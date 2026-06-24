import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

export const MASTER_EMAIL = 'kevinarnold522@gmail.com';
export const ADMIN_EMAILS = [
  'kevinjersey2019@gmail.com',
  'arnoldk137@gmail.com',
  'kevinarnold522@gmail.com',
];

function supabaseUrl() {
  const raw = Deno.env.get('VITE_SUPABASE_URL');
  return (raw && raw.startsWith('http')) ? raw : 'https://smymannqqogtshvsiqyp.supabase.co';
}

export function isAdminUser(user) {
  if (!user) return false;
  const email = String(user.email || '').toLowerCase();
  return user.role === 'admin' || email === MASTER_EMAIL.toLowerCase() || ADMIN_EMAILS.includes(email);
}

export async function getSupabaseUser(req, bodyToken) {
  const headerToken = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const token = headerToken || bodyToken || '';
  if (!token) return null;
  const key = Deno.env.get('VITE_SUPABASE_ANON_KEY');
  if (!key) return null;
  try {
    const supabase = createClient(supabaseUrl(), key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return { id: user.id, email: user.email, role: (user.user_metadata || {}).role };
  } catch (_) {
    return null;
  }
}

export async function getBase44User(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    return user ? { id: user.id, email: user.email, role: user.role } : null;
  } catch (_) {
    return null;
  }
}

export async function getRequestUser(req, bodyToken) {
  const supabaseUser = await getSupabaseUser(req, bodyToken);
  if (supabaseUser) return supabaseUser;
  return getBase44User(req);
}

export async function requireAdminUser(req, bodyToken) {
  const user = await getRequestUser(req, bodyToken);
  return isAdminUser(user) ? user : null;
}