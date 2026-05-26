import React from "react";

/**
 * HonorBadge — awarded to every new user on sign-up
 * label: e.g. "Founding Member"
 */
export default function HonorBadge({ label = "Founding Member", size = "sm", showTooltip = true }) {
  const isLg = size === "lg";
  const isMd = size === "md";

  return (
    <span className="relative inline-flex items-center gap-1 group">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: isLg ? 5 : 3,
          padding: isLg ? "4px 10px" : isMd ? "3px 8px" : "2px 6px",
          borderRadius: 99,
          background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 100%)",
          border: "1.5px solid rgba(251,146,60,0.7)",
          boxShadow: "0 0 8px rgba(251,146,60,0.5), 0 0 18px rgba(234,88,12,0.25)",
          fontSize: isLg ? 12 : isMd ? 11 : 10,
          color: "#fed7aa",
          fontWeight: 700,
          whiteSpace: "nowrap",
          animation: "honorPulse 3s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: isLg ? 14 : isMd ? 12 : 11 }}>🏅</span>
        <span>{label}</span>
      </span>

      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ background: "linear-gradient(135deg,#92400e,#b45309)", boxShadow: "0 0 10px rgba(251,146,60,0.5)" }}>
          🏅 Badge of Honor — {label}
        </span>
      )}

      <style>{`
        @keyframes honorPulse {
          0%,100% { box-shadow: 0 0 8px rgba(251,146,60,0.5), 0 0 18px rgba(234,88,12,0.25); }
          50%      { box-shadow: 0 0 14px rgba(251,146,60,0.8), 0 0 28px rgba(234,88,12,0.4); }
        }
      `}</style>
    </span>
  );
}