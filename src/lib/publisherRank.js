import { computeLeaderboard } from "@/lib/leaderboardScore";

// Cache the community leaderboard ranks (email -> rank number) so listing cards
// can show each publisher's rank without each card recomputing the leaderboard.
// TTL: 10 minutes — avoids re-fetching 7×1000-record API calls on every navigation.
let _rankPromise = null;
let _rankMap = null;
let _rankFetchedAt = 0;
const RANK_TTL_MS = 10 * 60 * 1000;

export function getPublisherRankMap() {
  const now = Date.now();
  if (_rankMap && (now - _rankFetchedAt) < RANK_TTL_MS) return Promise.resolve(_rankMap);
  if (!_rankPromise || (now - _rankFetchedAt) >= RANK_TTL_MS) {
    _rankPromise = computeLeaderboard({ tab: "community" })
      .then((rows) => {
        const map = {};
        rows.forEach((r, i) => { if (r.email) map[r.email] = i + 1; });
        _rankMap = map;
        _rankFetchedAt = Date.now();
        return map;
      })
      .catch(() => {
        _rankPromise = null; // allow retry on next call
        return {};
      });
  }
  return _rankPromise;
}