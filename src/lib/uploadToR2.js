import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";

// =====================================================================
// Supabase-only upload helper used by listings, profiles, posts, covers,
// videos, and AI listing images. No Base44 upload, no R2 upload, no backend.
// Required Supabase bucket: gamerproductionsmedia
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

function safePath(folder, file) {
  const originalName = String(file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  const safeFolder = String(folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${safeFolder}/${randomId}.${String(extension || "bin").toLowerCase()}`;
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

async function uploadToSupabase(file, folder) {
  const path = safePath(folder, file);
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (error) throw new Error(friendlyStorageError(error));

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Supabase upload returned no public URL.");
  return { file_url: data.publicUrl, source: "supabase", bucket: SUPABASE_BUCKET, path };
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