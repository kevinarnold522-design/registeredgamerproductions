import React from "react";

/**
 * VerifiedCheckmark — exact Meta-style checkmark badge, purple color
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 16, md: 20, lg: 28 };
  const px = dims[size] || 16;

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {/* Meta-style circle badge */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer circle — purple gradient fill */}
        <defs>
          <radialGradient id={`vbg-${px}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6b21a8" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill={`url(#vbg-${px})`} />
        {/* Subtle top highlight gloss */}
        <ellipse cx="10" cy="7.5" rx="4.5" ry="2.5" fill="rgba(255,255,255,0.18)" />
        {/* Meta-accurate checkmark path */}
        <path
          d="M7 12.5L10.5 16L17 8.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Inline label */}
      {showLabel && (
        <span className="font-bold text-xs text-purple-400 whitespace-nowrap">{label}</span>
      )}

      {/* Tooltip */}
      {showTooltip && !showLabel && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          style={{ background: "#7c3aed", boxShadow: "0 4px 12px rgba(124,58,237,0.5)" }}
        >
          ✓ {label}
        </span>
      )}
    </span>
  );
}