import { base44 } from "@/api/base44Client";

// ── Single source of truth for leaderboard points ──────────────────
// Both the public Leaderboard page and the Admin leaderboard tab use this,
// so rankings and points always match.
//
// Scoring:
//   Post / Listing ............ +10
//   Like received ............. +5 each
//   Star rating ............... +2 each
//   10 views .................. +1
//   Download .................. +2 each
//   Physical sale (paid) ...... +1000
//
// Points are keyed by the CURRENT owner email (seller_email / author_email /
// creator_email). When a listing is transferred, its seller_email changes, so
// its points automatically move to the new owner and leave the old one.
export async function computeLeaderboard({ tab = "community" } = {}) {
  if (tab === "tournaments") {
    const tournaments = await base44.entities.Tournament.list("-created_date", 200).catch(() => []);
    const scoreMap = {};
    tournaments.forEach((t) => {
      if (!Array.isArray(t.participants)) return;
      t.participants.forEach((p) => {
        if (!p.email) return;
        if (!scoreMap[p.email]) scoreMap[p.email] = { email: p.email, username: p.username || p.email, posts: 0, likes: 0, wins: 0, participated: 0, score: 0, avatar_url: p.avatar_url || "" };
        scoreMap[p.email].participated += 1;
        if (p.winner) scoreMap[p.email].wins += 1;
      });
    });
    return Object.values(scoreMap)
      .map((e) => ({ ...e, posts: e.participated, likes: e.wins, score: e.wins * 1000 + e.participated * 10 }))
      .sort((a, b) => b.score - a.score);
  }

  const [posts, channelPosts, listings, ratings, profiles, orders] = await Promise.all([
    base44.entities.CommunityPost.list("-created_date", 1000).catch(() => []),
    base44.entities.ChannelPost.list("-created_date", 1000).catch(() => []),
    base44.entities.Listing.list("-created_date", 1000).catch(() => []),
    base44.entities.PostRating.list("-created_date", 1000).catch(() => []),
    base44.entities.UserProfile.list("-created_date", 1000).catch(() => []),
    base44.entities.Order.filter({ payment_status: "paid" }, "-created_date", 500).catch(() => []),
  ]);

  const isMod = (cat) => cat === "modding" || cat === "premium_mods";
  const modText = (s) => {
    const h = (s || "").toLowerCase();
    return h.includes("mod") || h.includes("hack") || h.includes("patch") || h.includes("iso");
  };

  const scoreMap = {};
  const seed = (email, fallbackName, avatar) => {
    if (!scoreMap[email]) scoreMap[email] = { email, username: fallbackName || email, posts: 0, likes: 0, score: 0, avatar_url: avatar || "" };
    return scoreMap[email];
  };

  // Seed every registered user so all members appear (even with 0 points)
  profiles.forEach((p) => {
    if (!p.user_email) return;
    scoreMap[p.user_email] = { email: p.user_email, username: p.username || p.display_name || p.user_email, posts: 0, likes: 0, score: 0, avatar_url: p.avatar_url || "" };
  });

  // Only count live content — skip removed/deleted posts & listings
  const activePosts = posts.filter((p) => p.status !== "removed" && p.status !== "deleted");
  const activeChannelPosts = channelPosts.filter((p) => p.status !== "removed" && p.status !== "deleted");
  const activeListings = listings.filter((l) => l.status !== "removed" && l.status !== "deleted");

  // Community posts
  (tab === "modding" ? activePosts.filter((p) => modText(p.content)) : activePosts).forEach((post) => {
    if (!post.author_email) return;
    const e = seed(post.author_email, post.author_username, post.author_avatar);
    e.posts += 1; e.likes += post.likes || 0; e.score += 10 + (post.likes || 0) * 5;
  });

  // Channel posts (gaming newsfeed)
  (tab === "modding" ? activeChannelPosts.filter((p) => modText(`${p.caption || ""} ${(p.tags || []).join(" ")}`)) : activeChannelPosts).forEach((post) => {
    if (!post.creator_email) return;
    const e = seed(post.creator_email, post.creator_username, post.creator_avatar);
    e.posts += 1; e.likes += post.likes || 0; e.score += 10 + (post.likes || 0) * 5;
  });

  // Listings — points belong to the CURRENT seller_email (moves on transfer)
  activeListings.forEach((l) => {
    if (!l.seller_email) return;
    if (tab === "modding" && !isMod(l.category)) return;
    const e = seed(l.seller_email, l.seller_username);
    e.posts += 1; e.likes += l.likes || 0;
    e.score += 10 + (l.likes || 0) * 5 + Math.floor((l.views || 0) / 10) + (l.downloads || 0) * 2;
  });

  // Physical sales
  orders.forEach((o) => {
    if (!o.seller_email) return;
    seed(o.seller_email, o.seller_username).score += 1000;
  });

  // Ratings — resolve author by content id (active community post OR listing only)
  const authorByContentId = {};
  activePosts.forEach((p) => { if (p.id) authorByContentId[p.id] = p.author_email; });
  activeListings.forEach((l) => { if (l.id) authorByContentId[l.id] = l.seller_email; });
  ratings.forEach((r) => {
    const author = authorByContentId[r.post_id];
    if (author && scoreMap[author]) scoreMap[author].score += (r.rating || 0) * 2;
  });

  // Enrich with profile data
  const profileMap = {};
  profiles.forEach((p) => { profileMap[p.user_email] = p; });

  return Object.values(scoreMap)
    .map((entry) => {
      const prof = profileMap[entry.email];
      return {
        ...entry,
        username: prof?.username || prof?.display_name || entry.username,
        avatar_url: prof?.avatar_url || entry.avatar_url,
        is_verified: prof?.is_verified || false,
        account_type: prof?.account_type || "regular",
      };
    })
    .sort((a, b) => b.score - a.score);
}