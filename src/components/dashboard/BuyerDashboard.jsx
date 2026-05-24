import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, ClipboardList, Settings, User, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BuyerDashboard({ user, profile }) {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl overflow-hidden">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">{profile?.username || user?.full_name}</h1>
          <p className="text-blue-400 text-sm font-semibold">👤 Regular Account</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-blue-500/20 border border-blue-500/50 text-blue-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
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

      {tab === "payment" && (
        <div className="max-w-md space-y-4">
          <h3 className="text-white font-bold text-lg mb-4">Saved Payment Methods</h3>
          {[
            { name: "PayPal", icon: "🅿️", color: "border-blue-700/30 bg-blue-900/10" },
            { name: "GCash", icon: "💚", color: "border-green-700/30 bg-green-900/10" },
            { name: "Credit/Debit Card", icon: "💳", color: "border-purple-700/30 bg-purple-900/10" },
            { name: "BDO Online Banking", icon: "🏦", color: "border-yellow-700/30 bg-yellow-900/10" },
          ].map((m) => (
            <div key={m.name} className={`flex items-center justify-between p-4 rounded-2xl border ${m.color}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <p className="text-white font-semibold text-sm">{m.name}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors">Link</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}