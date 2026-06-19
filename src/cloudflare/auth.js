// =====================================================================
// Cloudflare native auth handler — OAuth (Google / Facebook / Yahoo)
// + email/password sign-up & login, all against D1. No Base44 involved.
//
// Routes (handled in worker.js):
//   GET  /auth/<provider>          -> redirect user to provider consent
//   GET  /auth/callback            -> exchange code, upsert user, set session
//   POST /auth/register            -> email + password sign-up
//   POST /auth/login               -> email + password login
//   POST /auth/logout              -> clear session
//   GET  /auth/me                  -> current user from session cookie
// =====================================================================

const SESSION_COOKIE = "gp_session";
const SESSION_DAYS = 30;

// ---- OAuth provider config (client id/secret come from env secrets) ----
function providerConfig(provider, env) {
  switch (provider) {
    case "google":
      return {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        scope: "openid email profile",
      };
    case "facebook":
      return {
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
        authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
        userInfoUrl: "https://graph.facebook.com/me?fields=id,name,email",
        scope: "email public_profile",
      };
    case "yahoo":
      return {
        clientId: env.YAHOO_CLIENT_ID,
        clientSecret: env.YAHOO_CLIENT_SECRET,
        authUrl: "https://api.login.yahoo.com/oauth2/request_auth",
        tokenUrl: "https://api.login.yahoo.com/oauth2/get_token",
        userInfoUrl: "https://api.login.yahoo.com/openid/v1/userinfo",
        scope: "openid email profile",
      };
    default:
      return null;
  }
}

function appBaseUrl(env, request) {
  return env.APP_BASE_URL || new URL(request.url).origin;
}

function callbackUrl(env, request) {
  return `${new URL(request.url).origin}/auth/callback`;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function genId() {
  return crypto.randomUUID().replace(/-/g, "");
}

function sessionCookie(token, maxAgeSec) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  return parts.join("; ");
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ---- session helpers ----
async function createSession(env, userId) {
  const token = genId() + genId();
  const now = Date.now();
  const expires = new Date(now + SESSION_DAYS * 86400000).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (token, user_id, created_date, expires_date) VALUES (?, ?, ?, ?)"
  ).bind(token, userId, new Date(now).toISOString(), expires).run();
  return { token, maxAge: SESSION_DAYS * 86400 };
}

async function getSessionUser(env, request) {
  const token = readCookie(request, SESSION_COOKIE) ||
    (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT s.user_id, s.expires_date, u.id, u.email, u.full_name, u.role, u.avatar_url FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?"
  ).bind(token).first();
  if (!row) return null;
  if (row.expires_date && new Date(row.expires_date) < new Date()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }
  return { id: row.id, email: row.email, full_name: row.full_name, role: row.role, avatar_url: row.avatar_url };
}

async function upsertUser(env, { email, full_name, avatar_url, provider, passwordHash }) {
  const existing = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  const now = new Date().toISOString();
  if (existing) {
    await env.DB.prepare(
      "UPDATE users SET full_name = COALESCE(?, full_name), avatar_url = COALESCE(?, avatar_url), updated_date = ? WHERE id = ?"
    ).bind(full_name || null, avatar_url || null, now, existing.id).run();
    return existing;
  }
  const id = genId();
  await env.DB.prepare(
    "INSERT INTO users (id, email, full_name, avatar_url, role, auth_provider, password_hash, created_date, updated_date) VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?)"
  ).bind(id, email, full_name || email.split("@")[0], avatar_url || null, provider || "email", passwordHash || null, now, now).run();
  return { id, email, full_name: full_name || email.split("@")[0], role: "user", avatar_url: avatar_url || null };
}

const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });

