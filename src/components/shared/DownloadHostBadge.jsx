import React from "react";
import BrandLogo from "@/components/shared/BrandLogo";

export const DOWNLOAD_HOSTS = {
  mediafire: { id: "mediafire", label: "MediaFire", color: "#1299F3", logoUrl: "/assets/download-hosts/mediafire.png" },
  mega: { id: "mega", label: "MEGA", color: "#D9272E", logoUrl: "/assets/download-hosts/mega.png" },
  modsfire: { id: "modsfire", label: "ModsFire", color: "#19A1EB", logoUrl: "/assets/download-hosts/modsfire.png" },
  sharemods: { id: "sharemods", label: "ShareMods", color: "#4FA4E5", logoUrl: "/assets/download-hosts/sharemods.png" },
};

export const DOWNLOAD_HOST_OPTIONS = Object.values(DOWNLOAD_HOSTS);

const SIZES = {
  sm: { wrap: "text-[10px] px-1 py-0.5 gap-1", chip: "h-4 min-w-[3.35rem] max-w-[3.8rem] px-1", logo: "w-2.5 h-2.5", img: "h-full w-full object-contain" },
  md: { wrap: "text-[11px] px-1.5 py-1 gap-1", chip: "h-5 min-w-[4.2rem] max-w-[5rem] px-1", logo: "w-3 h-3", img: "h-full w-full object-contain" },
};

export default function DownloadHostBadge({ host, size = "md", showLabel }) {
  const h = DOWNLOAD_HOSTS[String(host || "").toLowerCase()];
  if (!h) return null;
  const s = SIZES[size] || SIZES.md;
  const shouldShowLabel = typeof showLabel === "boolean" ? showLabel : !h.logoUrl;

  return (
    <span
      className={`inline-flex items-center rounded-lg font-bold border ${s.wrap}`}
      style={{ background: `${h.color}22`, borderColor: `${h.color}66`, color: "#fff" }}
    >
      <span
        className={`inline-flex items-center justify-center overflow-hidden rounded ${s.chip}`}
        style={h.logoUrl ? { background: "transparent" } : { background: h.color }}
      >
        {h.logoUrl
          ? <img src={h.logoUrl} alt={h.label} className={s.img} loading="lazy" />
          : h.brand
            ? <BrandLogo brand={h.brand} label={h.label} className={s.logo} />
            : <span className="text-[8px] font-black text-white leading-none">{h.mono}</span>}
      </span>
      {shouldShowLabel && <span className="truncate">{h.label}</span>}
    </span>
  );
}
