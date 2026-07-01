import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingSearchHeader({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  rightSlot = null,
  className = "",
  inputClassName = "",
}) {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      <div className="gp-toolbar flex w-full items-center overflow-hidden lg:max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="touch-target inline-flex flex-shrink-0 items-center justify-center gap-2 self-stretch border-r border-white/10 bg-black/18 px-4 py-3 text-sm font-black text-white transition-all hover:bg-black/26"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="relative min-w-0 flex-1 bg-black/18">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-100/65" />
          <input
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className={`w-full bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-fuchsia-100/55 focus:outline-none ${inputClassName}`}
          />
        </div>
      </div>
      {rightSlot ? <div className="flex flex-wrap items-stretch gap-2">{rightSlot}</div> : null}
    </div>
  );
}
