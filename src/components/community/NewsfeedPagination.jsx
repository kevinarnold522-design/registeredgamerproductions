import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Numbered page selector for newsfeeds. Shows numbered buttons with prev/next.
export default function NewsfeedPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Build a compact window of page numbers around the current page
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const go = (p) => {
    onChange(Math.max(1, Math.min(totalPages, p)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap mb-4">
      <button onClick={() => go(page - 1)} disabled={page === 1}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-purple-700 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {start > 1 && (
        <>
          <button onClick={() => go(1)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 hover:bg-purple-700 transition-colors">1</button>
          {start > 2 && <span className="text-gray-600 text-xs px-1">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button key={p} onClick={() => go(p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${p === page ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]" : "bg-gray-800 text-gray-300 hover:bg-purple-700"}`}>
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-600 text-xs px-1">…</span>}
          <button onClick={() => go(totalPages)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 hover:bg-purple-700 transition-colors">{totalPages}</button>
        </>
      )}
      <button onClick={() => go(page + 1)} disabled={page === totalPages}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-purple-700 transition-colors">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}