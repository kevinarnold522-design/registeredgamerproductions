import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, Eye, Flag, Trophy, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RepostButton from "@/components/shared/RepostButton";
import ShareButton from "@/components/shared/ShareButton";

export default function ListingEngagementBar({ listing, user, profile, compact = false, hideReport = false, hideRepost = false, showBars = false, showRankings = false }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(listing.likes || 0);
  const [saved, setSaved] = useState(false);
  const [commentCount, setCommentCount] = useState(listing.comments_count || 0);

  // Keep counts in sync when the listing updates in real time (unless the user just toggled their own like)
  useEffect(() => {
    if (!liked) setLikeCount(listing.likes || 0);
    setCommentCount(listing.comments_count || 0);
  }, [listing.likes, listing.comments_count]);

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : c - 1);
    base44.entities.Listing.update(listing.id, { likes: next ? likeCount + 1 : likeCount - 1 }).catch(() => {});
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

  const iconSize = compact ? "w-3 h-3 theme-glow-icon" : "w-3.5 h-3.5 theme-glow-icon";
  const textSize = compact ? "text-[9px]" : "text-[10px]";
  // Fixed-width count so numbers line up across every listing card
  const countWidth = compact ? "min-w-[22px]" : "min-w-[26px]";
  const actionClass = `theme-glow-action flex items-center justify-center gap-0.5 ${textSize} rounded-lg px-1 py-0.5`;
  const statClass = `${actionClass}`;

  // Calculate max for bar scaling
  const maxValue = Math.max(
    listing.views || 0,
    likeCount || 0,
    commentCount || 0,
    1
  );

  if (showBars) {
    return (
      <div className="w-full space-y-3">
        {/* Engagement bars with indicators */}
        <div className="grid grid-cols-3 gap-2">
          {/* Views bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 theme-glow-icon text-cyan-300" />
              <span className="text-[9px] tabular-nums text-gray-400">{(listing.views || 0).toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${maxValue > 0 ? ((listing.views || 0) / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Likes bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 theme-glow-icon" style={{ color: liked ? "#ec4899" : "rgba(216,180,254,0.82)" }} />
              <span className="text-[9px] tabular-nums" style={{ color: liked ? "#ec4899" : "rgba(216,180,254,0.82)" }}>{likeCount}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${maxValue > 0 ? (likeCount / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Comments bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 theme-glow-icon text-gray-400" />
              <span className="text-[9px] tabular-nums text-gray-400">{commentCount}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${maxValue > 0 ? (commentCount / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons below */}
        <div className="flex items-center justify-end gap-1 pt-1 border-t border-gray-800/50">
          <ShareButton type="listing" id={listing.id} title={listing.title} compact={true} />
          <button onClick={handleFav} className={`${actionClass} transition-colors`}
            style={{ color: saved ? "#f59e0b" : "rgba(216,180,254,0.82)" }} title="Save to Favourites">
            <Bookmark className={iconSize} style={{ fill: saved ? "#f59e0b" : "none" }} />
          </button>
          {!hideRepost && <RepostButton item={listing} type="listing" user={user} profile={profile} compact={compact} />}
          {!hideReport && (
            <button onClick={handleReport} className={`${actionClass} text-gray-500 hover:text-red-300 transition-colors`} title="Report">
              <Flag className={iconSize} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (showRankings) {
    return (
      <div className="w-full space-y-2">
        {/* Listing ranking */}
        {listing.monthlyRank && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm" style={{
            background: listing.monthlyRank === 1 ? "rgba(234,179,8,0.22)" : listing.monthlyRank === 2 ? "rgba(229,231,235,0.18)" : listing.monthlyRank === 3 ? "rgba(249,115,22,0.2)" : "rgba(168,85,247,0.18)",
            border: `1px solid ${listing.monthlyRank === 1 ? "#fde04755" : listing.monthlyRank === 2 ? "#e5e7eb55" : listing.monthlyRank === 3 ? "#fdba7455" : "#c084fc55"}`,
          }}>
            {listing.monthlyRank <= 3 ? (
              <Trophy className="w-3 h-3" style={{ color: listing.monthlyRank === 1 ? "#fde047" : listing.monthlyRank === 2 ? "#e5e7eb" : "#fdba74" }} />
            ) : (
              <TrendingUp className="w-3 h-3" style={{ color: "#d8b4fe" }} />
            )}
            <span className="text-[9px] font-bold" style={{ color: listing.monthlyRank === 1 ? "#fde047" : listing.monthlyRank === 2 ? "#e5e7eb" : listing.monthlyRank === 3 ? "#fdba74" : "#d8b4fe" }}>
              Listing Rank #{listing.monthlyRank}
            </span>
          </div>
        )}

        {/* Lister ranking - show seller rank if available */}
        {listing.seller_email && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm bg-blue-950/30 border border-blue-600/40">
            <Trophy className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] font-bold text-blue-300 truncate">
              Seller Rank
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-1 pt-1 border-t border-gray-800/50">
          <ShareButton type="listing" id={listing.id} title={listing.title} compact={true} />
          <button onClick={handleFav} className={`${actionClass} transition-colors`}
            style={{ color: saved ? "#f59e0b" : "rgba(216,180,254,0.82)" }} title="Save to Favourites">
            <Bookmark className={iconSize} style={{ fill: saved ? "#f59e0b" : "none" }} />
          </button>
          {!hideRepost && <RepostButton item={listing} type="listing" user={user} profile={profile} compact={compact} />}
          {!hideReport && (
            <button onClick={handleReport} className={`${actionClass} text-gray-500 hover:text-red-300 transition-colors`} title="Report">
              <Flag className={iconSize} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full" onClick={e => e.preventDefault()}>
      {/* Left cluster: count metrics, evenly aligned */}
      <div className="flex items-center gap-3">
        {/* Views */}
        <span className={`${statClass} text-gray-400`}>
          <Eye className={iconSize} />
          <span className={`${countWidth} text-left tabular-nums`}>{(listing.views || 0).toLocaleString()}</span>
        </span>

        {/* Hearts */}
        <button onClick={handleLike} className={`${statClass} transition-colors`}
          style={{ color: liked ? "#ec4899" : "rgba(216,180,254,0.82)" }}>
          <Heart className={iconSize} style={{ fill: liked ? "#ec4899" : "none" }} />
          <span className={`${countWidth} text-left tabular-nums`}>{likeCount}</span>
        </button>

        {/* Comments */}
        <a href={`/listing?id=${listing.id}#comments`} onClick={e => e.stopPropagation()}
          className={`${statClass} text-gray-400 hover:text-purple-200 transition-colors`}>
          <MessageCircle className={iconSize} />
          <span className={`${countWidth} text-left tabular-nums`}>{commentCount}</span>
        </a>
      </div>

      {/* Right cluster: actions */}
      <div className="flex items-center gap-2">
        {/* Share */}
        <ShareButton type="listing" id={listing.id} title={listing.title} compact={true} />

        {/* Save to Favourites */}
        <button onClick={handleFav} className={`${actionClass} transition-colors`}
          style={{ color: saved ? "#f59e0b" : "rgba(216,180,254,0.82)" }} title="Save to Favourites">
          <Bookmark className={iconSize} style={{ fill: saved ? "#f59e0b" : "none" }} />
        </button>

        {/* Repost */}
        {!hideRepost && <RepostButton item={listing} type="listing" user={user} profile={profile} compact={compact} />}

        {/* Report */}
        {!hideReport && (
          <button onClick={handleReport} className={`${actionClass} text-gray-500 hover:text-red-300 transition-colors`} title="Report">
            <Flag className={iconSize} />
          </button>
        )}
      </div>
    </div>
  );
}