// =====================================================================
// Main entry — returns a Response, or null if path isn't an auth route.
// =====================================================================
export async function handleAuth(parts, request, env) {
  const sub = parts[1]; // parts[0] === "auth"

  // ---- OAuth: start consent redirect ----
  if (["google", "facebook", "yahoo"].includes(sub) && request.method === "GET") {
    const cfg = providerConfig(sub, env);
    if (!cfg || !cfg.clientId) return json({ error: `${sub} OAuth not configured` }, 500);

    const url = new URL(request.url);
    const next = url.searchParams.get("next") || "/";
    const origin = url.searchParams.get("origin") || "";
    // Carry the app origin through state so the callback can redirect back
    // to the app domain (not the worker), avoiding a 404 landing page.
    const state = `${sub}:${encodeURIComponent(next)}:${encodeURIComponent(origin)}:${genId()}`;

    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: callbackUrl(env, request),
      response_type: "code",
      scope: cfg.scope,
      state,
    });
    return Response.redirect(`${cfg.authUrl}?${params.toString()}`, 302);
  }

  // ---- OAuth: callback (code exchange) ----
  if (sub === "callback" && request.method === "GET") {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "";
    const [provider, nextEnc, originEnc] = state.split(":");
    const next = nextEnc ? decodeURIComponent(nextEnc) : "/";
    const stateOrigin = originEnc ? decodeURIComponent(originEnc) : "";
    const cfg = providerConfig(provider, env);
    if (!code || !cfg) return json({ error: "Invalid OAuth callback" }, 400);

    // exchange code -> access token
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl(env, request),
      }).toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return json({ error: "Token exchange failed", details: tokenData }, 400);
    }

    // fetch user profile
    const profRes = await fetch(cfg.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const prof = await profRes.json();
    const email = prof.email;
    if (!email) return json({ error: "Provider did not return an email" }, 400);

    const user = await upsertUser(env, {
      email,
      full_name: prof.name || prof.given_name || email.split("@")[0],
      avatar_url: prof.picture || prof.picture?.data?.url || null,
      provider,
    });

    const { token, maxAge } = await createSession(env, user.id);
    // Prefer the app origin passed at login start, then APP_BASE_URL, then
    // the worker origin — so users land back on the app, not a 404 page.
    const base = stateOrigin || appBaseUrl(env, request);
    const dest = `${base}${next}`;
    return new Response(null, {
      status: 302,
      headers: { Location: dest, "Set-Cookie": sessionCookie(token, maxAge) },
    });
  }

  // ---- Email + password register ----
  if (sub === "register" && request.method === "POST") {
    const { email, password, full_name } = await request.json().catch(() => ({}));
    if (!email || !password) return json({ error: "Email and password are required" }, 400);
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return json({ error: "Email already registered" }, 409);

    const passwordHash = await sha256(password);
    const user = await upsertUser(env, { email, full_name, provider: "email", passwordHash });
    const { token, maxAge } = await createSession(env, user.id);
    return json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name } }, 200, {
      "Set-Cookie": sessionCookie(token, maxAge),
    });
  }

  // ---- Email + password login ----
  if (sub === "login" && request.method === "POST") {
    const { email, password } = await request.json().catch(() => ({}));
    if (!email || !password) return json({ error: "Email and password are required" }, 400);
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (!user || !user.password_hash) return json({ error: "Invalid credentials" }, 401);
    const passwordHash = await sha256(password);
    if (passwordHash !== user.password_hash) return json({ error: "Invalid credentials" }, 401);

    const { token, maxAge } = await createSession(env, user.id);
    return json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name } }, 200, {
      "Set-Cookie": sessionCookie(token, maxAge),
    });
  }

  // ---- Logout ----
  if (sub === "logout" && request.method === "POST") {
    const token = readCookie(request, SESSION_COOKIE);
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return json({ success: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
  }

  // ---- Current user ----
  if (sub === "me" && request.method === "GET") {
    const user = await getSessionUser(env, request);
    if (!user) return json({ error: "Not authenticated" }, 401);
    return json({ user });
  }

  return null;
}

export { getSessionUser };