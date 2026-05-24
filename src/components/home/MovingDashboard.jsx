import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Package, Star, Eye, TrendingUp, Zap, Radio, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

function ScrollRow({ children, speed = 30 }) {
  const trackRef = useRef(null);
  return (
    <div className="relative overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-4"
        style={{
          animation: `scrollX ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes scrollX {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function VideoCard({ video }) {
  const ytId = video.youtube_video_id || (video.youtube_url || "").match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      className="relative w-64 flex-shrink-0 rounded-2xl overflow-hidden border border-purple-700/30 bg-gray-900 group cursor-pointer"
      style={{ boxShadow: "0 0 20px rgba(139,92,246,0.1)" }}
    >
      <div className="relative h-36 bg-gradient-to-br from-purple-900 to-gray-900 overflow-hidden">
        {ytId ? (
          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">🎮</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-purple-600/80 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-xs text-gray-300">
          <Eye className="w-3 h-3" /> {(video.views || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-sm truncate">{video.title}</p>
        <p className="text-purple-400 text-xs mt-0.5">{video.creator_username || "Creator"}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 text-[10px] font-semibold">{video.category || "gaming"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ModCard({ mod }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      className="relative w-56 flex-shrink-0 rounded-2xl overflow-hidden border border-orange-700/30 bg-gray-900 group cursor-pointer"
      style={{ boxShadow: "0 0 20px rgba(251,146,60,0.08)" }}
    >
      <div className="h-32 bg-gradient-to-br from-orange-900/50 to-gray-900 flex items-center justify-center text-5xl">
        {mod.images?.[0] ? <img src={mod.images[0]} alt="" className="w-full h-full object-cover" /> : "🔧"}
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-sm truncate">{mod.title}</p>
        <p className="text-orange-400 font-black mt-1">₱{(mod.price || 0).toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1.5 text-gray-500">
          <Download className="w-3 h-3" /><span className="text-xs">{(mod.views || 0).toLocaleString()} downloads</span>
        </div>
      </div>
      {mod.is_premium && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] font-black">⭐ PREMIUM</div>
      )}
    </motion.div>
  );
}

function ProductCard({ product }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      className="relative w-52 flex-shrink-0 rounded-2xl overflow-hidden border border-green-700/30 bg-gray-900 group cursor-pointer"
      style={{ boxShadow: "0 0 20px rgba(74,222,128,0.06)" }}
    >
      <div className="h-32 bg-gradient-to-br from-green-900/50 to-gray-900 flex items-center justify-center">
        {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-5xl">🛒</span>}
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-sm truncate">{product.title}</p>
        <p className="text-green-400 font-black mt-1">₱{(product.price || 0).toLocaleString()}</p>
        <div className="flex items-center gap-0.5 mt-1">
          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
        </div>
      </div>
    </motion.div>
  );
}

export default function MovingDashboard() {
  const [videos, setVideos] = useState([]);
  const [mods, setMods] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [vids, listings] = await Promise.all([
        base44.entities.VideoPost.list("-views", 20),
        base44.entities.Listing.filter({ status: "active" }, "-created_date", 40),
      ]);
      setVideos(vids);
      setMods(listings.filter(l => l.category === "modding").slice(0, 16));
      setProducts(listings.filter(l => l.category !== "modding").slice(0, 16));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <section className="py-16 overflow-hidden" style={{ background: "linear-gradient(180deg, #030712 0%, #050010 50%, #030712 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-semibold mb-3">
            <Zap className="w-3 h-3 animate-pulse" /> Live Community Feed
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            What's <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Trending</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">Real-time content from the community · Updated live</p>
        </motion.div>
      </div>

      {/* Top Videos */}
      {videos.length > 0 && (
        <div className="mb-8">
          <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-purple-400" />
            <span className="text-white font-bold text-sm">🔥 Top Videos</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-2" />
            <span className="text-red-400 text-xs font-semibold">LIVE</span>
          </div>
          <ScrollRow speed={40}>
            {videos.map((v, i) => <VideoCard key={i} video={v} />)}
          </ScrollRow>
        </div>
      )}

      {/* Top Premium Mods */}
      {mods.length > 0 && (
        <div className="mb-8">
          <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <span className="text-white font-bold text-sm">⭐ Premium Mods</span>
          </div>
          <ScrollRow speed={35}>
            {mods.map((m, i) => <ModCard key={i} mod={m} />)}
          </ScrollRow>
        </div>
      )}

      {/* Top Products */}
      {products.length > 0 && (
        <div>
          <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-white font-bold text-sm">🛒 Top Products</span>
          </div>
          <ScrollRow speed={45}>
            {products.map((p, i) => <ProductCard key={i} product={p} />)}
          </ScrollRow>
        </div>
      )}

      {/* Empty state */}
      {videos.length === 0 && mods.length === 0 && products.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <Radio className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
          <p>Community content will appear here as users start posting!</p>
        </div>
      )}
    </section>
  );
}