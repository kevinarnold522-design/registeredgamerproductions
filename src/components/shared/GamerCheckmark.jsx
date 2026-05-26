import React from "react";
import { isAdmin } from "@/lib/constants";

/**
 * GamerCheckmark — themed verified badge
 * Verified Badge: compact double-checkmark with pink/purple glow
 * size: "sm" | "md" | "lg"
 */
export default function GamerCheckmark({ accountType, isVerified, userEmail, size = "sm", showTooltip = true }) {
  const admin = isAdmin(userEmail);

  let badge = null;
  if (admin) {
    badge = { type: "admin", label: "CEO & President · GAMER Productions" };
  } else if (isVerified) {
    badge = { type: "verified", label: "Verified" };
  }

  if (!badge) return null;

  const sizePx = { sm: 18, md: 22, lg: 30 };
  const px = sizePx[size] || 18;
  const svgSize = px - 4;

  if (badge.type === "admin") {
    return (
      <span className="relative inline-flex items-center group">
        <span style={{
          width: px, height: px,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          boxShadow: "0 0 8px rgba(251,191,36,0.7)",
          fontSize: svgSize * 0.6, lineHeight: 1, fontWeight: 900, color: "#fff",
        }}>⚡</span>
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {badge.label}
          </span>
        )}
      </span>
    );
  }

  // Verified Badge — compact double-checkmark with pulsing purple/pink glow
  return (
    <span className="relative inline-flex items-center group">
      <span style={{
        width: px, height: px,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #18001a, #1a0028)",
        border: "1.5px solid rgba(192,38,211,0.8)",
        boxShadow: "0 0 6px 2px rgba(168,85,247,0.7), 0 0 14px 3px rgba(236,72,153,0.35)",
        animation: "verifiedGlow 2.5s ease-in-out infinite",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 14 10" fill="none" style={{ width: svgSize, height: svgSize * 0.72 }}>
          <defs>
            <linearGradient id="vg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* First check (slightly offset left) */}
          <polyline
            points="1,5.5 3.5,8 7.5,2"
            stroke="url(#vg2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowF)"
            opacity="0.7"
          />
          {/* Second check (main, offset right) */}
          <polyline
            points="4,5.5 6.5,8 12,1.5"
            stroke="url(#vg2)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowF)"
          />
        </svg>
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-purple-700/50 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ textShadow: "0 0 8px #a855f7" }}>
          ✓✓ Verified Badge
        </span>
      )}
      <style>{`
        @keyframes verifiedGlow {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(168,85,247,0.7), 0 0 14px 3px rgba(236,72,153,0.35); }
          50% { box-shadow: 0 0 10px 4px rgba(168,85,247,0.9), 0 0 22px 6px rgba(236,72,153,0.5); }
        }
      `}</style>
    </span>
  );
}

export function getCheckmarkLabel(accountType, isVerified, userEmail) {
  if (isAdmin(userEmail)) return "CEO & President";
  if (isVerified) return "Verified";
  return null;
}