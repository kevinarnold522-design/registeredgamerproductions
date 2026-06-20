import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =====================================================================
// One-time migration: copy every record from the Base44 entities DB into
// the matching Supabase Postgres tables (data jsonb model). Idempotent —
// re-running upserts by id, so it's safe to run more than once.
//
// Requires the Supabase entities schema (supabase/entities-schema.sql) to
// already exist. Uses the service role key to bypass RLS for the copy.
// Admin-only.
// =====================================================================

const ENTITIES = [
  'Listing','UserProfile','ChannelPost','ChannelPostComment','CommunityPost',
  'PostComment','PostLike','PostRating','Order','GlobalTransactions','Transactions',
  'Tier1Subscription','Notification','Conversation','Message','Follow','Feedback',
  'Favorite','Cart','Review','GamingCommunity','CommunityMember','GroupChatMessage',
  'Tournament','SubcategoryRequest','SectionRequest','DailyReward','LoginHistory',
  'SiteSettings','SiteContent','SiteAnalytics','AdPlacement','ListingPageLayout',
  'ListingDeleteRequest','VideoPost'
];

const HEADER = new Set(['id','created_date','updated_date','created_by_id','created_by']);

function splitRecord(record) {
  const header = {};
  const data = {};
  for (const [k, v] of Object.entries(record || {})) {
    if (HEADER.has(k)) header[k] = v;
    else data[k] = v;
  }
  return { ...header, data };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const rawUrl = Deno.env.get('VITE_SUPABASE_URL');
    const url = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://smymannqqogtshvsiqyp.supabase.co';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) {
      return Response.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    const summary = {};
    for (const name of ENTITIES) {
      try {
        const records = await base44.asServiceRole.entities[name].filter({});
        if (!records || records.length === 0) { summary[name] = { migrated: 0 }; continue; }
        const rows = records.map(splitRecord);
        // Upsert by id in chunks to stay within payload limits.
        let migrated = 0;
        for (let i = 0; i < rows.length; i += 200) {
          const chunk = rows.slice(i, i + 200);
          const { error } = await supabase.from(name).upsert(chunk, { onConflict: 'id' });
          if (error) throw new Error(error.message);
          migrated += chunk.length;
        }
        summary[name] = { migrated };
      } catch (e) {
        summary[name] = { error: e.message };
      }
    }

    return Response.json({ ok: true, summary });
  } catch (error) {
    console.error('migrateToSupabase error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});