export function isSocialInAppBrowserUserAgent(userAgent = "") {
  return /Instagram|FBAN|FBAV|FB_IAB|Line|Twitter|TikTok|Snapchat/i.test(String(userAgent || ""));
}

export function isLikelyMobileWebDevice() {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";

  try {
    if (isSocialInAppBrowserUserAgent(ua)) return true;
  } catch {}

  try {
    if (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1) {
      if (window.matchMedia?.("(max-width: 1279px)")?.matches) return true;
    }
  } catch {}

  try {
    if (window.matchMedia?.("(pointer: coarse)")?.matches) return true;
  } catch {}

  try {
    if (window.matchMedia?.("(max-width: 1023px)")?.matches) return true;
  } catch {}

  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
}
