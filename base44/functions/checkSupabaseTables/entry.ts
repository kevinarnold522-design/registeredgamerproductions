import { createClient } from 'npm:@supabase/supabase-js@2';

// Diagnostic: try a real insert + select into UserProfile to see the exact
// error the write path hits (vs the read path which already works).
Deno.serve(async (req) => {
  try {
    const rawUrl = Deno.env.get('VITE_SUPABASE_URL');
    const url = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://smymannqqogtshvsiqyp.supabase.co';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) return Response.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    const out = {};

    // 1. Read works?
    const r = await supabase.from('UserProfile').select('id').limit(1);
    out.select = r.error ? r.error.message : `ok (${(r.data || []).length} rows)`;

    // 2. Plain insert (no onConflict)?
    const ins = await supabase.from('UserProfile').insert({ data: { _diagnostic: true } }).select('id');
    out.insert = ins.error ? ins.error.message : `ok (id ${ins.data?.[0]?.id})`;

    // 3. Upsert with onConflict id?
    const up = await supabase.from('UserProfile').upsert(
      [{ data: { _diagnostic_upsert: true } }],
      { onConflict: 'id' }
    ).select('id');
    out.upsert = up.error ? up.error.message : `ok (id ${up.data?.[0]?.id})`;

    // Clean up diagnostic rows
    if (ins.data?.[0]?.id) await supabase.from('UserProfile').delete().eq('id', ins.data[0].id);
    if (up.data?.[0]?.id) await supabase.from('UserProfile').delete().eq('id', up.data[0].id);

    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});