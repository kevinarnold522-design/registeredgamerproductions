import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MASTER_EMAIL = 'kevinarnold522@gmail.com';
const ALLOWED_FIELDS = ['avatar_url', 'banner_url', 'avatar_urls', 'profile_theme_color'];

// Verify the Supabase access token (auth migrated from Base44 -> Supabase).
// Token can come from the Authorization header OR the request body — the base44
// SDK does not reliably forward custom headers, so the body is the dependable path.
async function getSupabaseUser(req, bodyToken) {
  const headerToken = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const token = headerToken || bodyToken || '';
  if (!token) return null;
  const url = Deno.env.get('VITE_SUPABASE_URL');
  const key = Deno.env.get('VITE_SUPABASE_ANON_KEY');
  if (!url || !key) return null;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return { id: user.id, email: user.email, role: (user.user_metadata || {}).role };
  } catch (err) {
    console.error('updateProfileMedia supabase verify failed', err.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { profile_id, field, value, updates, accessToken } = body;

    const user = await getSupabaseUser(req, accessToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Build the set of fields to write — supports a single {field,value} OR an {updates} object.
    let payload = {};
    if (updates && typeof updates === 'object') {
      for (const k of Object.keys(updates)) {
        if (ALLOWED_FIELDS.includes(k)) payload[k] = updates[k];
      }
    } else if (field && ALLOWED_FIELDS.includes(field)) {
      payload[field] = value ?? '';
    }
    if (!profile_id || Object.keys(payload).length === 0) {
      return Response.json({ error: 'Invalid profile media update' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const profile = await base44.asServiceRole.entities.UserProfile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const isMasterAdmin = String(user.email || '').toLowerCase() === MASTER_EMAIL.toLowerCase() || user.role === 'admin';
    const isOwnProfile = String(profile.user_email || '').toLowerCase() === String(user.email || '').toLowerCase();
    if (!isMasterAdmin && !isOwnProfile) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.UserProfile.update(profile_id, payload);
    return Response.json({ success: true, profile: updated });
  } catch (error) {
    console.error('updateProfileMedia error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});