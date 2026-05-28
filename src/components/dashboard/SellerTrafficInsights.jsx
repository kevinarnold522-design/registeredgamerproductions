import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Eye, TrendingUp, Users, Heart, ShoppingCart, Star, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#9333ea", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

export default function SellerTrafficInsights({ user, listings = [], orders = [] }) {
  const [followers, setFollowers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Follow.filter({ following_email: user.email }),
      base44.entities.Favorite.filter({ listing_id: { $in: listings.map(l => l.id) } }),
      base44.entities.Review.filter({ target_id: { $in: listings.map(l => l.id) } }),
    ]).then(([f, fav, rev]) => {
      setFollowers(f);
      setFavorites(fav);
      setReviews(rev);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.email, listings.length]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const totalLikes = listings.reduce((s, l) => s + (l.likes || 0), 0);
  const activeListings = listings.filter(l => l.status === "active");
  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.seller_payout || 0), 0);
  const conversionRate = totalViews > 0 ? ((paidOrders.length / totalViews) * 100).toFixed(2) : "0.00";
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "N/A";

  // Views by listing (top 5)
  const topListings = [...listings]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(l => ({ name: l.title?.slice(0, 20) + (l.title?.length > 20 ? "…" : ""), views: l.views || 0, likes: l.likes || 0 }));

  // Category breakdown
  const categoryMap = {};
  listings.forEach(l => { categoryMap[l.category] = (categoryMap[l.category] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Orders over last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const count = orders.filter(o => new Date(o.created_date).toDateString() === d.toDateString()).length;
    return { day: label, orders: count };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="w-5 h-5 text-purple-400" />
        <h2 className="text-white font-black text-xl">Traffic & Performance Insights</h2>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
        <span className="text-green-400 text-xs font-semibold">Live</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Followers", value: followers.length, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "Wishlisted", value: favorites.length, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: ShoppingCart, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
          { label: "Total Orders", value: paidOrders.length, icon: ShoppingCart, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
          { label: "Avg Rating", value: avgRating !== "N/A" ? `${avgRating} ⭐` : "N/A", icon: Star, color: "text-yellow-300", bg: "bg-yellow-500/10 border-yellow-500/30" },
          { label: "Total Likes", value: totalLikes, icon: Heart, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top listings by views */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-white font-bold mb-4">Top Listings by Views</p>
          {topListings.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No listing data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topListings} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="views" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders last 7 days */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-white font-bold mb-4">Orders — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 10 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#fff" }} />
              <Line type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown + followers source */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Category pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-white font-bold mb-4">Listings by Category</p>
          {categoryData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No listings yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={160}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {categoryData.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 capitalize">{c.name}</span>
                    <span className="text-white font-bold ml-auto">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Follower sources */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-white font-bold mb-4">Followers ({followers.length})</p>
          {followers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No followers yet</p>
              <p className="text-gray-600 text-xs mt-1">Share your profile to gain followers!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { source: "manual", label: "Direct Follow", icon: "👤" },
                { source: "youtube_sync", label: "YouTube Sync", icon: "📺" },
                { source: "twitch_sync", label: "Twitch Sync", icon: "🎮" },
              ].map(s => {
                const count = followers.filter(f => f.source === s.source).length;
                const pct = followers.length > 0 ? Math.round((count / followers.length) * 100) : 0;
                return (
                  <div key={s.source} className="flex items-center gap-3">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-gray-400 text-xs w-28">{s.label}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-white font-bold text-xs w-8 text-right">{count}</span>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-gray-500 text-xs">Most recent followers:</p>
                {followers.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 mt-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-700/50 flex items-center justify-center text-[10px]">👤</div>
                    <span className="text-gray-300 text-xs">{f.follower_username || f.follower_email}</span>
                    <span className="text-gray-600 text-[10px] ml-auto">{new Date(f.created_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top listing details */}
      {activeListings.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <p className="text-white font-bold">Listing Performance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>{["Title", "Category", "Price", "Views", "Likes", "Wishlisted", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {activeListings.slice(0, 10).map(l => {
                  const wishCount = favorites.filter(f => f.listing_id === l.id).length;
                  return (
                    <tr key={l.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-white text-xs font-medium max-w-[140px] truncate">{l.title}</td>
                      <td className="px-4 py-3 text-purple-400 text-xs">{l.category}</td>
                      <td className="px-4 py-3 text-green-400 font-bold text-xs">₱{l.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-blue-400 font-bold text-xs">{l.views || 0}</td>
                      <td className="px-4 py-3 text-pink-400 font-bold text-xs">{l.likes || 0}</td>
                      <td className="px-4 py-3 text-yellow-400 font-bold text-xs">{wishCount}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900/50 text-green-400">{l.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}