import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";

/**
 * Persist profile media fields (avatar_url, avatar_urls, banner_url) via the
 * backend service-role function. Direct frontend entity writes are unreliable
 * in the hybrid Supabase auth setup, so all media updates route through here.
 *
 * @param {string} profileId
 * @param {object} updates - e.g. { avatar_url, avatar_urls } or { banner_url }
 * @returns {Promise<object>} the updated profile
 */
export async function updateProfileMedia(profileId, updates) {
  let headers = {};
  let accessToken;
  try {
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  } catch (_) {}

  const res = await base44.functions.invoke(
    "updateProfileMedia",
    { profile_id: profileId, updates, accessToken },
    { headers }
  );
  if (res?.data?.error) throw new Error(res.data.error);
  return res?.data?.profile;
}