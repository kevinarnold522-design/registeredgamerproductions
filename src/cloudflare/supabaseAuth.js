// =====================================================================
// Supabase token verification for the Cloudflare Worker.
// The frontend now signs in via Supabase Auth and sends the access
// token as `Authorization: Bearer <token>`. This module verifies that
// token with Supabase and upserts the matching user row into D1 so the
// rest of the Worker can keep working with a local user record.
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";

let _client = null;
function getSupabase(env) {
  if (_client) return _client;
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _client;
}

function genId() {
  return crypto.randomUUID().replace(/-/g, "");
}

// Ensure a D1 user row exists for the verified Supabase user.
async function upsertSupabaseUser(env, supaUser) {
  const email = supaUser.email;
  if (!email) return null;
  const meta = supaUser.user_metadata || {};
  const full_name = meta.full_name || meta.name || email.split("@")[0];
  const avatar_url = meta.avatar_url || meta.picture || null;
  const now = new Date().toISOString();

  const existing = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    await env.DB.prepare(
      "UPDATE users SET full_name = COALESCE(?, full_name), avatar_url = COALESCE(?, avatar_url), updated_date = ? WHERE id = ?"
    ).bind(full_name, avatar_url, now, existing.id).run();
    return { id: existing.id, email, full_name: existing.full_name || full_name, role: existing.role || "user", avatar_url: existing.avatar_url || avatar_url };
  }

  const id = genId();
  await env.DB.prepare(
    "INSERT INTO users (id, email, full_name, avatar_url, role, auth_provider, created_date, updated_date) VALUES (?, ?, ?, ?, 'user', 'supabase', ?, ?)"
  ).bind(id, email, full_name, avatar_url, now, now).run();
  return { id, email, full_name, role: "user", avatar_url };
}

// Verify the bearer token via Supabase; returns the D1 user row or null.
export async function getSupabaseUser(env, request) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const supabase = getSupabase(env);
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return await upsertSupabaseUser(env, user);
  } catch (err) {
    console.error("Supabase token verify failed:", err.message);
    return null;
  }
}