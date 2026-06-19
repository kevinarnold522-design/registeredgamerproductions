import { base44 } from "@/api/base44Client";

// Invoke an admin backend function, attaching the Supabase access token both as a
// Bearer header AND inside the request body (`accessToken`). The SDK does not
// reliably forward custom headers, so the body is the dependable path. This is
// required because app auth migrated to Supabase — base44.auth.me() is null on
// the backend, so admin functions must verify the Supabase token instead.
export async function invokeAdminFn(functionName, payload = {}) {
  let headers;
  let accessToken;
  try {
    const { supabase } = await import("@/lib/supabaseClient");
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token;
    if (accessToken) headers = { Authorization: `Bearer ${accessToken}` };
  } catch (_) {}
  const res = await base44.functions.invoke(
    functionName,
    { ...payload, accessToken },
    headers ? { headers } : {}
  );
  return res;
}