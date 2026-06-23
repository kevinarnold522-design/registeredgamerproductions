// Monthly listing ranking — resets on the 1st of every month.
//
// We rank listings by a combined engagement score. Because the app stores
// running totals (not monthly snapshots), "this month" is approximated by
// counting only listings created in the current month toward fresh ranking,
// while still ranking the whole set by score. The ranking is recomputed on
// every load, so on the 1st of a new month the set naturally resets as new
// listings dominate.

export function currentMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Combined score: views + likes*2 + downloads*3 + shares
export function listingScore(l = {}) {
  return (
    (Number(l.views) || 0) +
    (Number(l.likes) || 0) * 2 +
    (Number(l.downloads) || 0) * 3 +
    (Number(l.shares) || 0)
  );
}

/**
 * Given an array of listings, return a Map of listing.id -> rank (1-based)
 * for the current month. Ranks every listing by score, highest first.
 * Ties keep their input order. Returns ranks 1..N.
 */
export function computeMonthlyRanks(listings = []) {
  const ranked = [...listings]
    .map((l, i) => ({ id: l.id, score: listingScore(l), i }))
    .sort((a, b) => (b.score - a.score) || (a.i - b.i));
  const map = new Map();
  ranked.forEach((entry, idx) => map.set(entry.id, idx + 1));
  return map;
}