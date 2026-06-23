import React from "react";
import { Trophy, TrendingUp } from "lucide-react";

// Vertical rank badge pinned to the right edge of a listing card.
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
      className="absolute top-1/2 -translate-y-1/2 right-0 z-30 flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-l-xl backdrop-blur-sm"
      style={{
        background: tier.bg,
        border: `1px solid ${tier.ring}55`,
        boxShadow: `0 0 14px rgba(${tier.glow},0.5), inset 0 0 8px rgba(${tier.glow},0.25)`,
      }}
      title={`Rank #${rank} this month`}
    >
      {rank <= 3 ? (
        <Trophy className="w-3.5 h-3.5" style={{ color: tier.text }} />
      ) : (
        <TrendingUp className="w-3.5 h-3.5" style={{ color: tier.text }} />
      )}
      <span className="text-[8px] font-black uppercase tracking-wide" style={{ color: tier.text, writingMode: "vertical-rl" }}>
        Rank
      </span>
      <span className="text-xs font-black leading-none" style={{ color: tier.text }}>
        #{rank}
      </span>
    </div>
  );
}