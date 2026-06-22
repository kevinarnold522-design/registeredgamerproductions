import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, Star, Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { id: "bug", label: "🐛 Bug Report" },
  { id: "feature_request", label: "💡 Feature Request" },
  { id: "improvement", label: "⚡ Improvement" },
  { id: "content", label: "🎮 Content" },
  { id: "payment", label: "💳 Payment" },
  { id: "general", label: "💬 General" },
];

export default function FeedbackWidget({ userEmail, userName }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "general",
    subject: "",
    message: "",
    rating: 0,
  });

  const handleSubmit = async () => {
    if (!form.message.trim()) return;
    setSubmitting(true);
    await base44.entities.Feedback.create({
      user_email: userEmail || "anonymous",
      user_name: userName || "Anonymous",
      category: form.category,
      subject: form.subject,
      message: form.message,
      rating: form.rating || null,
      page: window.location.pathname + window.location.search,
      status: "new",
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm({ category: "general", subject: "", message: "", rating: 0 });
    }, 2500);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-sm shadow-2xl transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #ec4899)",
          boxShadow: "0 0 20px rgba(124,58,237,0.5)",
        }}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:block">Feedback</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
              style={{ background: "#0d0d1a", border: "1px solid rgba(124,58,237,0.4)" }}
            >
              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-black text-xl">Thanks for your feedback!</p>
                  <p className="text-gray-400 text-sm mt-1">We'll use it to improve GAMER Productions.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white font-black text-lg">Share Your Feedback</p>
                      <p className="text-gray-500 text-xs mt-0.5">Help us improve the platform</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            form.category === cat.id
                              ? "bg-purple-600 text-white border border-purple-500"
                              : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Overall Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setForm((f) => ({ ...f, rating: s }))}>
                          <Star
                            className="w-6 h-6 transition-colors"
                            style={{
                              color: s <= form.rating ? "#f5c518" : "#374151",
                              fill: s <= form.rating ? "#f5c518" : "none",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mb-3">
                    <input
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="Subject (optional)"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-5">
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us what you think, what's broken, or what you'd love to see..."
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.message.trim()}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending..." : "Submit Feedback"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}