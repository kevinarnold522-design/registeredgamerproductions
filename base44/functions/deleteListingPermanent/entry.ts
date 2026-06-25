import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';
import { getRequestUser, isAdminUser } from '../_shared/adminAuth.ts';

function collectUrls(value, urls = new Set()) {
  if (!value) return urls;
  if (typeof value === 'string') {
    if (value.startsWith('http://') || value.startsWith('https://')) urls.add(value);
    return urls;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, urls);
    return urls;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) collectUrls(item, urls);
  }
  return urls;
}

const SUPABASE_URL = 'https://smymannqqogtshvsiqyp.supabase.co';
const SUPABASE_BUCKET = 'gamerproductionsmedia';

function pathFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx >= 0) return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
    return decodeURIComponent(parsed.pathname.replace(/^\//, '')) || null;
  } catch {
    return null;
  }
}

function createServiceSupabaseClient() {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) throw new Error('Supabase service role key is not configured.');
  return createClient(Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { listing_id, accessToken } = await req.json().catch(() => ({}));
    const user = await getRequestUser(req, accessToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!listing_id) return Response.json({ error: 'Missing listing id' }, { status: 400 });

    const listing = await base44.asServiceRole.entities.Listing.get(listing_id);
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

    const isAdmin = isAdminUser(user);
    const isOwner =
      String(listing.seller_email || '').toLowerCase() === String(user.email || '').toLowerCase() ||
      String(listing.created_by || '').toLowerCase() === String(user.email || '').toLowerCase() ||
      String(listing.created_by_id || '') === String(user.id || '') ||
      String(listing.created_by_id || '') === String(user.email || '');
    if (!isAdmin && !isOwner) return Response.json({ error: 'Forbidden' }, { status: 403 });

    let deletedFiles = 0;
    const urls = collectUrls({
      images: listing.images,
      download_url: listing.download_url,
      video_url: listing.video_url,
      preview_video_url: listing.preview_video_url,
    });
    try {
      const supabase = createServiceSupabaseClient();
      const paths = [...urls].map((url) => pathFromUrl(url)).filter(Boolean) as string[];
      for (let i = 0; i < paths.length; i += 100) {
        const chunk = paths.slice(i, i + 100);
        const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove(chunk);
        if (error) {
          console.error('Supabase storage delete failed', { chunk, error: error.message });
          continue;
        }
        deletedFiles += chunk.length;
      }
    } catch (error) {
      console.error('Supabase media cleanup failed', error.message);
    }

    // Clear EVERYTHING that references this listing across all entities
    const relatedEntities = [
      ['Favorite', { listing_id }],
      ['PostComment', { post_id: listing_id }],
      ['PostRating', { post_id: listing_id }],
      ['PostLike', { post_id: listing_id }],
      ['PostComment', { listing_id }],
      ['ChannelPostComment', { post_id: listing_id }],
      ['Review', { listing_id }],
      ['ListingDeleteRequest', { listing_id }],
      ['ListingPageLayout', { listing_id }],
      ['Cart', { listing_id }],
      ['Order', { listing_id }],
      ['Notification', { related_id: listing_id }],
      ['CommunityPost', { listing_id }],
    ];
    for (const [entityName, query] of relatedEntities) {
      try {
        const rows = await base44.asServiceRole.entities[entityName].filter(query);
        for (const row of rows) await base44.asServiceRole.entities[entityName].delete(row.id);
      } catch (error) {
        console.error('Related cleanup failed', { entityName, error: error.message });
      }
    }

    // Also explicitly remove the listing from the dedicated Supabase-backed tables
    // used by the frontend so deleted records do not reappear after refresh.
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && serviceKey) {
      try {
        const { createClient } = await import('npm:@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
        await supabase.from('Listing').delete().eq('id', listing_id);
      } catch (error) {
        console.error('Supabase listing cleanup failed', error.message);
      }
    }

    await base44.asServiceRole.entities.Listing.delete(listing_id);
    return Response.json({ success: true, deletedFiles });
  } catch (error) {
    console.error('deleteListingPermanent error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
