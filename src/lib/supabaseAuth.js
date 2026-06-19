// =====================================================================
// Auth helpers — now backed by the Cloudflare Worker (not Supabase).
// Kept at this path so existing imports keep working. OAuth providers
// redirect to the worker's /auth/<provider> route; email/password hit
// the worker's /auth/login + /auth/register endpoints.
// =====================================================================
import { cf } from "@/lib/cfClient";

export async function signInWithProvider(provider, next = "/") {
  cf.auth.loginWithProvider(provider, next);
}

export async function signInWithEmail(email, password) {
  return cf.auth.loginWithEmail(email, password);
}

export async function signUpWithEmail(email, password, metadata = {}) {
  return cf.auth.registerWithEmail(email, password, metadata.full_name);
}

export async function signOut() {
  await cf.auth.logout();
}

export async function getCurrentUser() {
  try { return await cf.auth.me(); } catch { return null; }
}