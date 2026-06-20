import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";

// =====================================================================
// Supabase-only upload helper used by listings, profiles, posts, covers,
// videos, and AI listing images. No Base44 upload, no R2 upload, no backend.
// =====================================================================

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_UPLOAD_LABEL = "25MB";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const SUPABASE_BUCKETS = ["gamerproductionsmedia", "uploads", "public"];

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
  const extension = (file.name || "upload").split(".").pop() || "bin";
  const safeFolder = String(folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${safeFolder}/${randomId}.${extension.toLowerCase()}`;
}

async function uploadToSupabase(file, folder) {
  const path = safePath(folder, file);
  let lastError = null;

  for (const bucket of SUPABASE_BUCKETS) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Supabase upload returned no public URL.");
      return { file_url: data.publicUrl, source: "supabase", bucket, path };
    }

    lastError = error;
  }

  throw new Error(lastError?.message || "Supabase upload failed. Please check the storage bucket settings.");
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