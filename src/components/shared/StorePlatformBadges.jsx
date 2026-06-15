import React from "react";
import { GAMES_STORES } from "@/lib/constants";

// Renders official store glyphs for a Games listing. Optional outbound links.
export default function StorePlatformBadges({ platforms = [], links = {}, size = "md" }) {
  if (!platforms || platforms.length === 0) return null;
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {platforms.map((id) => {
        const store = GAMES_STORES.find((s) => s.id === id);
        if (!store) return null;
        const url = links?.[id];
        const inner = (
          <span
            className={`inline-flex items-center rounded-lg font-bold border ${sizes[size]}`}
            style={{ background: `${store.color}33`, borderColor: `${store.color}66`, color: "#fff" }}
          >
            <span>{store.emoji}</span>
            <span className="truncate">{store.label}</span>
          </span>
        );
        return url ? (
          <a key={id} href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            {inner}
          </a>
        ) : (
          <span key={id}>{inner}</span>
        );
      })}
    </div>
  );
}