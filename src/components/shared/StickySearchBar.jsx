import React, { useState } from "react";
import { Search } from "lucide-react";

// Persistent search bar pinned to the top of listing/landing pages.
// Sanitizes input and routes to /category with the query (search results live there).
export default function StickySearchBar() {
  const [q, setQ] = useState("");

  const submit = () => {
    const clean = q.replace(/[<>]/g, "").trim();
    if (!clean) return;
    window.location.href = `/category?cat=store&q=${encodeURIComponent(clean)}`;
  };

  return (
    <div className="sticky top-14 lg:top-0 z-40 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 py-2 px-4">
      <div className="max-w-3xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Search listings, games, mods…"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-10 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={submit}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}