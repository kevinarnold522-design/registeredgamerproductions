import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";
import { base44 } from "@/api/base44Client";

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

  // Ask the backend for a signed Supabase upload URL using the app's
  // AUTHENTICATED client so the function passes its sign-in check.
  const res = await base44.functions.invoke("createSupabaseUpload", payload);
  const data = res?.data || res;
  if (isValidUploadInfo(data)) return { ...data, source: "base44" };
  throw new Error(data?.error || "Could not prepare Supabase upload.");
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