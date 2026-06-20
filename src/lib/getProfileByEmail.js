import { base44 } from "@/api/base44Client";

/**
 * Reliable profile read by email via the service-role backend function.
 * The user-scoped Worker read returned stale data (freshly-saved avatar/banner
 * missing), so profile images appeared to "disappear" on refresh. This always
 * returns the true persisted record.
 */
export async function getProfileByEmail(email) {
  if (!email) return null;
  const res = await base44.functions.invoke("getProfileByEmail", { email });
  const data = res?.data || res;
  if (data?.error) throw new Error(data.error);
  return data?.profile || null;
}