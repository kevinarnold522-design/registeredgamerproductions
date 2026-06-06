import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingBag, Star, Download, Eye, BarChart2, Package, Clock, ArrowUpRight } from "lucide-react";
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
          {["overview", "orders", "listings", ...(admin ? ["subscriptions"] : [])].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${tab === t ? "text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
              style={tab === t ? { background: "linear-gradient(135deg, #22c55e, #16a34a)" } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" bg="bg-green-500/10 border-green-500/30" sub={`${paidOrders.length} paid orders`} />
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" />
              <StatCard label="Active Listings" value={listings.filter(l => l.status === "active").length} icon={Package} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" sub={`${totalListingViews.toLocaleString()} views`} />
              {admin
                ? <StatCard label="Tier 1 Subs" value={tier1Subs.length} icon={Star} color="text-yellow-400" bg="bg-yellow-500/10 border-yellow-500/30" sub={`$${tier1Revenue}/mo`} />
                : <StatCard label="Listing Views" value={totalListingViews.toLocaleString()} icon={Eye} color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/30" />
              }
            </div>

            {revenueChartData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Revenue by Month (₱)
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
                      <td className="px-4 py-3 text-green-400 font-black text-xs">₱{(o.amount || 0).toLocaleString()}</td>
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
                      <td className="px-4 py-3 text-purple-400 font-bold text-xs">₱{(l.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-blue-400 text-xs">{(l.views || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-400 font-black text-xs">₱{l.revenue.toLocaleString()}</td>
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