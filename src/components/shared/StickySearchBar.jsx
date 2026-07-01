import React, { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Persistent search bar pinned to the top of listing/landing pages.
// Sanitizes input and routes to /search?q=...
export default function StickySearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = () => {
    const clean = q.replace(/[<>]/g, "").trim();
    if (!clean) return;
    window.location.href = `/search?q=${encodeURIComponent(clean)}`;
  };

  return (
    <div className="sticky top-16 lg:top-0 z-40 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 py-2 px-4">
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex flex-shrink-0 items-center justify-center gap-1 rounded-xl border border-fuchsia-400/45 bg-gradient-to-r from-purple-600/80 via-fuchsia-600/80 to-pink-500/80 px-3 py-2.5 text-sm font-black text-white shadow-[0_0_18px_rgba(217,70,239,0.34)] transition-all hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Search listings, games, mods…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
}