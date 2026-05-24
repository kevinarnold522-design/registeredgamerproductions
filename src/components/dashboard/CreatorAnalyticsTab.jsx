import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Eye, ThumbsUp, Zap, Lightbulb, RefreshCw, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

export default function CreatorAnalyticsTab({ user, profile }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const vids = await base44.entities.VideoPost.filter({ creator_email: user.email });
      setVideos(vids);
      setLoading(false);
    };
    load();
  }, [user.email]);

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalEarnings = videos.reduce((s, v) => s + (v.earnings || 0), 0);
  const avgViews = videos.length ? Math.round(totalViews / videos.length) : 0;

  // Chart data — views per video (top 8)
  const chartData = videos
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8)
    .map(v => ({ name: v.title?.substring(0, 18) + "...", views: v.views || 0, likes: v.likes || 0 }));

  // Category breakdown
  const categoryBreakdown = videos.reduce((acc, v) => {
    const cat = v.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryBreakdown).map(([name, count]) => ({ name, count }));

  const getAiSuggestions = async () => {
    setAiLoading(true);
    const topVideo = videos.sort((a, b) => (b.views || 0) - (a.views || 0))[0];
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a YouTube gaming content strategist. Analyze this creator's stats and give 5 personalized, actionable content suggestions:

Creator: ${profile?.username}
Account type: ${profile?.account_type}
Total videos: ${videos.length}
Total views: ${totalViews.toLocaleString()}
Total likes: ${totalLikes.toLocaleString()}
Average views per video: ${avgViews.toLocaleString()}
Top performing video: "${topVideo?.title || 'N/A'}" (${topVideo?.views || 0} views)
Top categories: ${Object.entries(categoryBreakdown).map(([k,v]) => `${k}(${v})`).join(', ')}

Give 5 specific, actionable suggestions to grow their channel. Format each as:
🎯 [TITLE]: [Action] — [Why it works for gaming content]

Be specific to gaming content and their current stats. If they have low views, suggest viral formats. If they have good views, suggest monetization strategies.`,
    });
    setAiSuggestions(res);
    setAiLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Total Likes", value: totalLikes.toLocaleString(), icon: ThumbsUp, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
          { label: "Videos Posted", value: videos.length, icon: BarChart2, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "Est. Earnings", value: `$${totalEarnings.toFixed(2)}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Avg views badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/20 border border-purple-700/30 rounded-xl w-fit">
        <Star className="w-4 h-4 text-purple-400" />
        <span className="text-purple-300 text-sm font-semibold">Avg {avgViews.toLocaleString()} views per video</span>
        <span className="text-gray-500 text-xs">· {videos.length} total videos</span>
      </div>

      {/* Charts */}
      {videos.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Views per video bar chart */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <p className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-blue-400" /> Views by Video</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 9 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6" }} />
                <Bar dataKey="views" fill="url(#viewsGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <p className="text-white font-bold text-sm mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" /> Content by Category</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} width={70} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6" }} />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Videos */}
      {videos.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <p className="text-white font-bold">Top Performing Videos</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>{["Video", "Category", "Views", "Likes", "Est. Earnings"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
            </thead>
            <tbody>
              {videos.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6).map(v => (
                <tr key={v.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white text-xs font-medium max-w-[180px] truncate">{v.title}</td>
                  <td className="px-4 py-3 text-purple-400 text-xs">{v.category || "—"}</td>
                  <td className="px-4 py-3 text-blue-400 font-bold text-xs">{(v.views || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-pink-400 font-bold text-xs">{(v.likes || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-400 font-bold text-xs">${((v.views || 0) / 1000).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Content Suggestions */}
      <div className="bg-gray-900 rounded-2xl border border-purple-700/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-bold">AI Content Suggestions</p>
              <p className="text-gray-500 text-xs">Personalized growth tips based on your channel data</p>
            </div>
          </div>
          <button onClick={getAiSuggestions} disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {aiLoading ? "Analyzing..." : "Get AI Tips"}
          </button>
        </div>
        {aiSuggestions ? (
          <div className="bg-gray-800/60 rounded-xl p-4 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed border border-purple-700/20">
            {aiSuggestions}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Click "Get AI Tips" to receive personalized content suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
}