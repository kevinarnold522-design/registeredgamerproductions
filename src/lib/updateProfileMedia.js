import { supabase } from "@/lib/supabaseClient";
import { base44 } from "@/api/base44Client";

/**
 * Persist profile media/theme fields (avatar_url, avatar_urls, banner_url,
 * profile_theme_color) through the secure `updateProfileMedia` backend function.
 *
 * Why not base44.entities.UserProfile.update directly?
 * The user-scoped Worker entity update was not reliably persisting these writes,
 * so images "disappeared" on refresh. The backend function uses the service role
 * after verifying the caller's Supabase access token — it always persists and
 * returns the saved profile record.
 */
export async function updateProfileMedia(profileId, updates) {
  if (!profileId) throw new Error("Profile not found.");

  // Get the current Supabase access token so the backend can verify the caller.
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || "";

  const res = await base44.functions.invoke("updateProfileMedia", {
    profile_id: profileId,
    updates,
    accessToken,
  });

  const data = res?.data || res;
  if (data?.error) throw new Error(data.error);
  if (!data?.profile) throw new Error("Profile media did not save. Please try again.");

  return data.profile;
}