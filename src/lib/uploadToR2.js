import { base44 } from "@/api/base44Client";
import { compressImage } from "@/lib/compressImage";

// =====================================================================
// Upload helper used by listings, profiles, posts, and AI listing images.
// Primary path: Base44 built-in storage.
// Backup path: existing backend R2 uploader, so uploads do not fail just
// because one network route has a temporary problem.
// =====================================================================

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_UPLOAD_LABEL = "25MB";

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadToBase44WithRetry(file) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (!file_url) throw new Error("Upload returned no URL.");
      return file_url;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(700 * attempt);
    }
  }
  throw lastError;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function uploadToBackendR2(file, folder) {
  const dataUrl = await fileToDataUrl(file);
  const response = await base44.functions.invoke("uploadToR2", {
    fileName: file.name || "upload",
    contentType: file.type || "application/octet-stream",
    dataUrl,
    folder,
  });
  const fileUrl = response?.data?.file_url;
  if (!fileUrl) throw new Error(response?.data?.error || "Backup upload failed.");
  return fileUrl;
}

// Main entry point. Returns { file_url, source }.
export async function uploadFileWithFallback(file, folder = "uploads") {
  validateFile(file);

  const isImage = (file.type || "").startsWith("image/");
  const toUpload = isImage ? await compressImage(file) : file;

  try {
    const fileUrl = await uploadToBase44WithRetry(toUpload);
    return { file_url: fileUrl, source: "base44" };
  } catch (primaryError) {
    console.warn("Primary upload failed, trying backup uploader:", primaryError?.message);
  }

  try {
    const fileUrl = await uploadToBackendR2(toUpload, folder);
    return { file_url: fileUrl, source: "r2" };
  } catch (backupError) {
    console.error("All upload routes failed:", backupError?.message);
    throw new Error("Upload failed. Please try a smaller file or refresh the page and upload again.");
  }
}

// Backwards-compatible wrapper: existing callers expect { file_url }.
export async function uploadFileToR2(file, folder = "uploads") {
  const { file_url } = await uploadFileWithFallback(file, folder);
  return { file_url };
}