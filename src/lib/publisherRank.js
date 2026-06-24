import { computeLeaderboard } from "@/lib/leaderboardScore";

// Cache the community leaderboard ranks (email -> rank number) so listing cards
// can show each publisher's rank without each card recomputing the leaderboard.
let _rankPromise = null;
let _rankMap = null;

export function getPublisherRankMap() {
  if (_rankMap) return Promise.resolve(_rankMap);
  if (!_rankPromise) {
    _rankPromise = computeLeaderboard({ tab: "community" })
      .then((rows) => {
        const map = {};
        rows.forEach((r, i) => { if (r.email) map[r.email] = i + 1; });
        _rankMap = map;
        return map;
      })
      .catch(() => ({}));
  }
  return _rankPromise;
}