import React from "react";

const CHECKMARK_IMG = "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/de4dddc04_download.png";

/**
 * VerifiedCheckmark — uses the uploaded checkmark image
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 16, md: 20, lg: 28 };
  const px = dims[size] || 16;

  return (
    <span className="relative inline-flex items-center gap-1 group">
      <img
        src={CHECKMARK_IMG}
        alt="Verified"
        width={px}
        height={px}
        style={{ flexShrink: 0, display: "inline-block" }}
      />

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