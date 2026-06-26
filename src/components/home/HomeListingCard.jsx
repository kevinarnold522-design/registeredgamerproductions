import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatListingPrice } from "@/lib/currency";

export default function HomeListingCard({ listing, index = 0, className = "" }) {
  const [liveListing, setLiveListing] = useState(listing);

  useEffect(() => {
    setLiveListing(listing);
  }, [listing]);

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

  return (
    <motion.a
      href={`/listing?id=${listing.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700/50 transition-colors block ${className}`}
    >
      <div className="relative h-44">
        {liveListing.images?.[0] ? (
          <img src={liveListing.images[0]} alt={liveListing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-800">🎮</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
          <Eye className="w-3 h-3" />
          {(liveListing.views || 0).toLocaleString()}
        </span>
      </div>
      <div className="p-5">
        <p className="text-purple-400 text-xs font-semibold mb-1">{liveListing.subcategory || liveListing.platform || liveListing.game_name || "Game"}</p>
        <h3 className="text-white font-bold text-lg mb-2 truncate">{liveListing.title}</h3>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{liveListing.description}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-purple-400 font-black text-xl">
            {liveListing.is_free || !liveListing.price ? "FREE" : formatListingPrice(liveListing.price, liveListing.currency)}
          </span>
          <span className="text-gray-600 text-xs truncate">by @{liveListing.seller_username || liveListing.seller_email?.split("@")[0] || "gamer"}</span>
        </div>
      </div>
    </motion.a>
  );
}