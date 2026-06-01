import React, { useState, useEffect, useRef } from "react";
import { Search, X, Tag, Gamepad2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GlobalSearchBar({ compact = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const all = await base44.entities.Listing.list("-updated_date", 200);
      const q = query.toLowerCase();
      const filtered = all.filter(l =>
        l.status === "active" && (
          l.title?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.category?.toLowerCase().includes(q) ||
          l.subcategory?.toLowerCase().includes(q) ||
          l.game_name?.toLowerCase().includes(q) ||
          (l.tags || []).some(t => t.toLowerCase().includes(q))
        )
      ).slice(0, 8);
      setResults(filtered);
      setOpen(true);
      setLoading(false);
    }, 250);
  }, [query]);

  const handleSelect = (listing) => {
    window.location.href = `/category?cat=${listing.category}`;
    setOpen(false);
    setQuery("");
  };

  const categoryColors = {
    games: "text-purple-400",
    modding: "text-orange-400",
    buy_sell: "text-yellow-400",
    tournaments: "text-green-400",
    content: "text-blue-400",
    jobs: "text-rose-400",
    livestream: "text-red-400",
    services: "text-indigo-400",
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 focus-within:border-purple-500 transition-colors">
        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder={compact ? "Search..." : "Search listings, mods, games..."}
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-gray-500 hover:text-gray-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[100]">
          {loading && (
            <div className="px-4 py-3 text-gray-500 text-xs text-center">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-xs text-center">No results for "{query}"</div>
          )}
          {!loading && results.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map(listing => (
                <button
                  key={listing.id}
                  onClick={() => handleSelect(listing)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                >
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                      <Gamepad2 className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{listing.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold ${categoryColors[listing.category] || "text-gray-400"}`}>
                        {listing.category?.replace("_", " ")}
                      </span>
                      {listing.subcategory && (
                        <span className="text-gray-600 text-[10px]">· {listing.subcategory}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-green-400 font-bold text-sm flex-shrink-0">
                    {listing.is_free || listing.price === 0 ? "FREE" : `₱${listing.price?.toLocaleString()}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}