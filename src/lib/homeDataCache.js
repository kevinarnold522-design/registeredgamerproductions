import { base44 } from "@/api/base44Client";
import { normalizeListingRecord } from "@/lib/categoryMatching";

let activeListingsCache = null;
let activeListingsPromise = null;
const profileCache = new Map();
const CACHE_MS = 60000;
const LISTINGS_TIMEOUT_MS = 8000;
const LISTINGS_CACHE_URL =
  (import.meta.env.VITE_CF_LISTINGS_CACHE_URL || "https://gamer-productions-api.kevinarnold522.workers.dev/cache/listings-active").replace(/\/$/, "");

// Bust the listings cache whenever any listing changes, so edits
// (e.g. currency) propagate to all pages immediately instead of after 60s.
try {
  base44.entities.Listing.subscribe(() => { activeListingsCache = null; });
} catch { /* subscription unsupported — falls back to time-based expiry */ }

export async function getActiveListings() {
  const now = Date.now();
  if (activeListingsCache && now - activeListingsCache.time < CACHE_MS) {
    return activeListingsCache.data;
  }
  if (!activeListingsPromise) {
    activeListingsPromise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LISTINGS_TIMEOUT_MS);
      try {
        const response = await fetch(LISTINGS_CACHE_URL, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Listing cache failed (${response.status})`);
        const rows = await response.json();
        const data = (Array.isArray(rows) ? rows : [])
          .map((item) => normalizeListingRecord(item))
          .filter((item) => item?.status === "active" && item.is_approved !== false);
        activeListingsCache = { time: Date.now(), data };
        return data;
      } catch {
        if (activeListingsCache?.data) return activeListingsCache.data;
        try {
          const rows = await Promise.race([
            base44.entities.Listing.filter({ status: "active" }, "-created_date"),
            new Promise((resolve) => setTimeout(() => resolve([]), LISTINGS_TIMEOUT_MS)),
          ]);
          const data = (Array.isArray(rows) ? rows : [])
            .map((item) => normalizeListingRecord(item))
            .filter((item) => item?.status === "active" && item.is_approved !== false);
          activeListingsCache = { time: Date.now(), data };
          return data;
        } catch {
          return activeListingsCache?.data || [];
        }
      } finally {
        clearTimeout(timeout);
        activeListingsPromise = null;
      }
    })();
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
