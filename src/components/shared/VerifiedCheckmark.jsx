import React from "react";

/**
 * Meta-style purple verified checkmark — used for ALL verified users (admin + partners)
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 18, md: 22, lg: 30 };
  const px = dims[size] || 18;

  return (
    <span className="relative inline-flex items-center gap-1 group">
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer circle — solid Meta purple */}
        <circle cx="12" cy="12" r="12" fill="#7c3aed" />
        {/* Inner subtle highlight for depth */}
        <circle cx="9" cy="8" r="3.5" fill="rgba(255,255,255,0.15)" />
        {/* Bold white checkmark — Meta verified style */}
        <path
          d="M7 12.5L10.2 15.8L17 8.5"
          stroke="white"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showLabel && (
        <span className="font-bold text-xs text-purple-400 whitespace-nowrap">{label}</span>
      )}

      {showTooltip && !showLabel && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ background: "#7c3aed", boxShadow: "0 4px 16px rgba(124,58,237,0.6)" }}>
          ✓ {label}
        </span>
      )}
    </span>
  );
}