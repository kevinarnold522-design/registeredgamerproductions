export async function updateProfileMedia(profileId, updates) {
  if (!profileId) throw new Error("Profile not found.");

  // Save the new media URLs straight to the profile record.
  const { base44 } = await import("@/api/base44Client");
  return base44.entities.UserProfile.update(profileId, updates);
}