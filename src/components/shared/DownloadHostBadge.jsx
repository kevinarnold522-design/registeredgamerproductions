import React from "react";
import BrandLogo from "@/components/shared/BrandLogo";

// Real download-host branding (logo + official-ish color) for the file hosts
// listings can be hosted on. mediafire/mega have simple-icons logos; modsfire
// and sharemods don't, so they fall back to a colored monogram chip.
export const DOWNLOAD_HOSTS = {
  mediafire: { label: "MediaFire", color: "#1299F3", brand: "mediafire" },
  mega: { label: "MEGA", color: "#D9272E", brand: "mega" },
  modsfire: { label: "Modsfire", color: "#FF6A00", brand: null, mono: "MF" },
  sharemods: { label: "Sharemods", color: "#22C55E", brand: null, mono: "SM" },
};

const SIZES = {
  sm: { wrap: "text-[10px] px-1.5 py-0.5 gap-1", chip: "h-4 w-4", logo: "w-2.5 h-2.5" },
  md: { wrap: "text-xs px-2 py-1 gap-1.5", chip: "h-5 w-5", logo: "w-3.5 h-3.5" },
};

export default function DownloadHostBadge({ host, size = "md", showLabel = true }) {
  const h = DOWNLOAD_HOSTS[String(host || "").toLowerCase()];
  if (!h) return null;
  const s = SIZES[size] || SIZES.md;

  return (
    <span
      className={`inline-flex items-center rounded-lg font-bold border ${s.wrap}`}
      style={{ background: `${h.color}22`, borderColor: `${h.color}66`, color: "#fff" }}
    >
      <span className={`inline-flex items-center justify-center rounded ${s.chip}`} style={{ background: h.color }}>
        {h.brand
          ? <BrandLogo brand={h.brand} label={h.label} className={s.logo} />
          : <span className="text-[8px] font-black text-white leading-none">{h.mono}</span>}
      </span>
      {showLabel && <span className="truncate">{h.label}</span>}
    </span>
  );
}