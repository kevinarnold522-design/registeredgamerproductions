import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ClipboardList, User, Link2, Youtube, LogOut, Settings, Flame, DollarSign, Sparkles, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CreatorVideoTools from "./CreatorVideoTools";
import LinkShortenerDashboard from "./LinkShortenerDashboard";
import StreakTracker from "@/components/rewards/StreakTracker";
import YoutubeConnectHighlight from "@/components/social/YoutubeConnectHighlight";
import MonetizationHighlights from "@/components/monetization/MonetizationHighlights";
import AccountTypeTransitionModal from "@/components/account/AccountTypeTransitionModal";
import PaymentBillingSettings from "./PaymentBillingSettings";


export default function BuyerDashboard({ user, profile }) {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => { setLocalProfile(profile); }, [profile]);

  useEffect(() => {
    const load = async () => {
      const [myOrders, myFavs] = await Promise.all([
        base44.entities.Order.filter({ buyer_email: user.email }),
        base44.entities.Favorite.filter({ user_email: user.email }),
      ]);
      setOrders(myOrders);
      setFavorites(myFavs);
      setLoading(false);
    };
    load();
  }, [user.email]);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders & History", icon: ClipboardList },
    { id: "favorites", label: "Favourites", icon: Heart },
    { id: "rewards", label: "🔥 Daily Streak", icon: Flame },
    { id: "earn", label: "💰 Earn Money", icon: DollarSign },
    { id: "links", label: "🔗 Link Shortener", icon: Link2 },
    { id: "videos", label: "📹 Share Videos", icon: Youtube },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Vertical Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col py-6 px-3 sticky top-0 h-screen overflow-y-auto hidden md:flex z-20">
        {/* User info */}
        <div className="flex flex-col items-center text-center gap-2 mb-6 px-2">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">{profile?.username || user?.full_name}</p>
            <p className="text-blue-400 text-[10px] font-semibold mt-0.5">👤 Regular Account</p>
            <p className="text-gray-500 text-[9px] truncate max-w-[130px]">{user?.email}</p>
            <button onClick={() => setShowTransition(true)} className="mt-1.5 flex items-center justify-center gap-1 w-full px-2 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-bold transition-all hover:opacity-90">
              <Sparkles className="w-2.5 h-2.5" /> Become Creator
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${tab === t.id ? "bg-blue-500/20 border border-blue-500/40 text-blue-300" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              <t.icon className="w-4 h-4 shrink-0" />{t.label}
            </button>
          ))}
        </nav>

        <button onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm font-semibold hover:bg-red-900/40 transition-colors mt-4">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Mobile horizontal tabs */}
      <div className="md:hidden w-full absolute top-16 left-0 z-20 bg-gray-950 border-b border-gray-800 px-3 py-2 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-blue-500/20 border border-blue-500/50 text-blue-300" : "bg-gray-900 border border-gray-800 text-gray-400"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:pt-8 pt-20 bg-gray-950">
        <div className="max-w-4xl">

      {tab === "overview" && (
        <div>
          <YoutubeConnectHighlight profile={profile} user={user} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: orders.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
            { label: "Favourites", value: favorites.length, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
            { label: "Total Spent", value: `₱${orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.amount || 0), 0).toLocaleString()}`, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-5 border ${s.bg}`}>
              <p className="text-gray-400 text-xs mb-2">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
          </div>
          <div className="mt-6">
            <StreakTracker userEmail={user?.email} />
          </div>
        </div>
      )}

      {tab === "rewards" && (
        <div className="max-w-lg">
          <h3 className="text-white font-black text-lg mb-4">Daily Login Streak 🔥</h3>
          <StreakTracker userEmail={user?.email} />
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h4 className="text-white font-bold mb-2">How it works</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>🔥 Log in every day to build your streak</li>
              <li>📅 365 consecutive days = <strong className="text-yellow-400">$10 cash reward</strong></li>
              <li>❌ Missing one day resets your streak to 0</li>
              <li>🏆 Longest streak is always saved</li>
            </ul>
          </div>
        </div>
      )}

      {tab === "earn" && (
        <div>
          <h3 className="text-white font-black text-lg mb-4">Ways to Earn 💰</h3>
          <MonetizationHighlights />
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Purchase History</h3></div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No orders yet. Start shopping!</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>{["Item", "Amount", "Status", "Date"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-800">
                    <td className="px-4 py-3 text-white text-sm font-medium">{o.listing_title}</td>
                    <td className="px-4 py-3 text-green-400 font-bold">₱{o.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>{o.payment_status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "favorites" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.length === 0 ? <p className="text-gray-500 col-span-full text-center py-12">No favourites yet</p> : favorites.map((f) => (
            <div key={f.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {f.listing_image && <img src={f.listing_image} alt="" className="w-full h-40 object-cover" />}
              <div className="p-4">
                <p className="text-white font-bold truncate">{f.listing_title}</p>
                <p className="text-pink-400 font-black mt-1">₱{f.price?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "videos" && (
        <CreatorVideoTools user={user} profile={profile} />
      )}

      {tab === "links" && (
        <LinkShortenerDashboard user={user} />
      )}

      {tab === "settings" && (
        <PaymentBillingSettings user={user} profile={localProfile} onProfileUpdate={setLocalProfile} />
      )}

        </div>
      </main>

      {/* Transition Modal */}
      {showTransition && (
        <AccountTypeTransitionModal
          currentType="regular"
          user={user}
          onClose={() => setShowTransition(false)}
          onSuccess={() => {
            setShowTransition(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}