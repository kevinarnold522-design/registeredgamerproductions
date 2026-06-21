import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Eye, Flag, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copyToClipboard";
import RepostButton from "@/components/shared/RepostButton";

export default function ListingEngagementBar({ listing, user, profile, compact = false, hideReport = false, hideRepost = false }) {
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

  const [shared, setShared] = useState(false);
  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/listing?id=${listing.id}`;
    // Try the native share sheet first (mobile / supported browsers).
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url });
        base44.entities.Listing.update(listing.id, { shares: (Number(listing.shares) || 0) + 1 }).catch(() => {});
        return;
      } catch (err) {
        // User cancelled the share sheet — do nothing.
        if (err?.name === "AbortError") return;
        // Otherwise fall through to copy.
      }
    }
    // Fallback: copy the link to the clipboard with visible confirmation.
    const ok = await copyToClipboard(url);
    if (ok) {
      setShared(true);
      toast.success("Link copied — share it anywhere!");
      base44.entities.Listing.update(listing.id, { shares: (Number(listing.shares) || 0) + 1 }).catch(() => {});
      setTimeout(() => setShared(false), 2000);
    } else {
      toast.error("Couldn't copy the link");
    }
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
        <button onClick={handleShare} className={`${actionClass} ${shared ? "text-green-400" : "text-gray-400 hover:text-cyan-200"} transition-colors`} title="Share">
          {shared ? <Check className={iconSize} /> : <Share2 className={iconSize} />}
        </button>

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