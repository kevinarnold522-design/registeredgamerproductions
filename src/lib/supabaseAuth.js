// =====================================================================
// Auth helpers — backed by Supabase Auth (handles Google/Facebook OAuth
// + email/password natively, independent of the Cloudflare Worker).
// Kept at this path so existing imports keep working.
// =====================================================================
import { supabase } from "@/lib/supabaseClient";

// Map our display provider names to Supabase provider ids.
function mapProvider(provider = "google") {
  const p = String(provider).toLowerCase();
  if (p === "gmail") return "google";
  if (p === "microsoft" || p === "outlook") return "azure";
  return p; // google, facebook, etc.
}

export async function signInWithProvider(provider, next = "/") {
  const redirectTo = `${window.location.origin}${next.startsWith("/") ? next : "/" + next}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: mapProvider(provider),
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data?.user || null;
}

export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata, emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data?.user || null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}