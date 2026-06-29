// =====================================================================
// Cloudflare Worker client — the app's single backend.
// Cloudflare handles auth (Google OAuth + email/password, session cookie),
// the entity database (D1), backend functions, and R2 file storage.
//
// This client mirrors the shape the app already calls on `base44.*`
// (entities.<Entity>.list/filter/create/update/delete, functions.invoke,
// auth.me/logout/...) so existing pages keep working unchanged.
// =====================================================================

import { getBase44Direct } from "@/lib/base44Direct";

// Permanent fallback to the live Cloudflare Worker. The build-time env var
// (VITE_CF_API_URL) takes priority, but if it's missing or accidentally set to
// the app's own origin, we fall back to the known worker URL so auth and all
// backend calls always reach the worker (never the React app → no more 404s).
const WORKER_URL = "https://website-connected-gamerproductions.kevinarnold522.workers.dev";

function isLocalOrigin(hostname = "") {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_CF_API_URL || "").replace(/\/$/, "");
  try {
    const currentOrigin = window.location.origin.replace(/\/$/, "");
    const { hostname } = window.location;

    // The live Cloudflare custom domain should use same-origin functions/routes.
    // Forcing it over to the fallback workers.dev host can break auth/session
    // flow and first-load data on the main site even when Vercel/local work.
    if (!isLocalOrigin(hostname) && (hostname === "gamer.productions" || hostname === "www.gamer.productions")) {
      return currentOrigin;
    }
  } catch {}

  if (!fromEnv) return WORKER_URL;
  try {
    const envOrigin = new URL(fromEnv).origin.replace(/\/$/, "");
    const currentOrigin = window.location.origin.replace(/\/$/, "");
    // Same-origin is correct on deployed first-party hosts. Only force the
    // worker fallback during local development where the frontend has no
    // backend functions mounted on the same origin.
    if (envOrigin === currentOrigin) {
      return isLocalOrigin(window.location.hostname) ? WORKER_URL : currentOrigin;
    }
  } catch {
    return WORKER_URL;
  }
  return fromEnv;
}

const API_BASE = resolveApiBase();

