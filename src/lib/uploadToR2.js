import { base44 } from "@/api/base44Client";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "25MB";

export function validateUploadSize(file) {
  return file && file.size <= MAX_UPLOAD_BYTES;
}

export function uploadFileToR2(file, folder = "uploads") {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }
    if (!validateUploadSize(file)) {
      reject(new Error(`File upload limit is ${MAX_UPLOAD_LABEL}.`));
      return;
    }
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