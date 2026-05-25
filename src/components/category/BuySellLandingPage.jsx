import React, { useState, useEffect } from "react";
import SubcategoryCards from "./SubcategoryCards";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES, isAdmin } from "@/lib/constants";
import ListingImageSlider from "@/components/listings/ListingImageSlider";

const buySellCat = CATEGORIES.find(c => c.id === "buy_sell");

const SUBCATEGORY_GROUPS = [
  {
    label: "Game Accounts",
    icon: "🎮",
    color: "from-purple-900/40 to-purple-950",
    border: "border-purple-500/30",
    subs: ["Game Accounts - Mobile", "Game Accounts - PC", "Game Accounts - Console"],
  },
  {
    label: "Items & Cosmetics",
    icon: "💎",
    color: "from-blue-900/40 to-blue-950",
    border: "border-blue-500/30",
    subs: ["In-Game Items", "Skins & Cosmetics", "Gift Cards & Vouchers", "Game Keys / Codes"],
  },
  {
    label: "Gaming Gear",
    icon: "🖥️",
    color: "from-pink-900/40 to-pink-950",
    border: "border-pink-500/30",
    subs: ["Gaming Gear - Keyboards", "Gaming Gear - Mice", "Gaming Gear - Monitors", "Gaming Gear - Headsets", "Gaming Gear - Controllers", "Gaming Gear - Chairs", "Gaming PCs & Laptops", "Console Hardware"],
  },
  {
    label: "Premium Mods",
    icon: "⭐",
    color: "from-yellow-900/40 to-yellow-950",
    border: "border-yellow-500/30",
    subs: ["Premium Mods - WWE 2K", "Premium Mods - GTA 5", "Premium Mods - GTA SA", "Premium Mods - FIFA / EA FC", "Premium Mods - PES", "Premium Mods - NBA 2K", "Premium Mods - Football Life", "Premium Mods - PPSSPP / PSP", "Premium Mods - Minecraft", "Premium Mods - Android", "Premium Mods - PC Titles"],
  },
];

function ListingCard({ listing, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: "0 0 25px rgba(234,179,8,0.2)" }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group cursor-pointer hover:border-yellow-500/30 transition-colors"
    >
      <ListingImageSlider images={listing.images || []} title={listing.title} badge={listing.is_premium ? "PREMIUM" : null} />
      <div className="p-4">
        <p className="text-white font-bold text-sm truncate mb-1">{listing.title}</p>
        <p className="text-gray-500 text-xs line-clamp-2 mb-2">{listing.description || "No description."}</p>
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 font-black text-sm">₱{listing.price?.toLocaleString()}</span>
          {listing.subcategory && (
            <span className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-400 text-[10px]">{listing.subcategory}</span>
          )}
        </div>
        <p className="text-gray-600 text-[10px] mt-1">by {listing.seller_username || "Seller"}</p>
      </div>
    </motion.div>
  );
}

export default function BuySellLandingPage({ user, profile, sub }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState(sub || "all");

  const canPost = user;

  useEffect(() => {
    base44.entities.Listing.filter({ status: "active", category: "buy_sell" }, "-created_date", 80).then(l => {
      setListings(l);
      setLoading(false);
    });
  }, []);

  const filtered = listings.filter(l => {
    const matchSub = activeSub === "all" || l.subcategory === activeSub;
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #12100a 0%, #0a0800 50%, #030712 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(234,179,8,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.6) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <a href="/" className="text-yellow-400 text-sm hover:text-yellow-300 mb-4 flex items-center gap-1">← Back to Home</a>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-black uppercase">Marketplace</span>
            <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-black uppercase">Buy · Sell · Trade</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Buy & <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Sell</span>
          </h1>
          <p className="text-yellow-200/60 text-base max-w-xl">Trade game accounts, in-game items, skins, gaming gear, gift cards and premium mods.</p>
        </div>
      </div>

      <SubcategoryCards cat="buy_sell" categoryName="Buy & Sell" />

      {/* Filters */}
      <div className="bg-gray-950 border-b border-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button onClick={() => setActiveSub("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeSub === "all" ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
              All
            </button>
            {buySellCat?.subcategories.map(s => (
              <a key={s} href={`/category?cat=buy_sell&sub=${encodeURIComponent(s)}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${activeSub === s ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-6 items-center justify-between">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..."
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
          </div>
          {canPost && (
            <a href="/create-listing?cat=buy_sell" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-sm hover:opacity-90 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Listing
            </a>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-4">{filtered.length} listings</p>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 font-bold">No listings in this category yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to list something!</p>
            {canPost && <a href="/create-listing?cat=buy_sell" className="mt-4 inline-block px-6 py-3 rounded-xl bg-yellow-600 text-white font-bold text-sm">Add Listing</a>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}