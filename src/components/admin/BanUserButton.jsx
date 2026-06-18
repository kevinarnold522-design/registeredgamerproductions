import React, { useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Admin-only ban / unban control for a user profile row.
export default function BanUserButton({ profile, onChange }) {
  const [busy, setBusy] = useState(false);
  const [banned, setBanned] = useState(!!profile.is_banned);

  const toggleBan = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!banned) {
      const reason = window.prompt(`Ban ${profile.username || profile.user_email}? Enter a reason (optional):`, "");
      if (reason === null) return; // cancelled
      setBusy(true);
      await base44.entities.UserProfile.update(profile.id, {
        is_banned: true,
        banned_reason: reason || "Violation of community guidelines",
        banned_date: new Date().toISOString(),
        is_active: false,
      });
      setBanned(true);
    } else {
      setBusy(true);
      await base44.entities.UserProfile.update(profile.id, { is_banned: false, banned_reason: "", is_active: true });
      setBanned(false);
    }
    setBusy(false);
    onChange?.(banned ? false : true);
  };

  return (
    <button
      onClick={toggleBan}
      disabled={busy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
        banned
          ? "bg-green-900/30 border border-green-600/40 text-green-300 hover:bg-green-900/50"
          : "bg-red-900/30 border border-red-600/40 text-red-300 hover:bg-red-900/50"
      }`}
    >
      {banned ? <><ShieldCheck className="w-3.5 h-3.5" /> Unban</> : <><Ban className="w-3.5 h-3.5" /> Ban</>}
    </button>
  );
}