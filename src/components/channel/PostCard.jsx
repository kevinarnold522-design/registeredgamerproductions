import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import ShareButton from "@/components/shared/ShareButton";

export default function PostCard({ post, user, profile, onLike, onComment, onShare }) {
  const [showCommentsList, setShowCommentsList] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (user) {
      base44.entities.PostLike.filter({ post_id: post.id, user_email: user.email }).then(likes => {
        setIsLiked(likes.length > 0);
      });
    }
  }, [post.id, user]);

  const fetchComments = async () => {
    const commentsData = await base44.entities.ChannelPostComment.filter({ post_id: post.id });
    setComments(commentsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
  };

  const handleToggleComments = () => {
    if (!showCommentsList) {
      fetchComments();
    }
    setShowCommentsList(!showCommentsList);
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    await onComment(commentText.trim());
    setCommentText("");
    fetchComments();
  };

  const handleShare = async () => {
    await onShare();
    alert("Link copied to clipboard!");
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
          {post.creator_avatar ? (
            <img src={post.creator_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">{post.creator_username}</p>
          <p className="text-gray-500 text-xs">{new Date(post.created_date).toLocaleDateString()}</p>
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="grid grid-cols-2 gap-1 p-1">
          {post.image_urls.map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-64 object-cover" />
          ))}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="p-4">
          <p className="text-white text-sm">{post.caption}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-purple-400 text-xs">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 p-4 border-t border-gray-800">
        <button
          onClick={async () => {
            await onLike();
            setIsLiked(!isLiked);
          }}
          className={`theme-glow-action flex items-center gap-2 text-sm font-semibold transition-colors rounded-lg px-1 ${isLiked ? "text-pink-500" : "text-gray-400 hover:text-pink-500"}`}
        >
          <Heart className={`w-5 h-5 theme-glow-icon ${isLiked ? "fill-pink-500" : ""}`} />
          {post.likes || 0}
        </button>
        <button
          onClick={handleToggleComments}
          className="theme-glow-action flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold transition-colors rounded-lg px-1"
        >
          <MessageCircle className="w-5 h-5 theme-glow-icon" />
          {post.comments_count || 0}
        </button>
        <ShareButton type="post" id={post.id} title={post.caption} />
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showCommentsList && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-800 bg-gray-950/50"
          >
            <div className="p-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                      {comment.author_avatar ? (
                        <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">🎮</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-800 rounded-xl p-3">
                        <p className="text-white text-xs font-semibold">{comment.author_username}</p>
                        <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                      </div>
                      <p className="text-gray-600 text-xs mt-1 ml-2">
                        {new Date(comment.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Add Comment */}
              {user && (
                <div className="flex gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">🎮</div>
                    )}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                      placeholder="Write a comment..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!commentText.trim()}
                      className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-purple-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}