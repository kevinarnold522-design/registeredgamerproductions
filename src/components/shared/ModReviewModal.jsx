import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, CheckCircle, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

function StarRating({ value, onChange, readOnly }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
        >
          <Star
            className="w-5 h-5 transition-colors"
            style={{
              color: s <= (hovered || value) ? "#f5c518" : "#374151",
              fill: s <= (hovered || value) ? "#f5c518" : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
}

export default function ModReviewModal({ listing, user, profile, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Review.filter({ target_id: listing.id, target_type: "listing", is_approved: true });
      setReviews(data);
      if (data.length > 0) {
        setAvgRating(data.reduce((s, r) => s + r.rating, 0) / data.length);
      }
      setLoading(false);
    };
    load();
  }, [listing.id]);

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    await base44.entities.Review.create({
      reviewer_email: user.email,
      reviewer_username: profile?.username || user.full_name,
      reviewer_avatar: profile?.avatar_url || "",
      target_type: "listing",
      target_id: listing.id,
      rating,
      comment: comment.trim(),
      is_approved: true,
    });
    const updated = await base44.entities.Review.filter({ target_id: listing.id, target_type: "listing", is_approved: true });
    setReviews(updated);
    if (updated.length > 0) setAvgRating(updated.reduce((s, r) => s + r.rating, 0) / updated.length);
    setSubmitting(false);
    setSubmitted(true);
    setComment("");
    setRating(0);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const alreadyReviewed = reviews.some((r) => r.reviewer_email === user?.email);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: "#0d0d1a", border: "1px solid rgba(124,58,237,0.4)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg truncate">{listing.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} readOnly />
              <span className="text-gray-400 text-xs">{avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "No reviews yet"} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white ml-3 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Write a review */}
        {user && !alreadyReviewed && !submitted && (
          <div className="bg-gray-900/60 rounded-2xl p-4 mb-4 flex-shrink-0 border border-gray-800">
            <p className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-400" /> Write a Review
            </p>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this mod/product..."
              rows={3}
              className="w-full mt-3 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !rating || !comment.trim()}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </div>
        )}

        {submitted && (
          <div className="bg-green-900/20 border border-green-600/40 rounded-2xl p-3 mb-4 flex items-center gap-2 flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-green-300 text-sm font-semibold">Review posted!</p>
          </div>
        )}

        {alreadyReviewed && !submitted && (
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-2xl p-3 mb-4 flex-shrink-0">
            <p className="text-blue-300 text-xs font-semibold">✓ You've already reviewed this item.</p>
          </div>
        )}

        {/* Reviews list */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-purple-800 flex items-center justify-center overflow-hidden text-xs font-bold text-white flex-shrink-0">
                    {r.reviewer_avatar ? (
                      <img src={r.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (r.reviewer_username || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">@{r.reviewer_username || "user"}</p>
                    <StarRating value={r.rating} readOnly />
                  </div>
                  <span className="text-gray-600 text-[10px]">{new Date(r.created_date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}