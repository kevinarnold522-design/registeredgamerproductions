import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";
import { getBase44Direct } from "@/lib/base44Direct";

// =====================================================================
// Supabase-only upload helper used by listings, profiles, posts, covers,
// videos, and AI listing images. It requests a signed Supabase upload URL
// so browser uploads are not blocked by storage bucket permissions.
// =====================================================================

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_UPLOAD_LABEL = "25MB";

const SUPABASE_BUCKET = "gamerproductionsmedia";
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

function validateFile(file) {
  if (!file) throw new Error("No file selected.");
  const isImage = (file.type || "").startsWith("image/");
  if (isImage && !ALLOWED_IMAGE_TYPES.includes((file.type || "").toLowerCase())) {
    throw new Error("Only PNG, JPG, WEBP, and GIF images are allowed.");
  }
  if (!validateUploadSize(file)) {
    throw new Error(`File is too large. Maximum size is ${MAX_UPLOAD_LABEL}.`);
  }
}

function friendlyStorageError(error) {
  const message = error?.message || "Supabase upload failed.";
  if (/bucket not found/i.test(message)) {
    return "Supabase storage bucket is missing. Run cloudflare/supabase-storage-setup.sql once in Supabase SQL Editor, then try uploading again.";
  }
  if (/row-level security|not authorized|unauthorized|permission/i.test(message)) {
    return "Supabase storage permission blocked the upload. Run cloudflare/supabase-storage-setup.sql once in Supabase SQL Editor, then try again while logged in.";
  }
  return message;
}

function externalUploadEndpoints() {
  const endpoints = [];
  const vercelBase = (import.meta.env.VITE_VERCEL_API_URL || window.location.origin || "").replace(/\/$/, "");
  const cloudflareBase = (import.meta.env.VITE_CF_API_URL || "https://website-connected-gamerproductions.kevinarnold522.workers.dev").replace(/\/$/, "");
  if (vercelBase) endpoints.push({ source: "vercel", url: `${vercelBase}/api/base44-functions?function=createSupabaseUpload` });
  if (cloudflareBase) endpoints.push({ source: "cloudflare", url: `${cloudflareBase}/functions/createSupabaseUpload` });
  return endpoints;
}

async function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function isValidUploadInfo(data) {
  return data && data.token && data.path && data.publicUrl;
}

async function prepareSupabaseUpload(file, folder) {
  const payload = {
    fileName: file.name || "upload",
    folder,
    size: file.size || 0,
    contentType: file.type || "application/octet-stream",
  };
  const headers = await authHeaders();
  let lastError = null;

  // 1) Try the external Vercel/Cloudflare endpoints (used on the published site).
  for (const endpoint of externalUploadEndpoints()) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && isValidUploadInfo(data)) return { ...data, source: endpoint.source };
      lastError = new Error(data?.error || `${endpoint.source} upload preparation failed.`);
    } catch (error) {
      lastError = error;
    }
  }

  // 2) Fallback to the reliable Base44-hosted function (works in preview + always deployed).
  try {
    const res = await getBase44Direct().functions.invoke("createSupabaseUpload", payload);
    const data = res?.data || res;
    if (isValidUploadInfo(data)) return { ...data, source: "base44" };
    lastError = new Error(data?.error || "Could not prepare Supabase upload.");
  } catch (error) {
    lastError = error;
  }

  throw lastError || new Error("Could not prepare Supabase upload.");
}

async function uploadToSupabase(file, folder) {
  const uploadInfo = await prepareSupabaseUpload(file, folder);

  const { error } = await supabase.storage.from(uploadInfo.bucket || SUPABASE_BUCKET).uploadToSignedUrl(
    uploadInfo.path,
    uploadInfo.token,
    file,
    { contentType: file.type || "application/octet-stream" }
  );

  if (error) throw new Error(friendlyStorageError(error));

  return { file_url: uploadInfo.publicUrl, source: uploadInfo.source || "supabase", bucket: uploadInfo.bucket || SUPABASE_BUCKET, path: uploadInfo.path };
}

export async function uploadFileWithFallback(file, folder = "uploads") {
  validateFile(file);
  const isImage = (file.type || "").startsWith("image/");
  const toUpload = isImage ? await compressImage(file) : file;
  return uploadToSupabase(toUpload, folder);
}

// Backwards-compatible name used by existing components.
export async function uploadFileToR2(file, folder = "uploads") {
  const { file_url } = await uploadFileWithFallback(file, folder);
  return { file_url };
}