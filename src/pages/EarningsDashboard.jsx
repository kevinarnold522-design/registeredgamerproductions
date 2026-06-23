import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingBag, Star, Download, Eye, BarChart2, Package, Clock, ArrowUpRight, Gift, Flame, Target, Wallet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from "recharts";

const COLORS = ["#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#22c55e", "#f97316"];

const StatCard = ({ label, value, icon: IconComp, color, bg, sub }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl p-5 border ${bg} flex flex-col gap-2`}>
    <div className="flex items-center justify-between">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <IconComp className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    {sub && <p className="text-gray-600 text-xs">{sub}</p>}
  </motion.div>
);

export default function EarningsDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [tier1Subs, setTier1Subs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [dailyData, setDailyData] = useState({ streak: 0, totalDays: 0, lastClaim: null });

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) { base44.auth.redirectToLogin("/earnings"); return; }
      setUser(me);
      const admin = isAdmin(me.email);

      const [profs, ordersData, listingsData, subs] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: me.email }),
        admin ? base44.entities.Order.list("-created_date", 200) : base44.entities.Order.filter({ seller_email: me.email }),
        admin ? base44.entities.Listing.list("-created_date", 100) : base44.entities.Listing.filter({ seller_email: me.email }),
        admin ? base44.entities.Tier1Subscription.filter({ status: "active" }) : [],
      ]);

      setProfile(profs[0] || null);
      setOrders(ordersData);
      setListings(listingsData);
      setTier1Subs(subs);

      // Load daily reward data from localStorage
      const rewardData = JSON.parse(localStorage.getItem(`gp_rewards_${me.email}`) || "{}");
      setDailyData({
        streak: rewardData.totalStreak || 0,
        totalDays: (rewardData.claimedDays || []).length,
        lastClaim: rewardData.lastClaim || null,
      });

      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const admin = isAdmin(user?.email);
  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.seller_payout || o.amount || 0), 0);
  const totalListingViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const totalDwellSeconds = listings.reduce((s, l) => s + (l.total_dwell_seconds || 0), 0);
  const totalWatchHours = Math.round((totalDwellSeconds / 3600) * 10) / 10;
  const tier1Revenue = tier1Subs.length * 1; // $1/month each

  // Revenue by month
  const revenueByMonth = paidOrders.reduce((acc, o) => {
    const d = new Date(o.created_date);
    const key = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
    acc[key] = (acc[key] || 0) + (o.seller_payout || o.amount || 0);
    return acc;
  }, {});
  const revenueChartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })).slice(-6);

  // Top earning listings
  const listingRevenue = listings.map(l => ({
    ...l,
    revenue: paidOrders.filter(o => o.listing_id === l.id).reduce((s, o) => s + (o.seller_payout || o.amount || 0), 0)
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Orders by status
  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.payment_status || "pending"] = (acc[o.payment_status || "pending"] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(ordersByStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Earnings Dashboard</h1>
              <p className="text-gray-500 text-sm">{admin ? "Platform-wide revenue & earnings" : "Your sales and earnings overview"}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["overview", "daily rewards", "orders", "listings", ...(admin ? ["subscriptions"] : [])].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${tab === t ? "text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
              style={tab === t ? { background: "linear-gradient(135deg, #22c55e, #16a34a)" } : {}}>
              {t === "daily rewards" ? "🎁 Daily Rewards" : t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW (with combined Total Revenue hero) ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Combined Total Revenue hero */}
            <div className="rounded-3xl p-6 border border-green-500/30 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(16,163,74,0.05))" }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #22c55e, transparent)", transform: "translate(30%, -30%)" }} />
              <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-green-300/80 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-green-400 font-black" style={{ fontSize: "3rem", lineHeight: 1 }}>${totalRevenue.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-2">{paidOrders.length} paid orders · {orders.length} total orders</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-4 py-3 text-center">
                    <p className="text-purple-400 font-black text-xl">{listings.filter(l => l.status === "active").length}</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide">Active Listings</p>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-4 py-3 text-center">
                    <p className="text-cyan-400 font-black text-xl">{totalWatchHours.toLocaleString()}</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide">Watch Hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" bg="bg-green-500/10 border-green-500/30" sub={`${paidOrders.length} paid orders`} />
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" />
              <StatCard label="Active Listings" value={listings.filter(l => l.status === "active").length} icon={Package} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" sub={`${totalListingViews.toLocaleString()} views`} />
              <StatCard label="Watch Hours" value={totalWatchHours.toLocaleString()} icon={Clock} color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/30" sub="From listing stay time" />
            </div>
            {admin && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Tier 1 Subs" value={tier1Subs.length} icon={Star} color="text-yellow-400" bg="bg-yellow-500/10 border-yellow-500/30" sub={`$${tier1Revenue}/mo`} />
                <StatCard label="Listing Views" value={totalListingViews.toLocaleString()} icon={Eye} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" />
              </div>
            )}

            {revenueChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Revenue by Month ($)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#22c55e" }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {revenueChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {statusData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Orders by Status</h3>
                <div className="flex flex-wrap gap-3">
                  {statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-300 text-xs capitalize">{s.name}</span>
                      <span className="text-white font-black text-xs">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DAILY REWARDS EARNINGS ── */}
        {tab === "daily rewards" && (() => {
          const DAILY_RATE = 0.01; // $0.01 per day
          const TARGET = 1.00;    // $1.00 goal
          const earned = parseFloat((dailyData.totalDays * DAILY_RATE).toFixed(2));
          const progress = Math.min(100, (earned / TARGET) * 100);
          const daysToGoal = Math.max(0, Math.ceil((TARGET - earned) / DAILY_RATE));
          const canClaimToday = !dailyData.lastClaim || new Date(dailyData.lastClaim).toDateString() !== new Date().toDateString();
          const projectedDate = new Date();
          projectedDate.setDate(projectedDate.getDate() + daysToGoal);

          return (
            <div className="space-y-5">
              {/* Hero card */}
              <div className="rounded-3xl p-6 border border-green-500/30 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,163,74,0.06))" }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #22c55e, transparent)", transform: "translate(30%, -30%)" }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-xl">$1.00 Daily Reward Goal</h2>
                      <p className="text-gray-400 text-sm">Earn $0.01 every day you log in and claim your reward</p>
                    </div>
                  </div>

                  {/* Big progress number */}
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-green-400 font-black" style={{ fontSize: "3.5rem", lineHeight: 1 }}>
                      ${earned.toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-xl font-bold mb-2">/ $1.00</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-4 bg-gray-800 rounded-full mb-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: "linear-gradient(90deg, #22c55e, #16a34a, #86efac)" }}
                    >
                      <div className="absolute inset-0 opacity-40"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 2s infinite" }} />
                    </motion.div>
                  </div>
                  <style>{`@keyframes shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }`}</style>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{progress.toFixed(1)}% complete</span>
                    <span className="text-green-300 font-bold">{daysToGoal > 0 ? `${daysToGoal} days to go` : "🎉 Goal Reached!"}</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                  <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-white font-black text-2xl">{dailyData.streak}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Day Streak</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                  <Gift className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-black text-2xl">{dailyData.totalDays}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Days Claimed</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-black text-2xl">${earned.toFixed(2)}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Earned (USD)</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                  <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white font-black text-2xl">{daysToGoal}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Days to $1</p>
                </div>
              </div>

              {/* Milestone timeline */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-black mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Earnings Milestones
                </h3>
                <div className="space-y-3">
                  {[
                    { days: 10, amount: 0.10, label: "First Dime" },
                    { days: 25, amount: 0.25, label: "Quarter Dollar" },
                    { days: 50, amount: 0.50, label: "Half Dollar" },
                    { days: 75, amount: 0.75, label: "Three Quarters" },
                    { days: 100, amount: 1.00, label: "🎉 Full Dollar Goal!" },
                  ].map(m => {
                    const reached = dailyData.totalDays >= m.days;
                    const isCurrent = !reached && dailyData.totalDays < m.days;
                    return (
                      <div key={m.days} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${reached ? "bg-green-900/20 border border-green-700/40" : "bg-gray-800/50 border border-gray-700/30"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${reached ? "bg-green-500" : "bg-gray-700"}`}>
                          {reached ? <span className="text-white text-sm">✓</span> : <span className="text-gray-500 text-xs font-bold">{m.days}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${reached ? "text-green-300" : "text-gray-400"}`}>{m.label}</p>
                          <p className="text-gray-600 text-xs">{m.days} days → ${m.amount.toFixed(2)}</p>
                        </div>
                        <span className={`font-black text-sm ${reached ? "text-green-400" : "text-gray-600"}`}>${m.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              {canClaimToday && (
                <div className="bg-purple-900/20 border border-purple-600/40 rounded-2xl p-5 text-center">
                  <Gift className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <p className="text-white font-black text-lg mb-1">You haven't claimed today's reward yet!</p>
                  <p className="text-gray-400 text-sm mb-4">Claim now to earn your daily $0.01 and keep your streak alive.</p>
                  <button
                    onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-8 py-3.5 rounded-xl font-black text-white text-base"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 24px rgba(124,58,237,0.5)" }}
                  >
                    🎁 Claim Today's +$0.01
                  </button>
                  <p className="text-gray-600 text-xs mt-3">Use the Rewards button (top right) to claim your daily reward</p>
                </div>
              )}

              {!canClaimToday && (
                <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-4 text-center">
                  <p className="text-green-400 font-black">✅ Today's $0.01 claimed! Come back tomorrow.</p>
                  {daysToGoal > 0 && (
                    <p className="text-gray-500 text-sm mt-1">Projected $1.00 goal: {projectedDate.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</p>
                  )}
                </div>
              )}

              {earned >= 1.00 && (
                <div className="rounded-2xl p-6 text-center border-2 border-yellow-500/60"
                  style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(239,68,68,0.1))", boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}>
                  <p className="text-5xl mb-3">🎉</p>
                  <p className="text-yellow-400 font-black text-2xl mb-1">$1.00 Goal Reached!</p>
                  <p className="text-gray-300 text-sm">Your payout request is being processed. Make sure your PayPal email is set in your profile settings.</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-bold">All Orders</h3>
              <span className="text-gray-500 text-xs">{orders.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>{["Listing", "Buyer", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {orders.slice(0, 50).map(o => (
                    <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-white text-xs font-medium max-w-[150px] truncate">{o.listing_title || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{o.buyer_email || "—"}</td>
                      <td className="px-4 py-3 text-green-400 font-black text-xs">${(o.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.payment_status === "paid" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                          {o.payment_status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No orders yet</p>}
            </div>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {tab === "listings" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-bold">Top Earning Listings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>{["Listing", "Price", "Views", "Revenue", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {listingRevenue.map(l => (
                    <tr key={l.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <a href={`/listing?id=${l.id}`} className="flex items-center gap-2 text-white font-medium text-xs hover:text-purple-300 transition-colors">
                          {l.title} <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-purple-400 font-bold text-xs">${(l.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-blue-400 text-xs">{(l.views || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-400 font-black text-xs">${l.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${l.status === "active" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listingRevenue.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No listings yet</p>}
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTIONS (admin) ── */}
        {tab === "subscriptions" && admin && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Active Tier 1" value={tier1Subs.length} icon={Star} color="text-yellow-400" bg="bg-yellow-500/10 border-yellow-500/30" />
              <StatCard label="Monthly Revenue" value={`$${tier1Revenue}`} icon={DollarSign} color="text-green-400" bg="bg-green-500/10 border-green-500/30" />
              <StatCard label="Annual Projection" value={`$${tier1Revenue * 12}`} icon={TrendingUp} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Active Tier 1 Subscribers</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>{["User", "Username", "Amount", "Start Date", "Expires"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {tier1Subs.map(s => (
                      <tr key={s.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-300 text-xs">{s.user_email}</td>
                        <td className="px-4 py-3 text-purple-400 font-bold text-xs">@{s.username || "—"}</td>
                        <td className="px-4 py-3 text-green-400 font-black text-xs">${s.amount || 1}/mo</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-yellow-400 text-xs">{s.expiry_date ? new Date(s.expiry_date).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tier1Subs.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No active subscribers</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}