import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e?.preventDefault?.();
    const clean = query.trim().replace(/[<>]/g, "");
    if (!clean) return;
    navigate(`/search?q=${encodeURIComponent(clean)}`);
    setOpen(false);
  };

  return (
    <div className="fixed top-20 left-3 lg:left-[calc(var(--sidebar-offset,240px)+12px)] z-[60]">
      {open ? (
        <form onSubmit={submit} className="flex items-center gap-2 w-72 max-w-[calc(100vw-24px)] rounded-2xl border border-purple-700/50 bg-gray-950/95 px-3 py-2 shadow-2xl shadow-purple-950/40 backdrop-blur-md">
          <Search className="w-4 h-4 text-purple-300 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GAMER Productions..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="w-11 h-11 rounded-2xl border border-purple-700/50 bg-gray-950/95 text-purple-300 shadow-lg shadow-purple-950/40 backdrop-blur-md flex items-center justify-center hover:bg-purple-900/30 transition-all" title="Search">
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}