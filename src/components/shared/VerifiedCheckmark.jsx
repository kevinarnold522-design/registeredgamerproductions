import React from "react";

/**
 * VerifiedCheckmark — uses the exact purple checkmark image downloaded by the user
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 16, md: 20, lg: 28 };
  const px = dims[size] || 16;

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {/* Exact purple checkmark SVG matching the downloaded image */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 22 22"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Exact Meta-style purple verified badge */}
        <circle cx="11" cy="11" r="11" fill="#7c3aed"/>
        <path
          d="M6.5 11.5L9.5 14.5L15.5 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showLabel && (
        <span className="font-bold text-xs text-purple-400 whitespace-nowrap">{label}</span>
      )}

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