import React from "react";
import { ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "views_desc", label: "Most Viewed" },
];

export default function ListingSortControl({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function sortListings(listings, order) {
  const arr = [...listings];
  switch (order) {
    case "oldest":     return arr.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    case "price_asc":  return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_desc": return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "views_desc": return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    default:           return arr.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }
}