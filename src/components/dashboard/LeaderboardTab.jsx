import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Users, Zap } from "lucide-react";
import { computeLeaderboard } from "@/lib/leaderboardScore";
import GamerCheckmark from "@/components/shared/GamerCheckmark";

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-orange-400"];
const RANK_BG = ["bg-yellow-500/10 border-yellow-500/40", "bg-gray-500/10 border-gray-500/30", "bg-orange-500/10 border-orange-500/30"];

const TABS = [
  { id: "community", label: "Community", icon: Users },
  { id: "modding", label: "Modding", icon: Zap },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
];

export default function LeaderboardTab() {
  const [tab, setTab] = useState("community");
  const [leaderData, setLeaderData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    computeLeaderboard({ tab })
      .then((rows) => { if (mounted) setLeaderData(rows.slice(0, 100)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [tab]);

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
          <p className="text-gray-500 text-xs">Same rankings & points as the public leaderboard</p>
        </div>
      </div>

      {/* Tabs — match the public leaderboard categories */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t.id ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium */}
      {leaderData.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[leaderData[1], leaderData[0], leaderData[2]].map((u, idx) => {
            const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
            const isPrimary = rank === 0;
            return (
              <motion.div key={rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: isPrimary ? 0 : 16 }} transition={{ delay: rank * 0.1 }}
                className={`rounded-2xl border p-4 text-center ${RANK_BG[rank]} ${isPrimary ? "scale-105 shadow-lg shadow-yellow-900/20" : ""}`}>
                <div className="text-2xl mb-1">{MEDALS[rank]}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mx-auto mb-2 flex items-center justify-center text-xl overflow-hidden">
                  {u?.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className={`font-black text-sm truncate ${RANK_COLORS[rank]}`}>{u?.username || "—"}</p>
                  <GamerCheckmark accountType={u?.account_type} isVerified={u?.is_verified} userEmail={u?.email} size="sm" />
                </div>
                <p className={`text-xs font-bold ${RANK_COLORS[rank]}`}>{(u?.score || 0).toLocaleString()} pts</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{u?.posts || 0} posts · {u?.likes || 0} likes</p>
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
              <motion.div key={item.email || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 20) * 0.02 }}
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
                    <GamerCheckmark accountType={item?.account_type} isVerified={item?.is_verified} userEmail={item?.email} size="sm" />
                  </div>
                  <span className="text-gray-500 text-xs">{item?.posts || 0} posts · {item?.likes || 0} likes</span>
                </div>
                <span className="font-black text-sm text-yellow-400">{(item?.score || 0).toLocaleString()} pts</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}