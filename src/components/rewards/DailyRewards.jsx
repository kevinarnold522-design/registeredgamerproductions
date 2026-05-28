import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Star, Share2, Facebook, CheckCircle, Lock, Zap, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DAILY_REWARDS = [
  { day: 1, item: "🎮 Gamer Avatar Frame", type: "avatar_frame", value: "frame_basic", points: 50 },
  { day: 2, item: "⭐ 100 Bonus Points", type: "points", value: 100, points: 100 },
  { day: 3, item: "🔥 Hot Deal Badge", type: "badge", value: "hot_deal", points: 150 },
  { day: 4, item: "💎 Premium Listing Boost", type: "boost", value: "listing_boost_1d", points: 200 },
  { day: 5, item: "🏆 Elite Gamer Badge", type: "badge", value: "elite_gamer", points: 300 },
  { day: 6, item: "🎯 500 Bonus Points", type: "points", value: 500, points: 500 },
  { day: 7, item: "👑 VIP Crown Frame", type: "avatar_frame", value: "frame_vip", points: 700 },
];

const SHARE_REWARDS = [
  { platform: "Facebook", icon: "📘", reward: "🎁 Exclusive FB Sharer Badge", done: false },
  { platform: "Instagram", icon: "📸", reward: "💜 IG Creator Frame", done: false },
  { platform: "Twitter/X", icon: "🐦", reward: "⚡ 200 Bonus Points", done: false },
  { platform: "WhatsApp", icon: "💬", reward: "🔓 Unlock Premium Theme", done: false },
];

const SHARE_URL = "https://gamerproductions.vercel.app";

