import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, RefreshCw, Trash2, CheckCircle, MessageSquare, Filter } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  bug: "bg-red-900/40 text-red-400 border-red-700/40",
  feature_request: "bg-blue-900/40 text-blue-400 border-blue-700/40",
  improvement: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
  content: "bg-purple-900/40 text-purple-400 border-purple-700/40",
  payment: "bg-green-900/40 text-green-400 border-green-700/40",
  general: "bg-gray-800 text-gray-400 border-gray-700",
};

const CATEGORY_LABELS = {
  bug: "🐛 Bug",
  feature_request: "💡 Feature",
  improvement: "⚡ Improvement",
  content: "🎮 Content",
  payment: "💳 Payment",
  general: "💬 General",
};

export default function FeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = async () => {
    const data = await base44.entities.Feedback.list("-created_date", 200);
    setFeedbacks(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Auto-refresh every 15s for real-time feel
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const markReviewed = async (id) => {
    await base44.entities.Feedback.update(id, { status: "reviewed" });
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "reviewed" } : f));
  };

  const markResolved = async (id) => {
    await base44.entities.Feedback.update(id, { status: "resolved" });
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "resolved" } : f));
  };

  const deleteFeedback = async (id) => {
    await base44.entities.Feedback.delete(id);
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };

  const filtered = feedbacks.filter(f => {
    const catMatch = filter === "all" || f.category === filter;
    const statusMatch = statusFilter === "all" || f.status === statusFilter;
    return catMatch && statusMatch;
  });

  const counts = {
    new: feedbacks.filter(f => f.status === "new").length,
    reviewed: feedbacks.filter(f => f.status === "reviewed").length,
    resolved: feedbacks.filter(f => f.status === "resolved").length,
  };

  const avgRating = feedbacks.filter(f => f.rating).reduce((s, f, _, arr) => s + f.rating / arr.filter(x => x.rating).length, 0);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-black text-xl">Feedback Dashboard</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Real-time · Auto-refreshes every 15s</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(a => !a)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${autoRefresh ? "bg-green-900/30 border-green-600/40 text-green-300" : "bg-gray-800 border-gray-700 text-gray-400"}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Feedback", value: feedbacks.length, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "New / Unread", value: counts.new, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
          { label: "Reviewed", value: counts.reviewed, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
          { label: "Avg Rating", value: avgRating ? `${avgRating.toFixed(1)} ⭐` : "N/A", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`rounded-2xl p-4 border ${s.bg}`}>
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-500 text-xs">Category:</span>
        </div>
        {["all", "bug", "feature_request", "improvement", "content", "payment", "general"].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filter === c ? "bg-purple-600 text-white border-purple-500" : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"}`}>
            {c === "all" ? "All Categories" : CATEGORY_LABELS[c]}
          </button>
        ))}
        <span className="text-gray-700 text-xs self-center mx-1">|</span>
        {["all", "new", "reviewed", "resolved"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${statusFilter === s ? "bg-gray-700 text-white border-gray-600" : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"}`}>
            {s === "all" ? "All Status" : s}
            {s === "new" && counts.new > 0 && <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{counts.new}</span>}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p>No feedback found</p>
          </div>
        )}
        {filtered.map((f) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-900 rounded-2xl border p-5 ${f.status === "new" ? "border-purple-700/40" : "border-gray-800"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${CATEGORY_COLORS[f.category] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                    {CATEGORY_LABELS[f.category] || f.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${f.status === "new" ? "bg-red-900/50 text-red-400" : f.status === "reviewed" ? "bg-yellow-900/50 text-yellow-400" : "bg-green-900/50 text-green-400"}`}>
                    {f.status}
                  </span>
                  {f.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold">
                      {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                    </span>
                  )}
                  <span className="text-gray-600 text-[10px]">
                    {f.page && <span className="text-gray-700 mr-1">{f.page}</span>}
                    {new Date(f.created_date).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400 text-xs font-semibold">{f.user_name || "Anonymous"}</span>
                  {f.user_email && f.user_email !== "anonymous" && (
                    <span className="text-gray-600 text-xs">· {f.user_email}</span>
                  )}
                </div>
                {f.subject && <p className="text-white font-bold text-sm mb-1">{f.subject}</p>}
                <p className="text-gray-300 text-sm leading-relaxed">{f.message}</p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {f.status === "new" && (
                  <button onClick={() => markReviewed(f.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-900/30 border border-yellow-700/40 text-yellow-400 text-xs font-bold hover:bg-yellow-900/50 transition-colors whitespace-nowrap">
                    <CheckCircle className="w-3 h-3" /> Mark Reviewed
                  </button>
                )}
                {f.status !== "resolved" && (
                  <button onClick={() => markResolved(f.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-900/30 border border-green-700/40 text-green-400 text-xs font-bold hover:bg-green-900/50 transition-colors whitespace-nowrap">
                    <CheckCircle className="w-3 h-3" /> Resolve
                  </button>
                )}
                <button onClick={() => deleteFeedback(f.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-xs font-bold hover:bg-red-900/50 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}