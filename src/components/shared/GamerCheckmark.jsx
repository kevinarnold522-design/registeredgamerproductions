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

  if (admin) {
    return (
      <span className="relative inline-flex items-center gap-1 group">
        <span style={{
          width: px, height: px,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          boxShadow: "0 0 8px rgba(251,191,36,0.7)",
          fontSize: px * 0.6, lineHeight: 1, fontWeight: 900, color: "#fff",
          flexShrink: 0,
        }}>⚡</span>
        {showLabel && <span className="font-bold text-xs text-yellow-400 whitespace-nowrap">CEO & President</span>}
        {showTooltip && !showLabel && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            CEO & President · GAMER Productions
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