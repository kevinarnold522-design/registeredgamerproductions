/* LEGACY BACKUP - DO NOT MODIFY. 
   Used for reference during Supabase migration. 
*/import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, functionsVersion, appBaseUrl } = appParams;

// Resolve token: prefer URL param (already extracted by app-params), 
// then fall back to whatever is stored in localStorage
function resolveToken() {
  if (appParams.token) return appParams.token;
  try {
    return (
      localStorage.getItem('base44_access_token') ||
      localStorage.getItem('base44_token') ||
      null
    );
  } catch (_) {
    return null;
  }
}

export const base44 = createClient({
  appId,
  token: resolveToken(),
  functionsVersion,
  appBaseUrl,
  requiresAuth: false,
});
