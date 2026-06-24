import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

// A select dropdown with a built-in search box.
// options: [{ value, label }]
export default function SearchableSelect({ value, onChange, options, placeholder = "Select...", className = "", borderClass = "border-gray-700 focus-within:border-purple-500" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm text-left ${borderClass}`}>
        <span className={selected ? "" : "text-gray-500"}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          <div className="relative p-2 border-b border-gray-800">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && <p className="px-4 py-3 text-gray-500 text-sm">No matches found</p>}
            {filtered.map(o => (
              <button key={o.value} type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                className="w-full flex items-center justify-between text-left px-4 py-2.5 text-white text-sm hover:bg-purple-900/40 transition-colors border-b border-gray-800/50 last:border-0">
                {o.label}
                {o.value === value && <Check className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}