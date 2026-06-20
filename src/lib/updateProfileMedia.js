import { base44 } from "@/api/base44Client";

export async function updateProfileMedia(profileId, updates) {
  if (!profileId) throw new Error("Profile not found.");
  return base44.entities.UserProfile.update(profileId, updates);
}