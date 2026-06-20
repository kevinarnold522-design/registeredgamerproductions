import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";

// Image uploads now go directly to Supabase Storage (bucket: base44-images).
// Non-image files keep going (compression is skipped for them).
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_UPLOAD_LABEL = "5MB";
export const STORAGE_BUCKET = "base44-images";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function extensionFor(file) {
  const fromName = (file.name || "").split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const map = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp" };
  return map[file.type] || "bin";
}

// Uploads a file to Supabase Storage and returns its public URL.
export async function uploadFileToR2(file, folder = "uploads") {
  if (!file) throw new Error("No file selected");

  const isImage = (file.type || "").startsWith("image/");

  // Client-side validation for images: type + size.
  if (isImage && !ALLOWED_IMAGE_TYPES.includes((file.type || "").toLowerCase())) {
    throw new Error("Only PNG, JPG, and WEBP images are allowed.");
  }
  if (!validateUploadSize(file)) {
    throw new Error(`File is too large. Maximum size is ${MAX_UPLOAD_LABEL}.`);
  }

  // Compress images before uploading to save space.
  const toUpload = isImage ? await compressImage(file) : file;

  const ext = extensionFor(toUpload);
  const path = `${folder}/${uuid()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, toUpload, {
      cacheControl: "3600",
      upsert: false,
      contentType: toUpload.type || file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message || "Could not upload to storage."}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Upload failed: could not resolve the public URL.");
  }

  return { file_url: data.publicUrl };
}