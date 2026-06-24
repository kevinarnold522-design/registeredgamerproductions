import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Star, Zap, Users, MessageCircle, Heart, Shield, Medal, Award, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { computeLeaderboard, computeListingLeaderboard } from "@/lib/leaderboardScore";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import ListingLeaderRow from "@/components/leaderboard/ListingLeaderRow";

const TABS = [
  { id: "community", label: "Community", icon: Users },
  { id: "listings", label: "Listings", icon: Package },
  { id: "modding", label: "Modding", icon: Zap },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
];

const RANK_COLORS = [
  "from-yellow-500 to-amber-400",
  "from-slate-300 to-slate-400",
  "from-amber-700 to-amber-600",
];

const RANK_LABELS = ["Champion", "Elite", "Legend"];

function RankBadge({ rank }) {
  if (rank === 0) return <Medal className="w-5 h-5 text-yellow-400 mx-auto" style={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.7))" }} />;
  if (rank === 1) return <Medal className="w-5 h-5 text-slate-300 mx-auto" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-amber-600 mx-auto" />;
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
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-white font-bold text-sm truncate">{entry.username || "Unknown"}</p>
          <GamerCheckmark isVerified={entry.is_verified} userEmail={entry.email} size="sm" showTooltip={false} />
          {rank === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 font-black inline-flex items-center gap-0.5"><Star className="w-2.5 h-2.5" /> Top Contributor</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-gray-500 text-[10px] flex items-center gap-1">
            <MessageCircle className="w-2.5 h-2.5" /> {entry.posts} posts
          </span>
          <span className="text-gray-500 text-[10px] flex items-center gap-1">
            <Heart className="w-2.5 h-2.5" /> {entry.likes} likes
          </span>
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
    const limit = user ? 100 : 10;
    const sorted = currentTab === "listings"
      ? await computeListingLeaderboard()
      : await computeLeaderboard({ tab: currentTab });
    setLeaderboard(sorted.slice(0, limit));
    setLoading(false);
  };

  const admin = isAdmin(user?.email);

  const tabConfig = {
    community: { title: "Community", subtitle: "Top contributors by posts, likes & ratings", color: "#7c3aed" },
    listings: { title: "Listings", subtitle: "Top listings by views, likes & downloads", color: "#22d3ee" },
    modding: { title: "Modding", subtitle: "Top mod creators & uploaders", color: "#f97316" },
    tournaments: { title: "Tournaments", subtitle: "Top players by wins & participation", color: "#4ade80" },
  };

  const isListings = tab === "listings";

  const current = tabConfig[tab];

  const top10 = leaderboard.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero */}
      <div className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #050510, #0a0518, #050510)` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-8 text-center">
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
            {!user && (
              <p className="text-yellow-400/70 text-xs mt-2">Sign in to unlock Top 100 rankings</p>
            )}
            {/* Points legend — how each action is scored */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl mx-auto">
              {[
                { label: "Post / Listing", pts: "+10" },
                { label: "Like received", pts: "+5" },
                { label: "Star rating", pts: "+2 ea" },
                { label: "10 views", pts: "+1" },
                { label: "Download", pts: "+2" },
                { label: "Physical sale", pts: "+1000" },
                { label: "Tournament win", pts: "+1000" },
              ].map(p => (
                <span key={p.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-700/40 text-xs">
                  <span className="text-gray-300">{p.label}</span>
                  <span className="font-black text-green-400">{p.pts}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Two-column layout: Top 10 sidebar + main content */}
        <div className="flex gap-6 flex-col lg:flex-row">

          {/* LEFT: Top 10 Leaders — always visible, large, prominent */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-20">
              <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a2e, #0a1a2e)", border: "1px solid rgba(124,58,237,0.3)" }}>
                <div className="p-4 border-b border-purple-900/40" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.1))" }}>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-white font-black text-lg">Top 10 Leaders</h2>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{tabConfig[tab]?.title} Rankings</p>
                </div>
                <div className="p-3 space-y-2">
                  {loading ? (
                    [1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-14 rounded-xl bg-gray-800/50 animate-pulse" />)
                  ) : top10.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
                  ) : top10.map((entry, rank) => (
                    <motion.div
                      key={isListings ? entry.id : entry.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rank * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${rank < 3 ? "bg-gradient-to-r from-purple-900/40 to-pink-900/20 border border-purple-700/30" : "bg-gray-800/30"}`}
                    >
                      <div className="w-8 text-center flex-shrink-0">
                        {rank === 0 ? <Medal className="w-5 h-5 text-yellow-400 mx-auto" style={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.7))" }} />
                          : rank === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                          : rank === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                          : <span className="text-gray-400 font-black text-sm">#{rank+1}</span>}
                      </div>
                      <div className={`w-10 h-10 ${isListings ? "rounded-xl" : "rounded-full"} overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-sm border-2 ${rank < 3 ? "border-purple-500/60" : "border-gray-700"}`}
                        style={{ background: rank < 3 ? "linear-gradient(135deg,#7c3aed,#ec4899)" : "#1f2937" }}>
                        {(isListings ? entry.image : entry.avatar_url)
                          ? <img src={isListings ? entry.image : entry.avatar_url} className="w-full h-full object-cover" alt="" />
                          : ((isListings ? entry.title : entry.username) || "G")[0].toUpperCase()
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-bold text-sm truncate">{(isListings ? entry.title : entry.username) || "Unknown"}</p>
                          {!isListings && <GamerCheckmark isVerified={entry.is_verified} userEmail={entry.email} size="sm" showTooltip={false} />}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-base" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {entry.score.toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-[9px]">pts</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {!user && (
                  <div className="p-4 border-t border-purple-900/30 text-center">
                    <p className="text-gray-400 text-xs mb-2">Join to climb the ranks!</p>
                    <button onClick={() => base44.auth.redirectToLogin()}
                      className="w-full py-2 rounded-xl text-sm font-black text-white"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                      Sign Up Free
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Main leaderboard content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
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

            {/* Top 3 podium */}
            {!loading && !isListings && leaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-400 overflow-hidden bg-gray-800 flex items-center justify-center text-xl font-black">
                    {leaderboard[1]?.avatar_url ? <img src={leaderboard[1].avatar_url} className="w-full h-full object-cover" alt="" /> : (leaderboard[1]?.username?.[0] || "?")}
                  </div>
                  <p className="text-white text-xs font-bold text-center max-w-20 truncate">{leaderboard[1]?.username}</p>
                  <div className="w-20 bg-slate-600 rounded-t-xl flex flex-col items-center py-2" style={{ height: 60 }}><Medal className="w-7 h-7 text-slate-200" /></div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-800 flex items-center justify-center text-2xl font-black"
                    style={{ boxShadow: "0 0 20px rgba(234,179,8,0.5)" }}>
                    {leaderboard[0]?.avatar_url ? <img src={leaderboard[0].avatar_url} className="w-full h-full object-cover" alt="" /> : (leaderboard[0]?.username?.[0] || "?")}
                  </div>
                  <p className="text-yellow-300 text-sm font-black text-center max-w-24 truncate">{leaderboard[0]?.username}</p>
                  <div className="w-24 rounded-t-xl flex flex-col items-center py-2"
                    style={{ height: 80, background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}><Medal className="w-8 h-8 text-yellow-300" style={{ filter: "drop-shadow(0 0 8px rgba(234,179,8,0.8))" }} /></div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-700 overflow-hidden bg-gray-800 flex items-center justify-center text-xl font-black">
                    {leaderboard[2]?.avatar_url ? <img src={leaderboard[2].avatar_url} className="w-full h-full object-cover" alt="" /> : (leaderboard[2]?.username?.[0] || "?")}
                  </div>
                  <p className="text-white text-xs font-bold text-center max-w-20 truncate">{leaderboard[2]?.username}</p>
                  <div className="w-20 bg-amber-800 rounded-t-xl flex flex-col items-center py-2" style={{ height: 48 }}><Medal className="w-7 h-7 text-amber-300" /></div>
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
              <div className="space-y-2">
                {leaderboard.map((entry, rank) => (
                  isListings
                    ? <ListingLeaderRow key={entry.id} entry={entry} rank={rank} />
                    : <LeaderRow key={entry.email} entry={entry} rank={rank} tab={tab} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}