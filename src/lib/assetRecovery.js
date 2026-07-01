const ASSET_RECOVERY_KEY = "gp_asset_recovery_attempts";
const ASSET_RECOVERY_PARAM = "__asset_reload";
const MAX_ASSET_RECOVERY_ATTEMPTS = 2;

const ASSET_ERROR_PATTERNS = [
  "chunkloaderror",
  "loading chunk",
  "failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "importing a module script failed",
  "unable to preload css",
  "failed to fetch module",
  // Mobile-specific transient failures we also want to auto-recover from:
  "failed to fetch",            // Chrome / Android WebView fetch abort
  "networkerror",               // Firefox
  "load failed",                // iOS Safari generic resource load failure
  "the network connection was lost", // iOS Safari
  "the operation couldn\u2019t be completed", // iOS Safari (smart-quote)
  "the operation couldn't be completed",
  "script error",               // cross-origin chunk script error
  "err_network",
  "err_internet_disconnected",
  "unsupported mime type",
  "text/html",
  "unexpected token '<'",
  "expected a javascript module script",
  "disallowed mime type",
];

export function isLikelyAssetVersionError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return ASSET_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

export function tryRecoverFromAssetError() {
  if (typeof window === "undefined") return false;

  let attempts = 0;
  try {
    attempts = Number.parseInt(sessionStorage.getItem(ASSET_RECOVERY_KEY) || "0", 10) || 0;
  } catch {}

  if (attempts >= MAX_ASSET_RECOVERY_ATTEMPTS) return false;

  try {
    sessionStorage.setItem(ASSET_RECOVERY_KEY, String(attempts + 1));
  } catch {}

  const url = new URL(window.location.href);
  url.searchParams.set(ASSET_RECOVERY_PARAM, Date.now().toString(36));
  window.location.replace(url.toString());
  return true;
}

export function clearAssetRecoveryState() {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(ASSET_RECOVERY_KEY);
  } catch {}

  const url = new URL(window.location.href);
  if (!url.searchParams.has(ASSET_RECOVERY_PARAM)) return;

  url.searchParams.delete(ASSET_RECOVERY_PARAM);
  const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
}