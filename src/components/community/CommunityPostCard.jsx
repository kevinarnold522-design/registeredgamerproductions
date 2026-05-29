import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Star, Trash2, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import UserAvatar from "@/components/shared/UserAvatar";

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
        <button
          key={s}
          disabled={submitted}
          onMouseEnter={() => !submitted && setHover(s)}
          onMouseLeave={() => !submitted && setHover(0)}
          onClick={() => handleRate(s)}
          className={`transition-transform ${!submitted ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className="w-3.5 h-3.5"
            fill={(hover || rating) >= s ? "#a855f7" : "none"}
            stroke={(hover || rating) >= s ? "#a855f7" : "#6b7280"}
          />
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

  const load = () => setLoaded(true);

  const submitComment = async () => {
    if (!text.trim() || !isTier1) return;
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
      <button onClick={load} className="text-gray-600 text-xs hover:text-purple-400 transition-colors flex items-center gap-1 mt-1">
        <MessageCircle className="w-3 h-3" /> Show comments
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {comments.map(c => (
        <div key={c.id} className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
            {c.author_username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="bg-gray-800/60 rounded-xl px-3 py-1.5 flex-1">
            <p className="text-purple-300 text-[10px] font-bold">{c.author_username}</p>
            <p className="text-gray-300 text-xs">{c.content}</p>
          </div>
        </div>
      ))}
      {isTier1 && user && (
        <div className="flex gap-2 mt-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitComment()}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
          <button onClick={submitComment} disabled={!text.trim() || posting}
            className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold disabled:opacity-50">
            Send
          </button>
        </div>
      )}
      {!isTier1 && user && (
        <p className="text-gray-600 text-[10px] italic">Upgrade to Tier 1 to comment</p>
      )}
    </div>
  );
}

export default function CommunityPostCard({ post, user, profile, isTier1, canManage, canDelete, onFlag, onRemove, accentColor }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [userRating, setUserRating] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const admin = isAdmin(user?.email);
  const isMod = canManage;

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.PostRating.filter({ post_id: post.id, user_email: user.email })
      .then(r => { if (r[0]) setUserRating(r[0].rating); });
  }, [post.id, user?.email]);

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
      await base44.entities.CommunityPost.update(post.id, { likes: Math.max(0, likeCount - 1) });
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
      await base44.entities.CommunityPost.update(post.id, { likes: likeCount + 1 });
    }
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(`Check out this post on GAMER.PRODUCTIONS: "${post.content.slice(0, 100)}"`);
    const url = encodeURIComponent(window.location.href);
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank");
    } else if (platform === "instagram") {
      // Instagram doesn't support direct sharing via URL, copy to clipboard instead
      navigator.clipboard?.writeText(`${post.content}\n\n🎮 GAMER.PRODUCTIONS`);
      alert("Post copied to clipboard! Paste it in Instagram.");
    } else if (platform === "copy") {
      navigator.clipboard?.writeText(post.content);
    }
  };

  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="px-5 py-4 flex gap-3 group relative">
      {/* Avatar */}
      <UserAvatar avatarUrl={post.author_avatar} username={post.author_username} size={36} />

      <div className="flex-1 min-w-0">
        {/* Author row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-purple-300 text-xs font-bold">{post.author_username}</p>
          {isAdmin(post.author_email) && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-black">👑 Admin</span>
          )}
          <span className="text-gray-600 text-[10px]">{new Date(post.created_date).toLocaleDateString()}</span>
        </div>

        {/* Content */}
        <p className="text-gray-300 text-sm leading-relaxed mt-0.5">{post.content}</p>

        {/* Images */}
        {post.image_urls?.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} className="w-32 h-24 object-cover rounded-xl border border-gray-700" alt="" />
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Like — free for all */}
          <button onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-pink-400" : "text-gray-500 hover:text-pink-400"}`}>
            <Heart className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>

          {/* Comments */}
          <button onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Comment</span>
          </button>

          {/* Share — free for all */}
          <div className="relative">
            <button onClick={() => setShareOpen(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            {shareOpen && (
              <div className="absolute bottom-7 left-0 bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-2 z-10 flex gap-1.5 min-w-max">
                <button onClick={() => { handleShare("facebook"); setShareOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-900/70 text-blue-400 text-xs font-bold transition-all">
                  <span>f</span> Facebook
                </button>
                <button onClick={() => { handleShare("instagram"); setShareOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-900/40 hover:bg-pink-900/70 text-pink-400 text-xs font-bold transition-all">
                  📷 Instagram
                </button>
                <button onClick={() => { handleShare("copy"); setShareOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all">
                  📋 Copy
                </button>
              </div>
            )}
          </div>

          {/* Star rating — free for all members */}
          {user && (
            <StarRating postId={post.id} userEmail={user.email} initialRating={userRating} />
          )}

          {/* Mod actions — flag for all mods; delete only for admin/account_mod */}
          {canManage && (
            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onFlag(post)} title="Flag for review"
                className="w-6 h-6 rounded-lg bg-orange-900/40 hover:bg-orange-900/70 flex items-center justify-center">
                <Flag className="w-3 h-3 text-orange-400" />
              </button>
              {canDelete && (
                <button onClick={() => onRemove(post)} title="Remove post"
                  className="w-6 h-6 rounded-lg bg-red-900/40 hover:bg-red-900/70 flex items-center justify-center">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comments section */}
        {showComments && (
          <CommentsSection post={post} user={user} isTier1={isTier1} />
        )}
      </div>
    </div>
  );
}