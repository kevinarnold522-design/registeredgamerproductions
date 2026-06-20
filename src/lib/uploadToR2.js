import { base44 } from "@/api/base44Client";
import { compressImage } from "@/lib/compressImage";

// =====================================================================
// Image / file uploads use Base44's built-in storage — the reliable,
// platform-native uploader that needs no external bucket configuration.
// Returns { file_url, source }.
// =====================================================================

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_UPLOAD_LABEL = "25MB";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

// Strict client-side validation. Throws a clear error if invalid.
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

// Main entry point. Returns { file_url, source }.
export async function uploadFileWithFallback(file, folder = "uploads") {
  validateFile(file);

  // Compress images before uploading to save space.
  const isImage = (file.type || "").startsWith("image/");
  const toUpload = isImage ? await compressImage(file) : file;

  const { file_url } = await base44.integrations.Core.UploadFile({ file: toUpload });
  if (!file_url) throw new Error("Upload failed. Please try again.");
  return { file_url, source: "base44" };
}

// Backwards-compatible wrapper: existing callers expect { file_url }.
export async function uploadFileToR2(file, folder = "uploads") {
  const { file_url } = await uploadFileWithFallback(file, folder);
  return { file_url };
}