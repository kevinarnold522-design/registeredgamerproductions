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
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Solid purple circle */}
        <circle cx="50" cy="50" r="48" fill="#7c3aed" />
        {/* White checkmark — bold, centered */}
        <path
          d="M25 52L42 69L75 32"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
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