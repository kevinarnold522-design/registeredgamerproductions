import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Star, TrendingUp, Eye, DollarSign, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GamerCheckmark from "@/components/shared/GamerCheckmark";

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-orange-400"];
const RANK_BG = ["bg-yellow-500/10 border-yellow-500/40", "bg-gray-500/10 border-gray-500/30", "bg-orange-500/10 border-orange-500/30"];

export default function LeaderboardTab() {
  const [profiles, setProfiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("creators");

  useEffect(() => {
    const load = async () => {
      const [profs, vids] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.VideoPost.list(),
      ]);
      setProfiles(profs);
      setVideos(vids);
      setLoading(false);
    };
    load();
  }, []);

  // Leaderboard data builders
  const topCreators = profiles
    .filter(p => p.account_type === "digital_creator")
    .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
    .slice(0, 10)
    .map(p => ({
      ...p,
      score: p.total_views || 0,
      scoreLabel: `${(p.total_views || 0).toLocaleString()} views`,
      sub: `${(p.youtube_subscribers || 0).toLocaleString()} subscribers`,
    }));

  const topSellers = profiles
    .filter(p => p.account_type === "business" || p.account_type === "digital_creator")
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .slice(0, 10)
    .map(p => ({
      ...p,
      score: p.total_revenue || 0,
      scoreLabel: `₱${(p.total_revenue || 0).toLocaleString()}`,
      sub: `${(p.total_sales || 0)} sales`,
    }));

  // Group videos by creator for top video earners
  const videosByCreator = videos.reduce((acc, v) => {
    const email = v.creator_email;
    if (!acc[email]) acc[email] = { email, username: v.creator_username, avatar: v.creator_avatar, totalViews: 0, totalVideos: 0 };
    acc[email].totalViews += (v.views || 0);
    acc[email].totalVideos += 1;
    return acc;
  }, {});
  const topVideoEarners = Object.values(videosByCreator)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 10)
    .map(c => ({
      username: c.username,
      avatar_url: c.avatar,
      score: c.totalViews,
      scoreLabel: `${c.totalViews.toLocaleString()} views`,
      sub: `${c.totalVideos} videos`,
      account_type: "digital_creator",
    }));

  const categories = [
    { id: "creators", label: "🎬 Top Creators", data: topCreators, icon: Eye, color: "text-purple-400" },
    { id: "sellers", label: "🏆 Top Sellers", data: topSellers, icon: DollarSign, color: "text-green-400" },
    { id: "videos", label: "🔥 Video Views", data: topVideoEarners, icon: TrendingUp, color: "text-red-400" },
  ];

  const currentCategory = categories.find(c => c.id === category);
  const leaderData = currentCategory?.data || [];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-white font-black text-xl">Community Leaderboard</h2>
          <p className="text-gray-500 text-xs">Top performers on GAMER Productions</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${category === c.id ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {leaderData.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[leaderData[1], leaderData[0], leaderData[2]].map((user, idx) => {
            const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
            const isPrimary = rank === 0;
            return (
              <motion.div key={rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: isPrimary ? 0 : 16 }} transition={{ delay: rank * 0.1 }}
                className={`rounded-2xl border p-4 text-center ${RANK_BG[rank]} ${isPrimary ? "scale-105 shadow-lg shadow-yellow-900/20" : ""}`}>
                <div className="text-2xl mb-1">{MEDALS[rank]}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mx-auto mb-2 flex items-center justify-center text-xl overflow-hidden">
                  {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className={`font-black text-sm truncate ${RANK_COLORS[rank]}`}>{user?.username || "—"}</p>
                  <GamerCheckmark accountType={user?.account_type} isVerified={user?.is_verified} userEmail={user?.user_email} size="sm" />
                </div>
                <p className={`text-xs font-bold ${RANK_COLORS[rank]}`}>{user?.scoreLabel || "—"}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{user?.sub || ""}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full rankings list */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <h3 className="text-white font-bold">Full Rankings</h3>
        </div>
        {leaderData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No data yet — be the first on the leaderboard!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {leaderData.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/30 transition-colors">
                <span className={`w-7 text-center font-black text-sm ${i < 3 ? RANK_COLORS[i] : "text-gray-600"}`}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-base overflow-hidden flex-shrink-0">
                  {item?.avatar_url ? <img src={item.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm truncate">{item?.username}</span>
                    <GamerCheckmark accountType={item?.account_type} isVerified={item?.is_verified} userEmail={item?.user_email} size="sm" />
                  </div>
                  <span className="text-gray-500 text-xs">{item?.sub}</span>
                </div>
                <span className={`font-black text-sm ${currentCategory?.color}`}>{item?.scoreLabel}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}