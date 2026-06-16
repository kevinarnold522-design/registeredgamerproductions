import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart2, Eye, Package, ShoppingBag, DollarSign, Download, RefreshCw, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["#7c3aed", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function buildAnalytics(listings, orders) {
  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalViews = listings.reduce((s, l) => s + (Number(l.views) || 0), 0);
  const totalDownloads = listings.reduce((s, l) => s + (Number(l.downloads) || 0), 0);
  const totalRevenue = paidOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const categoryCounts = Object.entries(listings.reduce((acc, l) => {
    const key = l.category || "uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const topListings = [...listings]
    .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
    .slice(0, 8)
    .map(l => ({ title: (l.title || "Untitled").slice(0, 24), views: Number(l.views) || 0, downloads: Number(l.downloads) || 0 }));
  const orderStatus = Object.entries(orders.reduce((acc, o) => {
    const key = o.payment_status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).map(([name, count]) => ({ name, count }));
  return { paidOrders, totalViews, totalDownloads, totalRevenue, categoryCounts, topListings, orderStatus };
}

export default function AdvancedAnalytics({ user, profile, sellerOnly = false }) {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const query = sellerOnly ? { seller_email: user.email } : {};
      const [ls, os] = await Promise.all([
        base44.entities.Listing.filter(query),
        base44.entities.Order.filter(sellerOnly ? { seller_email: user.email } : {}),
      ]);
      setListings(ls);
      setOrders(os);
      setAnalytics(buildAnalytics(ls, os));
      setLoading(false);
    };
    load();
  }, [user.email, sellerOnly]);

  const getAiInsight = async () => {
    setAiLoading(true);
    const summary = buildAnalytics(listings, orders);
    const topCategory = summary.categoryCounts[0]?.name || "none";
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Give 4 short analytics insights using only these factual app numbers. Do not invent traffic, countries, visitors, bounce rate, or time-on-site.\nAccount: ${sellerOnly ? profile?.username : "Platform admin"}\nListings: ${listings.length}\nOrders: ${orders.length}\nPaid orders: ${summary.paidOrders.length}\nRevenue: ${summary.totalRevenue}\nViews: ${summary.totalViews}\nDownloads: ${summary.totalDownloads}\nTop category: ${topCategory}`,
    });
    setAiInsight(res);
    setAiLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  const { paidOrders, totalViews, totalDownloads, totalRevenue, categoryCounts, topListings, orderStatus } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white font-black text-xl flex items-center gap-2"><BarChart2 className="w-5 h-5 text-purple-400" /> Factual Analytics</h2>
          <p className="text-gray-500 text-xs mt-0.5">Only saved listing and order data is shown here.</p>
        </div>
        <span className="text-green-400 text-xs font-bold">LIVE DATA</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Listings", value: listings.length.toLocaleString(), icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "Downloads", value: totalDownloads.toLocaleString(), icon: Download, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
          { label: "Paid Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <p className="text-white font-bold text-sm mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-green-400" /> Top Listings by Views</p>
          {topListings.length === 0 ? <p className="text-gray-500 text-sm py-12 text-center">No listing views yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topListings} layout="vertical" margin={{ left: 20 }}>
                <defs><linearGradient id="bar3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="55%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#4c1d95" /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <YAxis type="category" dataKey="title" tick={{ fill: "#9ca3af", fontSize: 9 }} width={120} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", fontSize: 11 }} />
                <Bar dataKey="views" fill="url(#bar3d)" radius={[0, 8, 8, 0]} style={{ filter: "drop-shadow(6px 6px 6px rgba(0,0,0,0.45))" }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <p className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-blue-400" /> Listings by Category</p>
          {categoryCounts.length === 0 ? <p className="text-gray-500 text-sm py-12 text-center">No listings yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 9 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", fontSize: 11 }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} style={{ filter: "drop-shadow(5px 7px 7px rgba(0,0,0,0.45))" }}>
                  {categoryCounts.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Orders", value: orders.length.toLocaleString(), sub: "All stored orders", color: "text-cyan-400" },
          { label: "Paid Orders", value: paidOrders.length.toLocaleString(), sub: "Payment status paid", color: "text-green-400" },
          { label: "Avg Views", value: listings.length ? (totalViews / listings.length).toFixed(1) : "0", sub: "Views per listing", color: "text-purple-400" },
          { label: "Order Statuses", value: orderStatus.length.toLocaleString(), sub: "Stored status groups", color: "text-orange-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-purple-700/30 p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <p className="text-white font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> AI Analytics Insights</p>
            <p className="text-gray-500 text-xs">AI uses only the factual numbers shown on this page.</p>
          </div>
          <button onClick={getAiInsight} disabled={aiLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}{aiLoading ? "Analyzing..." : "Get Insights"}
          </button>
        </div>
        {aiInsight ? <div className="bg-gray-800/60 rounded-xl p-4 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed border border-purple-700/20">{aiInsight}</div> : <p className="text-center py-6 text-gray-600 text-sm">Click Get Insights for recommendations based on real saved data.</p>}
      </div>
    </div>
  );
}