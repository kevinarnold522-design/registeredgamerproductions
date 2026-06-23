import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Trophy, Star } from "lucide-react";
import { computeLeaderboard } from "@/lib/leaderboardScore";

export default function UserPointsBadge({ userEmail }) {
  const [pts, setPts] = useState(0);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const recompute = useCallback(async () => {
    if (!userEmail) return;
    try {
      // Use the SAME leaderboard scoring so profile points always match
      // the leaderboard's points & rank exactly.
      const board = await computeLeaderboard({ tab: "community" });
      const idx = board.findIndex((e) => e.email === userEmail);
      setPts(idx >= 0 ? board[idx].score : 0);
      setRank(idx >= 0 ? idx + 1 : null);
    } catch {}
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    recompute();
    if (!userEmail) return;
    // Live-update points as the user's activity & gifts change
    const subs = ["CommunityPost", "ChannelPost", "Listing", "Tournament", "DailyReward", "Gift"]
      .map((name) => {
        try { return base44.entities[name].subscribe(() => recompute()); } catch { return null; }
      });
    return () => subs.forEach((u) => u && u());
  }, [userEmail, recompute]);

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