import { base44 } from "@/api/base44Client";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "25MB";

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

export async function uploadFileToR2(file, folder = "uploads") {
  if (!file) {
    throw new Error("No file selected");
  }
  if (!validateUploadSize(file)) {
    throw new Error(`File upload limit is ${MAX_UPLOAD_LABEL}.`);
  }

  if ((file.type || "").startsWith("image/")) {
    const res = await base44.integrations.Core.UploadFile({ file });
    return { file_url: res.file_url };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await base44.functions.invoke("uploadToR2", {
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          dataUrl: reader.result,
          folder,
        });
        resolve({ file_url: res.data.file_url });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}