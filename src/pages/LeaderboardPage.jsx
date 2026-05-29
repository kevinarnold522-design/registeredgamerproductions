import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Star, Zap, Users, MessageCircle, Heart, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";

const TABS = [
  { id: "community", label: "Community", icon: Users },
  { id: "modding", label: "Modding", icon: Zap },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
];

const RANK_COLORS = [
  "from-yellow-500 to-amber-400",
  "from-slate-300 to-slate-400",
  "from-amber-700 to-amber-600",
];

const RANK_LABELS = ["🥇 Champion", "🥈 Elite", "🥉 Legend"];

function RankBadge({ rank }) {
  if (rank === 0) return <span className="text-yellow-400 font-black text-lg">🥇</span>;
  if (rank === 1) return <span className="text-slate-300 font-black text-lg">🥈</span>;
  if (rank === 2) return <span className="text-amber-600 font-black text-lg">🥉</span>;
  return <span className="text-gray-500 font-black text-sm">#{rank + 1}</span>;
}

function LeaderRow({ entry, rank, tab }) {
  const isTop3 = rank < 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        isTop3
          ? "bg-gradient-to-r from-purple-900/30 to-pink-900/20 border-purple-500/30"
          : "bg-gray-900/60 border-gray-800"
      }`}
    >
      <div className="w-10 text-center flex-shrink-0">
        <RankBadge rank={rank} />
      </div>

      {/* Avatar */}
      <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-black border-2 ${isTop3 ? "border-purple-500/60" : "border-gray-700"}`}
        style={{ background: isTop3 ? "linear-gradient(135deg,#7c3aed,#ec4899)" : "#1f2937" }}>
        {entry.avatar_url
          ? <img src={entry.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
          : (entry.username || "G")[0].toUpperCase()
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{entry.username || "Unknown"}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-gray-500 text-[10px] flex items-center gap-1">
            <MessageCircle className="w-2.5 h-2.5" /> {entry.posts} posts
          </span>
          <span className="text-gray-500 text-[10px] flex items-center gap-1">
            <Heart className="w-2.5 h-2.5" /> {entry.likes} likes
          </span>
          {entry.is_verified && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-900/50 border border-purple-700/40 text-purple-300 font-bold">✓ Verified</span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-black text-lg" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {entry.score.toLocaleString()}
        </p>
        <p className="text-gray-600 text-[10px]">pts</p>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("community");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tournament leaderboard state
  const [tournamentLb, setTournamentLb] = useState([]);

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    }
  }, [user]);

  useEffect(() => {
    loadLeaderboard(tab);
  }, [tab]);

  const loadLeaderboard = async (currentTab) => {
    setLoading(true);

    if (currentTab === "tournaments") {
      // Build leaderboard from tournaments — count wins/participations
      const tournaments = await base44.entities.Tournament.list("-created_date", 200);
      const scoreMap = {};
      tournaments.forEach(t => {
        if (!Array.isArray(t.participants)) return;
        t.participants.forEach(p => {
          if (!p.email) return;
          if (!scoreMap[p.email]) scoreMap[p.email] = { email: p.email, username: p.username || p.email, wins: 0, participated: 0, score: 0, avatar_url: p.avatar_url || "" };
          scoreMap[p.email].participated += 1;
          if (p.winner) scoreMap[p.email].wins += 1;
          scoreMap[p.email].score = scoreMap[p.email].wins * 100 + scoreMap[p.email].participated * 10;
        });
      });
      const sorted = Object.values(scoreMap).sort((a, b) => b.score - a.score).slice(0, 50).map(e => ({
        ...e,
        posts: e.participated,
        likes: e.wins,
      }));
      setLeaderboard(sorted);
      setLoading(false);
      return;
    }

    // For community & modding — aggregate from posts and ratings
    const [posts, ratings, profiles] = await Promise.all([
      base44.entities.CommunityPost.list("-created_date", 500),
      base44.entities.PostRating.list("-created_date", 1000),
      base44.entities.UserProfile.list("-created_date", 200),
    ]);

    // Filter posts by category for modding
    const filteredPosts = currentTab === "modding"
      ? posts.filter(p => {
          const content = (p.content || "").toLowerCase();
          return content.includes("mod") || content.includes("hack") || content.includes("patch") || content.includes("iso");
        })
      : posts;

    const scoreMap = {};

    filteredPosts.forEach(post => {
      const key = post.author_email;
      if (!key) return;
      if (!scoreMap[key]) scoreMap[key] = { email: key, username: post.author_username || key, posts: 0, likes: 0, score: 0, avatar_url: post.author_avatar || "" };
      scoreMap[key].posts += 1;
      scoreMap[key].likes += (post.likes || 0);
      scoreMap[key].score += 10 + (post.likes || 0) * 5;
    });

    // Also add rating scores
    ratings.forEach(r => {
      // find the post author from posts
      const post = posts.find(p => p.id === r.post_id);
      if (!post?.author_email) return;
      if (!scoreMap[post.author_email]) return;
      scoreMap[post.author_email].score += r.rating * 2;
    });

    // Enrich with profile data
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user_email] = p; });

    const sorted = Object.values(scoreMap)
      .map(entry => {
        const prof = profileMap[entry.email];
        return {
          ...entry,
          username: prof?.username || prof?.display_name || entry.username,
          avatar_url: prof?.avatar_url || entry.avatar_url,
          is_verified: prof?.is_verified || false,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    setLeaderboard(sorted);
    setLoading(false);
  };

  const admin = isAdmin(user?.email);

  const tabConfig = {
    community: { title: "Community", subtitle: "Top contributors by posts, likes & ratings", color: "#7c3aed" },
    modding: { title: "Modding", subtitle: "Top mod creators & uploaders", color: "#f97316" },
    tournaments: { title: "Tournaments", subtitle: "Top players by wins & participation", color: "#4ade80" },
  };

  const current = tabConfig[tab];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero */}
      <div className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #050510, #0a0518, #050510)` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-4">
              <Crown className="w-14 h-14 text-yellow-400" style={{ filter: "drop-shadow(0 0 20px rgba(234,179,8,0.6))" }} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              Top contributors across Gaming Community, Modding & Tournaments
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 bg-gray-900 rounded-2xl p-1.5 mb-6">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-purple-700 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Section header */}
        <div className="mb-5">
          <h2 className="text-xl font-black text-white">{current.title} Leaderboard</h2>
          <p className="text-gray-500 text-sm">{current.subtitle}</p>
        </div>

        {/* Top 3 podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2nd */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-slate-400 overflow-hidden bg-gray-800 flex items-center justify-center text-xl font-black">
                {leaderboard[1]?.avatar_url ? <img src={leaderboard[1].avatar_url} className="w-full h-full object-cover" alt="" /> : (leaderboard[1]?.username?.[0] || "?")}
              </div>
              <p className="text-white text-xs font-bold text-center max-w-20 truncate">{leaderboard[1]?.username}</p>
              <div className="w-20 bg-slate-600 rounded-t-xl flex flex-col items-center py-2" style={{ height: 60 }}>
                <span className="text-2xl">🥈</span>
              </div>
            </motion.div>
            {/* 1st */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-800 flex items-center justify-center text-2xl font-black"
                style={{ boxShadow: "0 0 20px rgba(234,179,8,0.5)" }}>
                {leaderboard[0]?.avatar_url ? <img src={leaderboard[0].avatar_url} className="w-full h-full object-cover" alt="" /> : (leaderboard[0]?.username?.[0] || "?")}
              </div>
              <p className="text-yellow-300 text-sm font-black text-center max-w-24 truncate">{leaderboard[0]?.username}</p>
              <div className="w-24 rounded-t-xl flex flex-col items-center py-2"
                style={{ height: 80, background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                <span className="text-2xl">🥇</span>
              </div>
            </motion.div>
            {/* 3rd */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-amber-700 overflow-hidden bg-gray-800 flex items-center justify-center text-xl font-black">
                {leaderboard[2]?.avatar_url ? <img src={leaderboard[2].avatar_url} className="w-full h-full object-cover" alt="" /> : (leaderboard[2]?.username?.[0] || "?")}
              </div>
              <p className="text-white text-xs font-bold text-center max-w-20 truncate">{leaderboard[2]?.username}</p>
              <div className="w-20 bg-amber-800 rounded-t-xl flex flex-col items-center py-2" style={{ height: 48 }}>
                <span className="text-2xl">🥉</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-900 animate-pulse" />)}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p className="font-semibold">No data yet — be the first to contribute!</p>
          </div>
        ) : (
          <div className="space-y-2 pb-16">
            {leaderboard.map((entry, rank) => (
              <LeaderRow key={entry.email} entry={entry} rank={rank} tab={tab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}