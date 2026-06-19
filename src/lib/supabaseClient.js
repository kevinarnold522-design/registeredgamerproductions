// Supabase client — handles app auth (Google/Facebook OAuth) and provides the
// access token for authenticated worker calls.
import { createClient } from "@supabase/supabase-js";

// Project URL and anon key are public/publishable and safe to hardcode as
// fallbacks so the real client always initializes even if the build-time env
// vars are missing. This prevents the app from ever falling back to a stub.
const FALLBACK_URL = "https://smymannqqogtshvsiqyp.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1hbm5xcW9ndHNodnNpcXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjMyOTYsImV4cCI6MjA5Njk5OTI5Nn0.mY40GwnnOoUXf111fgAhWgfzc8sapyBNcLISzbMWocg";

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});