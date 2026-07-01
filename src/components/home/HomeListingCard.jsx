import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Crown, Star, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatListingPrice } from "@/lib/currency";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import { useNavigate } from "react-router-dom";
import { listingScore } from "@/lib/leaderboardScore";

/** @type {Record<string, Array<{ solid: string, soft: string }>>} */
const glowPalettes = {
  games: [
    { solid: "#3b82f6", soft: "rgba(59,130,246,0.8)" },
    { solid: "#06b6d4", soft: "rgba(6,182,212,0.8)" },
    { solid: "#8b5cf6", soft: "rgba(139,92,246,0.8)" },
  ],
  modding: [
    { solid: "#22c55e", soft: "rgba(34,197,94,0.8)" },
    { solid: "#84cc16", soft: "rgba(132,204,22,0.8)" },
    { solid: "#10b981", soft: "rgba(16,185,129,0.8)" },
  ],
  premium_mods: [
    { solid: "#f59e0b", soft: "rgba(245,158,11,0.85)" },
    { solid: "#ec4899", soft: "rgba(236,72,153,0.85)" },
    { solid: "#f43f5e", soft: "rgba(244,63,94,0.85)" },
  ],
  paid_tools: [
    { solid: "#06b6d4", soft: "rgba(6,182,212,0.8)" },
    { solid: "#3b82f6", soft: "rgba(59,130,246,0.8)" },
    { solid: "#14b8a6", soft: "rgba(20,184,166,0.8)" },
  ],
  tournaments: [
    { solid: "#ef4444", soft: "rgba(239,68,68,0.8)" },
    { solid: "#f97316", soft: "rgba(249,115,22,0.82)" },
    { solid: "#eab308", soft: "rgba(234,179,8,0.82)" },
  ],
  content_streaming: [
    { solid: "#ec4899", soft: "rgba(236,72,153,0.85)" },
    { solid: "#a855f7", soft: "rgba(168,85,247,0.8)" },
    { solid: "#6366f1", soft: "rgba(99,102,241,0.82)" },
  ],
  default: [
    { solid: "#a855f7", soft: "rgba(168,85,247,0.8)" },
    { solid: "#3b82f6", soft: "rgba(59,130,246,0.8)" },
    { solid: "#ec4899", soft: "rgba(236,72,153,0.85)" },
    { solid: "#22c55e", soft: "rgba(34,197,94,0.8)" },
  ],
};

/**
 * @param {string} category
 * @param {any} listing
 * @param {number} index
 */
