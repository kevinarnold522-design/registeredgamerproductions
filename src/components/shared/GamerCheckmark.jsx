import React from "react";
import { isAdmin } from "@/lib/constants";

/**
 * GamerCheckmark — themed verified badge (like Meta's checkmark but GAMER-styled)
 * type: "admin" | "business" | "creator" | "verified"
 * size: "sm" | "md" | "lg"
 */
export default function GamerCheckmark({ accountType, isVerified, userEmail, size = "sm", showTooltip = true }) {
  const admin = isAdmin(userEmail);

  // Determine badge type
  let badge = null;
  if (admin) {
    badge = {
      gradient: "from-yellow-400 to-orange-500",
      ring: "ring-yellow-500/60",
      symbol: "⚡",
      label: "CEO & President · GAMER Productions",
      title: "Admin",
    };
  } else if (accountType === "business" && isVerified) {
    badge = {
      gradient: "from-emerald-400 to-green-600",
      ring: "ring-emerald-500/60",
      symbol: "✓",
      label: "Verified Business",
      title: "Business",
    };
  } else if (accountType === "digital_creator" && isVerified) {
    badge = {
      gradient: "from-purple-500 to-pink-500",
      ring: "ring-purple-500/60",
      symbol: "✓",
      label: "Verified Digital Creator",
      title: "Creator",
    };
  } else if (isVerified) {
    badge = {
      gradient: "from-blue-500 to-cyan-500",
      ring: "ring-blue-500/60",
      symbol: "✓",
      label: "Verified Member",
      title: "Verified",
    };
  }

  if (!badge) return null;

  const sizeClasses = {
    sm: "w-4 h-4 text-[8px]",
    md: "w-5 h-5 text-[10px]",
    lg: "w-7 h-7 text-sm",
  };

  return (
    <span className="relative inline-flex items-center group" title={showTooltip ? badge.label : undefined}>
      <span
        className={`
          inline-flex items-center justify-center rounded-full font-black
          bg-gradient-to-br ${badge.gradient}
          ring-2 ${badge.ring}
          shadow-md ${sizeClasses[size]}
          transition-transform group-hover:scale-110
        `}
        style={{ lineHeight: 1 }}
      >
        <span className="text-white drop-shadow" style={{ fontSize: size === "lg" ? 12 : size === "md" ? 9 : 7 }}>
          {badge.symbol}
        </span>
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
          {badge.label}
        </span>
      )}
    </span>
  );
}

// Helper to get checkmark type label
export function getCheckmarkLabel(accountType, isVerified, userEmail) {
  if (isAdmin(userEmail)) return "CEO & President";
  if (accountType === "business" && isVerified) return "Verified Business";
  if (accountType === "digital_creator" && isVerified) return "Verified Creator";
  if (isVerified) return "Verified";
  return null;
}