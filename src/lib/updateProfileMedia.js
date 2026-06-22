import { base44 } from "@/api/base44Client";

/**
 * Persist profile media/theme fields (avatar_url, avatar_urls, banner_url,
 * profile_theme_color, and any other profile field) straight to Supabase.
 * The write carries the user's Supabase session, so RLS authorizes it, and
 * the saved record is returned so the UI updates immediately and persists.
 */
export async function updateProfileMedia(profileId, updates) {
  if (!profileId) throw new Error("Profile not found.");
  const saved = await base44.entities.UserProfile.update(profileId, updates);
  if (!saved) throw new Error("Profile media did not save. Please try again.");
  return saved;
}