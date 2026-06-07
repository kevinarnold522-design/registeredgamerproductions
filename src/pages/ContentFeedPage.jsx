import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Eye, Heart, MessageCircle, Share2, Flag, Upload, Search, Bell, X,
  ChevronLeft, ChevronRight, Send, Repeat2, Bookmark, Radio, Wand2, Plus
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { Link } from "react-router-dom";

// ── Video Card (YouTube-style) ────────────────────────────────────────────────
function VideoCard({ video, onClick, user }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes || 0);
  const [saved, setSaved] = useState(false);

  const ytId = video.youtube_video_id || (video.youtube_url || "").match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : video.thumbnail_url || video.cover_url || "";

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
    await base44.entities.VideoPost.update(video.id, { likes: next ? likeCount + 1 : Math.max(0, likeCount - 1) });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/content?v=${video.id}`;
    if (navigator.share) { navigator.share({ title: video.title, url }); }
    else { navigator.clipboard?.writeText(url); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group cursor-pointer hover:border-purple-700/50 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gray-800 overflow-hidden" onClick={() => onClick(video)}>
        {thumb ? (
          <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : video.video_url ? (
          <video src={video.video_url} className="w-full h-full object-cover" muted />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🎮</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-xs text-gray-300">
          <Eye className="w-3 h-3" /> {(video.views || 0).toLocaleString()}
        </div>
        {video.category && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-purple-600/80 text-white text-[10px] font-bold capitalize">{video.category}</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white font-bold text-sm line-clamp-2 leading-snug mb-1.5 group-hover:text-purple-300 transition-colors" onClick={() => onClick(video)}>{video.title}</p>
        <p className="text-purple-400 text-xs font-semibold">{video.creator_username || "Creator"}</p>
        {video.game_tag && <p className="text-gray-600 text-[10px] mt-0.5">{video.game_tag}</p>}

        {/* Engagement row */}
        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-gray-800">
          <button onClick={handleLike} className={`flex items-center gap-1 text-xs font-bold transition-all ${liked ? "text-pink-400" : "text-gray-500 hover:text-pink-400"}`}>
            <Heart className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>
          <button onClick={() => onClick(video)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSaved(v => !v); }}
            className={`flex items-center gap-1 text-xs transition-colors ml-auto ${saved ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"}`}>
            <Bookmark className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Video Player Modal (YouTube-like) ────────────────────────────────────────
function VideoPlayerModal({ video, user, profile, onClose }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [reported, setReported] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const ytId = video.youtube_video_id || (video.youtube_url || "").match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];

  useEffect(() => {
    // increment view
    base44.entities.VideoPost.update(video.id, { views: (video.views || 0) + 1 }).catch(() => {});
    // load comments
    base44.entities.ChannelPostComment.filter({ post_id: video.id }).then(c =>
      setComments(c.filter(x => x.is_approved !== false).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)))
    );
  }, [video.id]);

  const handleLike = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
    await base44.entities.VideoPost.update(video.id, { likes: next ? likeCount + 1 : Math.max(0, likeCount - 1) });
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user) return;
    setPosting(true);
    const c = await base44.entities.ChannelPostComment.create({
      post_id: video.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: commentText,
    });
    setComments(prev => [c, ...prev]);
    setCommentText("");
    setPosting(false);
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/content?v=${video.id}`;
    const text = encodeURIComponent(`Watch "${video.title}" on Gamer.Productions!`);
    if (platform === "copy") { navigator.clipboard?.writeText(url); setShareOpen(false); return; }
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
    };
    window.open(links[platform], "_blank");
    setShareOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
        style={{ background: "rgba(0,0,0,0.95)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[95vh] flex flex-col lg:flex-row bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl"
        >
          {/* Video */}
          <div className="lg:w-[62%] bg-black flex flex-col">
            <div className="relative bg-black flex-1 min-h-[260px] flex items-center">
              {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                  className="w-full aspect-video"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              ) : video.video_url ? (
                <video src={video.video_url} controls autoPlay className="w-full max-h-[380px]" />
              ) : (
                <div className="w-full h-60 flex items-center justify-center text-gray-600">No video available</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800">
              <h2 className="text-white font-black text-base leading-snug">{video.title}</h2>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className="text-purple-400 font-semibold">{video.creator_username}</span>
                <span className="text-gray-600 mx-1">·</span>
                <span className="text-gray-500 text-xs">{(video.views || 0).toLocaleString()} views</span>
              </div>
              {video.description && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{video.description}</p>}

              {/* Action row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <button onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${liked ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"}`}>
                  <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
                  {likeCount}
                </button>

                <div className="relative">
                  <button onClick={() => setShareOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 text-sm font-bold transition-all">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  {shareOpen && (
                    <div className="absolute bottom-10 left-0 bg-gray-900 border border-gray-700 rounded-2xl p-2 z-10 flex flex-col gap-1.5 min-w-[150px] shadow-xl">
                      {[["facebook","f Facebook"],["whatsapp","💬 WhatsApp"],["telegram","✈ Telegram"],["copy","📋 Copy Link"]].map(([k,l]) => (
                        <button key={k} onClick={() => handleShare(k)}
                          className="text-left px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors">{l}</button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => { if (!reported) setReported(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${reported ? "bg-red-900/20 text-red-400 border border-red-700/30" : "bg-gray-800 border border-gray-700 text-gray-500 hover:bg-gray-700"}`}>
                  <Flag className="w-3.5 h-3.5" /> {reported ? "Reported" : "Report"}
                </button>

                <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 text-sm font-bold transition-all">
                  <Repeat2 className="w-4 h-4" /> Repost
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="lg:w-[38%] flex flex-col border-l border-gray-800 max-h-[95vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400" /> Comments ({comments.length})
              </h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {comments.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No comments yet</p>}
              {comments.map(c => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {c.author_username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="bg-gray-900 rounded-2xl px-3 py-2 flex-1">
                    <p className="text-purple-300 text-xs font-bold">{c.author_username}</p>
                    <p className="text-gray-200 text-sm mt-0.5 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {user ? (
              <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
                <button onClick={handleComment} disabled={!commentText.trim() || posting}
                  className="px-3 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-gray-800 text-center">
                <button onClick={() => base44.auth.redirectToLogin()} className="text-purple-400 text-sm font-bold hover:text-purple-300">Sign in to comment</button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ user, profile, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("gameplay");
  const [gameTag, setGameTag] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const categories = ["gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "livestream", "shorts"];

  const handleUpload = async () => {
    if (!file || !title.trim() || !user) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.VideoPost.create({
      creator_email: user.email,
      creator_username: profile?.username || user.full_name || "Gamer",
      creator_avatar: profile?.avatar_url || "",
      title: title.trim(),
      description: desc,
      video_url: file_url,
      youtube_url: "",
      youtube_video_id: "",
      game_tag: gameTag,
      category,
      likes: 0,
      views: 0,
      status: "active",
      is_approved: true,
    });
    setUploading(false);
    onSuccess();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-950 border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" /> Upload Video
          </h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${file ? "border-purple-500 bg-purple-900/20" : "border-gray-700 hover:border-purple-600 hover:bg-gray-900"}`}>
          {file ? (
            <div>
              <p className="text-purple-300 font-bold text-sm">✓ {file.name}</p>
              <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 font-semibold text-sm">Click to select video from device</p>
              <p className="text-gray-600 text-xs mt-1">MP4, MOV, AVI, WebM supported</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
        </div>

        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title *"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" rows={2}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
          <input value={gameTag} onChange={e => setGameTag(e.target.value)} placeholder="Game tag (e.g. GTA V)"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${category === c ? "bg-purple-600 text-white" : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleUpload} disabled={!file || !title.trim() || uploading}
          className="mt-4 w-full py-3 rounded-2xl font-black text-white text-sm transition-all disabled:opacity-40"
          style={{ background: uploading ? "#4b0082" : "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
          {uploading ? "Uploading & Publishing..." : "🚀 Publish Video"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Notification Center ────────────────────────────────────────────────────────
function NotificationCenter({ user, onClose }) {
  const [notifs, setNotifs] = useState([
    { id: 1, text: "New video uploaded in Gameplay", time: "2m ago", read: false },
    { id: 2, text: "Your video got 10 new likes!", time: "1h ago", read: false },
    { id: 3, text: "Someone commented on your video", time: "3h ago", read: true },
  ]);

  return (
    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-80 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-black text-sm">Notifications</h3>
        <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifs.map(n => (
          <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
            className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-900 transition-colors ${!n.read ? "bg-purple-900/10" : ""}`}>
            <div className="flex items-start gap-2.5">
              {!n.read && <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />}
              <div>
                <p className="text-gray-300 text-xs leading-relaxed">{n.text}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const VIDEO_CATEGORIES = ["all", "gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "livestream", "shorts"];

export default function ContentFeedPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeVideo, setActiveVideo] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(3);

  // Check for ?v= param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get("v");
    if (vId && videos.length > 0) {
      const found = videos.find(v => v.id === vId);
      if (found) setActiveVideo(found);
    }
  }, [videos]);

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    }
    loadVideos();
  }, [user?.email]);

  const loadVideos = async () => {
    setLoading(true);
    const v = await base44.entities.VideoPost.list("-created_date", 60);
    setVideos(v.filter(x => x.status === "active" && x.is_approved !== false));
    setLoading(false);
  };

  const filtered = videos.filter(v => {
    const matchCat = activeCategory === "all" || v.category === activeCategory;
    const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase()) || v.creator_username?.toLowerCase().includes(search.toLowerCase()) || v.game_tag?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
    if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero */}
      <div className="pt-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0010 0%, #050010 50%, #030710 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase mb-3 inline-flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-current" /> Content & Streaming
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Gaming <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Videos</span>
              </h1>
              <p className="text-gray-400 text-sm max-w-lg">Watch, upload, and engage with gaming content from creators worldwide. Your YouTube-style gaming hub.</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notification bell */}
              <div className="relative">
                <button onClick={() => { setShowNotifs(v => !v); setUnread(0); }}
                  className="relative w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <Bell className="w-4 h-4 text-gray-400" />
                  {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-black">{unread}</span>}
                </button>
                <AnimatePresence>
                  {showNotifs && <NotificationCenter user={user} onClose={() => setShowNotifs(false)} />}
                </AnimatePresence>
              </div>

              <Link to="/studio"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                <Wand2 className="w-4 h-4" /> AI Studio
              </Link>
              <Link to="/studio"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors">
                <Radio className="w-4 h-4" /> Go Live
              </Link>
              {user && (
                <button onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  <Plus className="w-4 h-4" /> Upload Video
                </button>
              )}
              {!user && (
                <button onClick={() => base44.auth.redirectToLogin()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Sign In to Upload
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category filter strip */}
      <div className="bg-gray-950/98 backdrop-blur-sm border-b border-gray-800 sticky top-14 lg:top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {VIDEO_CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${activeCategory === c ? "bg-purple-600/20 border border-purple-500/50 text-purple-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                {c === "all" ? "🎬 All" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + sort */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos, games, creators..."
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-purple-500">
            <option value="newest">🕐 Newest</option>
            <option value="popular">🔥 Most Viewed</option>
            <option value="likes">❤️ Most Liked</option>
          </select>
          <span className="text-gray-600 text-sm">{filtered.length} videos</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-gray-900 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-14 h-14 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-400 font-bold text-lg">No videos yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to upload gaming content!</p>
            {user && (
              <button onClick={() => setShowUpload(true)}
                className="mt-5 px-6 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Upload Your First Video
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((v, i) => (
              <VideoCard key={v.id} video={v} user={user} onClick={setActiveVideo} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeVideo && (
          <VideoPlayerModal
            video={activeVideo}
            user={user}
            profile={profile}
            onClose={() => setActiveVideo(null)}
          />
        )}
        {showUpload && (
          <UploadModal
            user={user}
            profile={profile}
            onClose={() => setShowUpload(false)}
            onSuccess={() => { setShowUpload(false); loadVideos(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}