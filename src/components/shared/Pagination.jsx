import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Numbered reverse-chronological pagination. Page 1 = newest.
// Always renders the page numbers (even with a single page) so users can
// always see which page they're on.
export default function Pagination({ page, totalPages, onChange }) {
  const safeTotal = Math.max(1, totalPages || 1);

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(safeTotal, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn = "min-w-9 h-9 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center";

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${btn} bg-gray-900 border border-gray-700 text-gray-300 disabled:opacity-40 hover:border-purple-500/50`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onChange(1)} className={`${btn} bg-gray-900 border border-gray-700 text-gray-300`}>1</button>
          {start > 2 && <span className="text-gray-600">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btn} ${p === page ? "bg-purple-600 text-white border border-purple-500" : "bg-gray-900 border border-gray-700 text-gray-300 hover:border-purple-500/50"}`}
        >
          {p}
        </button>
      ))}
      {end < safeTotal && (
        <>
          {end < safeTotal - 1 && <span className="text-gray-600">…</span>}
          <button onClick={() => onChange(safeTotal)} className={`${btn} bg-gray-900 border border-gray-700 text-gray-300`}>{safeTotal}</button>
        </>
      )}
      <button
        disabled={page >= safeTotal}
        onClick={() => onChange(page + 1)}
        className={`${btn} bg-gray-900 border border-gray-700 text-gray-300 disabled:opacity-40 hover:border-purple-500/50`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}