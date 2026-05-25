import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Video, Image, Link, Tag, ChevronDown, Wand2, Sparkles, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";

const POPULAR_GAMES = [
  "GTA 5", "GTA San Andreas", "GTA 4", "FIFA 25", "FC 25", "PES 2021", "Football Life",
  "WWE 2K24", "WWE 2K25", "NBA 2K24", "NBA 2K25", "Minecraft", "Roblox", "Fortnite",
  "Call of Duty", "Valorant", "CS2", "PUBG", "Apex Legends", "League of Legends",
  "Dota 2", "Mobile Legends", "Free Fire", "PUBG Mobile", "Genshin Impact",
  "Red Dead Redemption 2", "Cyberpunk 2077", "Elden Ring", "God of War",
  "Spider-Man", "The Last of Us", "Resident Evil", "Other / Custom",
];

const VIDEO_CATEGORIES = ["gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "livestream", "other"];

export default function CreatePostModal({ isOpen, onClose, user, profile, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [customGame, setCustomGame] = useState("");
  const [category, setCategory] = useState("gameplay");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameDropOpen, setGameDropOpen] = useState(false);

  const extractYtId = (url) => url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || null;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const ytId = youtubeUrl ? extractYtId(youtubeUrl) : null;
    const gameTagFinal = selectedGame === "Other / Custom" ? customGame : selectedGame;
    const post = await base44.entities.VideoPost.create({
      creator_email: user.email,
      creator_username: profile?.username || user.full_name,
      creator_avatar: profile?.avatar_url || "",
      title: title.trim(),
      description: description.trim(),
      youtube_url: youtubeUrl || "",
      youtube_video_id: ytId || "",
      image_urls: images,
      game_tag: gameTagFinal,
      category,
      status: "active",
    });
    setSubmitting(false);
    onCreated?.(post);
    onClose();
    // Reset
    setTitle(""); setDescription(""); setYoutubeUrl(""); setSelectedGame(""); setCustomGame(""); setImages([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-950 border border-purple-700/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">Share Your Content</h2>
              <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* AI Studio Quick-Access */}
            <div className="mb-5 space-y-2">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">⚡ Quick Actions</p>
              <RouterLink to="/ai-video-studio" onClick={onClose}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/40 border border-purple-600/40 rounded-2xl hover:border-purple-500 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    ✨ AI Video Studio
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/30 border border-pink-500/40 text-pink-300 text-[9px] font-black">NEW</span>
                  </p>
                  <p className="text-purple-300 text-xs mt-0.5">Create videos from images • Enhance • Script • Music • SEO</p>
                </div>
                <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-pink-400 transition-colors" />
              </RouterLink>

              <RouterLink to="/ai-video-studio" state={{ tab: "upload" }} onClick={onClose}
                className="flex items-center gap-3 p-3.5 bg-gray-900 border border-gray-700/50 rounded-2xl hover:border-orange-600/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-orange-900/40 border border-orange-700/40 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Upload Video with Copyright Scan</p>
                  <p className="text-gray-500 text-xs">AI checks for violations before publishing</p>
                </div>
              </RouterLink>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-800" />
                <p className="text-gray-600 text-xs">or post manually</p>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your post a title..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 text-sm" />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell the community about this..."
                  rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 text-sm resize-none" />
              </div>

              {/* Game Tag */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Which Game is this about?
                </label>
                <div className="relative">
                  <button type="button" onClick={() => setGameDropOpen(!gameDropOpen)}
                    className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm hover:border-purple-600 transition-colors">
                    <span className={selectedGame ? "text-white" : "text-gray-500"}>{selectedGame || "Select a game..."}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${gameDropOpen ? "rotate-180" : ""}`} />
                  </button>
                  {gameDropOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                      {POPULAR_GAMES.map(game => (
                        <button key={game} type="button" onClick={() => { setSelectedGame(game); setGameDropOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors ${selectedGame === game ? "text-purple-400 font-semibold" : "text-gray-300"}`}>
                          {game}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedGame === "Other / Custom" && (
                  <input value={customGame} onChange={e => setCustomGame(e.target.value)} placeholder="Type the game name..."
                    className="w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 text-sm" />
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Content Category</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${category === cat ? "bg-purple-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube URL */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <Video className="w-3 h-3" /> YouTube Video URL (optional)
                </label>
                <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 text-sm" />
                {youtubeUrl && extractYtId(youtubeUrl) && (
                  <img src={`https://img.youtube.com/vi/${extractYtId(youtubeUrl)}/hqdefault.jpg`} alt="Preview" className="mt-2 rounded-xl w-full h-32 object-cover border border-gray-700" />
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <Image className="w-3 h-3" /> Images (optional)
                </label>
                <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-500 text-xs">Upload screenshots or images</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {uploading && <p className="text-purple-400 text-xs mt-1 text-center">Uploading...</p>}
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {images.map((url, i) => <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-700" />)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:text-white transition-colors text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={!title.trim() || submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
                {submitting ? "Posting..." : "Share Post"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}