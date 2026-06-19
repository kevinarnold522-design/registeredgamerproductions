// Supabase client — handles app auth (Google/Facebook OAuth) and provides the
// access token for authenticated worker calls.
import { createClient } from "@supabase/supabase-js";

// Project URL is public and safe to hardcode as a fallback so the client always
// initializes even if the build-time env var is missing.
const FALLBACK_URL = "https://smymannqqogtshvsiqyp.supabase.co";

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// A no-op stub used when the anon key is missing. It returns the same shapes the
// app expects (no thrown errors, no network calls) so the app keeps rendering.
function createStubClient() {
  const noSession = { data: { session: null }, error: null };
  const noUser = { data: { user: null }, error: null };
  return {
    auth: {
      getSession: async () => noSession,
      getUser: async () => noUser,
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Sign-in is temporarily unavailable. Please try again shortly.") }),
      signInWithOAuth: async () => ({ data: null, error: new Error("Sign-in is temporarily unavailable. Please try again shortly.") }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error("Sign-in is temporarily unavailable. Please try again shortly.") }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

if (!anonKey) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_ANON_KEY. Auth is disabled until this is set."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createStubClient();