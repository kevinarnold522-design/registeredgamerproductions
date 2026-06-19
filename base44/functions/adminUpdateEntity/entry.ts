import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MASTER_EMAIL = 'kevinarnold522@gmail.com';

// Entities an admin is allowed to mutate through this endpoint.
const ALLOWED_ENTITIES = ['Listing', 'CommunityPost', 'UserProfile', 'GamingCommunity'];
const ALLOWED_ACTIONS = ['update', 'create'];

// Verify the Supabase access token (auth migrated from Base44 -> Supabase).
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
    console.error('adminUpdateEntity supabase verify failed', err.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { entity, action = 'update', id, data, accessToken } = body;

    const user = await getSupabaseUser(req, accessToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isMasterAdmin = String(user.email || '').toLowerCase() === MASTER_EMAIL.toLowerCase() || user.role === 'admin';
    if (!isMasterAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    if (!ALLOWED_ENTITIES.includes(entity) || !ALLOWED_ACTIONS.includes(action) || !data) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    let result;
    if (action === 'create') {
      result = await base44.asServiceRole.entities[entity].create(data);
    } else {
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      result = await base44.asServiceRole.entities[entity].update(id, data);
    }
    return Response.json({ success: true, result });
  } catch (error) {
    console.error('adminUpdateEntity error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});