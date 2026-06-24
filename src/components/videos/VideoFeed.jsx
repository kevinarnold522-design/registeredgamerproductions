import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Eye, Heart, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ShareButton from "@/components/shared/ShareButton";
import { extractYouTubeId } from "@/lib/youtube";

function getYouTubeId(url) {
  return extractYouTubeId(url);
}

export default function VideoFeed({ limit = 8 }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.VideoPost.filter({ status: "active", is_approved: true }, "-created_date", limit);
        setVideos(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [limit]);

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (videos.length === 0) return (
    <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
      <div className="text-5xl mb-3">🎬</div>
      <p className="text-white font-bold mb-1">No videos yet</p>
      <p className="text-gray-500 text-sm">Be the first to share your gaming content!</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {videos.map((v, i) => {
        const ytId = v.youtube_video_id || getYouTubeId(v.youtube_url);
        const thumb = v.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
        return (
          <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700/50 transition-colors group">
            <div className="relative h-40 bg-gray-800 overflow-hidden">
              {thumb ? (
                <img src={thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
                </div>
              </div>
              {v.is_monetized && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/90 rounded-full px-2 py-0.5">
                  <span className="text-xs font-bold text-black">🎮</span>
                </div>
              )}
              {ytId && (
                <div className="absolute bottom-2 left-2">
                  <div className="flex items-center gap-1 bg-red-600/90 rounded-full px-2 py-0.5">
                    <Youtube className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">YouTube</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-white font-semibold text-sm truncate">{v.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">@{v.creator_username}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(v.views || 0).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{(v.likes || 0).toLocaleString()}</span>
                {v.is_monetized && <span className="text-green-400 font-semibold">+${((v.views || 0) / 1000).toFixed(2)}</span>}
                <ShareButton type="video" id={v.id} title={v.title} compact />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}