function getHashedGlow(category, listing, index) {
  const palette = glowPalettes[String(category || "").toLowerCase()] || glowPalettes.default;
  const seed = `${listing?.id || ""}:${listing?.title || ""}:${listing?.seller_email || ""}:${index}`;
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

/**
 * @param {{ listing?: any, index?: number, className?: string, user?: any, profile?: any }} props
 */
export default function HomeListingCard({ listing, index = 0, className = "", user = null, profile = null }) {
  const safeListing = listing || {};
  const entities = /** @type {any} */ (base44.entities || {});
  const navigate = useNavigate();
  const [liveListing, setLiveListing] = useState(safeListing);
  const [sellerAvatar, setSellerAvatar] = useState(safeListing.seller_avatar || "");
  const points = listingScore(liveListing, 0);
  const sellerRank = liveListing.sellerRank || null;

  const getGlow = () => {
    const selected = String(liveListing.card_glow_color || "").toLowerCase();
    switch (selected) {
      case "red": return { solid: "#ef4444", soft: "rgba(239,68,68,0.8)" };
      case "blue": return { solid: "#3b82f6", soft: "rgba(59,130,246,0.8)" };
      case "green": return { solid: "#22c55e", soft: "rgba(34,197,94,0.8)" };
      case "gold": return { solid: "#f59e0b", soft: "rgba(245,158,11,0.85)" };
      case "multi": return { solid: "#ec4899", soft: "rgba(236,72,153,0.85)" };
      case "custom": return { solid: liveListing.card_glow_hex || "#a855f7", soft: (liveListing.card_glow_hex || "#a855f7") };
      case "purple": return { solid: "#a855f7", soft: "rgba(168,85,247,0.8)" };
      default:
        return getHashedGlow(liveListing.category, liveListing, index);
    }
  };

  const glow = getGlow();

  useEffect(() => {
    setLiveListing(listing || {});
  }, [listing]);

  // Resolve seller avatar from their profile when not embedded on the listing
  useEffect(() => {
    if (listing?.seller_avatar) { setSellerAvatar(listing.seller_avatar); return; }
    if (!listing?.seller_email || !entities.UserProfile?.filter) return;
    entities.UserProfile.filter({ user_email: listing.seller_email })
      .then((/** @type {any[]} */ rows) => { if (rows[0]?.avatar_url) setSellerAvatar(rows[0].avatar_url); })
      .catch(() => {});
  }, [entities.UserProfile, listing?.seller_email, listing?.seller_avatar]);

  useEffect(() => {
    if (!listing?.id || !entities.Listing?.subscribe) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = entities.Listing.subscribe((/** @type {any} */ event) => {
        if (event?.data?.id !== listing.id) return;
        if (event.type === "update") {
          setLiveListing((/** @type {any} */ prev) => ({ ...prev, ...event.data }));
        }
      });
    } catch {}
    return () => {
      try { unsubscribe(); } catch {}
    };
  }, [entities.Listing, listing?.id]);

  return (
    <motion.a
      href={liveListing.id ? `/listing?id=${liveListing.id}` : "/listing"}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700/50 transition-colors block group ${className}`}
      style={{ boxShadow: `0 0 20px ${glow.soft.replace("0.8", "0.22").replace("0.85", "0.22")}` }}
      whileHover={{ boxShadow: `0 0 34px ${glow.soft.replace("0.8", "0.45").replace("0.85", "0.5")}` }}
    >
      <div className="relative h-44 overflow-hidden">
        {liveListing.images?.length > 0 ? (
          <ListingImageSlider
            images={liveListing.images}
            title={liveListing.title}
            badge={liveListing.is_premium ? "PREMIUM" : null}
            heightClass="h-44"
          />
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
        
        {/* IGN Rating badge - lower left if available */}
        {liveListing.ign_rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black z-10" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", boxShadow: "0 0 15px rgba(251, 191, 36, 0.7)" }}>
            <Star className="w-3 h-3 fill-current" />
            IGN {liveListing.ign_rating}
          </div>
        )}
        
        {/* PAID sign at bottom-right */}
        {!liveListing.is_free && liveListing.price > 0 && (
          <span
            className="absolute bottom-3 right-3 inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black italic tracking-[0.22em] font-serif"
            style={{
              background: "linear-gradient(135deg, #050505 0%, #141414 50%, #2c2200 100%)",
              borderColor: "rgba(234,179,8,0.72)",
              color: "#facc15",
              boxShadow: "0 0 14px rgba(234,179,8,0.32)",
            }}
          >
            PAID
          </span>
        )}
        
        {/* Super glow bar effect - dynamic color by listing/category */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent"
          style={{ color: glow.solid, opacity: 0.72, boxShadow: `0 0 22px ${glow.soft}` }}
        />
      </div>
      <div className="p-5">
        <p className="text-purple-400 text-xs font-semibold mb-1">{liveListing.subcategory || liveListing.platform || liveListing.game_name || "Game"}</p>
        <h3 className={`text-white text-lg mb-2 truncate ${(!liveListing.is_free && liveListing.price > 0) ? "font-black font-serif tracking-[0.03em]" : "font-bold"}`}>{liveListing.title}</h3>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-purple-400 font-black text-xl">
            {liveListing.is_free || !liveListing.price ? "FREE" : formatListingPrice(liveListing.price, liveListing.currency)}
          </span>
          <div className="text-right">
            <p className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-lg font-black leading-none text-transparent">{points}</p>
            <p className="text-[9px] uppercase text-gray-400">pts</p>
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/channel?email=${encodeURIComponent(liveListing.seller_email || "")}`);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden border border-purple-400/45 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(217,70,239,0.28)]">
              {sellerAvatar
                ? <img src={sellerAvatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-white text-xs font-bold">{(liveListing.seller_username || "G")[0].toUpperCase()}</span>}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold text-gray-200">@{liveListing.seller_username || liveListing.seller_email?.split("@")[0] || "gamer"}</p>
              <p className="text-[10px] font-medium text-gray-500">Publisher</p>
            </div>
          </button>
          <div className="flex flex-col items-end gap-1">
            {sellerRank ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 px-2 py-1 text-[10px] font-black text-amber-300">
                <Trophy className="h-3 w-3" />#{sellerRank}
              </span>
            ) : null}
            {liveListing.monthlyRank ? <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2 py-1 text-[10px] font-black text-cyan-300">#{liveListing.monthlyRank}</span> : null}
          </div>
        </div>
        {liveListing.download_host && (
          <div className="mb-3">
            <DownloadHostBadge host={liveListing.download_host} size="sm" />
          </div>
        )}

      </div>
      <div className="px-5 pb-4 pt-0" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
        <ListingEngagementBar listing={liveListing} user={user} profile={profile} compact />
      </div>
    </motion.a>
  );
}
