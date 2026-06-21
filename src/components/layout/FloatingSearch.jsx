import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e?.preventDefault?.();
    const clean = query.trim().replace(/[<>]/g, "");
    if (!clean) return;
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="sticky top-0 z-[60] w-full bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 px-4 py-2">
      <form onSubmit={submit} className="max-w-3xl mx-auto flex items-center gap-2 rounded-2xl border border-purple-700/50 bg-gray-900 px-4 py-2.5 shadow-lg shadow-purple-950/30">
        <Search className="w-4 h-4 text-purple-300 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GAMER Productions..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        <button type="submit" className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex-shrink-0">
          Search
        </button>
      </form>
    </div>
  );
}