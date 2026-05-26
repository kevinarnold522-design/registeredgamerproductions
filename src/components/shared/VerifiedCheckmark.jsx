import React from "react";

/**
 * VerifiedCheckmark — Meta-style verified badge, purple/pink glow
 * Shows checkmark + "Verified" label inline
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true }) {
  const dims = { sm: 18, md: 22, lg: 28 };
  const px = dims[size] || 18;

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {/* Badge circle */}
      <span
        style={{
          width: px,
          height: px,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
          boxShadow: "0 0 7px 2px rgba(168,85,247,0.75), 0 0 18px 4px rgba(236,72,153,0.4)",
          flexShrink: 0,
          animation: "vcGlow 2.5s ease-in-out infinite",
        }}
      >
        {/* White checkmark */}
        <svg
          viewBox="0 0 12 10"
          fill="none"
          style={{ width: px * 0.55, height: px * 0.55 }}
        >
          <polyline
            points="1.5,5 4.5,8.5 10.5,1.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* "Verified" inline label */}
      {showLabel && (
        <span
          className="font-bold text-xs"
          style={{
            background: "linear-gradient(90deg,#a855f7,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
          }}
        >
          Verified
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && !showLabel && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)", boxShadow: "0 0 12px rgba(168,85,247,0.5)" }}>
          ✓ Verified
        </span>
      )}

      <style>{`
        @keyframes vcGlow {
          0%,100% { box-shadow: 0 0 7px 2px rgba(168,85,247,0.75), 0 0 18px 4px rgba(236,72,153,0.4); }
          50%      { box-shadow: 0 0 12px 4px rgba(168,85,247,0.95), 0 0 28px 8px rgba(236,72,153,0.6); }
        }
      `}</style>
    </span>
  );
}