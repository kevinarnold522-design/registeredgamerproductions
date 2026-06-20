import { supabase } from "@/lib/supabaseClient";

function externalFunctionEndpoints(functionName) {
  const endpoints = [];
  const vercelBase = (import.meta.env.VITE_VERCEL_API_URL || window.location.origin || "").replace(/\/$/, "");
  const cloudflareBase = (import.meta.env.VITE_CF_API_URL || "https://website-connected-gamerproductions.kevinarnold522.workers.dev").replace(/\/$/, "");
  if (vercelBase) endpoints.push({ source: "vercel", url: `${vercelBase}/api/base44-functions?function=${encodeURIComponent(functionName)}` });
  if (cloudflareBase) endpoints.push({ source: "cloudflare", url: `${cloudflareBase}/functions/${functionName}` });
  return endpoints;
}

async function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function updateProfileMedia(profileId, updates) {
  if (!profileId) throw new Error("Profile not found.");
  const headers = await authHeaders();
  let lastError = null;

  for (const endpoint of externalFunctionEndpoints("updateProfileMedia")) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ profile_id: profileId, updates }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && (data?.profile || data?.result || data?.success)) return data.profile || data.result || data;
      lastError = new Error(data?.error || `${endpoint.source} profile update failed.`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Could not save profile media.");
}