import { createClient } from 'npm:@supabase/supabase-js@2';
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3.699.0';

// Verify the Supabase access token sent as Authorization: Bearer <token>.
// Auth migrated from Base44 -> Supabase, so we no longer use base44.auth.me().
async function getSupabaseUser(req, bodyToken) {
  // Token can arrive via the Authorization header OR the request body — the
  // base44 SDK does not always forward custom headers, so the body is the reliable path.
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
    console.error('uploadToR2 supabase verify failed', err.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { fileName, contentType, dataUrl, folder = 'uploads', accessToken } = body;

    const user = await getSupabaseUser(req, accessToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!fileName || !contentType || !dataUrl) {
      return Response.json({ error: 'Missing file data' }, { status: 400 });
    }

    const accountId = 'f9559f35122ab25fb52ed96e81ca17a4';
    let accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')?.trim();
    let secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')?.trim();
    const bucket = 'gamerproductionsmedia';
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      return Response.json({ error: 'Cloudflare R2 is not configured' }, { status: 500 });
    }

    // Auto-correct if the access key id / secret were pasted in swapped order.
    if (accessKeyId.length !== 32 && secretAccessKey.length === 32) {
      const originalAccessKeyId = accessKeyId;
      accessKeyId = secretAccessKey;
      secretAccessKey = originalAccessKeyId;
    }

    if (accessKeyId.length !== 32) {
      return Response.json({ error: `The R2 Access Key ID must be exactly 32 characters. The saved value is ${accessKeyId.length} characters, which means a URL, API token, or Secret Access Key was pasted instead.` }, { status: 500 });
    }

    const base64 = String(dataUrl).includes(',') ? String(dataUrl).split(',')[1] : String(dataUrl);
    const binary = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const maxBytes = 25 * 1024 * 1024;
    if (binary.byteLength > maxBytes) {
      return Response.json({ error: 'File upload limit is 25MB' }, { status: 413 });
    }
    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '-');
    const safeFolder = String(folder).replace(/[^a-zA-Z0-9/_-]/g, '-');
    const key = `${safeFolder}/${user.id || user.email}/${Date.now()}-${safeName}`;

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: binary,
      ContentType: contentType,
    }));

    const publicBaseUrl = Deno.env.get('CLOUDFLARE_R2_PUBLIC_URL')?.trim();
    const normalizedPublicBaseUrl = publicBaseUrl
      ? (publicBaseUrl.startsWith('http://') || publicBaseUrl.startsWith('https://') ? publicBaseUrl : `https://${publicBaseUrl}`)
      : '';
    const fileUrl = normalizedPublicBaseUrl
      ? `${normalizedPublicBaseUrl.replace(/\/$/, '')}/${key}`
      : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`;

    return Response.json({ key, file_url: fileUrl });
  } catch (error) {
    console.error('uploadToR2 error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});