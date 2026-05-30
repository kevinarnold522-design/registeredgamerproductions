import { createClient } from '@supabase/supabase-js'

// Vite exposes environment variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anonymous Key is missing. Check your Vercel Environment Variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
