import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "25MB";

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

// Send the current Supabase access token so the backend function can authenticate the upload.
async function invokeUpload(payload) {
  let headers = {};
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  const res = await base44.functions.invoke("uploadToR2", payload, { headers });
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