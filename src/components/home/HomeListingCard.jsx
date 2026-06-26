import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, ChevronLeft, ChevronRight, Crown, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatListingPrice } from "@/lib/currency";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";


export default function HomeListingCard({ listing, index = 0, className = "", user = null, profile = null }) {
  const [liveListing, setLiveListing] = useState(listing);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sellerAvatar, setSellerAvatar] = useState(listing.seller_avatar || "");
  const hasMultipleImages = liveListing.images && liveListing.images.length > 1;

  useEffect(() => {
    setLiveListing(listing);
    setCurrentImageIndex(0);
  }, [listing]);

  // Resolve seller avatar from their profile when not embedded on the listing
  useEffect(() => {
    if (listing.seller_avatar) { setSellerAvatar(listing.seller_avatar); return; }
    if (!listing.seller_email) return;
    base44.entities.UserProfile.filter({ user_email: listing.seller_email })
      .then((rows) => { if (rows[0]?.avatar_url) setSellerAvatar(rows[0].avatar_url); })
      .catch(() => {});
  }, [listing.seller_email, listing.seller_avatar]);

  useEffect(() => {
    if (!listing?.id) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = base44.entities.Listing.subscribe((event) => {
        if (event?.data?.id !== listing.id) return;
        if (event.type === "update") {
          setLiveListing((prev) => ({ ...prev, ...event.data }));
        }
      });
    } catch (_) {}
    return () => {
      try { unsubscribe(); } catch (_) {}
    };
  }, [listing?.id]);

  // Auto-transition images every 3 seconds if multiple images
  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % liveListing.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hasMultipleImages, liveListing.images?.length]);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + liveListing.images.length) % liveListing.images.length);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % liveListing.images.length);
  };

  return (
    <motion.a
      href={`/listing?id=${listing.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700/50 transition-colors block group ${className}`}
      style={{ boxShadow: "0 0 20px rgba(168, 85, 247, 0.15)" }}
      whileHover={{ boxShadow: "0 0 30px rgba(168, 85, 247, 0.3)" }}
    >
      <div className="relative h-44 overflow-hidden">
        {/* Image carousel */}
        {liveListing.images?.[0] ? (
          <div className="relative w-full h-full">
            <motion.img
              key={`image-${currentImageIndex}`}
              src={liveListing.images[currentImageIndex]}
              alt={liveListing.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
            {/* Image navigation arrows - only show if multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors z-10"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                {/* Image indicators */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {liveListing.images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentImageIndex ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-800">🎮</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        {/* Premium badge - show for premium/verified listings */}
        {(liveListing.is_premium || liveListing.verified) && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black" style={{ background: "linear-gradient(135deg,#d946ef,#a855f7)", color: "#fff", boxShadow: "0 0 10px rgba(217,70,239,0.6)" }}>
            <Crown className="w-3 h-3" /> PREMIUM
          </span>
        )}
        
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
          <Eye className="w-3 h-3" />
          {(liveListing.views || 0).toLocaleString()}
        </span>
        
        {/* IGN Rating badge - top right if available */}
        {liveListing.ign_rating && (
          <div className="absolute top-3 left-24 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", boxShadow: "0 0 15px rgba(251, 191, 36, 0.7)" }}>
            <Star className="w-3 h-3 fill-current" />
            IGN {liveListing.ign_rating}
          </div>
        )}
        
        {/* PAID sign at bottom-right */}
        {!liveListing.is_free && liveListing.price > 0 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black" style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899)", color: "#000", boxShadow: "0 0 10px rgba(245,158,11,0.6)" }}>💎 PAID</span>
        )}
        
        {/* Super glow bar effect - animated gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" style={{ opacity: 0.6, boxShadow: "0 0 20px rgba(168, 85, 247, 0.8)" }} />
      </div>
      <div className="p-5">
        <p className="text-purple-400 text-xs font-semibold mb-1">{liveListing.subcategory || liveListing.platform || liveListing.game_name || "Game"}</p>
        <h3 className="text-white font-bold text-lg mb-2 truncate">{liveListing.title}</h3>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{liveListing.description}</p>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-purple-400 font-black text-xl">
            {liveListing.is_free || !liveListing.price ? "FREE" : formatListingPrice(liveListing.price, liveListing.currency)}
          </span>
          {/* Seller profile with avatar */}
          <a
            href={`/channel?email=${encodeURIComponent(liveListing.seller_email || "")}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              {sellerAvatar
                ? <img src={sellerAvatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-white text-[9px] font-bold">{(liveListing.seller_username || "G")[0].toUpperCase()}</span>}
            </div>
            <span className="text-gray-300 text-xs font-bold truncate">@{liveListing.seller_username || liveListing.seller_email?.split("@")[0] || "gamer"}</span>
          </a>
        </div>
        

      </div>
      <div className="px-5 pb-4 pt-0" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
        <ListingEngagementBar listing={liveListing} user={user} profile={profile} compact />
      </div>
    </motion.a>
  );
}