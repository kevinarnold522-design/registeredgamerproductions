import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PostComments({ postId, postType = "video" }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          if (profiles.length > 0) setProfile(profiles[0]);
        }
      } catch {}
      const fetched = await base44.entities.PostComment.filter({ post_id: postId, post_type: postType }, "-created_date", 50);
      setComments(fetched);
      setLoading(false);
    };
    init();
  }, [postId, postType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    const comment = await base44.entities.PostComment.create({
      post_id: postId,
      post_type: postType,
      author_email: user.email,
      author_username: profile?.username || user.full_name,
      author_avatar: profile?.avatar_url || "",
      content: newComment.trim(),
    });
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    setSubmitting(false);
  };

  const visibleComments = expanded ? comments : comments.slice(0, 3);

  return (
    <div className="mt-4">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold mb-3">
        <MessageCircle className="w-4 h-4" />
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        {comments.length > 3 && (expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </button>

      {expanded && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {/* Comment input */}
            {user ? (
              <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : "G"}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-600"
                    maxLength={500}
                  />
                  <button type="submit" disabled={submitting || !newComment.trim()}
                    className="px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-500 text-xs mb-3">
                <button onClick={() => base44.auth.redirectToLogin()} className="text-purple-400 hover:text-purple-300 font-semibold">Sign in</button> to comment
              </p>
            )}

            {/* Comments list */}
            {loading ? (
              <div className="text-gray-600 text-xs py-2">Loading comments...</div>
            ) : comments.length === 0 ? (
              <p className="text-gray-600 text-xs py-2">Be the first to comment!</p>
            ) : (
              <div className="space-y-3">
                {visibleComments.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                      {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : (c.author_username?.[0] || "G")}
                    </div>
                    <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-purple-300 text-xs font-bold">{c.author_username || "Gamer"}</span>
                        <span className="text-gray-600 text-[10px]">{new Date(c.created_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
                    </div>
                  </motion.div>
                ))}
                {comments.length > 3 && !expanded && (
                  <button onClick={() => setExpanded(true)} className="text-purple-400 text-xs hover:text-purple-300 font-semibold">
                    View all {comments.length} comments
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}