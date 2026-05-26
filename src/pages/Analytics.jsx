import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart2, Eye, TrendingUp, Users, Play, Heart, Package, Star, Radio, Clock, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { isAdmin } from "@/lib/constants";

const COLORS = ["#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#22c55e", "#f97316"];

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) { base44.auth.redirectToLogin("/analytics"); return; }
      setUser(me);
      const [profs, vids, myListings, myOrders] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: me.email }),
        isAdmin(me.email)
          ? base44.entities.VideoPost.filter({ status: "active" }, "-views", 50)
          : base44.entities.VideoPost.filter({ creator_email: me.email }, "-views", 50),
        base44.entities.Listing.filter({ seller_email: me.email }),
        base44.entities.Order.filter({ seller_email: me.email }),
      ]);
      setProfile(profs[0] || null);
      setVideos(vids);
      setListings(myListings);
      setOrders(myOrders);
      if (isAdmin(me.email)) {
        const allProfiles = await base44.entities.UserProfile.list("-followers_count", 20);
        setProfiles(allProfiles);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const admin = isAdmin(user?.email);
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.seller_payout || 0), 0);
  const totalWatchHours = Math.round(totalViews * 3 / 60);

  const categoryData = videos.reduce((acc, v) => {
    const cat = v.category || "other";
    acc[cat] = (acc[cat] || 0) + (v.views || 0);
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryData).map(([name, views]) => ({ name, views })).sort((a, b) => b.views - a.views).slice(0, 6);

  const topVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const topListings = [...listings].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const tabs = admin
    ? [{ id: "overview", label: "Overview" }, { id: "videos", label: "Top Videos" }, { id: "channels", label: "Top Channels" }, { id: "listings", label: "Listings" }]
    : [{ id: "overview", label: "Overview" }, { id: "videos", label: "My Videos" }, { id: "listings", label: "My Listings" }];

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><BarChart2 className="w-6 h-6 text-purple-400" /> Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">{admin ? "Platform-wide insights & performance" : "Your personal creator analytics"}</p>
          </div>
          {admin && <span className="px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-700/40 text-yellow-300 text-xs font-black">⚡ Admin View</span>}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t.id ? "bg-purple-600/20 border border-purple-600/40 text-purple-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
                { label: "Total Likes", value: totalLikes.toLocaleString(), icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
                { label: admin ? "Platform Revenue" : "My Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
                { label: "Watch Hours", value: totalWatchHours.toLocaleString() + "h", icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl p-4 border ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Category breakdown chart */}
            {categoryChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Views by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#a855f7" }} />
                    <Bar dataKey="views" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Admin extra stats */}
            {admin && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Videos", value: videos.length, icon: Play, color: "text-cyan-400" },
                  { label: "Total Users", value: profiles.length, icon: Users, color: "text-yellow-400" },
                  { label: "Active Listings", value: listings.length, icon: Package, color: "text-orange-400" },
                  { label: "Total Orders", value: orders.length, icon: Star, color: "text-red-400" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
                    <p className="text-gray-500 text-xs">{s.label}</p>
                    <p className={`text-xl font-black text-white mt-0.5`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {tab === "videos" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-bold">{admin ? "Top Videos on Platform" : "My Videos Performance"}</h3>
            </div>
            {topVideos.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No video data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>{["#", "Title", "Creator", "Category", "Views", "Likes", "Est. Watch Hrs"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {topVideos.map((v, i) => (
                      <tr key={v.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{i + 1}</td>
                        <td className="px-4 py-3 text-white text-xs font-medium max-w-[160px] truncate">{v.title}</td>
                        <td className="px-4 py-3 text-purple-400 text-xs">{v.creator_username || "—"}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">{v.category || "—"}</span></td>
                        <td className="px-4 py-3 text-blue-400 font-bold text-xs">{(v.views || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-pink-400 font-bold text-xs">{(v.likes || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{Math.round((v.views || 0) * 3 / 60)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Channels Tab (Admin only) */}
        {tab === "channels" && admin && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Top Channels by Followers</h3></div>
              {profiles.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No channel data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800/50">
                      <tr>{["#", "Username", "Account Type", "Followers", "Total Views", "Verified", "Channel"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {profiles.map((p, i) => (
                        <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                          <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{i + 1}</td>
                          <td className="px-4 py-3 text-white font-bold text-xs">@{p.username}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">{p.account_type}</span></td>
                          <td className="px-4 py-3 text-purple-400 font-bold text-xs">{(p.followers_count || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-blue-400 font-bold text-xs">{(p.total_views || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">{p.is_verified ? <span className="text-green-400 text-xs">✓ Yes</span> : <span className="text-gray-600 text-xs">—</span>}</td>
                          <td className="px-4 py-3">
                            <a href={`/channel?email=${p.user_email}`} className="flex items-center gap-1 text-purple-400 text-xs font-semibold hover:text-purple-300">
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {tab === "listings" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Top Listings by Views</h3></div>
            {topListings.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No listing data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>{["Title", "Category", "Price", "Views", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {topListings.map((l) => (
                      <tr key={l.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium text-xs max-w-[160px] truncate">{l.title}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">{l.category}</span></td>
                        <td className="px-4 py-3 text-green-400 font-bold text-xs">₱{l.price?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-blue-400 font-bold text-xs">{(l.views || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${l.status === "active" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"}`}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}