import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, Eye, TrendingUp, Users, Play, Heart, Package, Star, Clock, ExternalLink, ShoppingBag, DollarSign
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { isAdmin } from "@/lib/constants";

const COLORS = ["#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#22c55e", "#f97316"];

const StatCard = ({ label, value, icon: Icon, color, bg, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className={`rounded-2xl p-4 border ${bg}`}>
    <Icon className={`w-5 h-5 ${color} mb-2`} />
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </motion.div>
);

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) { base44.auth.redirectToLogin("/analytics"); return; }
      setUser(me);

      const admin = isAdmin(me.email);

      // Parallel fetch everything at once for speed
      const [profs, vids, myListings, myOrders] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: me.email }),
        admin
          ? base44.entities.VideoPost.filter({ status: "active" }, "-views", 50)
          : base44.entities.VideoPost.filter({ creator_email: me.email }, "-views", 50),
        admin
          ? base44.entities.Listing.filter({ status: "active" }, "-views", 50)
          : base44.entities.Listing.filter({ seller_email: me.email }),
        admin
          ? base44.entities.Order.list("-created_date", 100)
          : base44.entities.Order.filter({ seller_email: me.email }),
      ]);

      setProfile(profs[0] || null);
      setVideos(vids);
      setListings(myListings);
      setOrders(myOrders);

      if (admin) {
        const ap = await base44.entities.UserProfile.list("-followers_count", 50);
        setAllProfiles(ap);
      }

      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading analytics...</p>
      </div>
    </div>
  );

  const admin = isAdmin(user?.email);
  const accountType = profile?.account_type || "regular";

  // Computed metrics
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.seller_payout || 0), 0);
  const totalWatchHours = Math.round(totalViews * 3 / 60);
  const totalListingViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const paidOrders = orders.filter(o => o.payment_status === "paid").length;

  // Category chart
  const categoryData = videos.reduce((acc, v) => {
    const cat = v.category || "other";
    acc[cat] = (acc[cat] || 0) + (v.views || 0);
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryData)
    .map(([name, views]) => ({ name, views }))
    .sort((a, b) => b.views - a.views).slice(0, 6);

  // Account type breakdown (admin)
  const accountTypeData = allProfiles.reduce((acc, p) => {
    const t = p.account_type || "regular";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const accountTypePieData = Object.entries(accountTypeData).map(([name, value]) => ({ name, value }));

  // Listings by category chart
  const listingCatData = listings.reduce((acc, l) => {
    const cat = l.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const listingCatChartData = Object.entries(listingCatData).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Orders revenue by month (last 6 months)
  const revenueByMonth = orders.filter(o => o.payment_status === "paid").reduce((acc, o) => {
    const d = new Date(o.created_date);
    const key = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
    acc[key] = (acc[key] || 0) + (o.seller_payout || o.amount || 0);
    return acc;
  }, {});
  const revenueChartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })).slice(-6);

  const topVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const topListings = [...listings].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  // Tabs by role
  const tabs = admin
    ? [
        { id: "overview", label: "Overview" },
        { id: "sellers", label: "Sellers" },
        { id: "creators", label: "Creators" },
        { id: "users", label: "Users" },
        { id: "videos", label: "Top Videos" },
        { id: "channels", label: "Top Channels" },
      ]
    : accountType === "business"
    ? [
        { id: "overview", label: "Overview" },
        { id: "listings", label: "My Listings" },
        { id: "orders", label: "Orders & Revenue" },
      ]
    : accountType === "digital_creator"
    ? [
        { id: "overview", label: "Overview" },
        { id: "videos", label: "My Videos" },
        { id: "listings", label: "My Listings" },
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "activity", label: "My Activity" },
      ];

  // Role-based accent colors
  const accentColor =
    admin ? "from-yellow-600 to-orange-600" :
    accountType === "business" ? "from-green-600 to-emerald-600" :
    accountType === "digital_creator" ? "from-purple-600 to-pink-600" :
    "from-blue-600 to-cyan-600";

  const roleLabel =
    admin ? "⚡ Admin" :
    accountType === "business" ? "🏪 Business / Seller" :
    accountType === "digital_creator" ? "🎬 Digital Creator" :
    "🎮 Gamer";

  const roleBg =
    admin ? "bg-yellow-900/30 border-yellow-700/40 text-yellow-300" :
    accountType === "business" ? "bg-green-900/30 border-green-700/40 text-green-300" :
    accountType === "digital_creator" ? "bg-purple-900/30 border-purple-700/40 text-purple-300" :
    "bg-blue-900/30 border-blue-700/40 text-blue-300";

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16 max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-purple-400" /> Analytics Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {admin ? "Platform-wide insights & performance" : `Your ${accountType.replace("_", " ")} analytics`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full border text-xs font-black ${roleBg}`}>{roleLabel}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${tab === t.id ? `bg-gradient-to-r ${accentColor} text-white` : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stat cards — different sets per role */}
            {(accountType === "digital_creator" || admin) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" delay={0} />
                <StatCard label="Total Likes" value={totalLikes.toLocaleString()} icon={Heart} color="text-pink-400" bg="bg-pink-500/10 border-pink-500/30" delay={0.05} />
                <StatCard label="Est. Watch Hours" value={totalWatchHours.toLocaleString() + "h"} icon={Clock} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" delay={0.1} />
                <StatCard label="Videos" value={videos.length} icon={Play} color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/30" delay={0.15} />
              </div>
            )}
            {(accountType === "business" || admin) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Active Listings" value={listings.length} icon={Package} color="text-green-400" bg="bg-green-500/10 border-green-500/30" delay={0} />
                <StatCard label="Listing Views" value={totalListingViews.toLocaleString()} icon={Eye} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" delay={0.05} />
                <StatCard label="Paid Orders" value={paidOrders} icon={ShoppingBag} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/30" delay={0.1} />
                <StatCard label={admin ? "Platform Revenue" : "My Revenue"} value={`₱${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" bg="bg-green-500/10 border-green-500/30" delay={0.15} />
              </div>
            )}
            {accountType === "regular" && !admin && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Orders Made" value={orders.length} icon={ShoppingBag} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" delay={0} />
                <StatCard label="Favorites" value="—" icon={Heart} color="text-pink-400" bg="bg-pink-500/10 border-pink-500/30" delay={0.05} />
                <StatCard label="Account Type" value="Gamer" icon={Users} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" delay={0.1} />
              </div>
            )}

            {/* Revenue bar chart for sellers/admin */}
            {(accountType === "business" || admin) && revenueChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Revenue by Month (₱)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#22c55e" }} />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category views chart for creators/admin */}
            {(accountType === "digital_creator" || admin) && categoryChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Play className="w-4 h-4 text-purple-400" /> Views by Category</h3>
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

            {/* Admin: account type distribution pie */}
            {admin && accountTypePieData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-yellow-400" /> Users by Account Type</h3>
                <div className="flex items-center justify-center gap-8 flex-wrap">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={accountTypePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {accountTypePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {accountTypePieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-300 capitalize">{d.name.replace("_", " ")}</span>
                        <span className="text-white font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ SELLERS TAB (admin) ═══════════════ */}
        {tab === "sellers" && admin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Listings" value={listings.length} icon={Package} color="text-green-400" bg="bg-green-500/10 border-green-500/30" delay={0} />
              <StatCard label="Total Listing Views" value={totalListingViews.toLocaleString()} icon={Eye} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" delay={0.05} />
              <StatCard label="Paid Orders" value={paidOrders} icon={ShoppingBag} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/30" delay={0.1} />
            </div>

            {listingCatChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Listings by Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={listingCatChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#22c55e" }} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Top Listings by Views</h3></div>
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
            </div>
          </div>
        )}

        {/* ═══════════════ CREATORS TAB (admin) ═══════════════ */}
        {tab === "creators" && admin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Videos" value={videos.length} icon={Play} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" delay={0} />
              <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" delay={0.05} />
              <StatCard label="Total Likes" value={totalLikes.toLocaleString()} icon={Heart} color="text-pink-400" bg="bg-pink-500/10 border-pink-500/30" delay={0.1} />
              <StatCard label="Est. Watch Hours" value={totalWatchHours + "h"} icon={Clock} color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/30" delay={0.15} />
            </div>

            {categoryChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Views by Video Category</h3>
                <ResponsiveContainer width="100%" height={220}>
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

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Top Videos on Platform</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>{["#", "Title", "Creator", "Category", "Views", "Likes"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ USERS TAB (admin) ═══════════════ */}
        {tab === "users" && admin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Profiles" value={allProfiles.length} icon={Users} color="text-yellow-400" bg="bg-yellow-500/10 border-yellow-500/30" delay={0} />
              <StatCard label="Verified Users" value={allProfiles.filter(p => p.is_verified).length} icon={Star} color="text-green-400" bg="bg-green-500/10 border-green-500/30" delay={0.05} />
              <StatCard label="Business Accounts" value={allProfiles.filter(p => p.account_type === "business").length} icon={Package} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/30" delay={0.1} />
            </div>

            {/* Bar chart: users by account type */}
            {accountTypePieData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Users by Account Type</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={accountTypePieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#f59e0b" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {accountTypePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Top Channels by Followers</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>{["#", "Username", "Account Type", "Followers", "Verified", "Channel"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {allProfiles.slice(0, 20).map((p, i) => (
                      <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{i + 1}</td>
                        <td className="px-4 py-3 text-white font-bold text-xs">@{p.username}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">{p.account_type?.replace("_", " ")}</span></td>
                        <td className="px-4 py-3 text-purple-400 font-bold text-xs">{(p.followers_count || 0).toLocaleString()}</td>
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
            </div>
          </div>
        )}

        {/* ═══════════════ VIDEOS TAB (creator / admin from old) ═══════════════ */}
        {tab === "videos" && !admin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" delay={0} />
              <StatCard label="Total Likes" value={totalLikes.toLocaleString()} icon={Heart} color="text-pink-400" bg="bg-pink-500/10 border-pink-500/30" delay={0.05} />
              <StatCard label="Videos" value={videos.length} icon={Play} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" delay={0.1} />
              <StatCard label="Est. Watch Hours" value={totalWatchHours + "h"} icon={Clock} color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/30" delay={0.15} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">My Videos Performance</h3></div>
              {topVideos.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No video data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800/50">
                      <tr>{["#", "Title", "Category", "Views", "Likes", "Est. Watch Hrs"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {topVideos.map((v, i) => (
                        <tr key={v.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                          <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{i + 1}</td>
                          <td className="px-4 py-3 text-white text-xs font-medium max-w-[160px] truncate">{v.title}</td>
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
          </div>
        )}

        {/* ═══════════════ LISTINGS TAB (seller / creator) ═══════════════ */}
        {tab === "listings" && !admin && (
          <div className="space-y-6">
            {listingCatChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">My Listings by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={listingCatChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#22c55e" }} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">My Listings</h3></div>
              {topListings.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No listings yet.</p>
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
          </div>
        )}

        {/* ═══════════════ ORDERS & REVENUE TAB (seller) ═══════════════ */}
        {tab === "orders" && !admin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/30" delay={0} />
              <StatCard label="Paid Orders" value={paidOrders} icon={Star} color="text-green-400" bg="bg-green-500/10 border-green-500/30" delay={0.05} />
              <StatCard label="My Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" bg="bg-green-500/10 border-green-500/30" delay={0.1} />
            </div>
            {revenueChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Revenue by Month (₱)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#22c55e" }} />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ ACTIVITY TAB (regular user) ═══════════════ */}
        {tab === "activity" && accountType === "regular" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">🎮</div>
              <h3 className="text-white font-bold text-lg mb-2">Your Gaming Activity</h3>
              <p className="text-gray-500 text-sm mb-4">Track your orders, favorites, and community activity here.</p>
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-2xl font-black text-blue-400">{orders.length}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Orders</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-2xl font-black text-purple-400">{profile?.followers_count || 0}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Followers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CHANNELS TAB (admin legacy) ═══════════════ */}
        {tab === "channels" && admin && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Top Channels by Followers</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>{["#", "Username", "Account Type", "Followers", "Total Views", "Verified", "Channel"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {allProfiles.map((p, i) => (
                    <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{i + 1}</td>
                      <td className="px-4 py-3 text-white font-bold text-xs">@{p.username}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">{p.account_type?.replace("_", " ")}</span></td>
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
          </div>
        )}

      </div>
    </div>
  );
}