import { createClient } from 'npm:@supabase/supabase-js@2';

// Diagnostic: confirm WHICH Supabase project the backend connects to, and
// list every table actually present in its public schema (via PostgREST root).
Deno.serve(async (req) => {
  try {
    const rawUrl = Deno.env.get('VITE_SUPABASE_URL');
    const url = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://smymannqqogtshvsiqyp.supabase.co';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) return Response.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });

    // The PostgREST root endpoint returns the OpenAPI spec listing every table
    // it currently knows about — the ground truth for what writes can target.
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const spec = await res.json();
    const tables = spec && spec.definitions ? Object.keys(spec.definitions) : [];

    return Response.json({
      connected_supabase_url: url,
      env_url_raw: rawUrl || '(not set)',
      table_count: tables.length,
      tables,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});