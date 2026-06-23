import React from "react";
import { Trophy, TrendingUp } from "lucide-react";

// Horizontal rank badge shown at the bottom of a listing card.
// Shows the listing's rank for the current month (resets on the 1st).
export default function MonthlyRankBadge({ rank }) {
  if (!rank) return null;

  // Top 3 get medal colors, everyone else a neutral purple
  const tier =
    rank === 1 ? { ring: "#fde047", bg: "rgba(234,179,8,0.22)", text: "#fde047", glow: "250,204,21" }
    : rank === 2 ? { ring: "#e5e7eb", bg: "rgba(229,231,235,0.18)", text: "#e5e7eb", glow: "229,231,235" }
    : rank === 3 ? { ring: "#fdba74", bg: "rgba(249,115,22,0.2)", text: "#fdba74", glow: "249,115,22" }
    : { ring: "#c084fc", bg: "rgba(168,85,247,0.18)", text: "#d8b4fe", glow: "168,85,247" };

  return (
    <div
      className="flex items-center justify-center gap-1.5 w-full px-2 py-1 rounded-lg backdrop-blur-sm"
      style={{
        background: tier.bg,
        border: `1px solid ${tier.ring}55`,
        boxShadow: `0 0 12px rgba(${tier.glow},0.45), inset 0 0 8px rgba(${tier.glow},0.2)`,
      }}
      title={`Rank #${rank} this month`}
    >
      {rank <= 3 ? (
        <Trophy className="w-3.5 h-3.5" style={{ color: tier.text }} />
      ) : (
        <TrendingUp className="w-3.5 h-3.5" style={{ color: tier.text }} />
      )}
      <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: tier.text }}>
        Rank #{rank} this month
      </span>
    </div>
  );
}