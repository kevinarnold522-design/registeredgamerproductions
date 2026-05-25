import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Eye, Search, Upload, Radio, Wand2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";
import SubcategoryCards from "./SubcategoryCards";

function VideoCard({ video, index }) {
  const ytId = video.youtube_video_id || (video.youtube_url || "").match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="bg-gray-900 rounded-2xl border border-blue-700/20 overflow-hidden group cursor-pointer hover:border-blue-500/40 transition-colors"
    >
      <div className="relative h-40 bg-gradient-to-br from-blue-900/40 to-gray-900 overflow-hidden">
        {ytId ? (
          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">🎮</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-xs text-gray-300">
          <Eye className="w-3 h-3" /> {(video.views || 0).toLocaleString()}
        </div>
        {video.category && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-blue-600/80 text-white text-[10px] font-bold">{video.category}</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-sm truncate">{video.title}</p>
        <p className="text-blue-400 text-xs mt-0.5">{video.creator_username || "Creator"}</p>
        {video.game_tag && <p className="text-gray-600 text-[10px] mt-0.5">{video.game_tag}</p>}
      </div>
    </motion.div>
  );
}

export default function ContentLandingPage({ user, profile }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("gameplay");
  const fileInputRef = useRef(null);

  const videoCategories = ["all", "gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "livestream"];
  const sortOptions = [
    { id: "newest", label: "Newest" },
    { id: "popular", label: "Most Viewed" },
    { id: "likes", label: "Most Liked" },
  ];

  useEffect(() => {
    base44.entities.VideoPost.filter({ status: "active", is_approved: true }, "-created_date", 60).then(v => {
      setVideos(v);
      setLoading(false);
    });
  }, []);

  const filtered = videos.filter(v => {
    const matchCat = activeCategory === "all" || v.category === activeCategory;
    const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase()) || v.creator_username?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
    if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #00060f 0%, #00040a 50%, #030712 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <a href="/" className="text-blue-400 text-sm hover:text-blue-300 mb-4 flex items-center gap-1">← Back to Home</a>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-black uppercase mb-3 inline-block">Content Hub</span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Gaming <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Content</span>
              </h1>
              <p className="text-blue-200/60 text-base max-w-xl">Watch gaming videos, clips, tutorials, reviews and streams from creators worldwide.</p>
            </div>
            {user && (
              <div className="flex gap-2">
                <RouterLink to="/studio" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 whitespace-nowrap">
                  <Wand2 className="w-4 h-4" /> Studio
                </RouterLink>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold text-sm hover:bg-gray-700 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" /> Upload
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SubcategoryCards cat="content" categoryName="Content" />

      {/* Category filter */}
      <div className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {videoCategories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors capitalize ${activeCategory === c ? "bg-blue-600/20 border border-blue-600/40 text-blue-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                {c === "all" ? "All Videos" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..."
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
            {sortOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
          <span className="text-gray-500 text-sm">{filtered.length} videos</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 font-bold">No videos yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to upload a gaming video!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowUploadModal(false)}>
          <div className="bg-gray-900 border border-blue-700/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">Upload Video</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-600 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-700/50 rounded-2xl hover:border-blue-600/40 transition-colors group w-full text-left mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Upload Video from Device</p>
                <p className="text-gray-500 text-xs">Select and publish a video file</p>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setSelectedVideoFile(file);
                setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
              }}
              className="hidden"
            />

            {selectedVideoFile && (
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3">
                  <p className="text-blue-300 text-xs font-bold mb-2">Selected: {selectedVideoFile.name}</p>
                  <input
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    placeholder="Video title..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-2"
                  />
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {["gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "livestream"].map(cat => (
                        <button key={cat} type="button" onClick={() => setVideoCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${videoCategory === cat ? "bg-blue-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        if (!videoTitle.trim()) return;
                        setUploadingVideo(true);
                        try {
                          const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedVideoFile });
                          await base44.entities.VideoPost.create({
                            creator_email: user.email,
                            creator_username: profile?.username || user.full_name,
                            creator_avatar: profile?.avatar_url || "",
                            title: videoTitle.trim(),
                            description: "",
                            youtube_url: "",
                            youtube_video_id: "",
                            video_url: file_url,
                            image_urls: [],
                            game_tag: "",
                            category: videoCategory,
                            status: "active",
                            is_approved: true,
                          });
                          setShowUploadModal(false);
                          setSelectedVideoFile(null);
                          setVideoTitle("");
                          window.location.reload();
                        } catch (error) {
                          console.error("Upload failed:", error);
                        } finally {
                          setUploadingVideo(false);
                        }
                      }}
                      disabled={uploadingVideo || !videoTitle.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {uploadingVideo ? "Publishing..." : "Publish Video"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideoFile(null);
                        setVideoTitle("");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}