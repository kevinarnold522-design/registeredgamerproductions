// =====================================================================
// Cloudflare Worker client — the app's single backend.
// Cloudflare handles auth (Google OAuth + email/password, session cookie),
// the entity database (D1), backend functions, and R2 file storage.
//
// This client mirrors the shape the app already calls on `base44.*`
// (entities.<Entity>.list/filter/create/update/delete, functions.invoke,
// auth.me/logout/...) so existing pages keep working unchanged.
// =====================================================================

const API_BASE = (import.meta.env.VITE_CF_API_URL || "").replace(/\/$/, "");

if (!API_BASE) {
  console.error("VITE_CF_API_URL is not set — backend calls will fail.");
}

// The worker sets an HttpOnly session cookie on login. We always send it
// (credentials: "include"). We also mirror any non-HttpOnly token we may
// hold in localStorage as a Bearer header for environments that strip
// third-party cookies (e.g. some in-app browsers / iframes).
function authHeaders(extra = {}) {
  const headers = { ...extra };
  try {
    const token = localStorage.getItem("gp_session_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return headers;
}

async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: authHeaders({
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---- Query helpers: turn a filter object into ?key=value pairs ----
function toQuery(filter = {}, limit) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v === undefined || v === null) continue;
    params.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  if (limit) params.set("limit", String(limit));
  const q = params.toString();
  return q ? `?${q}` : "";
}

// Client-side sort + limit for list() (worker returns newest-first already).
function applySort(rows, sort) {
  if (!sort || !rows?.length) return rows;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a?.[field], bv = b?.[field];
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return desc ? -cmp : cmp;
  });
}

// ---- Entity proxy: cf.entities.<Entity>.method(...) ----
function makeEntity(name) {
  return {
    async list(sort, limit) {
      const rows = await request(`/entities/${name}${toQuery({}, limit)}`);
      return applySort(rows || [], sort).slice(0, limit || (rows || []).length);
    },
    async filter(query = {}, sort, limit) {
      const rows = await request(`/entities/${name}${toQuery(query, limit)}`);
      return applySort(rows || [], sort).slice(0, limit || (rows || []).length);
    },
    async get(id) {
      const rows = await request(`/entities/${name}${toQuery({ id }, 1)}`);
      return (rows && rows[0]) || null;
    },
    create(data) {
      return request(`/entities/${name}`, { method: "POST", body: data });
    },
    async bulkCreate(items = []) {
      const out = [];
      for (const it of items) out.push(await this.create(it));
      return out;
    },
    update(id, data) {
      return request(`/entities/${name}/${id}`, { method: "PUT", body: data });
    },
    delete(id) {
      return request(`/entities/${name}/${id}`, { method: "DELETE" });
    },
  };
}

const entities = new Proxy({}, {
  get: (_t, name) => makeEntity(String(name)),
});

// ---- Backend functions: cf.functions.invoke("name", payload) ----
// Returns an axios-like { data } so existing `res.data` reads keep working.
const functions = {
  async invoke(name, payload = {}, opts = {}) {
    const data = await request(`/functions/${name}`, {
      method: "POST",
      body: payload,
      headers: opts.headers,
    });
    return { data, status: 200 };
  },
};

// ---- Auth ----
const auth = {
  async me() {
    const data = await request(`/auth/me`);
    return data?.user || null;
  },
  async isAuthenticated() {
    try { return !!(await this.me()); } catch { return false; }
  },
  loginWithProvider(provider = "google", next = "/") {
    const p = provider.toLowerCase() === "gmail" ? "google" : provider.toLowerCase();
    // Send the app's full origin so the worker redirects back to the app
    // (not the worker domain) after OAuth — prevents a 404 landing page.
    const origin = window.location.origin;
    window.location.href = `${API_BASE}/auth/${p}?next=${encodeURIComponent(next)}&origin=${encodeURIComponent(origin)}`;
  },
  async loginWithEmail(email, password) {
    const data = await request(`/auth/login`, { method: "POST", body: { email, password } });
    return data?.user || null;
  },
  async registerWithEmail(email, password, full_name) {
    const data = await request(`/auth/register`, { method: "POST", body: { email, password, full_name } });
    return data?.user || null;
  },
  async logout(redirectUrl = "/") {
    try { await request(`/auth/logout`, { method: "POST" }); } catch (_) {}
    try {
      localStorage.removeItem("gp_session_token");
      localStorage.removeItem("impersonation_session");
    } catch (_) {}
    window.location.href = redirectUrl || "/";
  },
  redirectToLogin(next) {
    this.loginWithProvider("google", next || window.location.pathname);
  },
};

export const cf = { entities, functions, auth, API_BASE };
export default cf;