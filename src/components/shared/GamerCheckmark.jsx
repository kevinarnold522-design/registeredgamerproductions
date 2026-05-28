import React from "react";
import { isAdmin } from "@/lib/constants";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";

/**
 * GamerCheckmark — ALL verified badges use Verified Partner purple checkmark.
 * Admin gets purple + CEO tooltip. Verified partners get purple + "Verified Partner" tooltip.
 */
export default function GamerCheckmark({ accountType, isVerified, userEmail, size = "sm", showTooltip = true, showLabel = false }) {
  const admin = isAdmin(userEmail);

  if (!admin && !isVerified) return null;

  const label = admin ? "CEO & President · GAMER Productions" : "Verified Partner";

  return (
    <VerifiedCheckmark
      size={size}
      showLabel={showLabel}
      showTooltip={showTooltip}
      label={label}
    />
  );
}

export function getCheckmarkLabel(accountType, isVerified, userEmail) {
  if (isAdmin(userEmail)) return "CEO & President";
  if (isVerified) return "Verified Partner";
  return null;
}