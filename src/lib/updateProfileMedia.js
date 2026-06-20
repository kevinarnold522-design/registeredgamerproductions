import { supabase } from "@/lib/supabaseClient";

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);
}

export async function updateProfileMedia(profileId, updates) {
  const save = supabase
    .from("user_profiles")
    .update({ ...updates, updated_date: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();

  const { data, error } = await withTimeout(save, 20000, "Saving profile");
  if (error) throw error;
  return data;
}