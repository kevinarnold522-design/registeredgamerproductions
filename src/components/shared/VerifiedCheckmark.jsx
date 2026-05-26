import React from "react";

/**
 * VerifiedCheckmark — 3D purple rounded-square badge (like the reference image)
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true }) {
  const dims = { sm: 18, md: 22, lg: 30 };
  const px = dims[size] || 18;
  const r = px * 0.28; // border-radius ratio

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {/* Badge: 3D glossy purple square */}
      <span
        style={{
          width: px,
          height: px,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: r,
          background: "linear-gradient(145deg, #c084fc 0%, #9333ea 40%, #7e22ce 100%)",
          boxShadow: `0 ${px * 0.15}px ${px * 0.35}px rgba(124,58,237,0.7), inset 0 ${px * 0.07}px ${px * 0.12}px rgba(255,255,255,0.35), inset 0 -${px * 0.07}px ${px * 0.1}px rgba(0,0,0,0.25)`,
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gloss highlight */}
        <span style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "45%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
          borderRadius: `${r}px ${r}px 40% 40%`,
          pointerEvents: "none",
        }} />
        {/* Checkmark */}
        <svg
          viewBox="0 0 14 11"
          fill="none"
          style={{ width: px * 0.58, height: px * 0.58, position: "relative", zIndex: 1 }}
        >
          <polyline
            points="1.5,5.5 5,9 12.5,1.5"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* "Verified" inline label */}
      {showLabel && (
        <span className="font-bold text-xs text-purple-400">
          Verified
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && !showLabel && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          style={{ background: "#7c3aed", boxShadow: "0 4px 12px rgba(124,58,237,0.5)" }}>
          ✓ Verified
        </span>
      )}
    </span>
  );
}