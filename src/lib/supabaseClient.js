// Supabase client — handles app auth (Google/Facebook OAuth + email/password)
// and provides the access token for authenticated worker calls.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// A no-op stub used when Supabase env vars are missing. It returns the same
// shapes the app expects (no thrown errors, no network calls) so the app keeps
// rendering and never tries to hit a non-existent "placeholder.supabase.co"
// host (which produced DNS "server IP address could not be found" errors).
function createStubClient() {
  const noSession = { data: { session: null }, error: null };
  const noUser = { data: { user: null }, error: null };
  return {
    auth: {
      getSession: async () => noSession,
      getUser: async () => noUser,
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Authentication is not configured.") }),
      signInWithOAuth: async () => ({ data: null, error: new Error("Authentication is not configured.") }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error("Authentication is not configured.") }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

if (!isSupabaseConfigured) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth is disabled until these are set."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : createStubClient();