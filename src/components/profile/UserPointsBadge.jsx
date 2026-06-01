import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Trophy, Star } from "lucide-react";

export default function UserPointsBadge({ userEmail }) {
  const [pts, setPts] = useState(0);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    const calc = async () => {
      try {
        const [posts, ratings, listing] = await Promise.all([
          base44.entities.CommunityPost.filter({ author_email: userEmail }),
          base44.entities.PostRating.filter({ user_email: userEmail }),
          base44.entities.Listing.filter({ seller_email: userEmail }),
        ]);
        let score = 0;
        score += posts.filter(p => p.status === "active").length * 10;
        score += ratings.length * 5; // 5pts per heart/rating given
        score += listing.filter(l => l.status === "active").length * 20;
        // Add likes received
        const myListingLikes = listing.reduce((s, l) => s + (l.likes || 0), 0);
        score += myListingLikes * 5; // 5pts per heart received
        setPts(score);

        // Calculate rank — load all profiles for ranking
        const allProfiles = await base44.entities.UserProfile.list("-updated_date", 100);
        const scores = await Promise.all(allProfiles.map(async p => {
          const [pp, pr, pl] = await Promise.all([
            base44.entities.CommunityPost.filter({ author_email: p.user_email }),
            base44.entities.PostRating.filter({ user_email: p.user_email }),
            base44.entities.Listing.filter({ seller_email: p.user_email }),
          ]);
          let s = pp.filter(x => x.status === "active").length * 10;
          s += pr.length * 5;
          s += pl.filter(x => x.status === "active").length * 20;
          s += pl.reduce((a, l) => a + (l.likes || 0), 0) * 5;
          return { email: p.user_email, score: s };
        }));
        scores.sort((a, b) => b.score - a.score);
        const myRank = scores.findIndex(s => s.email === userEmail) + 1;
        setRank(myRank > 0 ? myRank : null);
      } catch {}
      setLoading(false);
    };
    calc();
  }, [userEmail]);

  if (loading || pts === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mt-2 flex-wrap"
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
        style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(236,72,153,0.15))", border: "1px solid rgba(168,85,247,0.4)" }}>
        <Star className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-white font-black text-sm">{pts.toLocaleString()}</span>
        <span className="text-gray-400 text-xs">pts</span>
      </div>
      {rank && rank <= 100 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }}>
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-300 font-black text-sm">#{rank}</span>
          <span className="text-gray-400 text-xs">leaderboard</span>
        </div>
      )}
    </motion.div>
  );
}