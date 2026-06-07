import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Music, Play, Film, ChevronRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MUSIC_TRACKS = [
  { id: "none", label: "No Music", url: null },
  { id: "epic1", label: "🎵 Epic Gaming Beat", url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
  { id: "chill1", label: "🎶 Chill Lofi Vibes", url: "https://www.soundjay.com/ambient/sounds/ambient-1.mp3" },
  { id: "hype1", label: "🔥 Hype Drop", url: null },
  { id: "retro1", label: "👾 Retro 8-Bit", url: null },
];

export default function ReelCreator({ user, profile, onClose, onPosted }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedMusic, setSelectedMusic] = useState("none");
  const [postToModding, setPostToModding] = useState(false);
  const [postToCommunities, setPostToCommunities] = useState(false);
  const [posting, setPosting] = useState(false);
  const [step, setStep] = useState(1); // 1=images, 2=music, 3=preview
  const [previewIdx, setPreviewIdx] = useState(0);
  const fileRef = useRef();

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 10) {
      alert("Max 10 images for a reel");
      return;
    }
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImages(prev => [...prev, file_url]);
    }
    setUploading(false);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handlePost = async () => {
    if (images.length === 0) return;
    setPosting(true);
    const music = MUSIC_TRACKS.find(t => t.id === selectedMusic);

    // Post as a ChannelPost (reel)
    const postData = {
      creator_email: user.email,
      creator_username: profile?.username || user.full_name || "Gamer",
      creator_avatar: profile?.avatar_url || "",
      content_type: "image",
      image_urls: images,
      caption: caption || "🎮 Quick Reel",
      tags: ["reel", "gaming", ...(music.id !== "none" ? [music.label.replace(/[^a-zA-Z0-9]/g, "")] : [])],
      is_approved: true,
      status: "active",
    };

    const post = await base44.entities.ChannelPost.create(postData);

    // Auto-post to modding community
    if (postToModding) {
      const moddingComms = await base44.entities.GamingCommunity.filter({ franchise_id: "modding" });
      const commId = moddingComms[0]?.id || "";
      if (commId) {
        await base44.entities.CommunityPost.create({
          community_id: commId,
          franchise_id: "modding",
          author_email: user.email,
          author_username: profile?.username || user.full_name || "Gamer",
          author_avatar: profile?.avatar_url || "",
          content: `🎬 New Reel: ${caption || "Quick Gaming Reel"}\n\nCheck out my profile!`,
          image_urls: images.slice(0, 3),
          status: "active",
        });
      }
    }

    // Auto-post to all joined communities
    if (postToCommunities) {
      const memberships = await base44.entities.CommunityMember.filter({ user_email: user.email });
      const uniqueComms = [...new Set(memberships.map(m => m.community_id))];
      for (const cid of uniqueComms.slice(0, 5)) {
        await base44.entities.CommunityPost.create({
          community_id: cid,
          franchise_id: memberships.find(m => m.community_id === cid)?.franchise_id || "",
          author_email: user.email,
          author_username: profile?.username || user.full_name || "Gamer",
          author_avatar: profile?.avatar_url || "",
          content: `🎬 New Reel: ${caption || "Quick Gaming Reel"}`,
          image_urls: images.slice(0, 3),
          status: "active",
        });
      }
    }

    setPosting(false);
    onPosted?.();
    onClose();
  };

  // Preview slideshow
  useEffect(() => {
    if (step !== 3 || images.length <= 1) return;
    const t = setInterval(() => setPreviewIdx(i => (i + 1) % images.length), 800);
    return () => clearInterval(t);
  }, [step, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-950 border border-purple-700/40 rounded-3xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-pink-400" />
            <h2 className="text-white font-black text-sm">Create Reel</h2>
            <span className="text-gray-600 text-xs">(~30 sec slideshow)</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 px-5 py-3 border-b border-gray-800">
          {["Images", "Music", "Post"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${step > i + 1 ? "bg-green-500 text-black" : step === i + 1 ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-500"}`}>
                {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold ${step === i + 1 ? "text-white" : "text-gray-600"}`}>{s}</span>
              {i < 2 && <ChevronRight className="w-3 h-3 text-gray-700" />}
            </div>
          ))}
        </div>

        <div className="p-5">
          {/* Step 1: Images */}
          {step === 1 && (
            <div>
              <p className="text-gray-400 text-xs mb-3">Add up to 10 images. They'll auto-slide to create your reel.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-16 h-16">
                    <img src={img} className="w-full h-full object-cover rounded-xl" alt="" />
                    <button onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] text-white font-bold bg-black/60 rounded-b-xl">Cover</span>}
                  </div>
                ))}
                {images.length < 10 && (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-purple-700/60 bg-purple-900/10 flex items-center justify-center text-purple-400 hover:bg-purple-900/20 transition-all">
                    {uploading ? <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <textarea value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Add a caption..."
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none mb-3" />
              <button disabled={images.length === 0} onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Next: Add Music →
              </button>
            </div>
          )}

          {/* Step 2: Music */}
          {step === 2 && (
            <div>
              <p className="text-gray-400 text-xs mb-3">Pick background music for your reel (optional).</p>
              <div className="space-y-2 mb-4">
                {MUSIC_TRACKS.map(track => (
                  <button key={track.id} onClick={() => setSelectedMusic(track.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${selectedMusic === track.id ? "border-purple-500 bg-purple-900/20 text-white" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"}`}>
                    <Music className="w-4 h-4 flex-shrink-0" style={{ color: selectedMusic === track.id ? "#a855f7" : "#6b7280" }} />
                    <span className="text-sm font-semibold">{track.label}</span>
                    {selectedMusic === track.id && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-bold hover:text-white">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-xl font-black text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>Next: Preview →</button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Post */}
          {step === 3 && (
            <div>
              <div className="aspect-[9/16] max-h-48 mx-auto rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 mb-4 relative">
                {images[previewIdx] && (
                  <motion.img
                    key={previewIdx}
                    src={images[previewIdx]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-bold drop-shadow-lg line-clamp-2">{caption}</p>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[9px] text-white">
                  {previewIdx + 1}/{images.length}
                </div>
              </div>

              {/* Auto-post options */}
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-600">
                  <input type="checkbox" checked={postToModding} onChange={e => setPostToModding(e.target.checked)} className="accent-purple-500 w-4 h-4 rounded" />
                  <div>
                    <p className="text-white text-xs font-bold">🔧 Post to Modding Community</p>
                    <p className="text-gray-500 text-[10px]">Auto-share to the Modding community feed</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-600">
                  <input type="checkbox" checked={postToCommunities} onChange={e => setPostToCommunities(e.target.checked)} className="accent-cyan-500 w-4 h-4 rounded" />
                  <div>
                    <p className="text-white text-xs font-bold">🌐 Post to All My Communities</p>
                    <p className="text-gray-500 text-[10px]">Share to gaming communities you've joined</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-bold hover:text-white">← Back</button>
                <button onClick={handlePost} disabled={posting}
                  className="flex-1 py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  {posting ? "Posting..." : "🚀 Post Reel!"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}