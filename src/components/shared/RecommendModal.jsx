import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Generic "Recommend" modal — used for recommending a game OR a category
export default function RecommendModal({ type = "game", parentCategory = "", user, profile, onClose }) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await base44.entities.SubcategoryRequest.create({
      seller_email: user?.email || "guest",
      seller_username: profile?.username || user?.full_name || "Gamer",
      parent_category: parentCategory || type,
      subcategory_name: name.trim(),
      description: reason.trim() || `User recommended: ${name.trim()}`,
      status: "pending",
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-sm shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-lg">
              {type === "game" ? "🎮 Recommend a Game" : "📁 Recommend a Category"}
            </h2>
            <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
          </div>

          {submitted ? (
            <div className="text-center py-6">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-black text-lg">Sent for Admin Review!</p>
              <p className="text-gray-400 text-sm mt-1">Thanks! An admin will review your recommendation.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-sm hover:bg-purple-600 transition-colors">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">
                  {type === "game" ? "Game Name" : "Category Name"}
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={type === "game" ? "e.g. Street Fighter 6" : "e.g. Retro Gaming"}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Why? (optional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Tell us why this should be added..."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              {!user && (
                <p className="text-yellow-400 text-xs text-center">Sign in to submit recommendations</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || submitting || !user}
                className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Sending..." : "Submit Recommendation"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}