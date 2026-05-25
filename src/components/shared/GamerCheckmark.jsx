import React from "react";
import { isAdmin } from "@/lib/constants";

/**
 * GamerCheckmark — themed verified badge
 * Verified Badge: black + pink/purple glow checkmark (admin-granted)
 * size: "sm" | "md" | "lg"
 */
export default function GamerCheckmark({ accountType, isVerified, userEmail, size = "sm", showTooltip = true }) {
  const admin = isAdmin(userEmail);

  let badge = null;
  if (admin) {
    badge = {
      type: "admin",
      symbol: "⚡",
      label: "CEO & President · GAMER Productions",
    };
  } else if (isVerified) {
    badge = {
      type: "verified",
      symbol: "✓",
      label: "Verified",
    };
  }

  if (!badge) return null;

  const sizePx = { sm: 16, md: 20, lg: 28 };
  const iconSize = { sm: 7, md: 9, lg: 13 };
  const px = sizePx[size] || 16;
  const fs = iconSize[size] || 7;

  if (badge.type === "admin") {
    return (
      <span className="relative inline-flex items-center group">
        <span
          style={{
            width: px, height: px, fontSize: fs,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            boxShadow: "0 0 8px rgba(251,191,36,0.7)",
            lineHeight: 1, fontWeight: 900, color: "#fff",
          }}
        >
          ⚡
        </span>
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {badge.label}
          </span>
        )}
      </span>
    );
  }

  // Verified Badge — black bg, pink/purple glow checkmark
  return (
    <span className="relative inline-flex items-center group">
      <span
        style={{
          width: px, height: px, fontSize: fs,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #18001a, #1a0028)",
          border: "1.5px solid rgba(192,38,211,0.7)",
          boxShadow: "0 0 8px 2px rgba(168,85,247,0.55), 0 0 16px 4px rgba(236,72,153,0.25)",
          lineHeight: 1, fontWeight: 900, color: "#fff",
          transition: "box-shadow 0.2s",
        }}
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          style={{ width: fs + 2, height: fs + 2 }}
        >
          <defs>
            <linearGradient id="vg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <polyline
            points="2,6.5 5,9.5 10,3"
            stroke="url(#vg)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-purple-700/50 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ textShadow: "0 0 8px #a855f7" }}>
          ✓ Verified Badge
        </span>
      )}
    </span>
  );
}

// Helper to get checkmark type label
export function getCheckmarkLabel(accountType, isVerified, userEmail) {
  if (isAdmin(userEmail)) return "CEO & President";
  if (isVerified) return "Verified";
  return null;
}