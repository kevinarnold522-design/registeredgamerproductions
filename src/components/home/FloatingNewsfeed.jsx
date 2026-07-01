import React, { useEffect, useState } from "react";
import { Newspaper, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatListingPrice } from "@/lib/currency";
import ListingImageFrame from "@/components/listings/ListingImageFrame";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import ListerAvatarBadge from "@/components/shared/ListerAvatarBadge";

// A small "Featured" listing row with the Gamer.Productions logo badge.
function FeedRow({ item }) {
  return (
    <a
      href={`/listing?id=${item.id}`}
      className="flex gap-2.5 p-2.5 rounded-xl hover:bg-purple-950/30 transition-colors border border-transparent hover:border-purple-700/40"
    >
      <div className="relative w-14 h-14 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
        {item.images?.[0] ? (
          <ListingImageFrame src={item.images[0]} alt="" className="w-full h-full" foregroundClassName="w-full h-full object-contain p-1" backgroundClassName="w-full h-full object-cover scale-110 blur-lg opacity-35" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>
        )}
        <ListerAvatarBadge listing={item} size="w-4 h-4" className="absolute bottom-0.5 right-0.5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-fuchsia-400/40 bg-gradient-to-r from-purple-600/35 via-fuchsia-500/30 to-pink-500/25 text-fuchsia-100 text-[8px] font-black uppercase tracking-wide shadow-[0_0_12px_rgba(217,70,239,0.28)]">
          <Star className="w-2.5 h-2.5 fill-fuchsia-200 text-fuchsia-200" /> Featured
        </span>
        <p className="text-white font-bold text-[11px] truncate mt-0.5">{item.title}</p>
        {item.download_host && <div className="mt-1"><DownloadHostBadge host={item.download_host} size="sm" /></div>}
        <p className="text-purple-300 text-[11px] font-black">
          {item.is_free || !item.price ? "FREE" : formatListingPrice(item.price, item.currency)}
        </p>
      </div>
    </a>
  );
}

// Globally-mounted newsfeed pinned to the right edge on every page.
// Auto-scrolls vertically (marquee loop) and stays fixed wherever the user goes.
export default function FloatingNewsfeed() {
  const [listings, setListings] = useState([]);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktopViewport(media.matches);
    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.entities.Listing.list("-created_date", 60);
        const all = Array.isArray(res) ? res : (res?.data || res?.records || []);
        const active = all.filter(l => (l.status ? l.status === "active" : true) && l.is_approved !== false);
        setListings(active.slice(0, 24));
      } catch {}
    };
    load();
  }, []);

  if (!isDesktopViewport) return null;

  // Duplicate the list so the vertical marquee loops seamlessly.
  const hasItems = listings.length > 0;
  const loopItems = hasItems ? [...listings, ...listings] : [];

  return (
    <div
      className="flex fixed z-[130] flex-col items-end pointer-events-none"
      style={{
        top: "5.75rem",
        right: "max(0.75rem, env(safe-area-inset-right))",
        transform: "translateZ(0)",
      }}
    >
      <div
        className="pointer-events-auto w-60 xl:w-64 rounded-2xl border border-yellow-700/40 bg-gray-950/92 backdrop-blur-md overflow-hidden"
        style={{ boxShadow: "0 0 24px rgba(234,179,8,0.22)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-yellow-500/20 bg-gradient-to-r from-[#080603]/95 via-[#1a1206]/95 to-[#2a1b06]/95">
          <Newspaper className="w-4 h-4 text-yellow-300" />
          <div className="min-w-0">
            <h3 className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 bg-clip-text text-xs font-black leading-none text-transparent">Featured Newsfeed</h3>
            <p className="text-yellow-200/70 text-[9px] mt-0.5">Latest listings · live</p>
          </div>
        </div>

        {/* Vertical auto-scrolling marquee */}
        <div className="relative h-[45vh] lg:h-[60vh] overflow-hidden">
          {hasItems ? (
            <div
              className="flex flex-col"
              style={{
                animation: `fn-vscroll ${Math.max(14, listings.length * 3.2)}s linear infinite`,
              }}
            >
              {loopItems.map((item, i) => (
                <FeedRow key={`${item.id}-${i}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center px-4 text-center">
              <p className="text-xs text-gray-400">Loading featured listings...</p>
            </div>
          )}
          {/* Fade edges */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-950/95 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950/95 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes fn-vscroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}

export function InlineFloatingNewsfeed() {
  const [listings, setListings] = useState([]);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobileViewport(media.matches);
    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await base44.entities.Listing.list("-created_date", isMobileViewport ? 3 : 12);
        const all = Array.isArray(res) ? res : (res?.data || res?.records || []);
        const visibleListings = all.filter((l) => (l.status ? l.status === "active" : true) && l.is_approved !== false);
        if (active) setListings(visibleListings.slice(0, isMobileViewport ? 1 : 5));
      } catch {}
    };
    const schedule = typeof window !== "undefined" && typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(load, { timeout: isMobileViewport ? 4200 : 1200 })
      : window.setTimeout(load, isMobileViewport ? 2400 : 180);
    return () => {
      active = false;
      if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function" && typeof schedule === "number") {
        window.cancelIdleCallback(schedule);
        return;
      }
      clearTimeout(schedule);
    };
  }, [isMobileViewport]);

  if (listings.length === 0) return null;

  return (
    <div className="relative z-20 w-full px-4 sm:px-6 mt-2 mb-4">
      <div
        className="lg:hidden w-full max-w-3xl mx-auto rounded-2xl border border-purple-700/30 bg-gray-950/84 overflow-hidden"
        style={{ boxShadow: "0 0 16px rgba(124,58,237,0.24)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-fuchsia-500/20 bg-gradient-to-r from-[#1d1234]/95 via-[#241042]/95 to-[#2f0d38]/95">
          <Newspaper className="w-3.5 h-3.5 text-fuchsia-200" />
          <div className="min-w-0">
            <h3 className="bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 bg-clip-text text-xs font-black leading-none text-transparent">Featured</h3>
            <p className="text-fuchsia-200/65 text-[8px] mt-0.5">Live feed</p>
          </div>
        </div>

        <div className={`grid p-2 ${isMobileViewport ? "gap-0.5" : "gap-1.5"}`}>
          {listings.map((item) => (
            <FeedRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
