import { base44 } from "@/api/base44Client";
import { normalizeListingRecord } from "@/lib/categoryMatching";

let activeListingsCache = null;
let activeListingsPromise = null;
const profileCache = new Map();
const CACHE_MS = 60000;
const LISTINGS_TIMEOUT_MS = 8000;
const RECENT_ACTIVE_LISTINGS_LIMIT = 250;
const LISTINGS_CACHE_URL =
  (import.meta.env.VITE_CF_LISTINGS_CACHE_URL || "https://gamer-productions-api.kevinarnold522.workers.dev/cache/listings-active").replace(/\/$/, "");

// Bust the listings cache whenever any listing changes, so edits
// (e.g. currency) propagate to all pages immediately instead of after 60s.
try {
  base44.entities.Listing.subscribe(() => { activeListingsCache = null; });
} catch { /* subscription unsupported — falls back to time-based expiry */ }

function normalizeActiveListings(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((item) => normalizeListingRecord(item))
    .filter((item) => item?.status === "active" && item.is_approved !== false);
}

function mergeActiveListings(preferredRows = [], fallbackRows = []) {
  const byId = new Map();
  [...fallbackRows, ...preferredRows].forEach((item) => {
    if (!item?.id) return;
    byId.set(item.id, { ...(byId.get(item.id) || {}), ...item });
  });
  return Array.from(byId.values()).sort((a, b) => new Date(b?.created_date || 0) - new Date(a?.created_date || 0));
}

async function fetchFreshActiveListings(limit = RECENT_ACTIVE_LISTINGS_LIMIT) {
  const rows = await Promise.race([
    base44.entities.Listing.filter({ status: "active" }, "-created_date", limit),
    new Promise((resolve) => setTimeout(() => resolve([]), LISTINGS_TIMEOUT_MS)),
  ]);
  return normalizeActiveListings(rows);
}

export function invalidateActiveListingsCache() {
  activeListingsCache = null;
}

export function upsertActiveListingsCache(...records) {
  const normalized = normalizeActiveListings(records);
  const merged = mergeActiveListings(normalized, activeListingsCache?.data || []);
  activeListingsCache = { time: Date.now(), data: merged };
  return merged;
}

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
        const [cachedResponse, freshListings] = await Promise.allSettled([
          fetch(LISTINGS_CACHE_URL, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }),
          fetchFreshActiveListings(),
        ]);

        if (cachedResponse.status !== "fulfilled" || !cachedResponse.value.ok) {
          throw new Error(
            cachedResponse.status === "fulfilled"
              ? `Listing cache failed (${cachedResponse.value.status})`
              : "Listing cache request failed"
          );
        }

        const rows = await cachedResponse.value.json();
        const cachedListings = normalizeActiveListings(rows);
        const freshData = freshListings.status === "fulfilled" ? freshListings.value : [];
        const data = mergeActiveListings(freshData, cachedListings);
        activeListingsCache = { time: Date.now(), data };
        return data;
      } catch {
        if (activeListingsCache?.data) return activeListingsCache.data;
        try {
          const data = await fetchFreshActiveListings();
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

export function peekActiveListings() {
  return activeListingsCache?.data || [];
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
