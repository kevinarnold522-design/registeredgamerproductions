import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Package, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import { formatListingPrice } from "@/lib/currency";

export default function EnhancedListingCard({ listing, user, profile, subcategory }) {
  const cardRef = useRef(null);
  const countedRef = useRef(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(listing.likes || 0);
  const [downloadCount, setDownloadCount] = useState(listing.downloads || 0);
  const [viewCount, setViewCount] = useState(listing.views || 0);

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

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : c - 1);
    base44.entities.Listing.update(listing.id, { likes: next ? likeCount + 1 : likeCount - 1 }).catch(() => {});
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    // Increment download count
    const newCount = downloadCount + 1;
    setDownloadCount(newCount);
    base44.entities.Listing.update(listing.id, { downloads: newCount }).catch(() => {});
    // Redirect to listing page for actual download
    window.location.href = `/listing?id=${listing.id}`;
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/listing?id=${listing.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/contact?report=${listing.id}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      ref={cardRef}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-purple-600/50 transition-all group"
    >
      {/* Image */}
      <a href={`/listing?id=${listing.id}`} className="block relative">
        {listing.images?.length > 0 ? (
          <ListingImageSlider images={listing.images} title={listing.title} badge={listing.is_premium ? "PREMIUM" : null} heightClass="h-48" />
        ) : (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800"><Package className="w-10 h-10 text-purple-300" /></div>
        )}
        {(listing.price === 0 || listing.is_free) && (
          <span className="absolute top-3 right-3 z-10 text-xs font-bold bg-green-500/90 text-black px-2 py-0.5 rounded-full">FREE</span>
        )}
        <span className="theme-glow-action absolute bottom-3 right-3 z-10 flex items-center gap-1 text-xs bg-black/70 text-cyan-300 font-bold px-2 py-1 rounded-full"><Eye className="w-3 h-3 theme-glow-icon" />{viewCount.toLocaleString()}</span>
      </a>

      {/* Content */}
      <div className="p-4">
        <a href={`/listing?id=${listing.id}`} className="block">
          <p className="text-purple-400 text-xs font-semibold mb-1">{subcategory || listing.modding_subcategory || listing.digital_subcategory || "Listing"}</p>
          <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">{listing.title}</h3>
          <p className="theme-glow-action inline-flex items-center gap-1.5 text-gray-400 text-xs mt-1 rounded-lg px-1.5 py-0.5"><CalendarDays className="w-3 h-3 theme-glow-icon" /> Posted Date: {listing.created_date ? new Date(listing.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</p>
          
          <div className="flex items-center justify-between mt-3">
            <span className={`font-black text-sm ${listing.price === 0 || listing.is_free ? "text-green-400" : "text-yellow-400"}`}>
              {listing.price === 0 || listing.is_free ? "FREE" : formatListingPrice(listing.price, listing.currency)}
            </span>
          </div>
        </a>

        <div className="mt-4 pt-3 border-t border-gray-800">
          <ListingEngagementBar listing={listing} user={user} profile={profile} compact />
        </div>
      </div>
    </motion.div>
  );
}