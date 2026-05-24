import React from "react";
import { motion } from "framer-motion";

export function getFollowerRank(followers) {
  if (followers >= 100000) return {
    label: "Gaming God/Goddess",
    emoji: "⚡👑",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.8)",
    bg: "linear-gradient(135deg, #1a1000, #2a1800)",
    border: "rgba(255,215,0,0.6)",
    badge: "GAMING GOD",
    badgeBg: "linear-gradient(90deg, #ffd700, #ff8c00, #ffd700)",
    badgeText: "#000",
  };
  if (followers >= 10000) return {
    label: "Gaming Guru",
    emoji: "🌟",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.7)",
    bg: "linear-gradient(135deg, #0d0020, #1a0040)",
    border: "rgba(168,85,247,0.5)",
    badge: "GAMING GURU",
    badgeBg: "linear-gradient(90deg, #a855f7, #6366f1, #a855f7)",
    badgeText: "#fff",
  };
  if (followers >= 1000) return {
    label: "Supreme Digital Creator",
    emoji: "💎",
    color: "#00d4ff",
    glow: "rgba(0,212,255,0.6)",
    bg: "linear-gradient(135deg, #001520, #002535)",
    border: "rgba(0,212,255,0.4)",
    badge: "SUPREME CREATOR",
    badgeBg: "linear-gradient(90deg, #00d4ff, #0ea5e9, #00d4ff)",
    badgeText: "#000",
  };
  return null;
}

export default function FollowerRankBadge({ followers, size = "md", showLabel = false }) {
  const rank = getFollowerRank(followers || 0);
  if (!rank) return null;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2.5 py-1 text-[10px]",
    lg: "px-4 py-1.5 text-xs",
  };

  return (
    <motion.div
      className="inline-flex items-center gap-1"
      animate={{ boxShadow: [`0 0 8px ${rank.glow}`, `0 0 18px ${rank.glow}`, `0 0 8px ${rank.glow}`] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full font-black ${sizeClasses[size]}`}
        style={{
          background: rank.badgeBg,
          color: rank.badgeText,
          boxShadow: `0 0 12px ${rank.glow}`,
        }}
      >
        {rank.emoji} {rank.badge}
      </span>
      {showLabel && <span className="text-xs text-gray-400">{rank.label}</span>}
    </motion.div>
  );
}