export default function DailyRewards({ user, profile }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("daily");
  const [claimedDays, setClaimedDays] = useState([]);
  const [claimedShares, setClaimedShares] = useState([]);
  const [claiming, setClaiming] = useState(false);
  const [lastClaim, setLastClaim] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationItem, setCelebrationItem] = useState(null);

  useEffect(() => {
    // Load from localStorage
    const data = JSON.parse(localStorage.getItem(`gp_rewards_${user?.email}`) || "{}");
    setClaimedDays(data.claimedDays || []);
    setClaimedShares(data.claimedShares || []);
    setLastClaim(data.lastClaim || null);
  }, [user?.email]);

  const save = (days, shares, last) => {
    localStorage.setItem(`gp_rewards_${user?.email}`, JSON.stringify({ claimedDays: days, claimedShares: shares, lastClaim: last }));
  };

  const canClaimToday = () => {
    if (!lastClaim) return true;
    const last = new Date(lastClaim);
    const now = new Date();
    return now.toDateString() !== last.toDateString();
  };

  const nextDay = claimedDays.length + 1;
  const currentReward = DAILY_REWARDS.find(r => r.day === nextDay) || DAILY_REWARDS[DAILY_REWARDS.length - 1];

  const handleClaimDaily = async () => {
    if (!canClaimToday() || claimedDays.includes(nextDay)) return;
    setClaiming(true);
    const newDays = [...claimedDays, nextDay];
    const now = new Date().toISOString();
    setClaimedDays(newDays);
    setLastClaim(now);
    save(newDays, claimedShares, now);
    setCelebrationItem(currentReward);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    setClaiming(false);
  };

  const handleShareReward = (platform, idx) => {
    const shareLinks = {
      "Facebook": `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}&quote=${encodeURIComponent("I'm playing on GAMER Productions! Join me 🎮")}`,
      "Instagram": null, // copy to clipboard
      "Twitter/X": `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out GAMER Productions! 🎮🔥")}&url=${encodeURIComponent(SHARE_URL)}`,
      "WhatsApp": `https://wa.me/?text=${encodeURIComponent("Join me on GAMER Productions! 🎮 " + SHARE_URL)}`,
    };
    const link = shareLinks[platform];
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer,width=600,height=500");
    } else {
      navigator.clipboard.writeText(`Join me on GAMER Productions! 🎮 ${SHARE_URL}`);
    }
    const newShares = [...claimedShares, platform];
    setClaimedShares(newShares);
    save(claimedDays, newShares, lastClaim);
    setCelebrationItem({ item: SHARE_REWARDS[idx].reward });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button — top right, below navbar */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-[68px] right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl text-white font-black text-xs shadow-2xl"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 18px rgba(124,58,237,0.5)" }}
      >
        <Gift className="w-4 h-4" />
        <span className="hidden sm:block">Rewards</span>
        {canClaimToday() && (
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        )}
      </button>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && celebrationItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            className="fixed bottom-24 right-6 z-50 bg-gray-900 border-2 border-yellow-500/60 rounded-3xl p-5 shadow-2xl text-center max-w-xs"
            style={{ boxShadow: "0 0 30px rgba(234,179,8,0.4)" }}
          >
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-yellow-300 font-black text-lg">Reward Claimed!</p>
            <p className="text-white text-sm mt-1">{celebrationItem.item}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-950 border border-purple-700/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-white font-black text-xl">Rewards Center</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { id: "daily", label: "📅 Daily Login", icon: null },
                  { id: "share", label: "🔗 Share & Unlock", icon: null },
                  { id: "gift", label: "🎁 Gift Items", icon: null },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-3 text-xs font-bold transition-colors ${tab === t.id ? "text-purple-300 border-b-2 border-purple-500 bg-purple-900/10" : "text-gray-500 hover:text-white"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {/* Daily Login Tab */}
                {tab === "daily" && (
                  <div>
                    <p className="text-gray-400 text-xs mb-4 text-center">Log in every day to claim rewards. Day {Math.min(nextDay, 7)} of 7</p>

                    {/* 7-day grid */}
                    <div className="grid grid-cols-7 gap-1.5 mb-6">
                      {DAILY_REWARDS.map(r => {
                        const claimed = claimedDays.includes(r.day);
                        const isCurrent = r.day === nextDay;
                        return (
                          <div key={r.day} className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${claimed ? "bg-purple-900/30 border-purple-500/50" : isCurrent ? "bg-yellow-900/20 border-yellow-500/50" : "bg-gray-900 border-gray-800"}`}>
                            <span className="text-xs text-gray-500 font-bold">Day {r.day}</span>
                            <span className="text-lg my-1">{claimed ? "✅" : isCurrent ? r.item.split(" ")[0] : <Lock className="w-4 h-4 text-gray-700" />}</span>
                            <span className="text-[9px] text-gray-500">{r.points}pts</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Claim button */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 text-center">
                      <p className="text-white font-black text-lg mb-1">{currentReward.item}</p>
                      <p className="text-yellow-400 text-sm mb-4">+{currentReward.points} points</p>
                      {canClaimToday() && !claimedDays.includes(nextDay) ? (
                        <button
                          onClick={handleClaimDaily}
                          disabled={claiming}
                          className="w-full py-3.5 rounded-xl font-black text-white text-base hover:opacity-90 transition-opacity disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}
                        >
                          {claiming ? "Claiming..." : "🎁 Claim Today's Reward!"}
                        </button>
                      ) : (
                        <div className="py-3 px-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-sm font-semibold">
                          {claimedDays.includes(nextDay) ? "✅ Already claimed today — come back tomorrow!" : "🔒 Complete previous days first"}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>Total days claimed: {claimedDays.length}</span>
                      <span>Total points: {claimedDays.reduce((s, d) => s + (DAILY_REWARDS.find(r => r.day === d)?.points || 0), 0)}</span>
                    </div>
                  </div>
                )}

                {/* Share & Unlock Tab */}
                {tab === "share" && (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-xs text-center">Share GAMER Productions to unlock exclusive items!</p>
                    {SHARE_REWARDS.map((sr, i) => {
                      const done = claimedShares.includes(sr.platform);
                      return (
                        <div key={sr.platform} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${done ? "bg-green-900/20 border-green-600/40" : "bg-gray-900 border-gray-800"}`}>
                          <span className="text-2xl">{sr.icon}</span>
                          <div className="flex-1">
                            <p className="text-white font-bold text-sm">{sr.platform}</p>
                            <p className="text-purple-300 text-xs mt-0.5">Unlock: {sr.reward}</p>
                          </div>
                          {done ? (
                            <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                              <CheckCircle className="w-4 h-4" /> Claimed
                            </div>
                          ) : (
                            <button
                              onClick={() => handleShareReward(sr.platform, i)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div className="mt-4 p-4 rounded-2xl bg-blue-900/20 border border-blue-600/40 text-center">
                      <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-300 font-bold text-sm">Bonus Unlock!</p>
                      <p className="text-gray-400 text-xs mt-1">Share to all 4 platforms and unlock the <strong className="text-yellow-300">👑 Legend Frame</strong></p>
                      {claimedShares.length >= 4 ? (
                        <p className="text-green-400 text-xs mt-2 font-bold">✅ Unlocked! Check your rewards.</p>
                      ) : (
                        <p className="text-gray-500 text-xs mt-2">{claimedShares.length}/4 platforms shared</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Gift Items Tab */}
                {tab === "gift" && (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-xs text-center">Send gifts to other users or redeem special items</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { emoji: "💎", name: "Diamond Badge", desc: "Send to a friend", cost: "500 pts" },
                        { emoji: "🎮", name: "Gaming Kit", desc: "Custom controller skin", cost: "300 pts" },
                        { emoji: "🌟", name: "Star Pack", desc: "+50 followers boost", cost: "1000 pts" },
                        { emoji: "🔥", name: "Hot Pack", desc: "Listing highlight 3 days", cost: "400 pts" },
                        { emoji: "👑", name: "Crown Badge", desc: "Exclusive crown icon", cost: "800 pts" },
                        { emoji: "🎁", name: "Mystery Box", desc: "Random rare item!", cost: "200 pts" },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-purple-500/50 transition-colors">
                          <span className="text-3xl">{item.emoji}</span>
                          <p className="text-white font-bold text-sm">{item.name}</p>
                          <p className="text-gray-500 text-xs">{item.desc}</p>
                          <span className="text-yellow-400 text-xs font-bold">{item.cost}</span>
                          <button className="w-full py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/40 transition-colors">
                            🎁 Gift / Redeem
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-600 text-[10px] text-center">Points are earned through daily logins, shares, purchases and engagement</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}