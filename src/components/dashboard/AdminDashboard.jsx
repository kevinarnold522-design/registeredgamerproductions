import React, { useState, useEffect } from "react";
import AdminPayPalPanel from "@/components/dashboard/AdminPayPalPanel";
import { motion } from "framer-motion";
import {
  Shield, Users, BarChart2, TrendingUp, DollarSign,
  Store, Eye, Package, CheckCircle, XCircle, AlertCircle,
  MessageSquare, Play, Mail, Trophy
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReviewsTab from "./ReviewsTab";
import VideoManagementTab from "./VideoManagementTab";
import EmailHeaderEditor from "./EmailHeaderEditor";
import LeaderboardTab from "./LeaderboardTab";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import AdminTextEditor from "./AdminTextEditor";
import AdminTransactionsDashboard from "./AdminTransactionsDashboard";
import AdminSubcategoryManager from "./AdminSubcategoryManager";

export default function AdminDashboard({ user, profile }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, listings: 0, orders: 0, revenue: 0, commission: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profiles, listings, orders] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.Listing.list(),
        base44.entities.Order.list(),
      ]);
      const totalRev = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.amount || 0), 0);
      const totalComm = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.commission || 0), 0);
      setAllUsers(profiles);
      setAllListings(listings);
      setAllOrders(orders);
      setPendingVerifications(profiles.filter(p => p.verification_status === "pending"));
      setStats({ users: profiles.length, listings: listings.length, orders: orders.length, revenue: totalRev, commission: totalComm });
      setLoading(false);
    };
    load();
  }, []);

  const approveVerification = async (profileId) => {
    await base44.entities.UserProfile.update(profileId, { verification_status: "approved", is_verified: true });
    setPendingVerifications(prev => prev.filter(p => p.id !== profileId));
  };

  const rejectVerification = async (profileId) => {
    await base44.entities.UserProfile.update(profileId, { verification_status: "rejected" });
    setPendingVerifications(prev => prev.filter(p => p.id !== profileId));
  };

  const removeListing = async (listingId) => {
    await base44.entities.Listing.update(listingId, { status: "removed" });
    setAllListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "removed" } : l));
  };

  const totalModDownloads = allListings
    .filter(l => l.category === "modding")
    .reduce((s, l) => s + (l.views || 0), 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "listings", label: "Listings", icon: Store },
    { id: "orders", label: "Orders", icon: Package },
    { id: "verifications", label: `Verifications${pendingVerifications.length > 0 ? ` (${pendingVerifications.length})` : ""}`, icon: CheckCircle },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "videos", label: "Videos", icon: Play },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "transactions", label: "💰 Transactions", icon: DollarSign },
    { id: "payment", label: "💳 Payment Account", icon: Shield },
    { id: "subcategories", label: "📂 Subcategories", icon: Store },
    { id: "site_text", label: "Site Text", icon: Shield },
    { id: "email_settings", label: "Email Settings", icon: Mail },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <GamerCheckmark accountType="admin" isVerified={true} userEmail={user?.email} size="lg" />
          </div>
          <p className="text-yellow-400 text-sm font-semibold">👑 CEO & President · GAMER Productions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 bg-gray-950 sticky top-16 z-30 py-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div>
          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">LIVE DATA — Real-time platform stats</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Registered Users", value: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
              { label: "Active Listings", value: stats.listings, icon: Store, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
              { label: "Total Orders", value: stats.orders, icon: Package, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
              { label: "Total Revenue", value: `₱${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
              { label: "Commission (10%)", value: `₱${stats.commission.toLocaleString()}`, icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
              { label: "Mod Downloads", value: totalModDownloads, icon: BarChart2, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`rounded-2xl p-4 border ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-bold">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    {["Buyer", "Item", "Amount", "Commission", "Status", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allOrders.slice(0, 10).map((o) => (
                    <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-300 text-xs">{o.buyer_email}</td>
                      <td className="px-4 py-3 text-white text-xs font-medium">{o.listing_title}</td>
                      <td className="px-4 py-3 text-green-400 font-bold">₱{o.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-yellow-400 font-bold">₱{o.commission?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">All Users ({allUsers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {["Username", "Email", "Type", "Payment", "Verified", "Revenue", "Joined"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white font-semibold text-xs">{u.username}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.user_email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.account_type === "business" ? "bg-green-900/50 text-green-400" : u.account_type === "digital_creator" ? "bg-purple-900/50 text-purple-400" : "bg-blue-900/50 text-blue-400"}`}>
                        {u.account_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.paypal_email ? (
                        <div className="flex flex-col">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-400 w-fit mb-1">
                            🅿️ PayPal Connected
                          </span>
                          <span className="text-gray-500 text-[10px] truncate max-w-[150px]">{u.paypal_email}</span>
                        </div>
                      ) : u.payout_method === "stripe" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-400">
                          💳 Stripe
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Not connected</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.is_verified ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-gray-600" />}
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-bold">₱{(u.total_revenue || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.joined_date ? new Date(u.joined_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listings */}
      {tab === "listings" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-bold">All Listings ({allListings.length})</h3>
            <a href="/create-listing" className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors">+ Add Listing</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {["Title", "Seller", "Category", "Price", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allListings.map((l) => (
                  <tr key={l.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white font-semibold text-xs max-w-[160px] truncate">{l.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{l.seller_username || l.seller_email}</td>
                    <td className="px-4 py-3 text-purple-400 text-xs">{l.category}</td>
                    <td className="px-4 py-3 text-green-400 font-bold">₱{l.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${l.status === "active" ? "bg-green-900/50 text-green-400" : l.status === "sold" ? "bg-blue-900/50 text-blue-400" : "bg-red-900/50 text-red-400"}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <a href={`/create-listing?edit=${l.id}`} className="text-purple-400 hover:text-purple-300 text-xs font-semibold">Edit</a>
                      {l.status !== "removed" && (
                        <button onClick={() => removeListing(l.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews */}
      {tab === "reviews" && <ReviewsTab />}

      {/* Videos */}
      {tab === "videos" && <VideoManagementTab />}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <LeaderboardTab />
        </div>
      )}

      {/* Site Text Editor */}
      {tab === "site_text" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <AdminTextEditor />
        </div>
      )}

      {/* Email Settings */}
      {tab === "email_settings" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <EmailHeaderEditor />
        </div>
      )}

      {/* Subcategory Manager */}
      {tab === "subcategories" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <AdminSubcategoryManager />
        </div>
      )}

      {/* Admin Payment Account */}
      {tab === "payment" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <AdminPayPalPanel />
        </div>
      )}

      {/* Global Transactions */}
      {tab === "transactions" && (
        <AdminTransactionsDashboard user={user} />
      )}

      {/* Orders full tab */}
      {tab === "orders" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">All Orders ({allOrders.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>{["Buyer","Seller","Item","Amount","Commission","Payment","Order","Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {allOrders.map(o => (
                  <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-300 text-xs">{o.buyer_email}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{o.seller_email}</td>
                    <td className="px-4 py-3 text-white text-xs font-medium max-w-[120px] truncate">{o.listing_title}</td>
                    <td className="px-4 py-3 text-green-400 font-bold text-xs">₱{o.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-yellow-400 font-bold text-xs">₱{o.commission?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>{o.payment_status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.order_status === "completed" ? "bg-blue-900/50 text-blue-400" : "bg-gray-800 text-gray-400"}`}>{o.order_status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verifications */}
      {tab === "verifications" && (
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Pending Verifications ({pendingVerifications.length})</h3>
          {pendingVerifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">No pending verifications</div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {pendingVerifications.map((p) => (
              <div key={p.id} className="bg-gray-900 rounded-2xl border border-yellow-700/30 p-5">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{p.username}</p>
                    <p className="text-gray-400 text-xs">{p.user_email}</p>
                    <span className={`text-xs font-semibold ${p.account_type === "business" ? "text-green-400" : "text-purple-400"}`}>{p.account_type}</span>
                  </div>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                {p.verification_docs?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs mb-1">Submitted Documents:</p>
                    <div className="flex gap-2 flex-wrap">
                      {p.verification_docs.map((doc, i) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-purple-400 underline">Doc {i + 1}</a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => approveVerification(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-900/40 border border-green-700/50 text-green-400 text-sm font-semibold hover:bg-green-900/60 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => rejectVerification(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-900/40 border border-red-700/50 text-red-400 text-sm font-semibold hover:bg-red-900/60 transition-colors">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}