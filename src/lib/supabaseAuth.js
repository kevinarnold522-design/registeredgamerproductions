import { supabase } from "@/lib/supabaseClient";

// ── Supabase Auth helpers ──
// OAuth providers map to Supabase's provider ids. Configure each provider's
// client id/secret in the Supabase dashboard (Authentication > Providers).
const PROVIDER_MAP = {
  google: "google",
  gmail: "google",
  facebook: "facebook",
  yahoo: "yahoo",
};

export async function signInWithProvider(provider, next = "/") {
  if (!supabase) throw new Error("Supabase is not configured");
  const supaProvider = PROVIDER_MAP[provider.toLowerCase()] || provider.toLowerCase();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: supaProvider,
    options: { redirectTo: `${window.location.origin}${next}` },
  });
  if (error) throw error;
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, metadata = {}) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}