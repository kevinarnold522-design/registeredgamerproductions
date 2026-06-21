import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Package, CalendarDays, Star, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import ListingReportButton from "@/components/shared/ListingReportButton";
import RepostButton from "@/components/shared/RepostButton";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import CardEditPencil from "@/components/listings/CardEditPencil";
import { formatListingPrice } from "@/lib/currency";

// Map glow color id -> "r,g,b" used by the --std-glow CSS var (matches resolveGlow)
const SIZE_HEIGHTS = { sm: "h-36", md: "h-48", lg: "h-60" };

// Average stay (seconds) -> "1m 20s" / "45s"
function formatStay(listing) {
  const total = listing?.total_dwell_seconds || 0;
  const sessions = listing?.view_sessions || 0;
  if (!sessions || !total) return null;
  const avg = Math.round(total / sessions);
  if (avg >= 60) return `${Math.floor(avg / 60)}m ${avg % 60}s`;
  return `${avg}s`;
}

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

export default function StandardListingCard({ listing: initialListing, user, profile, subcategory, onReview }) {
  const cardRef = useRef(null);
  const countedRef = useRef(false);
  const [listing, setListing] = useState(initialListing);
  const [viewCount, setViewCount] = useState(initialListing.views || 0);
  const [touchActive, setTouchActive] = useState(false);
  const [sellerAvatar, setSellerAvatar] = useState(initialListing.seller_avatar || "");

  useEffect(() => { setListing(initialListing); }, [initialListing]);

  // Resolve publisher avatar from their profile when not embedded on the listing
  useEffect(() => {
    if (initialListing.seller_avatar) { setSellerAvatar(initialListing.seller_avatar); return; }
    if (!initialListing.seller_email) return;
    base44.entities.UserProfile.filter({ user_email: initialListing.seller_email })
      .then((rows) => { if (rows[0]?.avatar_url) setSellerAvatar(rows[0].avatar_url); })
      .catch(() => {});
  }, [initialListing.seller_email, initialListing.seller_avatar]);

  // Realtime: keep this card's stats (views, likes, comments) in sync live
  useEffect(() => {
    if (!listing?.id) return;
    const unsubscribe = base44.entities.Listing.subscribe((event) => {
      if (event?.data?.id !== listing.id) return;
      if (event.type === "update") {
        setListing((prev) => ({ ...prev, ...event.data }));
        if (typeof event.data.views === "number") setViewCount(event.data.views);
      }
    });
    return unsubscribe;
  }, [listing?.id]);

  const glow = resolveGlow(listing);
  const isFree = listing.price === 0 || listing.is_free;
  const heightClass = SIZE_HEIGHTS[listing.card_size] || "h-48";
  const stay = formatStay(listing);

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
      className={`std-listing-card std-edge-glow rounded-2xl overflow-hidden group ${touchActive ? "std-touch-active" : ""}`}
    >
      {/* Flag/report — moved to bottom-left of the card */}
      <ListingReportButton listingId={listing.id} position="bottom-2 left-2" />

      {/* Inline card editor pencil — owner/admin only, top-left */}
      <CardEditPencil listing={listing} user={user} onSaved={setListing} />

      {/* Repost — pinned top-right of the card */}
      <div className="absolute top-2 right-2 z-20 bg-black/60 rounded-lg px-1 py-0.5 backdrop-blur-sm">
        <RepostButton item={listing} type="listing" user={user} profile={profile} compact />
      </div>

      {/* Publisher header — avatar + name, top-left */}
      <a
        href={`/channel?email=${encodeURIComponent(listing.seller_email || "")}`}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 px-3 py-2 border-b border-purple-900/30 hover:bg-purple-900/20 transition-colors"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
          {sellerAvatar
            ? <img src={sellerAvatar} className="w-full h-full object-cover" alt="" />
            : <span className="text-white text-xs font-bold">{(listing.seller_username || "G")[0].toUpperCase()}</span>}
        </div>
        <span className="text-white text-xs font-bold truncate">{listing.seller_username || "Gamer"}</span>
      </a>

      {/* Image */}
      <a href={`/listing?id=${listing.id}`} className="block relative">
        {listing.images?.length > 0 ? (
          <ListingImageSlider images={listing.images} title={listing.title} badge={listing.is_premium ? "PREMIUM" : null} heightClass={heightClass} />
        ) : (
          <div className={`${heightClass} w-full flex items-center justify-center bg-gray-800/60`}><Package className="w-10 h-10 text-purple-300 icon-glow-hover" /></div>
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
          <p className="text-purple-400 text-xs font-semibold mb-1 capitalize">{listing.card_category_label || subcategory || listing.modding_subcategory || listing.digital_subcategory || listing.game_name || "Listing"}</p>
          <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">{listing.title}</h3>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <p className="theme-glow-action inline-flex items-center gap-1.5 text-gray-400 text-xs rounded-lg px-1.5 py-0.5">
              <CalendarDays className="w-3 h-3 icon-glow-hover" /> {listing.created_date ? new Date(listing.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
            </p>
            {stay && (
              <p className="theme-glow-action inline-flex items-center gap-1 text-cyan-300 text-xs rounded-lg px-1.5 py-0.5" title="Average stay time">
                <Clock className="w-3 h-3 icon-glow-hover" /> {stay} avg
              </p>
            )}
          </div>

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
          <ListingEngagementBar listing={listing} user={user} profile={profile} compact hideReport hideRepost />
        </div>
      </div>
    </motion.div>
  );
}