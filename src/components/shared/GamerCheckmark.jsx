import React from "react";
import { isAdmin } from "@/lib/constants";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";

/**
 * GamerCheckmark — themed verified badge
 * Verified Badge: compact double-checkmark with pink/purple glow
 * size: "sm" | "md" | "lg"
 */
export default function GamerCheckmark({ accountType, isVerified, userEmail, size = "sm", showTooltip = true }) {
  const admin = isAdmin(userEmail);

  let badge = null;
  if (admin) {
    badge = { type: "admin", label: "CEO & President · GAMER Productions" };
  } else if (isVerified) {
    badge = { type: "verified", label: "Verified" };
  }

  if (!badge) return null;

  const sizePx = { sm: 18, md: 22, lg: 30 };
  const px = sizePx[size] || 18;
  const svgSize = px - 4;

  if (badge.type === "admin") {
    return (
      <span className="relative inline-flex items-center group">
        <span style={{
          width: px, height: px,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          boxShadow: "0 0 8px rgba(251,191,36,0.7)",
          fontSize: svgSize * 0.6, lineHeight: 1, fontWeight: 900, color: "#fff",
        }}>⚡</span>
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {badge.label}
          </span>
        )}
      </span>
    );
  }

  // Use the new Meta-style VerifiedCheckmark
  return <VerifiedCheckmark size={size} showLabel={true} showTooltip={showTooltip} />;
}

export function getCheckmarkLabel(accountType, isVerified, userEmail) {
  if (isAdmin(userEmail)) return "CEO & President";
  if (isVerified) return "Verified";
  return null;
}