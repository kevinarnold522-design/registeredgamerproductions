import React, { useState } from "react";
import { Heart, CornerDownRight, Send, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Reusable comment thread with hearts + replies
export default function CommentThread({ comments, user, profile, postId, onRefresh }) {
  const [replyTo, setReplyTo] = useState(null); // { id, username }
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topLevel = comments.filter(c => !c.parent_id);
  const getReplies = (id) => comments.filter(c => c.parent_id === id);

  const handleHeart = async (comment) => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    const alreadyHearted = (comment.hearted_by || []).includes(user.email);
    const newHearted = alreadyHearted
      ? (comment.hearted_by || []).filter(e => e !== user.email)
      : [...(comment.hearted_by || []), user.email];
    await base44.entities.PostComment.update(comment.id, {
      hearts: newHearted.length,
      hearted_by: newHearted,
    });
    onRefresh();
  };

  const submitComment = async (content, parentId = null, replyToUsername = null) => {
    if (!content.trim() || !user) return;
    setSubmitting(true);
    await base44.entities.PostComment.create({
      post_id: postId,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      content: content.trim(),
      status: "active",
      hearts: 0,
      hearted_by: [],
      parent_id: parentId || null,
      reply_to_username: replyToUsername || null,
    });
    setSubmitting(false);
    onRefresh();
    if (parentId) { setReplyTo(null); setReplyText(""); }
    else setNewComment("");
  };

  const CommentBubble = ({ comment, isReply = false }) => {
    const hearted = user && (comment.hearted_by || []).includes(user.email);
    const replies = getReplies(comment.id);
    return (
      <div className={`flex gap-2.5 ${isReply ? "ml-8 mt-2" : ""}`}>
        <div className="w-7 h-7 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold mt-0.5">
          {(comment.author_username || "G")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-xs">{comment.author_username}</span>
              <span className="text-gray-600 text-[9px]">{new Date(comment.created_date).toLocaleDateString()}</span>
            </div>
            {comment.reply_to_username && (
              <span className="text-purple-400 text-xs font-semibold mr-1">@{comment.reply_to_username}</span>
            )}
            <p className="text-gray-300 text-sm leading-relaxed inline">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button onClick={() => handleHeart(comment)} className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${hearted ? "text-red-400" : "text-gray-600 hover:text-red-400"}`}>
              <Heart className={`w-3 h-3 ${hearted ? "fill-red-400" : ""}`} />
              {comment.hearts > 0 && comment.hearts}
            </button>
            {user && (
              <button onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, username: comment.author_username })}
                className="text-[11px] text-gray-600 hover:text-purple-400 font-semibold transition-colors">
                Reply
              </button>
            )}
          </div>
          {/* Inline reply input */}
          {replyTo?.id === comment.id && (
            <div className="mt-2 ml-1 flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitComment(replyText, comment.id, comment.author_username)}
                placeholder={`Reply to @${comment.author_username}...`}
                autoFocus
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              <button onClick={() => submitComment(replyText, comment.id, comment.author_username)} disabled={!replyText.trim() || submitting}
                className="p-1.5 rounded-xl bg-purple-600 disabled:opacity-50">
                <Send className="w-3 h-3 text-white" />
              </button>
              <button onClick={() => { setReplyTo(null); setReplyText(""); }} className="p-1.5 rounded-xl bg-gray-700">
                <X className="w-3 h-3 text-gray-300" />
              </button>
            </div>
          )}
          {/* Nested replies */}
          {replies.map(r => <CommentBubble key={r.id} comment={r} isReply />)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* New top-level comment input */}
      {user ? (
        <div className="flex gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">
            {(profile?.username || "G")[0].toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment(newComment)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            <button onClick={() => submitComment(newComment)} disabled={!newComment.trim() || submitting}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-2">Sign in to leave a comment</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors">Sign In</button>
        </div>
      )}
      {topLevel.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-sm">No comments yet. Be the first!</div>
      ) : (
        topLevel.map(c => <CommentBubble key={c.id} comment={c} />)
      )}
    </div>
  );
}