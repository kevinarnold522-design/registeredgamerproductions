import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Layers, Gamepad2, DollarSign, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { isServiceListing } from "@/lib/constants";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import { formatListingPrice } from "@/lib/currency";

// Homepage-style premium mod game cards
const PREMIUM_MOD_GAME_CARDS = [
  { id: "NBA 2K", label: "NBA 2K", color: "from-orange-600 to-red-600" },
  { id: "Football Life", label: "Football Life", color: "from-green-600 to-emerald-600" },
  { id: "GTA", label: "GTA", color: "from-yellow-600 to-orange-600" },
  { id: "Assetto Corsa", label: "Assetto Corsa", color: "from-red-600 to-pink-600" },
  { id: "Minecraft", label: "Minecraft", color: "from-emerald-600 to-lime-600" },
  { id: "WWE 2K", label: "WWE 2K", color: "from-purple-600 to-pink-600" },
];

export default function PremiumModsLandingPage({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [game, setGame] = useState("");
  const [priceRange, setPriceRange] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.Listing.filter({ status: "active", category: "premium_mods" }, "-created_date", 80);
        const cleaned = all.filter(l =>
          l.is_approved !== false &&
          l.product_type === "digital" &&
          (l.is_premium || Number(l.price || 0) > 0) &&
          !isServiceListing(l)
        );
        setListings(cleaned);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = listings.filter(l => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase());
    const normalizedGame = game.toLowerCase().replace(/\s+/g, "");
    const games = [l.game_name, l.tool_target_game, l.subcategory, ...(l.subcategories || [])].filter(Boolean).map(v => String(v).toLowerCase().replace(/\s+/g, ""));
    const matchGame = !game || games.some(v => v === normalizedGame || (normalizedGame === "gta" && v.startsWith("gta")));
    let matchPrice = true;
    if (priceRange === "free") matchPrice = l.price === 0 || l.is_free;
    else if (priceRange === "low") matchPrice = l.price > 0 && l.price <= 500;
    else if (priceRange === "mid") matchPrice = l.price > 500 && l.price <= 2000;
    else if (priceRange === "high") matchPrice = l.price > 2000;
    return matchSearch && matchGame && matchPrice;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #2a1a00, #030712)" }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <a href="/" className="text-amber-400 text-sm hover:text-amber-300 mb-4 flex items-center gap-1">← Back to Home</a>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Premium Mods</span> & Paid Content
          </h1>
          <p className="text-amber-200/60 text-base max-w-xl">Premium quality mods for your favorite games.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Sell a Premium Mod — homepage game cards */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h3 className="text-white font-black text-xl">Sell a Premium Mod</h3>
            {user && (
              <Link to="/create-listing?cat=premium_mods" className="text-amber-300 text-sm font-bold hover:text-amber-200">+ Sell a Premium Mod</Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_MOD_GAME_CARDS.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative group cursor-pointer"
              >
                <Link to={`/sub-landing?cat=premium_mods&sub=${encodeURIComponent(g.id)}`}>
                  <div className={`h-32 rounded-2xl bg-gradient-to-br ${g.color} p-0.5 group-hover:scale-105 transition-transform duration-300`}>
                    <div className="h-full bg-gray-950 rounded-[15px] p-4 flex flex-col items-center justify-center gap-2">
                      <Tag className="w-8 h-8 text-white/80" />
                      <h3 className="text-white font-black text-lg">{g.label}</h3>
                      <p className="text-gray-400 text-xs text-center">Browse paid mods</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-900/80 border border-purple-700/30 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-bold">Browse By</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search mods..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            </div>
            <select value={game} onChange={e => setGame(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              <option value="">All Games</option>
              {PREMIUM_MOD_GAME_CARDS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
            <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="low">₱1 - ₱500</option>
              <option value="mid">₱501 - ₱2,000</option>
              <option value="high">₱2,001+</option>
            </select>
          </div>
        </div>

        {/* Paid Mods Feed */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> Paid Mods Feed
          </h3>
          <p className="text-gray-400 text-sm">{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</p>
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-400 text-lg">No paid mods found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group">
                <Link to={`/listing?id=${l.id}`}>
                  <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group-hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <div className="relative overflow-hidden">
                      {l.images?.length > 0 ? (
                        <ListingImageSlider images={l.images} title={l.title} badge={l.is_premium ? "PREMIUM" : null} heightClass="h-44" />
                      ) : (
                        <div className="h-44 w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center"><Gamepad2 className="w-12 h-12 text-gray-700" /></div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">{l.title}</h4>
                      {l.game_name && (
                        <div className="flex items-center gap-1.5"><Gamepad2 className="w-3 h-3 text-gray-500" /><span className="text-gray-400 text-xs">{l.game_name}</span></div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 font-bold text-sm">{l.price === 0 ? "FREE" : formatListingPrice(l.price, l.currency)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <GamerBrandFooter />
    </div>
  );
}