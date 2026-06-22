// =====================================================================
// Direct Base44 SDK client — used ONLY for the hosted backend functions
// that live on Base44 (createSupabaseUpload, updateProfileMedia). The
// app's main `base44` export points at the Cloudflare worker, but those
// upload/media functions are deployed on Base44 and are the reliable path
// for preparing Supabase signed uploads from the browser.
//
// The app id + backend URL are injected at build time by the Base44 vite
// plugin, so we never hardcode them here.
// =====================================================================
import { createClient } from "@base44/sdk";

let cached = null;

export function getBase44Direct() {
  if (cached) return cached;
  cached = createClient({
    appId: import.meta.env.VITE_BASE44_APP_ID,
    serverUrl: import.meta.env.VITE_BASE44_BACKEND_URL,
    requiresAuth: false,
  });
  return cached;
}