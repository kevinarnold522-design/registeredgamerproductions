// Client-side image compression — shrinks images before uploading to R2/storage
// to save space. Non-images and already-tiny files pass through untouched.

const MAX_DIMENSION = 1600; // px, longest edge
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 120 * 1024; // don't bother compressing < 120KB

export async function compressImage(file) {
  try {
    if (!file || !(file.type || "").startsWith("image/")) return file;
    // GIFs (animated) and SVGs shouldn't be rasterized
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
    if (file.size <= SKIP_BELOW_BYTES) return file;

    const bitmap = await loadBitmap(file);
    const { width, height } = scaleDimensions(bitmap.width, bitmap.height);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);
    if (bitmap.close) bitmap.close();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob || blob.size >= file.size) return file; // keep original if no gain

    const newName = file.name.replace(/\.(png|webp|bmp|jpeg|jpg)$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file; // never block an upload on a compression error
  }
}

function loadBitmap(file) {
  if (window.createImageBitmap) return createImageBitmap(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function scaleDimensions(w, h) {
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) return { width: w, height: h };
  const ratio = w > h ? MAX_DIMENSION / w : MAX_DIMENSION / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}