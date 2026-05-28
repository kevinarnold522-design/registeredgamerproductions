import React from "react";
import { isAdmin } from "@/lib/constants";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";

/**
 * GamerCheckmark — shows admin ⚡ badge or Meta-style purple verified checkmark
 * size: "sm" | "md" | "lg"
 */
export default function GamerCheckmark({ accountType, isVerified, userEmail, size = "sm", showTooltip = true, showLabel = false }) {
  const admin = isAdmin(userEmail);

  if (!admin && !isVerified) return null;

  const sizePx = { sm: 16, md: 20, lg: 28 };
  const px = sizePx[size] || 16;

  // Admin gets gold verified checkmark (CEO badge)
  if (admin) {
    return (
      <span className="relative inline-flex items-center gap-1 group">
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <defs>
            <radialGradient id={`admin-vbg-${px}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="11" fill={`url(#admin-vbg-${px})`} />
          <ellipse cx="10" cy="7.5" rx="4.5" ry="2.5" fill="rgba(255,255,255,0.22)" />
          <path d="M7 12.5L10.5 16L17 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showLabel && <span className="font-bold text-xs text-yellow-400 whitespace-nowrap">Verified</span>}
        {showTooltip && !showLabel && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-yellow-700/50 rounded-lg text-yellow-300 text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            ✓ CEO & President · GAMER Productions
          </span>
        )}
      </span>
    );
  }

  return <VerifiedCheckmark size={size} showLabel={showLabel} showTooltip={showTooltip} label="Verified Partner" />;
}

export function getCheckmarkLabel(accountType, isVerified, userEmail) {
  if (isAdmin(userEmail)) return "CEO & President";
  if (isVerified) return "Verified Partner";
  return null;
}