// The worker sets an HttpOnly session cookie on login. We always send it
// (credentials: "include"). We also mirror any non-HttpOnly token we may
// hold in localStorage as a Bearer header for environments that strip
// third-party cookies (e.g. some in-app browsers / iframes).
// Resolve the Supabase access token (the worker authenticates the user from
// this Bearer token via its getSupabaseUser fallback). Falls back to any
// locally-stored worker session token.
async function authHeaders(extra = {}) {
  const headers = { ...extra };
  try {
    const { supabase } = await import("@/lib/supabaseClient");
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      return headers;
    }
  } catch (_) {}
  try {
    const token = localStorage.getItem("gp_session_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return headers;
}

async function getSupabaseAccessToken({ refresh = false } = {}) {
  try {
    let { data } = await supabase.auth.getSession();
    const exp = data?.session?.expires_at ? data.session.expires_at * 1000 : 0;
    if (refresh && (!data?.session || (exp && exp - Date.now() < 60000))) {
      const refreshed = await supabase.auth.refreshSession();
      if (refreshed?.data?.session) data = refreshed.data;
    }
    return data?.session?.access_token || "";
  } catch (_) {
    return "";
  }
}

async function request(path, { method = "GET", body, headers } = {}) {
  return requestAbsolute(`${API_BASE}${path}`, { method, body, headers });
}

async function requestAbsolute(url, { method = "GET", body, headers } = {}) {
  let res;
  // Fail fast: never let a call hang forever if the worker is slow/unreachable.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      signal: controller.signal,
      headers: await authHeaders({
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      }),
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // fetch() rejects with "Failed to fetch" on network/CORS/offline errors.
    // Wrap it in a clean, catchable error so callers' .catch() handlers can
    // degrade gracefully instead of the raw TypeError crashing the UI.
    const err = new Error(networkErr?.name === "AbortError"
      ? "The server took too long to respond. Please try again."
      : "Network request failed. Please check your connection and try again.");
    err.status = 0;
    err.isNetworkError = true;
    err.cause = networkErr;
    throw err;
  } finally {
    clearTimeout(timeout);
  }
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
// All entity operations route through the `entityProxy` backend function, which
// reads/writes the REAL persistent Base44 entities database via the service role.
//
// Why: the Cloudflare Worker's /entities/* routes return HTML (the React app),
// never real data, so direct entity reads silently returned nothing — that is
// why profiles, listings, and posts "disappeared" on every refresh. Going
// through the backend function is the single reliable, persistent path.
async function entityOp(entity, op, payload = {}) {
  // Pass the Supabase access token in the body — the dependable auth path for
  // write operations (header forwarding is not guaranteed in all environments).
  const isWrite = op === "create" || op === "update" || op === "delete";
  const accessToken = await getSupabaseAccessToken({ refresh: isWrite });
  const res = await request(`/functions/entityProxy`, {
    method: "POST",
    body: { entity, op, accessToken, ...payload },
  });
  if (res && res.error) throw new Error(res.error);
  return res ? res.result : null;
}

function makeEntity(name) {
  return {
    async list(sort, limit) {
      try {
        const rows = await entityOp(name, "list", { sort, limit });
        return applySort(rows || [], sort).slice(0, limit || (rows || []).length);
      } catch (e) {
        if (e.isNetworkError) return [];
        throw e;
      }
    },
    async filter(query = {}, sort, limit) {
      try {
        const rows = await entityOp(name, "filter", { query, sort, limit });
        return applySort(rows || [], sort).slice(0, limit || (rows || []).length);
      } catch (e) {
        if (e.isNetworkError) return [];
        throw e;
      }
    },
    async get(id) {
      try {
        return await entityOp(name, "get", { id });
      } catch (e) {
        if (e.isNetworkError) return null;
        throw e;
      }
    },
    create(data) {
      return entityOp(name, "create", { data });
    },
    async bulkCreate(items = []) {
      const out = [];
      for (const it of items) out.push(await this.create(it));
      return out;
    },
    update(id, data) {
      return entityOp(name, "update", { id, data });
    },
    delete(id) {
      return entityOp(name, "delete", { id });
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
    const accessToken = payload?.accessToken || await getSupabaseAccessToken({ refresh: true });
    const finalPayload = accessToken ? { ...payload, accessToken } : payload;
    const shouldSkipDirectBase44 = /^github/i.test(name);

    if (!shouldSkipDirectBase44) {
      try {
        const direct = getBase44Direct();
        const data = await direct.functions.invoke(name, finalPayload);
        return data?.data ? data : { data, status: 200 };
      } catch (directError) {
        try {
          const data = await request(`/functions/${name}`, {
            method: "POST",
            body: finalPayload,
            headers: opts.headers,
          });
          return { data, status: 200 };
        } catch (fallbackError) {
          if (
            (fallbackError?.status === 404 || fallbackError?.status === 405) &&
            API_BASE !== WORKER_URL
          ) {
            const data = await requestAbsolute(`${WORKER_URL}/functions/${name}`, {
              method: "POST",
              body: finalPayload,
              headers: opts.headers,
            });
            return { data, status: 200 };
          }
          if (fallbackError?.isNetworkError) throw directError;
          throw fallbackError;
        }
      }
    }

    try {
      const data = await request(`/functions/${name}`, {
        method: "POST",
        body: finalPayload,
        headers: opts.headers,
      });
      return { data, status: 200 };
    } catch (fallbackError) {
      if (
        (fallbackError?.status === 404 || fallbackError?.status === 405) &&
        API_BASE !== WORKER_URL
      ) {
        const data = await requestAbsolute(`${WORKER_URL}/functions/${name}`, {
          method: "POST",
          body: finalPayload,
          headers: opts.headers,
        });
        return { data, status: 200 };
      }
      throw fallbackError;
    }
  },
};

// ---- Auth (Supabase-backed) ----
// Supabase handles auth natively (Google/Facebook OAuth + email/password),
// independent of the Worker. We normalize the Supabase user into the shape
// the app already expects ({ id, email, full_name, avatar_url, role }).
import { supabase } from "@/lib/supabaseClient";
import {
  signInWithProvider as sbSignInWithProvider,
  signInWithEmail as sbSignInWithEmail,
  signUpWithEmail as sbSignUpWithEmail,
} from "@/lib/supabaseAuth";

function normalizeSupabaseUser(u) {
  if (!u) return null;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email,
    full_name: meta.full_name || meta.name || (u.email ? u.email.split("@")[0] : ""),
    avatar_url: meta.avatar_url || meta.picture || "",
    role: undefined, // resolved by AuthContext via isAdmin/profile
  };
}

const auth = {
  async me() {
    const { data } = await supabase.auth.getUser();
    return normalizeSupabaseUser(data?.user);
  },
  async isAuthenticated() {
    try { return !!(await this.me()); } catch { return false; }
  },
  loginWithProvider(provider = "google", next = "/") {
    sbSignInWithProvider(provider, next).catch((e) => {
      console.error("OAuth sign-in failed", e);
      alert(e?.message || "Login failed. Please try again.");
    });
  },
  async loginWithEmail(email, password) {
    return sbSignInWithEmail(email, password);
  },
  async registerWithEmail(email, password, full_name) {
    return sbSignUpWithEmail(email, password, { full_name });
  },
  async logout(redirectUrl = "/") {
    try { await supabase.auth.signOut(); } catch (_) {}
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

// Entities are served by the `entityProxy` backend function, which reads and
// writes the real persistent Base44 entities database (where all existing
// profiles, listings, posts, etc. actually live). The Supabase tables were
// empty, which is why every page loaded forever — so we use the proxy `entities`
// client defined above as the single, reliable data layer.
export const cf = { entities, functions, auth, API_BASE };
export default cf;
