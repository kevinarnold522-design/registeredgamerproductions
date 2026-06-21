import { base44 } from "@/api/base44Client";

// ── Single source of truth for a single user's live points ──────────
// Used by the profile points badge. Recomputes in real time from the
// user's own activity so the number updates as they post, share, win
// tournaments, check in daily, and receive gifts.
//
// Scoring (Standard):
//   Post / Listing / Channel post .... +10
//   Share ............................ +5  each
//   Like received .................... +5  each
//   Tournament win ................... +100 each
//   Daily reward check-in ............ +20 per check-in
//   Points gift received ............. + the gift's points value
export const POINTS = {
  POST: 10,
  SHARE: 5,
  LIKE: 5,
  TOURNAMENT_WIN: 100,
  DAILY_CHECKIN: 20,
};

export async function computeUserPoints(userEmail) {
  if (!userEmail) return 0;

  const [posts, channelPosts, listings, tournaments, daily, gifts] = await Promise.all([
    base44.entities.CommunityPost.filter({ author_email: userEmail }).catch(() => []),
    base44.entities.ChannelPost.filter({ creator_email: userEmail }).catch(() => []),
    base44.entities.Listing.filter({ seller_email: userEmail }).catch(() => []),
    base44.entities.Tournament.list("-created_date", 200).catch(() => []),
    base44.entities.DailyReward.filter({ user_email: userEmail }).catch(() => []),
    base44.entities.Gift.filter({ recipient_email: userEmail, gift_type: "points" }).catch(() => []),
  ]);

  let score = 0;

  const activePosts = posts.filter((p) => p.status !== "removed" && p.status !== "deleted");
  activePosts.forEach((p) => {
    score += POINTS.POST + (p.likes || 0) * POINTS.LIKE + (p.shares_count || p.shares || 0) * POINTS.SHARE;
  });

  const activeChannel = channelPosts.filter((p) => p.status !== "removed" && p.status !== "deleted");
  activeChannel.forEach((p) => {
    score += POINTS.POST + (p.likes || 0) * POINTS.LIKE + (p.shares_count || p.shares || 0) * POINTS.SHARE;
  });

  const activeListings = listings.filter((l) => l.status === "active");
  activeListings.forEach((l) => {
    score += POINTS.POST + (l.likes || 0) * POINTS.LIKE + (l.shares || 0) * POINTS.SHARE;
  });

  // Tournament wins
  tournaments.forEach((t) => {
    if (!Array.isArray(t.participants)) return;
    t.participants.forEach((p) => {
      if (p.email === userEmail && p.winner) score += POINTS.TOURNAMENT_WIN;
    });
  });

  // Daily reward streak — synced into points
  if (daily[0]) {
    score += (daily[0].total_checkins || 0) * POINTS.DAILY_CHECKIN;
  }

  // Points gifts received
  gifts.forEach((g) => { score += g.points_cost || 0; });

  return score;
}