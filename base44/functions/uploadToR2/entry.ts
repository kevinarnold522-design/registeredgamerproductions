import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3.699.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileName, contentType, dataUrl, folder = 'uploads' } = await req.json();
    if (!fileName || !contentType || !dataUrl) {
      return Response.json({ error: 'Missing file data' }, { status: 400 });
    }

    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    const bucket = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME');
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      return Response.json({ error: 'Cloudflare R2 is not configured' }, { status: 500 });
    }

    const base64 = String(dataUrl).includes(',') ? String(dataUrl).split(',')[1] : String(dataUrl);
    const binary = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
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

    const publicBaseUrl = Deno.env.get('CLOUDFLARE_R2_PUBLIC_URL');
    const fileUrl = publicBaseUrl
      ? `${publicBaseUrl.replace(/\/$/, '')}/${key}`
      : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`;

    return Response.json({ key, file_url: fileUrl });
  } catch (error) {
    console.error('uploadToR2 error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});