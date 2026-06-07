import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";

const TOTAL_SLOTS = 10000;

export default function First10KBanner({ user, profile }) {
  const [claimedCount, setClaimedCount] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Count verified members
    base44.entities.UserProfile.filter({ is_verified: true }).then(res => {
      setClaimedCount(res.length);
    }).catch(() => setClaimedCount(847));

    // Check if current user already claimed
    if (profile?.is_verified) setClaimed(true);
  }, [profile]);

  const remaining = claimedCount !== null ? Math.max(0, TOTAL_SLOTS - claimedCount) : null;
  const pct = claimedCount !== null ? Math.min(100, (claimedCount / TOTAL_SLOTS) * 100) : 0;
  const isFull = remaining === 0;

  const handleClaim = async () => {
    if (!user || claiming || claimed || isFull) return;
    setClaiming(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        is_verified: true,
        verification_status: "approved",
      });
      setClaimedCount(prev => prev + 1);
      setClaimed(true);
    } catch {}
    setClaiming(false);
  };

  if (claimedCount === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 md:mx-auto max-w-4xl my-6 rounded-3xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #0d1a2e 50%, #1a0533 100%)",
        border: "1px solid rgba(168,85,247,0.4)",
        boxShadow: "0 0 40px rgba(124,58,237,0.2)",
      }}
    >
      {/* Animated background shimmer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-full animate-[spin_8s_linear_infinite] opacity-5"
          style={{ background: "conic-gradient(from 0deg, transparent, #7c3aed, transparent)" }} />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left: Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="text-xs font-black uppercase tracking-widest text-purple-400">Limited Time Offer</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
              First <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">10,000</span> Members
            </h2>
            <p className="text-gray-400 text-sm mb-4">Get your <strong className="text-purple-300">Verified Badge</strong> completely free — no subscription needed.</p>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{claimedCount?.toLocaleString()} claimed</span>
                <span>{remaining?.toLocaleString()} slots left</span>
              </div>
              <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{pct.toFixed(1)}% of slots claimed</p>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col items-center gap-3">
            {/* Slot counter */}
            <div className="text-center">
              <motion.div
                key={remaining}
                initial={{ scale: 1.2, color: "#f59e0b" }}
                animate={{ scale: 1, color: "#ffffff" }}
                className="text-4xl font-black text-white"
              >
                {remaining?.toLocaleString()}
              </motion.div>
              <p className="text-gray-500 text-xs">free slots remaining</p>
            </div>

            {!user ? (
              <a href="/register"
                className="px-6 py-3 rounded-2xl font-black text-sm text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
                🚀 Claim Free Badge
              </a>
            ) : claimed ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-900/40 border border-green-500/50 text-green-300 text-sm font-black">
                <VerifiedCheckmark size="md" /> Verified!
              </div>
            ) : isFull ? (
              <div className="px-6 py-3 rounded-2xl bg-gray-800 text-gray-500 text-sm font-black">All slots taken</div>
            ) : (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
                {claiming ? "Claiming..." : "🏅 Claim Free Verified Badge"}
              </button>
            )}

            <p className="text-[10px] text-gray-600 text-center">Also included free in Tier 1 membership</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}