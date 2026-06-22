import React, { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Review.list("-created_date", 100);
    setReviews(data);
    setLoading(false);
  };

  const approveReview = async (id) => {
    await base44.entities.Review.update(id, { is_approved: true });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
  };

  const deleteReview = async (id) => {
    await base44.entities.Review.delete(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = filter === "all" ? reviews : filter === "pending" ? reviews.filter(r => !r.is_approved) : reviews.filter(r => r.is_approved);

  const Stars = ({ n }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />)}
    </div>
  );

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" /> Reviews ({reviews.length})
        </h3>
        <div className="flex gap-2">
          {["all", "pending", "approved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-purple-600/30 border border-purple-500/50 text-purple-300" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No reviews found</div>
      )}

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className={`bg-gray-900 rounded-2xl border p-4 ${r.is_approved ? "border-green-700/20" : "border-yellow-700/30"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">@{r.reviewer_username || r.reviewer_email}</span>
                  <Stars n={r.rating} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.target_type === "platform" ? "bg-blue-900/50 text-blue-400" : r.target_type === "seller" ? "bg-purple-900/50 text-purple-400" : "bg-gray-800 text-gray-400"}`}>
                    {r.target_type}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{r.comment || <span className="italic text-gray-600">No comment</span>}</p>
                <p className="text-gray-600 text-xs mt-1">{new Date(r.created_date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 ml-3 flex-shrink-0">
                {!r.is_approved && (
                  <button onClick={() => approveReview(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-900/40 border border-green-700/50 text-green-400 text-xs font-semibold hover:bg-green-900/60 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                <button onClick={() => deleteReview(r.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-700/50 text-red-400 text-xs font-semibold hover:bg-red-900/60 transition-colors">
                  <XCircle className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}