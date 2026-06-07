import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Star, Flag, Trash2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import SpecialEffectsRenderer from "@/components/community/PostSpecialEffects";
import UserAvatar from "@/components/shared/UserAvatar";
import RepostButton from "@/components/shared/RepostButton";

function ExpandedComments({ post, user, isTier1 }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    base44.entities.PostComment.filter({ post_id: post.id }).then(c =>
      setComments(c.filter(x => x.status !== "removed").sort((a, b) => new Date(a.created_date) - new Date(b.created_date)))
    );
  }, [post.id]);

  const submit = async () => {
    if (!text.trim() || !isTier1 || !user) return;
    setPosting(true);
    const c = await base44.entities.PostComment.create({
      post_id: post.id,
      community_id: post.community_id,
      franchise_id: post.franchise_id,
      author_email: user.email,
      author_username: user.full_name || "Gamer",
      content: text,
    });
    setComments(prev => [...prev, c]);
    setText("");
    setPosting(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {comments.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-8">No comments yet. Be the first!</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {c.author_username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="bg-gray-800 rounded-2xl px-3.5 py-2 flex-1">
              <p className="text-purple-300 text-xs font-bold mb-0.5">{c.author_username}</p>
              <p className="text-gray-200 text-sm leading-relaxed">{c.content}</p>
              <p className="text-gray-600 text-[10px] mt-1">{new Date(c.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
      </div>
      {user && isTier1 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && submit()}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
          <button onClick={submit} disabled={!text.trim() || posting}
            className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold disabled:opacity-40 transition-colors flex items-center gap-1">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {user && !isTier1 && (
        <p className="text-gray-600 text-xs text-center mt-3 pt-3 border-t border-gray-800">Upgrade to Tier 1 to comment</p>
      )}
    </div>
  );
}

export default function PostExpandedModal({ post, user, profile, isTier1, canManage, canDelete, onFlag, onRemove, onClose }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [imgIdx, setImgIdx] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const postEffect = post.special_effect || "none";
  const images = post.image_urls || [];

  const handleLike = async () => {
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
    await base44.entities.CommunityPost.update(post.id, { likes: next ? likeCount + 1 : Math.max(0, likeCount - 1) });
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(post.content + " " + window.location.href)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.content)}`,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.92)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col lg:flex-row bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl"
          style={{ boxShadow: "0 0 80px rgba(124,58,237,0.3)" }}
        >
          {/* Left: Media */}
          <div className="lg:w-[55%] relative bg-black flex items-center justify-center min-h-[280px]">
            <SpecialEffectsRenderer effect={postEffect}>
              <div className="w-full h-full">
                {images.length > 0 ? (
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={imgIdx}
                        src={images[imgIdx]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-h-[500px] object-contain"
                        alt=""
                      />
                    </AnimatePresence>
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setImgIdx(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white w-4" : "bg-white/40"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : post.video_urls?.length > 0 ? (
                  <video src={post.video_urls[0]} controls className="w-full max-h-[500px] object-contain" />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px] p-8">
                    <p className="text-white text-xl font-bold text-center leading-relaxed">{post.content}</p>
                  </div>
                )}
              </div>
            </SpecialEffectsRenderer>
          </div>

          {/* Right: Info + Comments */}
          <div className="lg:w-[45%] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <UserAvatar avatarUrl={post.author_avatar} username={post.author_username} size={36} />
                <div>
                  <p className="text-white font-black text-sm">{post.author_username}</p>
                  <p className="text-gray-500 text-[10px]">{new Date(post.created_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Post content */}
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-gray-200 text-sm leading-relaxed">{post.content}</p>
              {post.description && (
                <p className="text-gray-400 text-xs mt-2 leading-relaxed bg-gray-900/60 rounded-xl p-2.5">{post.description}</p>
              )}
              {postEffect !== "none" && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-600/40 text-purple-300 text-[10px] font-bold">
                  ✨ {postEffect.replace("_", " ")} effect
                </span>
              )}
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-hidden px-4 py-3">
              <ExpandedComments post={post} user={user} isTier1={isTier1} />
            </div>

            {/* Actions bar */}
            <div className="px-4 py-3 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={handleLike}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-all ${liked ? "text-pink-400 scale-110" : "text-gray-400 hover:text-pink-400"}`}>
                  <motion.div whileTap={{ scale: 1.4 }}>
                    <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
                  </motion.div>
                  <span>{likeCount}</span>
                </button>

                {/* Share */}
                <div className="relative">
                  <button onClick={() => setShareOpen(v => !v)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  {shareOpen && (
                    <div className="absolute bottom-8 left-0 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-2 z-10 flex flex-col gap-1.5 min-w-[140px]">
                      {Object.entries(shareLinks).map(([k, v]) => (
                        <button key={k} onClick={() => { window.open(v, "_blank"); setShareOpen(false); }}
                          className="text-left px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800 capitalize transition-colors">
                          {k === "facebook" ? "f " : k === "whatsapp" ? "💬 " : "✈ "}{k}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {user && post.author_email !== user?.email && (
                  <RepostButton item={post} type="post" user={user} profile={profile} compact />
                )}

                {canManage && (
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => { onFlag(post); onClose(); }} title="Flag"
                      className="w-7 h-7 rounded-lg bg-orange-900/40 hover:bg-orange-900/70 flex items-center justify-center">
                      <Flag className="w-3 h-3 text-orange-400" />
                    </button>
                    {canDelete && (
                      <button onClick={() => { onRemove(post); onClose(); }} title="Remove"
                        className="w-7 h-7 rounded-lg bg-red-900/40 hover:bg-red-900/70 flex items-center justify-center">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}