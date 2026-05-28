import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Trophy, Flame, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function isYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0] === dateStr;
}

export default function DailyRewardPopup({ user, onClose }) {
  const [rewardData, setRewardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    loadRewardData();
  }, [user]);

  const loadRewardData = async () => {
    try {
      const records = await base44.entities.DailyReward.filter({ user_email: user.email });
      const today = getTodayDate();

      if (records.length === 0) {
        // First time — create record and show new user popup
        const newRecord = await base44.entities.DailyReward.create({
          user_email: user.email,
          current_streak: 1,
          longest_streak: 1,
          last_checkin_date: today,
          total_checkins: 1,
          reward_unlocked: false,
          reward_claimed: false,
          streak_history: [today],
        });
        setRewardData(newRecord);
        setCheckedIn(true);
        setShowPopup(true);
      } else {
        const record = records[0];
        const lastCheckin = record.last_checkin_date;

        if (lastCheckin === today) {
          // Already checked in today
          setRewardData(record);
          setCheckedIn(true);
          setShowPopup(false);
        } else if (isYesterday(lastCheckin)) {
          // Continuing streak
          const newStreak = (record.current_streak || 0) + 1;
          const newTotal = (record.total_checkins || 0) + 1;
          const unlocked = newStreak >= 365;
          const history = [...(record.streak_history || []), today];
          const updated = await base44.entities.DailyReward.update(record.id, {
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, record.longest_streak || 0),
            last_checkin_date: today,
            total_checkins: newTotal,
            reward_unlocked: unlocked,
            streak_history: history,
          });
          setRewardData(updated);
          setCheckedIn(true);
          setShowPopup(true);
        } else {
          // Missed a day — forfeit streak
          const updated = await base44.entities.DailyReward.update(record.id, {
            current_streak: 1,
            last_checkin_date: today,
            total_checkins: (record.total_checkins || 0) + 1,
            streak_history: [today],
          });
          setRewardData(updated);
          setCheckedIn(true);
          setShowPopup(true);
        }
      }
    } catch (e) {
      console.error("DailyReward error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !showPopup) return null;

  const streak = rewardData?.current_streak || 1;
  const isFirstTime = rewardData?.total_checkins === 1;
  const streakReset = !isFirstTime && streak === 1 && rewardData?.total_checkins > 1;
  const daysLeft = Math.max(0, 365 - streak);
  const progressPct = Math.min(100, (streak / 365) * 100);

  const handleClose = () => {
    setShowPopup(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 30, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-sm shadow-2xl shadow-purple-900/30 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/10 rounded-full blur-3xl" />
          </div>

          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/50">
            {isFirstTime ? <Star className="w-8 h-8 text-white" /> : streakReset ? <Flame className="w-8 h-8 text-white" /> : <Flame className="w-8 h-8 text-white" />}
          </div>

          {isFirstTime ? (
            <>
              <h2 className="text-white font-black text-xl mb-1">Welcome, Gamer! 🎮</h2>
              <p className="text-purple-300 font-bold text-sm mb-3">Day 1 streak started!</p>
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-600/30 rounded-2xl p-4 mb-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-black text-sm">$10 Reward Challenge</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Log in <strong className="text-white">every day for 365 days straight</strong> to unlock a <strong className="text-yellow-400">$10 bonus reward</strong>! Missing even one day resets your streak.
                </p>
              </div>
            </>
          ) : streakReset ? (
            <>
              <h2 className="text-red-400 font-black text-xl mb-1">Streak Reset! 😢</h2>
              <p className="text-gray-400 text-sm mb-3">You missed a day — starting fresh from Day 1.</p>
              <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-3 mb-4">
                <p className="text-red-300 text-xs">Your $10 reward progress was forfeited. Come back every day to build your streak again!</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-white font-black text-xl mb-1">Day {streak} 🔥</h2>
              <p className="text-purple-300 font-bold text-sm mb-3">Keep the streak alive!</p>
            </>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Day {streak}</span>
              <span>{daysLeft} days to $10</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
              />
            </div>
            <p className="text-[11px] text-gray-600 mt-1">{streak}/365 days completed</p>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            {[
              { days: 7, label: "Week 1", icon: "⭐" },
              { days: 30, label: "Month 1", icon: "🏅" },
              { days: 365, label: "$10 Reward", icon: "💰" },
            ].map(m => (
              <div key={m.days} className={`rounded-xl p-2 border ${streak >= m.days ? "border-purple-500/60 bg-purple-900/30" : "border-gray-800 bg-gray-900/50"}`}>
                <div className="text-lg">{m.icon}</div>
                <div className="text-[10px] text-gray-400">{m.label}</div>
                <div className={`text-[10px] font-bold ${streak >= m.days ? "text-green-400" : "text-gray-600"}`}>
                  {streak >= m.days ? "✓ Done" : `Day ${m.days}`}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity"
            style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
          >
            {isFirstTime ? "Start My Journey! 🚀" : "Let's Go! 🎮"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}