// Minimal Supabase client — used only to read the current access token so
// image uploads can authenticate against the Cloudflare Worker (fixes 401).
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);