// Supabase client — handles app auth (Google/Facebook OAuth + email/password)
// and provides the access token for authenticated worker calls.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Don't crash the whole app if env vars are missing — log a clear warning.
  // createClient throws "supabaseUrl is required" on an empty URL, which would
  // blank the entire site. A harmless placeholder keeps the app rendering;
  // auth simply won't work until the real values are configured.
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth is disabled until these are set."
  );
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);