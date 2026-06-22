import React, { useState, useEffect, useCallback } from "react";
import AdminPayPalPanel from "@/components/dashboard/AdminPayPalPanel";
import { motion } from "framer-motion";
import {
  Shield, Users, BarChart2, TrendingUp, DollarSign,
  Store, Eye, Package, CheckCircle, XCircle, AlertCircle,
  MessageSquare, Play, Mail, Trophy, Trash2
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
import AdvancedAnalytics from "./AdvancedAnalytics";
import AdminVisitorAnalytics from "./AdminVisitorAnalytics";
import AdminUserLogs from "./AdminUserLogs";
import FeedbackDashboard from "./FeedbackDashboard";
import AdRevenueDashboard from "./AdRevenueDashboard";
import ManagedAccountsPanel from "@/components/admin/ManagedAccountsPanel";
import CategoryStyleEditor from "@/components/admin/CategoryStyleEditor";
import AdminGamesPanel from "@/components/dashboard/AdminGamesPanel";
import AdminAdManager from "@/components/admin/AdminAdManager";
import { Gamepad2, Megaphone } from "lucide-react";

export default function AdminDashboard({ user, profile }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, listings: 0, orders: 0, revenue: 0, commission: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [feedbacks_count, setFeedbacksCount] = useState(0);
  const [transferTargets, setTransferTargets] = useState({});
  const [loading, setLoading] = useState(true);

  // Recompute stats whenever the user/listing/order lists change so the
  // overview cards always reflect the live data.
  const recomputeStats = useCallback((profiles, listings, orders) => {
    const totalRev = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.amount || 0), 0);
    const totalComm = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.commission || 0), 0);
    const totalViews = listings.reduce((s, l) => s + (Number(l.views) || 0), 0);
    const totalDownloads = listings.reduce((s, l) => s + (Number(l.downloads) || 0), 0);
    const ghostAccounts = profiles.filter(p => p.is_managed_account === true).length;
    setStats({
      users: profiles.length,
      ghostAccounts,
      regularUsers: profiles.length - ghostAccounts,
      listings: listings.length,
      orders: orders.length,
      revenue: totalRev,
      commission: totalComm,
      views: totalViews,
      downloads: totalDownloads,
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [profiles, listings, orders, feedbackList] = await Promise.all([
        base44.entities.UserProfile.list("-created_date", 1000),
        base44.entities.Listing.list("-created_date", 1000),
        base44.entities.Order.list("-created_date", 1000),
        base44.entities.Feedback.filter({ status: "new" }),
      ]);
      if (!mounted) return;
      setFeedbacksCount(feedbackList.length);
      setAllUsers(profiles);
      setAllListings(listings);
      setAllOrders(orders);
      setPendingVerifications(profiles.filter(p => p.verification_status === "pending"));
      recomputeStats(profiles, listings, orders);
      setLoading(false);
    };
    load();

    // Realtime: keep the user list & counts in sync as accounts are created,
    // updated, or removed — no manual refresh needed.
    const applyUserEvent = (event) => {
      setAllUsers((prev) => {
        let next = prev;
        if (event.type === "delete") {
          next = prev.filter((u) => u.id !== event.data?.id && u.id !== event.id);
        } else if (event.type === "create") {
          if (!prev.some((u) => u.id === event.data?.id)) next = [event.data, ...prev];
        } else if (event.type === "update") {
          next = prev.map((u) => (u.id === event.data?.id ? { ...u, ...event.data } : u));
        }
        setPendingVerifications(next.filter((p) => p.verification_status === "pending"));
        setStats((s) => {
          const ghostAccounts = next.filter((p) => p.is_managed_account === true).length;
          return { ...s, users: next.length, ghostAccounts, regularUsers: next.length - ghostAccounts };
        });
        return next;
      });
    };

    let unsub = () => {};
    try {
      unsub = base44.entities.UserProfile.subscribe(applyUserEvent);
    } catch (_) {}

    return () => { mounted = false; try { unsub(); } catch (_) {} };
  }, [recomputeStats]);

  const approveVerification = async (profileId) => {
    await base44.entities.UserProfile.update(profileId, { verification_status: "approved", is_verified: true });
    setPendingVerifications(prev => prev.filter(p => p.id !== profileId));
  };

  const rejectVerification = async (profileId) => {
    await base44.entities.UserProfile.update(profileId, { verification_status: "rejected" });
    setPendingVerifications(prev => prev.filter(p => p.id !== profileId));
  };

  const removeListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing and its files?")) return;
    await base44.functions.invoke("deleteListingPermanent", { listing_id: listingId });
    setAllListings(prev => prev.filter(l => l.id !== listingId));
  };

  const transferListingOwner = async (listing) => {
    const targetEmail = transferTargets[listing.id];
    const targetUser = allUsers.find(u => u.user_email === targetEmail);
    if (!targetUser) return;
    const sellerUsername = targetUser.username || targetUser.display_name || targetUser.user_email?.split("@")[0] || "Gamer";
    await base44.entities.Listing.update(listing.id, {
      seller_email: targetUser.user_email,
      seller_username: sellerUsername,
    });
    setAllListings(prev => prev.map(item => item.id === listing.id ? { ...item, seller_email: targetUser.user_email, seller_username: sellerUsername } : item));
    setTransferTargets(prev => ({ ...prev, [listing.id]: "" }));
  };

  const toggleVerifiedBadge = async (profileId, currentValue) => {
    await base44.entities.UserProfile.update(profileId, { is_verified: !currentValue });
    setAllUsers(prev => prev.map(u => u.id === profileId ? { ...u, is_verified: !currentValue } : u));
  };

  const toggleNoAds = async (profileId, currentValue) => {
    await base44.entities.UserProfile.update(profileId, { no_ads: !currentValue });
    setAllUsers(prev => prev.map(u => u.id === profileId ? { ...u, no_ads: !currentValue } : u));
  };

  const togglePageEditor = async (profileId, currentValue) => {
    await base44.entities.UserProfile.update(profileId, { page_editor_enabled: !currentValue });
    setAllUsers(prev => prev.map(u => u.id === profileId ? { ...u, page_editor_enabled: !currentValue } : u));
  };

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (u) => { setEditingUser(u.id); setEditForm({ username: u.username, account_type: u.account_type }); };
  const cancelEdit = () => { setEditingUser(null); setEditForm({}); };
  const saveEdit = async (profileId) => {
    await base44.entities.UserProfile.update(profileId, editForm);
    setAllUsers(prev => prev.map(u => u.id === profileId ? { ...u, ...editForm } : u));
    setEditingUser(null);
  };

  const totalModDownloads = allListings
    .filter(l => l.category === "modding" || l.category === "premium_mods")
    .reduce((s, l) => s + (Number(l.downloads) || 0), 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "user_logs", label: "User Logs", icon: Eye },
    { id: "created_accounts", label: "Created Accounts", icon: Users },
    { id: "listings", label: "Listings", icon: Store },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "ads", label: "Ad Scheduler", icon: Megaphone },
    { id: "orders", label: "Orders", icon: Package },
    { id: "verifications", label: `Verifications${pendingVerifications.length > 0 ? ` (${pendingVerifications.length})` : ""}`, icon: CheckCircle },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "videos", label: "Videos", icon: Play },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "transactions", label: "Transactions", icon: DollarSign },
    { id: "payment", label: "Payment Account", icon: Shield },
    { id: "subcategories", label: "Subcategories", icon: Store },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "pending_listings", label: `Pending Review${allListings.filter(l => l.status === "pending").length > 0 ? ` (${allListings.filter(l => l.status === "pending").length})` : ""}`, icon: AlertCircle },
    { id: "feedback", label: `Feedback${feedbacks_count > 0 ? ` (${feedbacks_count})` : ""}`, icon: MessageSquare },
    { id: "site_text", label: "Site Text", icon: Shield },
    { id: "category_design", label: "Category Design", icon: Megaphone },
    { id: "email_settings", label: "Email Settings", icon: Mail },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col md:flex-row">
      <div className="md:hidden sticky top-16 z-30 bg-gray-950 border-b border-gray-800 px-3 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${tab === t.id ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* LEFT: Vertical Sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex-col pt-4 pb-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-black text-xs leading-tight">Admin Panel</p>
              <p className="text-yellow-400 text-[10px]">CEO & President</p>
            </div>
          </div>
          <GamerCheckmark accountType="admin" isVerified={true} userEmail={user?.email} size="sm" />
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors w-full ${tab === t.id ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              <t.icon className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* RIGHT: Content */}
      <div className="flex-1 min-w-0 px-3 sm:px-6 py-5 sm:py-8 overflow-y-auto">

      {/* Overview */}
      {tab === "overview" && (
        <div>
          {/* Ad Revenue at top of overview */}
          <div className="mb-8 bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <AdRevenueDashboard />
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">LIVE DATA — Real-time platform stats</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 mb-8">
            {[
              { label: "Total Users (Live)", value: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", sub: `${stats.regularUsers || 0} regular + ${stats.ghostAccounts || 0} ghost` },
              { label: "Active Listings", value: stats.listings, icon: Store, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
              { label: "Total Views", value: (stats.views || 0).toLocaleString(), icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
              { label: "Downloads", value: (stats.downloads || 0).toLocaleString(), icon: BarChart2, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
              { label: "Total Orders", value: stats.orders, icon: Package, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
              { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
              { label: "Commission (10%)", value: `$${stats.commission.toLocaleString()}`, icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
              { label: "Mod Downloads", value: totalModDownloads.toLocaleString(), icon: BarChart2, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`rounded-2xl p-4 border ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                {s.sub && <p className="text-[9px] text-gray-500 mt-1">{s.sub}</p>}
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
                      <td className="px-4 py-3 text-green-400 font-bold">${o.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-yellow-400 font-bold">${o.commission?.toLocaleString()}</td>
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
            <p className="text-gray-500 text-xs mt-1">Passwords are encrypted by the login provider and cannot be viewed by admins.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {["Username", "Email", "Type", "Payment", "Verified Badge", "No Ads", "Page Editor", "Revenue", "Joined", "Edit"].map(h => (
                   <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white font-semibold text-xs">
                      {editingUser === u.id ? (
                        <input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                          className="bg-gray-800 border border-purple-500 rounded px-2 py-1 text-white text-xs w-28 focus:outline-none" />
                      ) : u.username}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.user_email}</td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <select value={editForm.account_type} onChange={e => setEditForm(f => ({ ...f, account_type: e.target.value }))}
                          className="bg-gray-800 border border-purple-500 rounded px-2 py-1 text-white text-xs focus:outline-none">
                          <option value="regular">regular</option>
                          <option value="digital_creator">digital_creator</option>
                          <option value="business">business</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.account_type === "business" ? "bg-green-900/50 text-green-400" : u.account_type === "digital_creator" ? "bg-purple-900/50 text-purple-400" : "bg-blue-900/50 text-blue-400"}`}>
                          {u.account_type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.paypal_email ? (
                        <div className="flex flex-col">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-400 w-fit mb-1">
                            PayPal Connected
                          </span>
                          <span className="text-gray-500 text-[10px] truncate max-w-[150px]">{u.paypal_email}</span>
                        </div>
                      ) : u.payout_method === "stripe" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-400">
                          Stripe
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Not connected</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVerifiedBadge(u.id, u.is_verified)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${u.is_verified ? "bg-purple-900/40 border border-purple-600/50 text-purple-300 hover:bg-red-900/30 hover:text-red-400 hover:border-red-600/50" : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-purple-900/30 hover:text-purple-300 hover:border-purple-600/50"}`}
                        title={u.is_verified ? "Click to revoke badge" : "Click to grant badge"}
                      >
                        {u.is_verified ? (
                          <><span style={{fontSize:10}}>✓</span> Verified</>
                        ) : (
                          <><span>+</span> Grant Badge</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleNoAds(u.id, u.no_ads)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${u.no_ads ? "bg-green-900/40 border-green-600/50 text-green-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-green-600/50 hover:text-green-300"}`}
                        title="Permanently control whether this account sees ads"
                      >
                        {u.no_ads ? "Ad-free" : "Shows ads"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePageEditor(u.id, u.page_editor_enabled)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${u.page_editor_enabled ? "bg-cyan-900/40 border-cyan-600/50 text-cyan-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-cyan-600/50 hover:text-cyan-300"}`}
                        title="Allow this user to open the listing Page Editor"
                      >
                        {u.page_editor_enabled ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-bold">${(u.total_revenue || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.joined_date ? new Date(u.joined_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => saveEdit(u.id)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-bold">Save</button>
                          <button onClick={cancelEdit} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(u)} className="px-2 py-1 bg-gray-800 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-600/50 text-gray-400 hover:text-purple-300 text-xs rounded font-semibold transition-colors">
                          Edit
                        </button>
                      )}
                    </td>
                    </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Logs */}
      {tab === "user_logs" && <AdminUserLogs users={allUsers} />}

      {/* Created Accounts */}
      {tab === "created_accounts" && (
        <div className="relative">
          <ManagedAccountsPanel />
        </div>
      )}

      {/* Listings */}
      {tab === "listings" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-bold">All Listings ({allListings.length})</h3>
            <a href="/create-listing" className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors">+ Post</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {["Title", "Seller", "Category", "Price", "Status", "Transfer Owner", "Actions"].map(h => (
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
                    <td className="px-4 py-3 text-green-400 font-bold">${l.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${l.status === "active" ? "bg-green-900/50 text-green-400" : l.status === "sold" ? "bg-blue-900/50 text-blue-400" : "bg-red-900/50 text-red-400"}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[220px]">
                        <select
                          value={transferTargets[l.id] || ""}
                          onChange={e => setTransferTargets(prev => ({ ...prev, [l.id]: e.target.value }))}
                          className="min-w-0 flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
                        >
                          <option value="">Select user...</option>
                          {allUsers.map(u => (
                            <option key={u.id} value={u.user_email}>{u.username || u.display_name || u.user_email} · {u.user_email}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => transferListingOwner(l)}
                          disabled={!transferTargets[l.id]}
                          className="px-2 py-1.5 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-bold hover:bg-blue-900/60 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Transfer
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <a href={`/create-listing?edit=${l.id}`} className="text-purple-400 hover:text-purple-300 text-xs font-semibold">Edit</a>
                      {l.status !== "removed" && (
                        <button onClick={() => removeListing(l.id)} className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-semibold"><Trash2 className="w-3 h-3" /> Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Games Management */}
      {tab === "games" && <AdminGamesPanel />}

      {/* Ad Scheduler */}
      {tab === "ads" && <AdminAdManager listings={allListings} />}

      {/* Analytics — combined */}
      {tab === "analytics" && (
        <div className="space-y-8">
          <AdminVisitorAnalytics />
          <AdvancedAnalytics user={user} profile={profile} sellerOnly={false} />
        </div>
      )}

      {/* Pending Listings (AI flagged) */}
      {tab === "pending_listings" && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">AI-Flagged Listings</h3>
              <p className="text-gray-400 text-xs">Listings pending review — flagged by AI for potentially illegal or inappropriate content</p>
            </div>
          </div>
          {allListings.filter(l => l.status === "pending").length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-500/40 mx-auto mb-3" />
              <p className="font-semibold">All clear! No listings pending review.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {allListings.filter(l => l.status === "pending").map(l => (
                <div key={l.id} className="bg-gray-900 rounded-2xl border border-yellow-700/40 p-5 flex items-start gap-4">
                  {l.images?.[0] && <img src={l.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold">{l.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{l.seller_username || l.seller_email} · {l.category} · ${l.price?.toLocaleString()}</p>
                    {l.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{l.description}</p>}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={async () => {
                          await base44.entities.Listing.update(l.id, { status: "active", is_approved: true });
                          setAllListings(prev => prev.map(x => x.id === l.id ? { ...x, status: "active", is_approved: true } : x));
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-900/40 border border-green-700/50 text-green-400 text-xs font-bold hover:bg-green-900/60 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                      </button>
                      <button
                        onClick={async () => {
                          await base44.entities.Listing.update(l.id, { status: "removed", is_approved: false });
                          setAllListings(prev => prev.map(x => x.id === l.id ? { ...x, status: "removed" } : x));
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-700/50 text-red-400 text-xs font-bold hover:bg-red-900/60 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject & Remove
                      </button>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-900/50 text-yellow-400 border border-yellow-700/30 flex-shrink-0">PENDING</span>
                </div>
              ))}
            </div>
          )}
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

      {/* Category Design */}
      {tab === "category_design" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <CategoryStyleEditor />
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

      {/* Feedback Dashboard */}
      {tab === "feedback" && <FeedbackDashboard />}

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
                    <td className="px-4 py-3 text-green-400 font-bold text-xs">${o.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-yellow-400 font-bold text-xs">${o.commission?.toLocaleString()}</td>
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
    </div>
  );
}