import { base44 } from "@/api/base44Client";

let activeListingsCache = null;
let activeListingsPromise = null;
const profileCache = new Map();
const CACHE_MS = 60000;

export async function getActiveListings() {
  const now = Date.now();
  if (activeListingsCache && now - activeListingsCache.time < CACHE_MS) {
    return activeListingsCache.data;
  }
  if (!activeListingsPromise) {
    activeListingsPromise = base44.entities.Listing.filter({ status: "active" }, "-created_date", 120)
      .then(rows => rows.filter(item => item.is_approved !== false))
      .then(data => {
        activeListingsCache = { time: Date.now(), data };
        return data;
      })
      .finally(() => { activeListingsPromise = null; });
  }
  return activeListingsPromise;
}

export async function getCachedUserProfile(email) {
  if (!email) return null;
  if (profileCache.has(email)) return profileCache.get(email);
  const promise = base44.entities.UserProfile.filter({ user_email: email }, "-created_date", 1)
    .then(rows => rows[0] || null)
    .catch(() => null);
  profileCache.set(email, promise);
  return promise;
}