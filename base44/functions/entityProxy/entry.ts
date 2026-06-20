import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Verify the caller via their Supabase access token (auth is Supabase-backed).
// The token arrives as an Authorization: Bearer header or in the body.
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
    return { id: user.id, email: user.email };
  } catch (err) {
    console.error('entityProxy supabase verify failed', err.message);
    return null;
  }
}

// =====================================================================
// Universal entity proxy — the single reliable path for the frontend to
// read/write the REAL persistent Base44 entities database.
//
// ROOT CAUSE THIS FIXES: the app's Cloudflare Worker returns HTML (the React
// index.html) for every /entities/* request, so the frontend's direct entity
// reads never returned real data — profiles, listings, and posts appeared
// empty after refresh/navigation. The actual persisted records live in the
// Base44 entities DB, which is reachable here via the service role.
//
// Security: writes are restricted to authenticated users. Reads are allowed
// (the app's listings/profiles/posts are public content). Sensitive admin-only
// entities keep their own dedicated functions.
// =====================================================================

const PUBLIC_READ = true;

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { entity, op, query, sort, limit, id, data, accessToken } = body || {};

    if (!entity || !op) {
      return Response.json({ error: 'entity and op are required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities[entity];
    if (!svc) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });

    // Auth check for writes (reads are public content).
    const isWrite = op === 'create' || op === 'update' || op === 'delete';
    if (isWrite || !PUBLIC_READ) {
      const user = await getSupabaseUser(req, accessToken);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result;
    switch (op) {
      case 'list':
        result = await svc.list(sort || '-created_date', limit || 500);
        break;
      case 'filter':
        result = await svc.filter(query || {}, sort || '-created_date', limit || 500);
        break;
      case 'get':
        result = await svc.get(id);
        break;
      case 'create':
        result = await svc.create(data || {});
        break;
      case 'update':
        result = await svc.update(id, data || {});
        break;
      case 'delete':
        result = await svc.delete(id);
        break;
      default:
        return Response.json({ error: `Unknown op: ${op}` }, { status: 400 });
    }

    return Response.json({ result });
  } catch (error) {
    console.error('entityProxy error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});