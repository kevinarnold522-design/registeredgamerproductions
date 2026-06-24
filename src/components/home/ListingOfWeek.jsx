import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Download, Eye, Heart, Star, Crown, Sparkles, Rocket } from "lucide-react";
import { getActiveListings, getCachedUserProfile } from "@/lib/homeDataCache";
import { formatListingPrice } from "@/lib/currency";

// Most-recent Sunday 00:00 (local) — listing of the week resets every Sunday.
function lastSundayMidnight() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return d.getTime();
}

export default function ListingOfWeek() {
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Resets every Sunday: only score listings created since the most recent Sunday.
        const all = await getActiveListings();
        const weekStart = lastSundayMidnight();
        const recent = all.filter(l => new Date(l.created_date).getTime() >= weekStart);
        const pool = recent.length >= 3 ? recent : all;
        
        // Score: views * 1 + likes * 3 + (has_download ? 10 : 0)
        const scored = pool.map(l => ({
          ...l,
          score: (l.views || 0) + (l.likes || 0) * 3 + ((l.download_url || l.external_link) ? 10 : 0),
        })).sort((a, b) => b.score - a.score);

        if (scored[0]) {
          setListing(scored[0]);
          if (scored[0].seller_email) {
            const sellerProfile = await getCachedUserProfile(scored[0].seller_email);
            if (sellerProfile) setSeller(sellerProfile);
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !listing) return null;

  const isFree = !listing.price || listing.price === 0 || listing.is_free;
  const thumbImg = listing.images?.[0];

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/40" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/50 bg-yellow-900/20"
            style={{ boxShadow: "0 0 24px rgba(234,179,8,0.3), 0 0 48px rgba(234,179,8,0.1)" }}>
            <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}>
              <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </motion.div>
            <span className="text-yellow-300 text-sm font-black uppercase tracking-wider">Listing of the Week</span>
            <motion.div animate={{ rotate: [0, 15, -15, 10, -10, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}>
              <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </motion.div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/40" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border-2 border-yellow-500/60"
          style={{
            background: "linear-gradient(135deg, #0d0d1a 0%, #1a1200 50%, #0d0d1a 100%)",
            boxShadow: "0 0 60px rgba(234,179,8,0.35), 0 0 120px rgba(234,179,8,0.15), 0 0 200px rgba(124,58,237,0.1)",
          }}
        >
          {/* Animated rockets + sparkles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Rockets */}
            {[...Array(4)].map((_, i) => (
              <motion.div key={`rocket-${i}`}
                animate={{ y: ["110%", "-20%"], x: [0, (i % 2 === 0 ? 20 : -20), 0], opacity: [0, 1, 0] }}
                transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
                className="absolute text-yellow-400"
                style={{ left: `${15 + i * 22}%`, bottom: 0, rotate: "-45deg" }}>
                <Rocket className="w-5 h-5" style={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.8))" }} />
              </motion.div>
            ))}
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div key={`spark-${i}`}
                animate={{ y: [-8, 8, -8], opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                className="absolute text-yellow-400"
                style={{ left: `${8 + i * 16}%`, top: `${5 + (i % 3) * 12}%` }}>
                <Sparkles className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px rgba(234,179,8,0.7))" }} />
              </motion.div>
            ))}
          </div>

          {/* Radiant rotating glow ring */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute"
              style={{
                top: "50%", left: "50%",
                width: "140%", height: "140%",
                transform: "translate(-50%, -50%)",
                background: "conic-gradient(from 0deg, transparent 60%, rgba(234,179,8,0.2) 80%, rgba(168,85,247,0.15) 90%, transparent 100%)",
              }}
            />
          </div>

          <div className="relative flex flex-col md:flex-row gap-6 p-6 md:p-8">
            {/* Image */}
            <div className="md:w-64 flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-square bg-gray-800 border border-yellow-500/30">
                {thumbImg ? (
                  <img src={thumbImg} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🏆</div>
                )}
                {/* Gold ribbon */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-black shadow-lg">
                  <Crown className="w-3 h-3 fill-black" /> #1 THIS WEEK
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Seller */}
                {seller && (
                  <a href={`/channel?user=${listing.seller_email}`} className="flex items-center gap-2 mb-3 group">
                    <div className="w-7 h-7 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                      {seller.avatar_url
                        ? <img src={seller.avatar_url} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">{(seller.username || "S")[0]}</div>}
                    </div>
                    <span className="text-gray-400 text-xs group-hover:text-yellow-300 transition-colors">by <span className="font-bold text-gray-300">@{seller.username}</span></span>
                  </a>
                )}

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-yellow-900/40 border border-yellow-600/40 text-yellow-300 text-[10px] font-bold capitalize">{listing.category}</span>
                  {listing.is_premium && <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black">⭐ PREMIUM</span>}
                  {isFree && <span className="px-2 py-0.5 rounded-full bg-green-900/40 border border-green-700/40 text-green-300 text-[10px] font-black">FREE</span>}
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">{listing.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-4">{listing.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-yellow-300 text-sm font-bold">
                    <Eye className="w-4 h-4" /> {(listing.views || 0).toLocaleString()} views
                  </div>
                  <div className="flex items-center gap-1.5 text-pink-300 text-sm font-bold">
                    <Heart className="w-4 h-4 fill-pink-400" /> {(listing.likes || 0).toLocaleString()} likes
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300 text-sm font-bold">
                    <Download className="w-4 h-4" /> Top Downloads
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <a href={`/listing?id=${listing.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-black text-sm transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 20px rgba(234,179,8,0.4)" }}>
                  <Trophy className="w-4 h-4" /> View Listing
                </a>
                {!isFree && (
                  <span className="text-2xl font-black text-yellow-300">{formatListingPrice(listing.price, listing.currency)}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}