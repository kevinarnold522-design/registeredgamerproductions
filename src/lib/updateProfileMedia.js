import { base44 } from "@/api/base44Client";

// Reject if the write takes too long, so the UI never gets stuck "saving".
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);
}

/**
 * Persist profile media fields (avatar_url, avatar_urls, banner_url) through
 * the Cloudflare Worker. The worker authenticates from the session cookie.
 *
 * @param {string} profileId
 * @param {object} updates - e.g. { avatar_url, avatar_urls } or { banner_url }
 * @returns {Promise<object>} the updated profile
 */
export async function updateProfileMedia(profileId, updates) {
  return withTimeout(
    base44.entities.UserProfile.update(profileId, updates),
    20000,
    "Saving profile"
  );
}