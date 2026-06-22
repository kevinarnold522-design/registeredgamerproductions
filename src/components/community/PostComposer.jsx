import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Image, Video, Music, Sparkles, Send, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import { EffectSelector, SpecialEffectsRenderer } from "@/components/community/PostSpecialEffects";

export default function PostComposer({ user, profile, franchise, community, isJoined, admin, isModerator, onPostCreated, accentColor }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [showEffectSelector, setShowEffectSelector] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  const canPost = isJoined || admin || isModerator;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const { file_url } = await uploadFileToR2(file, "community-images");
      setImages(prev => [...prev, file_url]);
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const { file_url } = await uploadFileToR2(file, "community-videos");
      setVideos(prev => [...prev, file_url]);
    }
  };

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingMusic(true);
    const { file_url } = await uploadFileToR2(file, "community-audio");
    setMusicUrl(file_url);
    setMusicTitle(file.name.replace(/\.[^.]+$/, ""));
    setUploadingMusic(false);
  };

  const handlePost = async () => {
    if (!content.trim() || !user || !canPost) return;
    setPosting(true);

    const ensuredCommunity = community?.id
      ? community
      : await base44.entities.GamingCommunity.create({
          franchise_id: franchise.id, name: franchise.name,
          color_primary: franchise.color, color_secondary: franchise.accent, genre: franchise.genre,
          moderator_emails: [], sections: [],
        });

    const post = await base44.entities.CommunityPost.create({
      community_id: ensuredCommunity?.id || franchise.id,
      franchise_id: franchise.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content,
      image_urls: images,
      video_urls: videos,
      music_url: musicUrl || undefined,
      music_title: musicTitle || undefined,
      likes: 0,
      status: "active",
      special_effect: selectedEffect,
    });

    onPostCreated(post);
    setContent(""); setImages([]); setVideos([]); setMusicUrl(""); setMusicTitle(""); setSelectedEffect("none");
    setPosting(false);
  };

  if (!user) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-5 text-center">
        <p className="text-gray-400 text-sm font-semibold mb-2">🎮 Sign in to start posting!</p>
        <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="px-6 py-2.5 rounded-xl font-black text-sm text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
          Sign In / Register
        </button>
      </div>
    );
  }

  if (!canPost) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-5 text-center">
        <p className="text-gray-400 text-sm font-semibold mb-2">🎮 Join this community to post!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-5">
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full flex items-center justify-center text-sm">{franchise.emoji || "🎮"}</div>}
        </div>
        <div className="flex-1 min-w-0">
          {/* Single merged text area for content + description */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind in ${franchise.name}? Share your thoughts, clips, news...`}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 mb-2 resize-none"
          />

          {/* Media previews */}
          {(images.length > 0 || videos.length > 0 || musicUrl) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-700" alt="" />
                  <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center">×</button>
                </div>
              ))}
              {videos.map((url, i) => (
                <div key={i} className="relative group">
                  <video src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-700" muted />
                  <button onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center">×</button>
                </div>
              ))}
              {musicUrl && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 border border-purple-700/50 rounded-xl">
                  <Music className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-300 text-xs font-semibold truncate max-w-[120px]">{musicTitle || "Audio"}</span>
                  <button onClick={() => { setMusicUrl(""); setMusicTitle(""); }}
                    className="text-gray-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-purple-400 cursor-pointer text-xs font-semibold transition-colors">
              <Image className="w-4 h-4" /> Images
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
            </label>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-blue-400 cursor-pointer text-xs font-semibold transition-colors">
              <Video className="w-4 h-4" /> Video
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" multiple />
            </label>
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${musicUrl ? "bg-purple-900/30 border-purple-600/60 text-purple-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-pink-400"}`}>
              <Music className="w-4 h-4" /> {uploadingMusic ? "Uploading…" : musicUrl ? "Change Music" : "Add Music"}
              <input type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" />
            </label>

            {/* Effect selector */}
            <div className="relative">
              <button onClick={() => setShowEffectSelector(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${selectedEffect !== "none" ? "bg-purple-900/40 border-purple-500/60 text-purple-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-purple-400"}`}>
                <Sparkles className="w-4 h-4" /> {selectedEffect !== "none" ? selectedEffect.replace(/_/g, " ") : "Effects"}
              </button>
              {showEffectSelector && (
                <EffectSelector
                  selectedEffect={selectedEffect}
                  onSelect={(e) => { setSelectedEffect(e); setShowEffectSelector(false); }}
                  onClose={() => setShowEffectSelector(false)}
                />
              )}
            </div>

            <button onClick={handlePost} disabled={!content.trim() || posting}
              className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity"
              style={{ background: accentColor || "#7c3aed" }}>
              <Send className="w-4 h-4" /> {posting ? "Posting…" : "Post"}
            </button>
          </div>

          {/* Live effect preview */}
          {selectedEffect !== "none" && content.trim() && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Live Preview — {selectedEffect.replace(/_/g, " ")} effect
              </p>
              <div className="rounded-2xl border border-purple-700/40 overflow-hidden bg-gray-950 text-sm">
                <SpecialEffectsRenderer effect={selectedEffect}>
                  <div className="p-4">
                    <p className="text-gray-100 text-sm">{content}</p>
                    {images.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {images.slice(0, 3).map((url, i) => <img key={i} src={url} className="w-20 h-16 object-cover rounded-lg" alt="" />)}
                      </div>
                    )}
                  </div>
                </SpecialEffectsRenderer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}