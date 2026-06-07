import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Eye, Download, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EnhancedListingCard({ listing, user, profile, subcategory }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(listing.likes || 0);
  const [downloadCount, setDownloadCount] = useState(listing.downloads || 0);

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
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-purple-600/50 transition-all group"
    >
      {/* Image */}
      <a href={`/listing?id=${listing.id}`} className="block relative h-48">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-800">🎮</div>
        )}
        {listing.is_premium && (
          <span className="absolute top-3 left-3 text-xs font-bold bg-yellow-500/90 text-black px-2 py-0.5 rounded-full">⭐ Premium</span>
        )}
        {(listing.price === 0 || listing.is_free) && (
          <span className="absolute top-3 right-3 text-xs font-bold bg-green-500/90 text-black px-2 py-0.5 rounded-full">FREE</span>
        )}
      </a>

      {/* Content */}
      <div className="p-4">
        <a href={`/listing?id=${listing.id}`} className="block">
          <p className="text-purple-400 text-xs font-semibold mb-1">{subcategory || listing.modding_subcategory || listing.digital_subcategory || "Listing"}</p>
          <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">{listing.title}</h3>
          <p className="text-gray-600 text-xs mt-1">by @{listing.seller_username}</p>
          
          <div className="flex items-center justify-between mt-3">
            <span className={`font-black text-sm ${listing.price === 0 || listing.is_free ? "text-green-400" : "text-yellow-400"}`}>
              {listing.price === 0 || listing.is_free ? "FREE" : `₱${listing.price?.toLocaleString()}`}
            </span>
          </div>
        </a>

        {/* Engagement Bar */}
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between flex-wrap gap-2">
          {/* Views */}
          <span className="flex items-center gap-1 text-gray-500 text-[10px]">
            <Eye className="w-3 h-3" />
            <span>{(listing.views || 0).toLocaleString()}</span>
          </span>

          {/* Downloads */}
          <button onClick={handleDownload} className="flex items-center gap-1 text-[10px] transition-colors"
            style={{ color: "#3b82f6" }}>
            <Download className="w-3 h-3" />
            <span>{downloadCount}</span>
          </button>

          {/* Hearts */}
          <button onClick={handleLike} className="flex items-center gap-1 text-[10px] transition-colors"
            style={{ color: liked ? "#ec4899" : "rgba(156,163,175,0.7)" }}>
            <Heart className="w-3 h-3" style={{ fill: liked ? "#ec4899" : "none" }} />
            <span>{likeCount}</span>
          </button>

          {/* Comments */}
          <a href={`/listing?id=${listing.id}#comments`} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-400 transition-colors">
            <MessageCircle className="w-3 h-3" />
          </a>

          {/* Share */}
          <button onClick={handleShare} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-400 transition-colors" title="Share">
            <Share2 className="w-3 h-3" />
          </button>

          {/* Report */}
          <button onClick={handleReport} className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors" title="Report">
            <Flag className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}