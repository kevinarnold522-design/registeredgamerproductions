import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';
import { requireAdminUser } from '../_shared/adminAuth.ts';

const SUPABASE_URL = 'https://smymannqqogtshvsiqyp.supabase.co';
const BUCKET = 'gamerproductionsmedia';
const TARGET_EMAIL = 'kevinjersey2019@gmail.com';
const TEST_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c3aed"/><stop offset="0.55" stop-color="#ec4899"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="#050510"/><circle cx="256" cy="256" r="210" fill="url(#g)" opacity="0.9"/><circle cx="256" cy="256" r="176" fill="#111827" opacity="0.82"/><text x="256" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="900" fill="#ffffff">KJ</text><text x="256" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#c4b5fd">GAMER</text></svg>`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const adminUser = await requireAdminUser(req, body.accessToken);
    if (!adminUser) return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) return Response.json({ error: 'Supabase service key missing' }, { status: 500 });

    const supabase = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 26214400 });
      if (bucketError && !/already exists/i.test(bucketError.message)) return Response.json({ error: bucketError.message }, { status: 500 });
    }

    const path = `profile-avatars/kevinjersey2019-test-${Date.now()}.svg`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, TEST_AVATAR_SVG, { contentType: 'image/svg+xml', upsert: true });
    if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const avatarUrl = publicData.publicUrl;

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: TARGET_EMAIL });
    if (!profiles.length) return Response.json({ error: 'Kevin profile not found' }, { status: 404 });

    const profile = profiles[0];
    const avatarUrls = [avatarUrl, ...((profile.avatar_urls || []).filter((url) => url !== avatarUrl))].slice(0, 6);
    const updated = await base44.asServiceRole.entities.UserProfile.update(profile.id, { avatar_url: avatarUrl, avatar_urls: avatarUrls });

    return Response.json({ success: true, avatarUrl, profileId: profile.id, username: updated.username });
  } catch (error) {
    console.error('setKevinTestProfilePicture error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});