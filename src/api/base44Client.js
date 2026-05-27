import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// For Vercel deployments, appBaseUrl must point to the Base44 backend (not the Vercel URL).
// It is set via VITE_BASE44_APP_BASE_URL in Vercel environment variables.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  appBaseUrl,
  requiresAuth: false,
});