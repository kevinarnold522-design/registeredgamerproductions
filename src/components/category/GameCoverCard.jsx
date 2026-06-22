import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import StorePlatformBadges from "@/components/shared/StorePlatformBadges";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import CardEditPencil from "@/components/listings/CardEditPencil";
import { formatListingPrice } from "@/lib/currency";

// Wide, sharp-edged game card — cover art on top, info panel, and a separate
// YouTube/video preview pinned below the card.
export default function GameCoverCard({ l: initialL, i, user, profile }) {
  const [l, setL] = React.useState(initialL);
  React.useEffect(() => { setL(initialL); }, [initialL]);
  const priceLabel = (!l.price || l.price === 0 || l.is_free) ? "FREE" : formatListingPrice(l.price, l.currency);
  const coverUrl = l.images?.[0];
  const videoUrl = l.preview_video_url || l.video_url || l.youtube_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.4), type: "tween" }}
      whileHover={{ y: -4 }}
      className="group relative p-[2px]"
      style={{
        background: "linear-gradient(160deg, rgba(236,72,153,0.9), rgba(168,85,247,0.9))",
        boxShadow: "0 0 22px rgba(168,85,247,0.45), 0 0 44px rgba(236,72,153,0.25)",
      }}
    >
      <div className="relative bg-gray-950">
        <CardEditPencil listing={l} user={user} onSaved={setL} />
        <a href={`/listing?id=${l.id}`} className="block cursor-pointer">
          {/* Cover art (wide landscape) */}
          <div className="relative w-full overflow-hidden bg-gray-900" style={{ aspectRatio: "16 / 9" }}>
            {coverUrl ? (
              <img src={coverUrl} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
            ) : videoUrl ? (
              <UniversalVideoPreview url={videoUrl} poster={coverUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700"><Play className="w-12 h-12" /></div>
            )}
            {/* IGN rating badge */}
            {l.ign_rating != null && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <IgnRatingBadge rating={l.ign_rating} size="sm" />
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="p-4">
            {l.card_category_label && (
              <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-[10px] font-bold capitalize">{l.card_category_label}</span>
            )}
            <div className="flex items-start justify-between gap-2">
              <p className="text-white font-black text-base leading-tight line-clamp-1">{l.title}</p>
              <p className="text-white font-black text-base whitespace-nowrap">{priceLabel}</p>
            </div>
            <p className="text-gray-300 text-sm mt-1.5 line-clamp-2 leading-snug">{l.description}</p>
          </div>
        </a>

        <div className="px-4 pb-2">
          <ListingEngagementBar listing={l} user={user} profile={profile} compact />
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          {l.store_platforms?.length > 0 ? (
            <StorePlatformBadges platforms={l.store_platforms} links={l.store_platform_links} size="sm" />
          ) : <span />}
          <span className="text-gray-400 text-[10px] whitespace-nowrap">
            Posted {l.created_date ? new Date(l.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "recently"}
          </span>
        </div>

        {/* Separate video preview pinned BELOW the card */}
        {videoUrl && (
          <div className="border-t border-purple-500/30 bg-black">
            <div className="w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
              <UniversalVideoPreview url={videoUrl} poster={coverUrl} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}