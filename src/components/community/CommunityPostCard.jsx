import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Star, Trash2, Flag, Video, Image, Maximize2, Send } from "lucide-react";
import ImageGalleryModal from "@/components/community/ImageGalleryModal";
import SpecialEffectsRenderer from "@/components/community/PostSpecialEffects";
import PostExpandedModal from "@/components/community/PostExpandedModal";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import UserAvatar from "@/components/shared/UserAvatar";
import RepostButton from "@/components/shared/RepostButton";

function StarRating({ postId, userEmail, initialRating = 0 }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(!!initialRating);

  const handleRate = async (val) => {
    if (submitted) return;
    setRating(val);
    setSubmitted(true);
    await base44.entities.PostRating.create({ post_id: postId, user_email: userEmail, rating: val });
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} disabled={submitted}
          onMouseEnter={() => !submitted && setHover(s)}
          onMouseLeave={() => !submitted && setHover(0)}
          onClick={() => handleRate(s)}
          className={`transition-transform ${!submitted ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}>
          <Star className="w-3.5 h-3.5"
            fill={(hover || rating) >= s ? "#a855f7" : "none"}
            stroke={(hover || rating) >= s ? "#a855f7" : "#6b7280"} />
        </button>
      ))}
      {submitted && <span className="text-purple-400 text-[10px] ml-1">Rated!</span>}
    </div>
  );
}

function CommentsSection({ post, user, isTier1 }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    base44.entities.PostComment.filter({ post_id: post.id }).then(c =>
      setComments(c.filter(x => x.status !== "removed").sort((a, b) => new Date(a.created_date) - new Date(b.created_date)))
    );
  }, [loaded, post.id]);

  const submitComment = async () => {
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

  if (!loaded) {
    return (
      <button onClick={() => setLoaded(true)} className="text-gray-500 text-xs hover:text-purple-400 transition-colors flex items-center gap-1 mt-2">
        <MessageCircle className="w-3 h-3" /> View comments
      </button>
    );
  }

  return (
    <div className="mt-3 border-t border-gray-800 pt-3 space-y-2">
      {comments.map(c => (
        <div key={c.id} className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
            {c.author_username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="bg-gray-800 rounded-2xl px-3 py-2 flex-1">
            <p className="text-purple-300 text-[10px] font-bold">{c.author_username}</p>
            <p className="text-gray-200 text-sm mt-0.5">{c.content}</p>
          </div>
        </div>
      ))}
      {isTier1 && user && (
        <div className="flex gap-2 mt-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitComment()}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          <button onClick={submitComment} disabled={!text.trim() || posting}
            className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold disabled:opacity-50 transition-colors flex items-center gap-1">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {!isTier1 && user && (
        <p className="text-gray-600 text-xs italic mt-1">Upgrade to Tier 1 to comment</p>
      )}
    </div>
  );
}

// Image grid layout — like Facebook
function ImageGrid({ images, onImageClick }) {
  if (!images || images.length === 0) return null;
  const count = images.length;

  if (count === 1) {
    return (
      <button onClick={() => onImageClick(0)} className="block w-full mt-3 rounded-2xl overflow-hidden border border-gray-700/60 hover:border-purple-600/50 transition-all group">
        <img src={images[0]} className="w-full max-h-[480px] object-cover group-hover:brightness-90 transition-all" alt="" />
      </button>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {images.map((url, i) => (
          <button key={i} onClick={() => onImageClick(i)} className="rounded-xl overflow-hidden border border-gray-700/60 hover:border-purple-600/50 transition-all">
            <img src={url} className="w-full h-56 object-cover hover:brightness-90 transition-all" alt="" />
          </button>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        <button onClick={() => onImageClick(0)} className="row-span-2 rounded-xl overflow-hidden border border-gray-700/60 hover:border-purple-600/50 transition-all">
          <img src={images[0]} className="w-full h-full object-cover hover:brightness-90 transition-all" style={{ minHeight: 220 }} alt="" />
        </button>
        {images.slice(1).map((url, i) => (
          <button key={i} onClick={() => onImageClick(i + 1)} className="rounded-xl overflow-hidden border border-gray-700/60 hover:border-purple-600/50 transition-all">
            <img src={url} className="w-full h-[106px] object-cover hover:brightness-90 transition-all" alt="" />
          </button>
        ))}
      </div>
    );
  }

  // 4+
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-3">
      {images.slice(0, 4).map((url, i) => (
        <button key={i} onClick={() => onImageClick(i)} className="relative rounded-xl overflow-hidden border border-gray-700/60 hover:border-purple-600/50 transition-all">
          <img src={url} className="w-full h-44 object-cover hover:brightness-90 transition-all" alt="" />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
              <span className="text-white text-2xl font-black">+{count - 4}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

const EFFECT_LABELS = {
  none: null,
  fire: "🔥 Fire Effect",
  water: "💧 Water Effect",
  fireworks: "🎆 Fireworks",
  gambling_cards: "🎰 Gambling Cards",
  glass: "🔮 Glass Effect",
};

export default function CommunityPostCard({ post, user, profile, isTier1, canManage, canDelete, onFlag, onRemove, accentColor }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [userRating, setUserRating] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showExpanded, setShowExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const postEffect = post.special_effect || "none";

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.PostRating.filter({ post_id: post.id, user_email: user.email })
      .then(r => { if (r[0]) setUserRating(r[0].rating); });
  }, [post.id, user?.email]);

  const handleLike = async () => {
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
    await base44.entities.CommunityPost.update(post.id, { likes: next ? likeCount + 1 : Math.max(0, likeCount - 1) });
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(`Check out this post on GAMER.PRODUCTIONS: "${post.content.slice(0, 100)}"`);
    const url = encodeURIComponent(window.location.href);
    if (platform === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank");
    else if (platform === "whatsapp") window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
    else if (platform === "telegram") window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    else if (platform === "viber") window.open(`viber://forward?text=${text}%20${url}`, "_blank");
    else if (platform === "copy") navigator.clipboard?.writeText(post.content);
    setShareOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group hover:border-gray-700 transition-all"
        style={postEffect !== "none" ? { boxShadow: `0 0 30px rgba(124,58,237,0.15)` } : {}}
      >
        <SpecialEffectsRenderer effect={postEffect}>
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserAvatar avatarUrl={post.author_avatar} username={post.author_username} size={42} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black text-sm">{post.author_username}</p>
                    {isAdmin(post.author_email) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-black">👑 Admin</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(post.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {EFFECT_LABELS[postEffect] && (
                      <span className="ml-2 text-purple-400 font-semibold">{EFFECT_LABELS[postEffect]}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setShowExpanded(true)}
                  className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  title="Expand post">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                {canManage && (
                  <>
                    <button onClick={() => onFlag(post)} title="Flag"
                      className="w-8 h-8 rounded-xl bg-orange-900/30 hover:bg-orange-900/60 flex items-center justify-center">
                      <Flag className="w-3.5 h-3.5 text-orange-400" />
                    </button>
                    {canDelete && (
                      <button onClick={() => onRemove(post)} title="Remove"
                        className="w-8 h-8 rounded-xl bg-red-900/30 hover:bg-red-900/60 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {post.content && (
              <p className="text-gray-100 text-base leading-relaxed mb-1">{post.content}</p>
            )}
            {post.description && (
              <p className="text-gray-400 text-sm mt-2 leading-relaxed bg-gray-800/50 rounded-xl p-3 border border-gray-700/40">
                {post.description}
              </p>
            )}

            {/* Image Grid */}
            <ImageGrid
              images={post.image_urls}
              onImageClick={(i) => { setGalleryIndex(i); setShowGallery(true); }}
            />

            {/* Videos */}
            {post.video_urls?.length > 0 && (
              <div className="mt-3 space-y-2">
                {post.video_urls.map((url, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden border border-gray-700">
                    <video src={url} controls className="w-full max-h-80 bg-black" />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[9px] font-bold flex items-center gap-1">
                      <Video className="w-2.5 h-2.5" /> Video
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-0.5 mt-4 pt-3 border-t border-gray-800">
              {/* Like */}
              <button onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${liked ? "text-pink-400 bg-pink-900/20" : "text-gray-500 hover:text-pink-400 hover:bg-gray-800"}`}>
                <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
                <span>{likeCount}</span>
              </button>

              {/* Comment */}
              <button onClick={() => setShowComments(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${showComments ? "text-purple-400 bg-purple-900/20" : "text-gray-500 hover:text-purple-400 hover:bg-gray-800"}`}>
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>

              {/* Share */}
              <div className="relative">
                <button onClick={() => setShareOpen(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition-all">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <AnimatePresence>
                  {shareOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 8 }}
                      className="absolute bottom-10 left-0 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-2 z-20 flex flex-col gap-1 min-w-[160px]">
                      {[["facebook","f Facebook","text-blue-400"],["whatsapp","💬 WhatsApp","text-green-400"],["telegram","✈ Telegram","text-sky-400"],["viber","📲 Viber","text-violet-300"],["copy","📋 Copy Link","text-gray-300"]].map(([p,l,c]) => (
                        <button key={p} onClick={() => handleShare(p)}
                          className={`text-left px-3 py-1.5 rounded-xl text-xs font-bold ${c} hover:bg-gray-800 transition-colors`}>{l}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Star rating */}
              {user && (
                <div className="ml-auto">
                  <StarRating postId={post.id} userEmail={user.email} initialRating={userRating} />
                </div>
              )}

              {/* Repost */}
              {user && post.author_email !== user.email && (
                <RepostButton item={post} type="post" user={user} profile={profile} compact />
              )}
            </div>

            {/* Comments */}
            {showComments && (
              <CommentsSection post={post} user={user} isTier1={isTier1} />
            )}
          </div>
        </SpecialEffectsRenderer>
      </motion.div>

      {/* Gallery Modal */}
      <ImageGalleryModal
        images={post.image_urls || []}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        initialIndex={galleryIndex}
      />

      {/* Expanded Modal */}
      {showExpanded && (
        <PostExpandedModal
          post={post}
          user={user}
          profile={profile}
          isTier1={isTier1}
          canManage={canManage}
          canDelete={canDelete}
          onFlag={onFlag}
          onRemove={onRemove}
          onClose={() => setShowExpanded(false)}
        />
      )}
    </>
  );
}