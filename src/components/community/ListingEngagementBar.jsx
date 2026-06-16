import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Eye, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RepostButton from "@/components/shared/RepostButton";

export default function ListingEngagementBar({ listing, user, profile, compact = false }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(listing.likes || 0);
  const [saved, setSaved] = useState(false);
  const [commentCount, setCommentCount] = useState(listing.comments_count || 0);

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : c - 1);
    base44.entities.Listing.update(listing.id, { likes: next ? likeCount + 1 : likeCount - 1 }).catch(() => {});
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/listing?id=${listing.id}`;
    try { if (navigator.share) { await navigator.share({ title: listing.title, url }); return; } } catch {}
    try { await navigator.clipboard.writeText(url); } catch {}
  };

  const handleFav = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (saved) return;
    setSaved(true);
    base44.entities.Favorite.create({ user_email: user.email, listing_id: listing.id, listing_title: listing.title }).catch(() => {});
  };

  const handleReport = (e) => {
    e.preventDefault(); e.stopPropagation();
    window.open(`/contact?report=${listing.id}`, "_blank");
  };

  const iconSize = compact ? "w-3 h-3" : "w-3.5 h-3.5";
  const textSize = compact ? "text-[9px]" : "text-[10px]";
  const gap = compact ? "gap-2" : "gap-3";

  return (
    <div className={`flex items-center ${gap} flex-wrap`} onClick={e => e.preventDefault()}>
      {/* Views */}
      <span className={`flex items-center gap-0.5 ${textSize} text-gray-500`}>
        <Eye className={iconSize} />
        <span>{(listing.views || 0).toLocaleString()}</span>
      </span>

      {/* Hearts */}
      <button onClick={handleLike} className={`flex items-center gap-0.5 ${textSize} transition-colors`}
        style={{ color: liked ? "#ec4899" : "rgba(156,163,175,0.7)" }}>
        <Heart className={iconSize} style={{ fill: liked ? "#ec4899" : "none" }} />
        <span>{likeCount}</span>
      </button>

      {/* Comments */}
      <a href={`/listing?id=${listing.id}#comments`} onClick={e => e.stopPropagation()}
        className={`flex items-center gap-0.5 ${textSize} text-gray-500 hover:text-purple-400 transition-colors`}>
        <MessageCircle className={iconSize} />
        <span>{commentCount}</span>
      </a>

      {/* Share */}
      <button onClick={handleShare} className={`flex items-center gap-0.5 ${textSize} text-gray-500 hover:text-blue-400 transition-colors`} title="Share">
        <Share2 className={iconSize} />
      </button>

      {/* Save to Favourites */}
      <button onClick={handleFav} className={`flex items-center gap-0.5 ${textSize} transition-colors`}
        style={{ color: saved ? "#f59e0b" : "rgba(156,163,175,0.7)" }} title="Save to Favourites">
        <Bookmark className={iconSize} style={{ fill: saved ? "#f59e0b" : "none" }} />
      </button>

      {/* Repost */}
      <RepostButton item={listing} type="listing" user={user} profile={profile} compact={compact} />

      {/* Report */}
      <button onClick={handleReport} className={`flex items-center gap-0.5 ${textSize} text-gray-600 hover:text-red-400 transition-colors`} title="Report">
        <Flag className={iconSize} />
      </button>
    </div>
  );
}