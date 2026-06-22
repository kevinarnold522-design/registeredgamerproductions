import React from "react";
import { CalendarDays } from "lucide-react";

function formatPostedDate(value) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ListingSellerBadge({ createdDate }) {
  return (
    <div className="theme-glow-action inline-flex items-center gap-2 mt-2 rounded-xl border border-purple-500/20 bg-gray-950/50 px-2.5 py-1.5 text-gray-300">
      <CalendarDays className="w-3.5 h-3.5 theme-glow-icon" />
      <span className="min-w-0 flex flex-col">
        <span className="text-purple-300/70 text-[9px] font-bold uppercase tracking-wider">Posted Date</span>
        <span className="text-gray-200 text-[11px] font-semibold truncate max-w-[130px]">{formatPostedDate(createdDate)}</span>
      </span>
    </div>
  );
}