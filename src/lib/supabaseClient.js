import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ksnzljothfoaefifevch.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create the client if credentials are present
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null