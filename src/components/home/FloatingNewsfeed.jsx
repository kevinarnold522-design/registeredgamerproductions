import React, { useEffect, useState } from "react";
import { Newspaper, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatListingPrice } from "@/lib/currency";

const GP_LOGO = "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/db7734e8e_2c492ba5e_86DEEF8D-A166-44B9-8CC9-D721135C9BB9.png";

// A small "Featured" listing row with the Gamer.Productions logo badge.
function FeedRow({ item }) {
  return (
    <a
      href={`/listing?id=${item.id}`}
      className="flex gap-2.5 p-2.5 rounded-xl hover:bg-purple-950/30 transition-colors border border-transparent hover:border-purple-700/40"
    >
      <div className="relative w-14 h-14 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
        {item.images?.[0] ? (
          <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>
        )}
        {/* Gamer.Productions logo badge */}
        <img src={GP_LOGO} alt="" className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full ring-1 ring-purple-400/70" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-black text-[8px] font-black uppercase tracking-wide">
          <Star className="w-2.5 h-2.5 fill-black" /> Featured
        </span>
        <p className="text-white font-bold text-[11px] truncate mt-0.5">{item.title}</p>
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
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
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

  if (isMobileViewport || listings.length === 0) return null;

  // Duplicate the list so the vertical marquee loops seamlessly.
  const loopItems = [...listings, ...listings];

  return (
    <div className="flex fixed top-20 lg:top-24 right-2 lg:right-3 z-30 flex-col items-end pointer-events-none">
      <div
        className="pointer-events-auto w-44 lg:w-64 rounded-2xl border border-purple-700/40 bg-gray-950/90 backdrop-blur-md overflow-hidden"
        style={{ boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-gray-900">
          <Newspaper className="w-4 h-4 text-purple-300" />
          <div className="min-w-0">
            <h3 className="text-white font-black text-xs leading-none">Featured Newsfeed</h3>
            <p className="text-gray-500 text-[9px] mt-0.5">Latest listings · live</p>
          </div>
        </div>

        {/* Vertical auto-scrolling marquee */}
        <div className="relative h-[45vh] lg:h-[60vh] overflow-hidden">
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.entities.Listing.list("-created_date", 24);
        const all = Array.isArray(res) ? res : (res?.data || res?.records || []);
        const active = all.filter((l) => (l.status ? l.status === "active" : true) && l.is_approved !== false);
        setListings(active.slice(0, 12));
      } catch {}
    };
    load();
  }, []);

  if (listings.length === 0) return null;

  // Duplicate the list so the vertical marquee loops seamlessly for mobile
  const loopItems = [...listings, ...listings];

  return (
    <div className="fixed bottom-24 lg:bottom-auto lg:top-auto right-0 lg:right-0 z-30 w-full lg:w-auto flex flex-col items-end lg:items-end">
      <div
        className="lg:hidden w-48 max-h-screen rounded-l-2xl border border-purple-700/40 bg-gray-950/90 backdrop-blur-md overflow-hidden mr-0"
        style={{ boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-gray-900">
          <Newspaper className="w-3.5 h-3.5 text-purple-300" />
          <div className="min-w-0">
            <h3 className="text-white font-black text-xs leading-none">Featured</h3>
            <p className="text-gray-500 text-[8px] mt-0.5">Live feed</p>
          </div>
        </div>

        {/* Vertical auto-scrolling marquee for mobile */}
        <div className="relative h-96 overflow-hidden">
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
          {/* Fade edges */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-950/95 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-950/95 to-transparent" />
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