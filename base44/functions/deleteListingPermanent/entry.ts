import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { S3Client, DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@3.699.0';

const ADMIN_EMAIL = 'kevinarnold522@gmail.com';

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

function keyFromUrl(url, publicBaseUrl) {
  try {
    const parsed = new URL(url);
    const normalizedBase = publicBaseUrl ? publicBaseUrl.replace(/\/$/, '') : '';
    if (normalizedBase && url.startsWith(normalizedBase + '/')) {
      return decodeURIComponent(url.slice(normalizedBase.length + 1));
    }
    const path = parsed.pathname.replace(/^\//, '');
    return path || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { listing_id } = await req.json();
    if (!listing_id) return Response.json({ error: 'Missing listing id' }, { status: 400 });

    const listing = await base44.asServiceRole.entities.Listing.get(listing_id);
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

    const isAdmin = String(user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isOwner = String(listing.seller_email || '').toLowerCase() === String(user.email || '').toLowerCase();
    if (!isAdmin && !isOwner) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')?.trim() || 'f9559f35122ab25fb52ed96e81ca17a4';
    const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')?.trim();
    const bucket = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME')?.trim() || 'gamerproductionsmedia';
    const publicBaseUrlRaw = Deno.env.get('CLOUDFLARE_R2_PUBLIC_URL')?.trim() || '';
    const publicBaseUrl = publicBaseUrlRaw
      ? (publicBaseUrlRaw.startsWith('http') ? publicBaseUrlRaw : `https://${publicBaseUrlRaw}`)
      : '';

    let deletedFiles = 0;
    const urls = collectUrls({
      images: listing.images,
      download_url: listing.download_url,
      video_url: listing.video_url,
      preview_video_url: listing.preview_video_url,
    });

    if (accountId && accessKeyId && secretAccessKey && bucket) {
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
      for (const url of urls) {
        const key = keyFromUrl(url, publicBaseUrl);
        if (!key) continue;
        try {
          await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
          deletedFiles += 1;
        } catch (error) {
          console.error('R2 delete failed', { key, error: error.message });
        }
      }
    }

    const relatedEntities = [
      ['Favorite', { listing_id }],
      ['PostComment', { post_id: listing_id }],
      ['PostRating', { post_id: listing_id }],
      ['ListingDeleteRequest', { listing_id }],
      ['Cart', { listing_id }],
    ];
    for (const [entityName, query] of relatedEntities) {
      try {
        const rows = await base44.asServiceRole.entities[entityName].filter(query);
        for (const row of rows) await base44.asServiceRole.entities[entityName].delete(row.id);
      } catch (error) {
        console.error('Related cleanup failed', { entityName, error: error.message });
      }
    }

    await base44.asServiceRole.entities.Listing.delete(listing_id);
    return Response.json({ success: true, deletedFiles });
  } catch (error) {
    console.error('deleteListingPermanent error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});