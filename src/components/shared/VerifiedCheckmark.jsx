import React from "react";

/**
 * Verified Partner-style purple verified checkmark with glow effect
 * Matches the Verified Partner verified badge design — solid purple circle, bold white checkmark, purple glow
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 18, md: 22, lg: 30 };
  const px = dims[size] || 18;
  const glowSize = px * 1.6;

  return (
    <span className="relative inline-flex items-center gap-1 group" style={{ verticalAlign: "middle" }}>
      {/* Glow layer */}
      <span
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.35)",
          filter: "blur(6px)",
          top: "50%",
          left: px / 2,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
      >
        {/* Outer circle — deep Verified Partner purple */}
        <circle cx="12" cy="12" r="12" fill="#7c3aed" />
        {/* Gradient overlay for depth */}
        <defs>
          <radialGradient id="metaGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="12" fill="url(#metaGrad)" />
        {/* Bold white checkmark */}
        <path
          d="M6.5 12.5L10 16L17.5 8"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showLabel && (
        <span className="font-bold text-xs text-purple-400 whitespace-nowrap" style={{ position: "relative", zIndex: 1 }}>
          {label}
        </span>
      )}

      {showTooltip && !showLabel && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ background: "#7c3aed", boxShadow: "0 4px 16px rgba(124,58,237,0.7)" }}
        >
          ✓ {label}
        </span>
      )}
    </span>
  );
}