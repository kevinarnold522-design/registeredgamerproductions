import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';
import { getRequestUser, isAdminUser } from '../_shared/adminAuth.ts';

const SUPABASE_URL = 'https://smymannqqogtshvsiqyp.supabase.co';
const BUCKET = 'gamerproductionsmedia';
const ALLOWED_PREFIXES = ['listing-images/', 'listing-videos/', 'listing-downloads/'];

function serviceClient() {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) throw new Error('Supabase media cleanup service is not configured.');
  return createClient(Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function pathFromValue(value: unknown) {
  if (!value || typeof value !== 'string') return null;
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return value.replace(/^\/+/, '') || null;
  }
  try {
    const parsed = new URL(value);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx >= 0) {
      return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
    }
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, '')) || null;
  } catch {
    return null;
  }
}

function collectPaths(value: unknown, paths = new Set<string>()) {
  if (!value) return paths;
  if (typeof value === 'string') {
    const path = pathFromValue(value);
    if (path) paths.add(path);
    return paths;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPaths(item, paths);
    return paths;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) collectPaths(item, paths);
  }
  return paths;
}

function isAllowedListingPath(path: string | null) {
  return !!path && ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function listAllListings(supabase: ReturnType<typeof createClient>) {
  const rows: Array<{ id: string; data: Record<string, unknown> | null }> = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('Listing')
      .select('id,data')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data || []) as Array<{ id: string; data: Record<string, unknown> | null }>));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function referencedListingPaths(supabase: ReturnType<typeof createClient>) {
  const paths = new Set<string>();
  const listings = await listAllListings(supabase);
  for (const row of listings) {
    collectPaths({
      images: row.data?.images,
      video_url: row.data?.video_url,
      download_url: row.data?.download_url,
      preview_video_url: row.data?.preview_video_url,
    }, paths);
  }
  return paths;
}

async function removePaths(supabase: ReturnType<typeof createClient>, paths: string[]) {
  let deletedCount = 0;
  const uniquePaths = [...new Set(paths)].filter(Boolean);
  for (let i = 0; i < uniquePaths.length; i += 100) {
    const chunk = uniquePaths.slice(i, i + 100);
    const { error } = await supabase.storage.from(BUCKET).remove(chunk);
    if (error) {
      console.error('cleanupListingDraftMedia remove failed', { chunk, error: error.message });
      continue;
    }
    deletedCount += chunk.length;
  }
  return deletedCount;
}

async function listFolderPaths(supabase: ReturnType<typeof createClient>, folder: string) {
  const out: string[] = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(error.message);
    const files = (data || []).filter((item) => item?.name && item?.metadata);
    out.push(...files.map((item) => `${folder}/${item.name}`));
    if (!data || data.length < limit) break;
    offset += data.length;
  }
  return out;
}

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);
    const { uploads = [], removeOrphans = false, accessToken } = await req.json().catch(() => ({}));
    const user = await getRequestUser(req, accessToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = serviceClient();
    const referenced = await referencedListingPaths(supabase);

    const requestedPaths = (Array.isArray(uploads) ? uploads : [])
      .map((item) => pathFromValue(item?.path || item?.url || item?.file_url || ''))
      .filter((path): path is string => isAllowedListingPath(path) && !referenced.has(path));

    let orphanPaths: string[] = [];
    if (removeOrphans) {
      if (!isAdminUser(user)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const storedPaths = await listFolderPaths(supabase, 'listing-images');
      orphanPaths = storedPaths.filter((path) => !referenced.has(path));
    }

    const allPaths = [...new Set([...requestedPaths, ...orphanPaths])];
    const deletedCount = await removePaths(supabase, allPaths);

    return Response.json({
      success: true,
      deletedCount,
      deletedPaths: allPaths,
    });
  } catch (error) {
    console.error('cleanupListingDraftMedia error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
