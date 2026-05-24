import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORY_META = {
  jobs: {
    title: "Gaming Jobs",
    subtitle: "Find gaming industry jobs — QA, Dev, Coaching, Content & more.",
    color: "#f87171",
    bg: "from-rose-950 to-gray-950",
    grid: "linear-gradient(rgba(248,113,113,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,113,113,0.5) 1px, transparent 1px)",
    accent: "rose",
  },
  services: {
    title: "Services",
    subtitle: "PC Repair, Custom Builds, Coaching, Boosting, Design & Mod Installation.",
    color: "#818cf8",
    bg: "from-indigo-950 to-gray-950",
    grid: "linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)",
    accent: "indigo",
  },
  livestream: {
    title: "Live Streams",
    subtitle: "Watch live gaming events and go live yourself.",
    color: "#f87171",
    bg: "from-red-950 to-gray-950",
    grid: "linear-gradient(rgba(239,68,68,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.5) 1px, transparent 1px)",
    accent: "red",
  },
};

export default function GenericCategoryPage({ user, profile, cat, sub, categoryData }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState(sub || "all");
  const meta = CATEGORY_META[cat] || CATEGORY_META.services;
  const canPost = user;

  useEffect(() => {
    base44.entities.Listing.filter({ status: "active", category: cat }, "-created_date", 60).then(l => {
      setListings(l);
      setLoading(false);
    });
  }, [cat]);

  const filtered = listings.filter(l => {
    const matchSub = activeSub === "all" || l.subcategory === activeSub;
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  if (cat === "livestream") {
    return (
      <div className="min-h-screen">
        <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #0f0000, #030712)" }}>
          <div className="max-w-7xl mx-auto relative z-10">
            <a href="/" className="text-red-400 text-sm hover:text-red-300 mb-4 flex items-center gap-1">← Back to Home</a>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Live <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Streams</span>
            </h1>
            <p className="text-red-200/60 text-base mb-6">Watch and go live on GAMER Productions.</p>
            <div className="flex gap-4">
              <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:opacity-90">Watch on Twitch</a>
              <a href="https://youtube.com/live" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:opacity-90">YouTube Live</a>
              <a href="https://facebook.com/gaming" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:opacity-90">FB Gaming</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Radio className="w-16 h-16 mx-auto text-red-500 animate-pulse mb-4" />
          <p className="text-white font-black text-2xl mb-2">Live Streaming Coming Soon</p>
          <p className="text-gray-500">Integrated live streaming will be available soon. Connect your stream now!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: `linear-gradient(135deg, #060008, #030712)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: meta.grid, backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <a href="/" className="text-sm hover:opacity-80 mb-4 flex items-center gap-1" style={{ color: meta.color }}>← Back to Home</a>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{meta.title}</h1>
          <p className="max-w-xl mb-1 text-base" style={{ color: `${meta.color}99` }}>{meta.subtitle}</p>
        </div>
      </div>

      {/* Subcategory tabs */}
      {categoryData?.subcategories?.length > 0 && (
        <div className="bg-gray-950 border-b border-gray-800 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button onClick={() => setActiveSub("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeSub === "all" ? "bg-gray-700 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                All
              </button>
              {categoryData.subcategories.map(s => (
                <button key={s} onClick={() => setActiveSub(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${activeSub === s ? "bg-gray-700 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-6 items-center justify-between">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${meta.title}...`}
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
          </div>
          {canPost && (
            <a href={`/create-listing?cat=${cat}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/30 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Listing
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-xl font-bold mb-2 text-gray-400">No listings yet</p>
            <p className="text-sm">Be the first to add one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-purple-500/30 transition-colors">
                {l.images?.[0] && (
                  <div className="h-36 overflow-hidden">
                    <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-white font-bold text-sm truncate">{l.title}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{l.description}</p>
                  <p className="text-purple-400 font-black mt-2">₱{l.price?.toLocaleString()}</p>
                  {l.subcategory && <span className="px-2 py-0.5 mt-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] inline-block">{l.subcategory}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}