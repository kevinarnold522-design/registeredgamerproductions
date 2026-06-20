import { supabase } from "@/lib/supabaseClient";
import { base44 } from "@/api/base44Client";
import { compressImage } from "@/lib/compressImage";

// =====================================================================
// Hybrid image upload: Supabase Storage is the PRIMARY handler
// (bucket: base44-images). Cloudflare R2 is used only as a fallback
// if Supabase fails. Returns { file_url, source } ('supabase' | 'r2').
// =====================================================================

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_UPLOAD_LABEL = "5MB";
export const STORAGE_BUCKET = "base44-images";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

// Strict client-side validation. Throws a clear error if invalid.
function validateFile(file) {
  if (!file) throw new Error("No file selected.");
  const isImage = (file.type || "").startsWith("image/");
  if (isImage && !ALLOWED_IMAGE_TYPES.includes((file.type || "").toLowerCase())) {
    throw new Error("Only PNG, JPG, and WEBP images are allowed.");
  }
  if (!validateUploadSize(file)) {
    throw new Error(`File is too large. Maximum size is ${MAX_UPLOAD_LABEL}.`);
  }
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  } catch {
    return "";
  }
}

// Reject a promise if it takes longer than `ms` — guarantees R2 never hangs
// the whole upload; we fail fast to the Supabase fallback instead.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);
}

// ---- R2 upload via the existing backend function ----
async function uploadToCloudflareR2(file, folder) {
  const dataUrl = await fileToDataUrl(file);
  const accessToken = await getAccessToken();
  const res = await withTimeout(
    base44.functions.invoke("uploadToR2", {
      fileName: file.name || `${uuid()}.${extensionFor(file)}`,
      contentType: file.type || "application/octet-stream",
      dataUrl,
      folder,
      accessToken,
    }),
    7000,
    "R2 upload"
  );
  const url = res?.data?.file_url;
  if (!url) throw new Error(res?.data?.error || "R2 upload returned no URL.");
  return url;
}

// ---- Supabase Storage upload (fallback) ----
async function uploadToSupabase(file, folder) {
  const ext = extensionFor(file);
  const path = `${folder}/${uuid()}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
  if (error) throw new Error(error.message || "Supabase upload failed.");
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not resolve the Supabase public URL.");
  return data.publicUrl;
}

// Main entry point. Returns { file_url, source }.
export async function uploadFileWithFallback(file, folder = "uploads") {
  validateFile(file);

  // Compress images before uploading to save space.
  const isImage = (file.type || "").startsWith("image/");
  const toUpload = isImage ? await compressImage(file) : file;

  // 1) Supabase Storage is the primary handler.
  try {
    const url = await uploadToSupabase(toUpload, folder);
    return { file_url: url, source: "supabase" };
  } catch (supaErr) {
    console.warn("Supabase upload failed, falling back to R2:", supaErr?.message);
  }

  // 2) Fall back to Cloudflare R2.
  const url = await uploadToCloudflareR2(toUpload, folder);
  return { file_url: url, source: "r2" };
}

// Backwards-compatible wrapper: existing callers expect { file_url }.
export async function uploadFileToR2(file, folder = "uploads") {
  const { file_url } = await uploadFileWithFallback(file, folder);
  return { file_url };
}