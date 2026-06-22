import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const SUPABASE_URL = 'https://smymannqqogtshvsiqyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1hbm5xcW9ndHNodnNpcXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjMyOTYsImV4cCI6MjA5Njk5OTI5Nn0.mY40GwnnOoUXf111fgAhWgfzc8sapyBNcLISzbMWocg';
const BUCKET = 'gamerproductionsmedia';
const TEST_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) return Response.json({ error: 'Supabase service key missing' }, { status: 500 });

    const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
      const { error: bucketError } = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 26214400 });
      if (bucketError && !/already exists/i.test(bucketError.message)) return Response.json({ error: bucketError.message }, { status: 500 });
    }

    const path = `listing-images/signed-upload-test-${Date.now()}.png`;
    const { data: signed, error: signError } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (signError) return Response.json({ error: signError.message }, { status: 500 });

    const bytes = Uint8Array.from(atob(TEST_PNG_BASE64), (char) => char.charCodeAt(0));
    const { error: uploadError } = await anon.storage.from(BUCKET).uploadToSignedUrl(path, signed.token, bytes, { contentType: 'image/png' });
    if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path);
    return Response.json({ success: true, bucket: BUCKET, path, publicUrl: publicData.publicUrl });
  } catch (error) {
    console.error('testSupabaseListingUpload error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});