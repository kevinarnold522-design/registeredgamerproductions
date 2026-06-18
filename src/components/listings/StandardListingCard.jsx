import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Package, CalendarDays, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import ListingReportButton from "@/components/shared/ListingReportButton";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import { formatListingPrice } from "@/lib/currency";

// Resolve the per-listing glow color into an "r,g,b" string used by the CSS var --std-glow
const GLOW_PRESET_RGB = {
  red: "239,68,68",
  purple: "168,85,247",
  blue: "59,130,246",
  green: "34,197,94",
  gold: "234,179,8",
  multi: "168,85,247",
};
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return null;
  return `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`;
}
function resolveGlow(listing) {
  if (listing?.card_glow_color === "custom" && listing?.card_glow_hex) {
    return hexToRgb(listing.card_glow_hex) || "168,85,247";
  }
  return GLOW_PRESET_RGB[listing?.card_glow_color] || "168,85,247";
}

export default function StandardListingCard({ listing, user, profile, subcategory, onReview }) {
  const cardRef = useRef(null);
  const countedRef = useRef(false);
  const [viewCount, setViewCount] = useState(listing.views || 0);
  const [touchActive, setTouchActive] = useState(false);

  const glow = resolveGlow(listing);
  const isFree = listing.price === 0 || listing.is_free;

  // Count a view once when scrolled into view
  useEffect(() => {
    if (!cardRef.current || !listing?.id) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || countedRef.current) return;
      countedRef.current = true;
      const key = `listing_seen_${listing.id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      const nextViews = (listing.views || 0) + 1;
      setViewCount(nextViews);
      base44.entities.Listing.update(listing.id, { views: nextViews }).catch(() => {});
    }, { threshold: 0.55 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [listing?.id]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onTouchStart={() => setTouchActive(true)}
      onTouchEnd={() => setTimeout(() => setTouchActive(false), 600)}
      onTouchCancel={() => setTouchActive(false)}
      style={{ "--std-glow": glow }}
      className={`std-listing-card rounded-2xl overflow-hidden group ${touchActive ? "std-touch-active" : ""}`}
    >
      <ListingReportButton listingId={listing.id} />

      {/* Image */}
      <a href={`/listing?id=${listing.id}`} className="block relative">
        {listing.images?.length > 0 ? (
          <ListingImageSlider images={listing.images} title={listing.title} badge={listing.is_premium ? "PREMIUM" : null} heightClass="h-48" />
        ) : (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800/60"><Package className="w-10 h-10 text-purple-300 icon-glow-hover" /></div>
        )}
        {isFree && (
          <span className="absolute top-3 right-3 z-10 text-xs font-bold bg-green-500/90 text-black px-2 py-0.5 rounded-full">FREE</span>
        )}
        <span className="theme-glow-action absolute bottom-3 right-3 z-10 flex items-center gap-1 text-xs bg-black/70 text-cyan-300 font-bold px-2 py-1 rounded-full">
          <Eye className="w-3 h-3 icon-glow-hover" />{viewCount.toLocaleString()}
        </span>
      </a>

      {/* Content */}
      <div className="p-4">
        <a href={`/listing?id=${listing.id}`} className="block">
          <p className="text-purple-400 text-xs font-semibold mb-1">{subcategory || listing.modding_subcategory || listing.digital_subcategory || listing.game_name || "Listing"}</p>
          <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">{listing.title}</h3>
          <p className="theme-glow-action inline-flex items-center gap-1.5 text-gray-400 text-xs mt-1 rounded-lg px-1.5 py-0.5">
            <CalendarDays className="w-3 h-3 icon-glow-hover" /> Posted: {listing.created_date ? new Date(listing.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className={`font-black text-sm ${isFree ? "text-green-400" : "text-yellow-400"}`}>
              {isFree ? "FREE" : formatListingPrice(listing.price, listing.currency)}
            </span>
            {onReview && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReview(listing); }}
                className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                <Star className="w-3 h-3 icon-glow-hover" /> Reviews
              </button>
            )}
          </div>
          {listing.seller_username && <p className="text-gray-600 text-xs mt-1">by @{listing.seller_username}</p>}
        </a>

        <div className="mt-4 pt-3 border-t border-purple-900/30">
          <ListingEngagementBar listing={listing} user={user} profile={profile} compact hideReport />
        </div>
      </div>
    </motion.div>
  );
}