import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { ArrowLeft, Eye, Plus, Search } from "lucide-react";

export default function ListingsLanding({ mode = "mine" }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      setProfile(profiles[0] || null);
      const rows = mode === "all" ? await base44.entities.Listing.filter({ status: "active" }, "-created_date", 200) : await base44.entities.Listing.filter({ seller_email: me.email }, "-created_date", 200);
      setItems(rows.filter(x => x.is_approved !== false));
      setLoading(false);
    };
    load();
  }, [mode]);

  const filtered = items.filter(l => !q || `${l.title || ""} ${l.description || ""} ${l.category || ""}`.toLowerCase().includes(q.toLowerCase()));

  return <div className="min-h-screen bg-gray-950 text-white"><AuthNavbar user={user} profile={profile} /><main className="pt-20 max-w-7xl mx-auto px-4 pb-12"><button onClick={() => history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back</button><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"><div><p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Standalone Page</p><h1 className="text-3xl font-black">{mode === "all" ? "All Listings" : "My Listings"}</h1><p className="text-gray-500 text-sm">Only listing data appears here.</p></div><div className="flex gap-2"><div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"><Search className="w-4 h-4 text-gray-500" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search listings..." className="bg-transparent outline-none text-sm text-white w-36" /></div><a href="/create-listing" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 text-white text-sm font-bold"><Plus className="w-4 h-4" /> Post</a></div></div>{loading ? <div className="py-16 text-center text-gray-500">Loading listings...</div> : <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">{filtered.map(l => <a key={l.id} href={`/listing?id=${l.id}`} className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-purple-500/50 transition-all"><div className="aspect-square bg-gray-800 relative flex items-center justify-center text-4xl">{l.images?.[0] ? <img src={l.images[0]} className="w-full h-full object-cover" /> : "🎮"}<span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-cyan-300 text-[10px] font-bold"><Eye className="w-3 h-3" />{(l.views || 0).toLocaleString()}</span></div><div className="p-3"><p className="font-bold text-sm truncate">{l.title}</p><p className="text-purple-300 text-xs font-black">{!l.price || l.is_free ? "FREE" : `₱${l.price.toLocaleString()}`}</p></div></a>)}</div>}</main></div>;
}