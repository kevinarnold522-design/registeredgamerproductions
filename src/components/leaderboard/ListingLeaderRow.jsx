import React from "react";
import { motion } from "framer-motion";
import { Eye, Heart, Download, Medal, Package } from "lucide-react";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import { formatListingPrice } from "@/lib/currency";

function RankBadge({ rank }) {
  if (rank === 0) return <Medal className="w-5 h-5 text-yellow-400 mx-auto" style={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.7))" }} />;
  if (rank === 1) return <Medal className="w-5 h-5 text-slate-300 mx-auto" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-amber-600 mx-auto" />;
  return <span className="text-gray-500 font-black text-sm">#{rank + 1}</span>;
}

// One row in the Listings leaderboard. Shows the listing + its owner, and the
// points it has earned (which also contribute to the owner's overall score).
export default function ListingLeaderRow({ entry, rank }) {
  const isTop3 = rank < 3;
  return (
    <motion.a
      href={`/listing?id=${entry.id}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:border-purple-500/50 ${
        isTop3
          ? "bg-gradient-to-r from-purple-900/30 to-pink-900/20 border-purple-500/30"
          : "bg-gray-900/60 border-gray-800"
      }`}
    >
      <div className="w-10 text-center flex-shrink-0">
        <RankBadge rank={rank} />
      </div>

      {/* Listing thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
        {entry.image ? (
          <img src={entry.image} className="w-full h-full object-cover" alt="" />
        ) : (
          <Package className="w-5 h-5 text-purple-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{entry.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-gray-400 text-[11px] truncate">{entry.seller_username}</span>
          <GamerCheckmark isVerified={entry.owner_verified} userEmail={entry.seller_email} size="sm" showTooltip={false} />
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-gray-500 text-[10px] flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {(entry.views || 0).toLocaleString()}</span>
          <span className="text-gray-500 text-[10px] flex items-center gap-1"><Heart className="w-2.5 h-2.5" /> {entry.likes || 0}</span>
          <span className="text-gray-500 text-[10px] flex items-center gap-1"><Download className="w-2.5 h-2.5" /> {entry.downloads || 0}</span>
          <span className="text-[10px] font-black text-yellow-400">{entry.is_free || !entry.price ? "FREE" : formatListingPrice(entry.price, entry.currency)}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-black text-lg" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {entry.score.toLocaleString()}
        </p>
        <p className="text-gray-600 text-[10px]">pts</p>
      </div>
    </motion.a>
  );
}