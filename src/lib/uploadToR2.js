import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";
import { cf } from "@/lib/cfClient";

// =====================================================================
// Direct Supabase Storage upload helper used by listings, profiles,
// posts, covers, videos, and AI listing images.
//
// ROOT-CAUSE FIX: the app's `base44` client routes every functions.invoke
// call to the Cloudflare Worker, which does NOT host `createSupabaseUpload`
// (it returned 405), so the old signed-URL flow could never work in the
// browser. The bucket is public and allows authenticated uploads, so we
// now upload the file straight to Supabase Storage and read back its
// public URL — no backend function in the path.
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

// Build a safe, unique storage path: <folder>/<timestamp>-<rand>.<ext>
function buildPath(folder, file) {
  const safeFolder = String(folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const name = String(file.name || "upload");
  const ext = (name.includes(".") ? name.split(".").pop() : "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const rand = Math.random().toString(36).slice(2, 10);
  return `${safeFolder}/${Date.now()}-${rand}.${ext}`;
}

async function uploadToSupabase(file, folder) {
  const path = buildPath(folder, file);

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    console.error("Supabase storage upload failed", { path, message: error.message });
    const err = new Error(friendlyStorageError(error));
    // Mark permission/RLS/auth failures so the caller can fall back to the
    // server-side signed-upload path (works even without a browser session).
    err.isPermissionError = /row-level security|not authorized|unauthorized|permission|jwt|token|401|403/i.test(error.message || "");
    throw err;
  }

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Upload succeeded but no public URL was returned.");

  return { file_url: data.publicUrl, source: "supabase", bucket: SUPABASE_BUCKET, path };
}

// Server-issued signed upload URL (service role) — bypasses browser-session
// RLS, so users whose Supabase session is missing/expired can still upload.
async function uploadViaSignedUrl(file, folder) {
  const res = await cf.functions.invoke("createSupabaseUpload", {
    fileName: file.name || "upload",
    folder,
    size: file.size,
  });
  const info = res?.data;
  if (!info?.signedUrl || !info?.path) {
    throw new Error(info?.error || "Could not start upload. Please try again.");
  }

  const { error } = await supabase.storage
    .from(info.bucket || SUPABASE_BUCKET)
    .uploadToSignedUrl(info.path, info.token, file, {
      contentType: file.type || "application/octet-stream",
    });
  if (error) throw new Error(friendlyStorageError(error));

  if (!info.publicUrl) throw new Error("Upload succeeded but no public URL was returned.");
  return { file_url: info.publicUrl, source: "supabase", bucket: info.bucket || SUPABASE_BUCKET, path: info.path };
}

export async function uploadFileWithFallback(file, folder = "uploads") {
  validateFile(file);
  const isImage = (file.type || "").startsWith("image/");
  const toUpload = isImage ? await compressImage(file) : file;
  try {
    return await uploadToSupabase(toUpload, folder);
  } catch (err) {
    // Only fall back on permission/auth failures — keep real errors (too large,
    // bucket missing, network) surfacing as-is.
    if (!err?.isPermissionError) throw err;
    return uploadViaSignedUrl(toUpload, folder);
  }
}

// Backwards-compatible name used by existing components.
export async function uploadFileToR2(file, folder = "uploads") {
  const { file_url } = await uploadFileWithFallback(file, folder);
  return { file_url };
}