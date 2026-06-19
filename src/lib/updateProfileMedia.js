import { base44 } from "@/api/base44Client";

/**
 * Persist profile media fields (avatar_url, avatar_urls, banner_url) through
 * the Cloudflare Worker. The worker authenticates from the session cookie.
 *
 * @param {string} profileId
 * @param {object} updates - e.g. { avatar_url, avatar_urls } or { banner_url }
 * @returns {Promise<object>} the updated profile
 */
export async function updateProfileMedia(profileId, updates) {
  return base44.entities.UserProfile.update(profileId, updates);
}