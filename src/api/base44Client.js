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

/* ──────────────────────────────────────────────────────────────
   AUTH MIGRATION OVERRIDE (Supabase is the live auth provider).
   The old base44.auth.logout / redirectToLogin hit dead Base44
   routes (e.g. /api/apps/auth/logout → 404). We override them here
   so EVERY component that still calls base44.auth.* routes through
   Supabase instead. Single permanent fix point.
   ────────────────────────────────────────────────────────────── */
import { supabase } from '@/lib/supabaseClient';

if (base44?.auth) {
  base44.auth.logout = async (redirectUrl = '/') => {
    try {
      localStorage.removeItem('impersonation_session');
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('base44_token');
      if (supabase) await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      window.location.href = redirectUrl || '/';
    }
  };

  base44.auth.redirectToLogin = async (nextUrl) => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: nextUrl || window.location.href },
      });
    }
  };
}