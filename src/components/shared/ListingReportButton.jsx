import React from "react";
import { Flag } from "lucide-react";

// Standalone report control pinned to the top-right corner of a listing card.
export default function ListingReportButton({ listingId, className = "", position = "top-2 right-2" }) {
  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/contact?report=${listingId}`, "_blank");
  };
  return (
    <button
      onClick={handleReport}
      title="Report this listing"
      className={`absolute ${position} z-20 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-red-400 hover:border-red-500/50 flex items-center justify-center transition-all ${className}`}
    >
      <Flag className="w-3.5 h-3.5" />
    </button>
  );
}