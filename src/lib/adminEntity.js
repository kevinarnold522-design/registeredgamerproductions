import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";

/**
 * Admin entity writes via the service-role backend function.
 * Direct frontend base44.entities writes have no valid token in the hybrid
 * Supabase auth setup and fail silently, so admin mutations route through here.
 */
async function invoke(payload) {
  let headers = {};
  let accessToken;
  try {
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  } catch (_) {}
  const res = await base44.functions.invoke("adminUpdateEntity", { ...payload, accessToken }, { headers });
  if (res?.data?.error) throw new Error(res.data.error);
  return res?.data?.result;
}

export function adminUpdateEntity(entity, id, data) {
  return invoke({ entity, action: "update", id, data });
}

export function adminCreateEntity(entity, data) {
  return invoke({ entity, action: "create", data });
}