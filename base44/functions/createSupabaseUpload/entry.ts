import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const SUPABASE_URL = 'https://smymannqqogtshvsiqyp.supabase.co';
const BUCKET = 'gamerproductionsmedia';
const MAX_BYTES = 25 * 1024 * 1024;

function safePath(folder, fileName) {
  const originalName = String(fileName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');
  const extension = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const safeFolder = String(folder || 'uploads').replace(/[^a-zA-Z0-9/_-]/g, '-');
  const randomId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  return `${safeFolder}/${randomId}.${String(extension || 'bin').toLowerCase()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) return Response.json({ error: 'Please sign in before uploading.' }, { status: 401 });

    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) return Response.json({ error: 'Supabase upload service is not configured.' }, { status: 500 });

    const body = await req.json();
    const fileName = body.fileName || 'upload';
    const folder = body.folder || 'uploads';
    const size = Number(body.size || 0);

    if (size > MAX_BYTES) return Response.json({ error: 'File is too large. Maximum size is 25MB.' }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Supabase bucket list failed', listError.message);
      return Response.json({ error: listError.message }, { status: 500 });
    }

    if (!buckets.some((bucket) => bucket.name === BUCKET)) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_BYTES,
      });
      if (createError && !/already exists/i.test(createError.message)) {
        console.error('Supabase bucket create failed', createError.message);
        return Response.json({ error: createError.message }, { status: 500 });
      }
    }

    const path = safePath(folder, fileName);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) {
      console.error('Signed upload URL failed', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return Response.json({ bucket: BUCKET, path, token: data.token, signedUrl: data.signedUrl, publicUrl: publicData.publicUrl });
  } catch (error) {
    console.error('createSupabaseUpload error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});