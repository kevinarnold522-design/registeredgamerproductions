import { base44 } from "@/api/base44Client";

/**
 * Read a user profile by email — straight from Supabase (the app's database).
 * Returns the true persisted record (avatar, banner, all fields) every time.
 */
export async function getProfileByEmail(email) {
  if (!email) return null;
  const rows = await base44.entities.UserProfile.filter({ user_email: email }, "-created_date", 1);
  return rows && rows[0] ? rows[0] : null;
}