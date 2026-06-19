import { base44 } from "@/api/base44Client";
import { compressImage } from "@/lib/compressImage";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "25MB";

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

// Upload through the backend uploadToR2 function. It verifies the Supabase
// access token, which we send BOTH as a Bearer header and inside the request
// body (`accessToken`) — the SDK does not reliably forward custom headers, so
// the body is the dependable path and prevents 401 "Unauthorized" upload errors.
async function invokeUpload(payload) {
  let headers;
  let accessToken;
  try {
    const { supabase } = await import("@/lib/supabaseClient");
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token;
    if (accessToken) headers = { Authorization: `Bearer ${accessToken}` };
  } catch (_) {}
  const res = await base44.functions.invoke(
    "uploadToR2",
    { ...payload, accessToken },
    headers ? { headers } : {}
  );
  return res.data;
}

export async function uploadFileToR2(file, folder = "uploads") {
  if (!file) {
    throw new Error("No file selected");
  }
  if (!validateUploadSize(file)) {
    throw new Error(`File upload limit is ${MAX_UPLOAD_LABEL}.`);
  }

  // Compress images before uploading; all file types go to Cloudflare R2.
  const toUpload = (file.type || "").startsWith("image/") ? await compressImage(file) : file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = await invokeUpload({
          fileName: toUpload.name || file.name,
          contentType: toUpload.type || file.type || "application/octet-stream",
          dataUrl: reader.result,
          folder,
        });
        resolve({ file_url: data.file_url });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(toUpload);
  });
}