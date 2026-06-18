import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import StorePlatformBadges from "@/components/shared/StorePlatformBadges";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import { formatListingPrice } from "@/lib/currency";

// Tall poster-style glassmorphism game card — cover art forward with a frosted
// info panel overlaid at the bottom and a neon purple frame.
export default function GameCoverCard({ l, i, user, profile }) {
  const priceLabel = (!l.price || l.price === 0 || l.is_free) ? "FREE" : formatListingPrice(l.price, l.currency);
  const mediaUrl = l.preview_video_url || l.video_url || l.youtube_url;

  return (
    <motion.a
      href={`/listing?id=${l.id}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.4), type: "tween" }}
      whileHover={{ y: -4 }}
      className="group relative block rounded-[20px] p-[2px] cursor-pointer"
      style={{
        background: "linear-gradient(160deg, rgba(236,72,153,0.9), rgba(168,85,247,0.9))",
        boxShadow: "0 0 22px rgba(168,85,247,0.45), 0 0 44px rgba(236,72,153,0.25)",
      }}
    >
      <div className="relative rounded-[18px] overflow-hidden bg-gray-950" style={{ aspectRatio: "3 / 4.6" }}>
        {/* Cover art */}
        <div className="absolute inset-0">
          {mediaUrl ? (
            <UniversalVideoPreview url={mediaUrl} poster={l.images?.[0]} className="w-full h-full object-cover" />
          ) : l.images?.[0] ? (
            <img src={l.images[0]} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700"><Play className="w-12 h-12" /></div>
          )}
        </div>

        {/* IGN rating badge */}
        {l.ign_rating != null && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <IgnRatingBadge rating={l.ign_rating} size="sm" />
          </div>
        )}

        {/* Frosted glass info panel overlaid at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3.5 backdrop-blur-xl"
          style={{
            background: "linear-gradient(to top, rgba(10,8,20,0.92) 35%, rgba(20,16,40,0.55) 80%, transparent)",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-black text-sm leading-tight line-clamp-1">{l.title}</p>
            <p className="text-white font-black text-sm whitespace-nowrap">{priceLabel}</p>
          </div>
          <p className="text-gray-300 text-xs mt-1.5 line-clamp-2 leading-snug">{l.description}</p>

          <div className="mt-2 -mb-0.5">
            <ListingEngagementBar listing={l} user={user} profile={profile} compact />
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            {l.store_platforms?.length > 0 ? (
              <StorePlatformBadges platforms={l.store_platforms} links={l.store_platform_links} size="sm" />
            ) : <span />}
            <span className="text-gray-400 text-[10px] whitespace-nowrap">
              Posted {l.created_date ? new Date(l.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "recently"}
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}