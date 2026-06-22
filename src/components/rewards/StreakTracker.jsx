import React, { useState, useEffect } from "react";
import { Flame, Trophy, Calendar, DollarSign, Lock, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function StreakTracker({ userEmail }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    base44.entities.DailyReward.filter({ user_email: userEmail })
      .then(r => { setData(r[0] || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userEmail]);

  if (loading) return <div className="h-24 bg-gray-900 rounded-2xl animate-pulse" />;
  if (!data) return null;

  const streak = data.current_streak || 0;
  const pct = Math.min(100, (streak / 365) * 100);
  const daysLeft = Math.max(0, 365 - streak);

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-700/30 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-white font-black">Daily Streak</span>
        </div>
        <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 rounded-full px-3 py-1">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-orange-300 font-black text-sm">{streak} days</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress to $10 reward</span>
          <span>{daysLeft > 0 ? `${daysLeft} days left` : "🎉 Unlocked!"}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
          />
        </div>
        <p className="text-[11px] text-gray-600 mt-1">{streak}/365 days</p>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[
          { days: 7, icon: "⭐", label: "Wk 1" },
          { days: 30, icon: "🏅", label: "Mo 1" },
          { days: 100, icon: "💎", label: "100d" },
          { days: 365, icon: "💰", label: "$10!" },
        ].map(m => (
          <div key={m.days} className={`rounded-xl p-2 text-center border ${streak >= m.days ? "border-green-500/50 bg-green-900/20" : "border-gray-800 bg-gray-900/50"}`}>
            <div className="text-base">{m.icon}</div>
            <div className="text-[9px] text-gray-500">{m.label}</div>
            {streak >= m.days && <CheckCircle className="w-3 h-3 text-green-400 mx-auto mt-0.5" />}
          </div>
        ))}
      </div>

      {data.reward_unlocked && !data.reward_claimed && (
        <div className="mt-3 bg-yellow-900/30 border border-yellow-500/40 rounded-xl p-3 text-center">
          <p className="text-yellow-300 font-black text-sm">🎉 $10 Reward Unlocked!</p>
          <p className="text-yellow-400/70 text-xs mt-0.5">Contact admin to claim your reward.</p>
        </div>
      )}

      <p className="text-gray-600 text-[10px] mt-2 text-center">⚠️ Missing one day resets your streak to 0</p>
    </div>
  );
}