import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { ArrowLeft, Package } from "lucide-react";

export default function OrdersLanding() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      setProfile(profiles[0] || null);
      const rows = await base44.entities.Order.list("-created_date", 200).catch(() => []);
      setOrders(rows.filter(o => [o.buyer_email, o.user_email, o.customer_email, o.seller_email].includes(me.email)));
      setLoading(false);
    };
    load();
  }, []);

  return <div className="min-h-screen bg-gray-950 text-white"><AuthNavbar user={user} profile={profile} /><main className="pt-20 max-w-5xl mx-auto px-4 pb-12"><button onClick={() => history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back</button><p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Standalone Page</p><h1 className="text-3xl font-black mb-2">Orders</h1><p className="text-gray-500 text-sm mb-6">Only order data appears here.</p>{loading ? <div className="py-16 text-center text-gray-500">Loading orders...</div> : orders.length === 0 ? <div className="py-20 text-center bg-gray-900 rounded-3xl border border-gray-800"><Package className="w-12 h-12 mx-auto text-gray-700 mb-3" /><p className="text-gray-400 font-bold">No orders yet</p></div> : <div className="space-y-3">{orders.map(o => <div key={o.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800"><p className="font-bold">{o.listing_title || o.title || `Order ${o.id}`}</p><p className="text-gray-500 text-xs mt-1">{o.status || "pending"} · {new Date(o.created_date).toLocaleString()}</p></div>)}</div>}</main></div>;
}