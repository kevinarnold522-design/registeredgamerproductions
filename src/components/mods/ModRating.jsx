import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ModRating({ listingId, compact = false }) {
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => setUser(me)).catch(() => {});
    base44.entities.Review.filter({ target_id: listingId, target_type: "listing" }).then(r => {
      setReviews(r);
    });
  }, [listingId]);

  useEffect(() => {
    if (user && reviews.length > 0) {
      const mine = reviews.find(r => r.reviewer_email === user.email);
      if (mine) { setAlready(true); setUserRating(mine.rating); }
    }
  }, [user, reviews]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  const handleSubmit = async (rating) => {
    if (!user || already || submitting) return;
    setSubmitting(true);
    await base44.entities.Review.create({
      reviewer_email: user.email,
      reviewer_username: user.full_name,
      target_type: "listing",
      target_id: listingId,
      rating,
      is_approved: true,
    });
    setAlready(true);
    setUserRating(rating);
    setReviews(prev => [...prev, { rating, reviewer_email: user.email }]);
    setSubmitting(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className="w-3 h-3" style={{ color: s <= Math.round(avgRating) ? "#f5c518" : "#374151", fill: s <= Math.round(avgRating) ? "#f5c518" : "none" }} />
          ))}
        </div>
        <span className="text-[10px] text-gray-400">{avgRating > 0 ? avgRating.toFixed(1) : "—"} ({reviews.length})</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Ratings & Reviews
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-400">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
          <div>
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-3.5 h-3.5" style={{ color: "#f5c518", fill: s <= Math.round(avgRating) ? "#f5c518" : "none" }} />
              ))}
            </div>
            <p className="text-gray-500 text-[10px]">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Rating input */}
      {user && !already && (
        <div className="mb-4 p-3 rounded-xl bg-gray-800 border border-gray-700">
          <p className="text-gray-400 text-xs mb-2">Rate this mod:</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => handleSubmit(s)}
                disabled={submitting}
              >
                <Star className="w-7 h-7 transition-colors" style={{
                  color: "#f5c518",
                  fill: s <= (hover || userRating) ? "#f5c518" : "none",
                }} />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {already && (
        <div className="mb-4 flex items-center gap-2 text-yellow-400 text-xs">
          <Star className="w-3.5 h-3.5 fill-yellow-400" /> You rated this {userRating}/5
        </div>
      )}

      {!user && (
        <p className="text-gray-500 text-xs mb-4">Sign in to rate this mod.</p>
      )}

      {/* Recent reviews */}
      {reviews.slice(0, 5).map((r, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-800 last:border-0">
          <div className="flex">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3" style={{ color: "#f5c518", fill: s <= r.rating ? "#f5c518" : "none" }} />)}
          </div>
          <span className="text-gray-500 text-xs">{r.reviewer_username || r.reviewer_email?.split("@")[0] || "User"}</span>
        </div>
      ))}
    </div>
  );
}