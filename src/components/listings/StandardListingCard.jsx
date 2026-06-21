import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Package, CalendarDays, Star, Clock, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import ListingReportButton from "@/components/shared/ListingReportButton";
import RepostButton from "@/components/shared/RepostButton";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import CardEditPencil from "@/components/listings/CardEditPencil";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import { formatListingPrice } from "@/lib/currency";

// Vertical card: image on top, details below. Wider than before.
const SIZE_HEIGHTS = { sm: "h-[184px]", md: "h-[220px]", lg: "h-[256px]" };

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

  const hasDownload = listing.download_url || listing.external_link;

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
      className={`std-listing-card std-edge-glow rounded-2xl overflow-hidden group flex flex-col ${touchActive ? "std-touch-active" : ""}`}
    >
      {/* TOP: Image */}
      <a href={`/listing?id=${listing.id}`} className="relative block w-full">
        {listing.images?.length > 0 ? (
          <ListingImageSlider images={listing.images} title={listing.title} badge={listing.is_premium ? "PREMIUM" : null} heightClass={heightClass} />
        ) : (
          <div className={`${heightClass} w-full flex items-center justify-center bg-gray-800/60`}><Package className="w-9 h-9 text-purple-300 icon-glow-hover" /></div>
        )}
        {isFree && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-bold bg-green-500/90 text-black px-2 py-0.5 rounded-full">FREE</span>
        )}
        <span className="theme-glow-action absolute bottom-2 left-2 z-10 flex items-center gap-1 text-[10px] bg-black/70 text-cyan-300 font-bold px-1.5 py-0.5 rounded-full">
          <Eye className="w-3 h-3 icon-glow-hover" />{viewCount.toLocaleString()}
        </span>
      </a>

      {/* BOTTOM: Content */}
      <div className="relative flex-1 min-w-0 flex flex-col p-3">
        {/* Inline card editor pencil — owner/admin only */}
        <CardEditPencil listing={listing} user={user} onSaved={setListing} />

        {/* Repost — pinned top-right */}
        <div className="absolute top-1.5 right-1.5 z-20 bg-black/60 rounded-lg px-1 py-0.5 backdrop-blur-sm">
          <RepostButton item={listing} type="listing" user={user} profile={profile} compact />
        </div>

        {/* Publisher */}
        <a
          href={`/channel?email=${encodeURIComponent(listing.seller_email || "")}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-1.5 pr-8 hover:opacity-80 transition-opacity"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
            {sellerAvatar
              ? <img src={sellerAvatar} className="w-full h-full object-cover" alt="" />
              : <span className="text-white text-[9px] font-bold">{(listing.seller_username || "G")[0].toUpperCase()}</span>}
          </div>
          <span className="text-gray-300 text-[11px] font-bold truncate">{listing.seller_username || "Gamer"}</span>
        </a>

        <a href={`/listing?id=${listing.id}`} className="block">
          <p className="text-purple-400 text-[10px] font-semibold capitalize truncate">{listing.card_category_label || subcategory || listing.modding_subcategory || listing.digital_subcategory || listing.game_name || "Listing"}</p>
          <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">{listing.title}</h3>
          <p className="theme-glow-action inline-flex items-center gap-1 text-gray-500 text-[10px] mt-1">
            <CalendarDays className="w-3 h-3 icon-glow-hover" /> {listing.created_date ? new Date(listing.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}
            {stay && <span className="text-cyan-300 ml-1 inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {stay}</span>}
          </p>
        </a>

        {/* Download host badge — real logo */}
        {listing.download_host && (
          <div className="mt-1.5">
            <DownloadHostBadge host={listing.download_host} size="sm" />
          </div>
        )}

        {/* Price + Flag + Download row, pushed to the bottom */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <span className={`font-black text-sm ${isFree ? "text-green-400" : "text-yellow-400"}`}>
            {isFree ? "FREE" : formatListingPrice(listing.price, listing.currency)}
          </span>
          <div className="flex items-center gap-1.5">
            {onReview && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReview(listing); }}
                className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                <Star className="w-3 h-3 icon-glow-hover" />
              </button>
            )}
            {/* Flag/report — sits next to the download icon */}
            <ListingReportButton listingId={listing.id} position="static" />
            {hasDownload && (
              <a
                href={`/listing?id=${listing.id}`}
                onClick={(e) => e.stopPropagation()}
                title="Download"
                className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-purple-900/30">
          <ListingEngagementBar listing={listing} user={user} profile={profile} compact hideReport hideRepost />
        </div>
      </div>
    </motion.div>
  );
}