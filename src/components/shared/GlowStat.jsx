import React from "react";
import { formatCount, exactCount } from "@/lib/formatCounts";

export default function GlowStat({ label, value, icon: Icon, color = "text-purple-300" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gray-950/70 px-4 py-3 text-center shadow-[0_0_24px_rgba(124,58,237,0.22)]">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/5 to-cyan-500/10" />
      <div className="relative flex flex-col items-center gap-1">
        {Icon && <Icon className={`w-4 h-4 ${color} drop-shadow-[0_0_8px_rgba(168,85,247,0.85)]`} />}
        <p className={`text-2xl font-black tracking-tight ${color} drop-shadow-[0_0_12px_rgba(168,85,247,0.75)]`} title={exactCount(value)}>{formatCount(value)}</p>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{label}</p>
      </div>
    </div>
  );
}