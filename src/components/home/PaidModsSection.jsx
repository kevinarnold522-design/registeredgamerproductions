import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Gamepad2, DollarSign, Tag, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { isServiceListing } from "@/lib/constants";

const PAID_MOD_CATEGORIES = [
  { id: "premium_mods", label: "Premium Mods", color: "from-purple-600 to-pink-600" },
  { id: "paid_tools", label: "Tools", color: "from-blue-600 to-cyan-600" },
  { id: "exclusive_content", label: "Exclusive Content", color: "from-yellow-600 to-orange-600" },
];

const GAMES = [
  "WWE2K", "GTA 5", "GTA SA", "FIFA", "PES", "NBA2K", "Football Life", 
  "PPSSPP", "PS2", "PC", "Android", "GTA 4"
];

export default function PaidModsSection() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    game: "",
    priceRange: "",
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const allListings = await base44.entities.Listing.filter({ 
          status: "active",
          is_approved: true
        });
        // Filter for paid/premium listings in paid mod categories
        const paidMods = allListings.filter(l => 
          (l.is_premium || l.price > 0) && 
          (l.category === "premium_mods" || l.category === "paid_tools" || l.category === "exclusive_content") &&
          !isServiceListing(l)
        );
        setListings(paidMods.slice(0, 50));
      } catch (error) {
        console.error("Failed to fetch paid mods:", error);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchSearch = !filters.search || 
      listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      listing.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchCategory = !filters.category || listing.category === filters.category;
    const matchGame = !filters.game || listing.game_name === filters.game;
    
    let matchPrice = true;
    if (filters.priceRange === "free") matchPrice = listing.price === 0 || listing.is_free;
    else if (filters.priceRange === "low") matchPrice = listing.price > 0 && listing.price <= 500;
    else if (filters.priceRange === "mid") matchPrice = listing.price > 500 && listing.price <= 2000;
    else if (filters.priceRange === "high") matchPrice = listing.price > 2000;

    return matchSearch && matchCategory && matchGame && matchPrice;
  });

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-purple-950/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Paid Mods</span> & Premium Content
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Premium quality mods, tools, and exclusive content for your favorite games
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-purple-700/30 rounded-2xl p-6 mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-bold text-lg">Browse By</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Search mods..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">All Categories</option>
              {PAID_MOD_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>

            {/* Game Filter */}
            <select
              value={filters.game}
              onChange={(e) => setFilters(f => ({ ...f, game: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">All Games</option>
              {GAMES.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>

            {/* Price Range */}
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(f => ({ ...f, priceRange: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="low">₱1 - ₱500</option>
              <option value="mid">₱501 - ₱2,000</option>
              <option value="high">₱2,001+</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.category || filters.game || filters.priceRange) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-gray-500 text-xs">Active filters:</span>
              {filters.search && (
                <span className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs">
                  {filters.search}
                </span>
              )}
              {filters.category && (
                <span className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs">
                  {PAID_MOD_CATEGORIES.find(c => c.id === filters.category)?.label}
                </span>
              )}
              {filters.game && (
                <span className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs">
                  {filters.game}
                </span>
              )}
              {filters.priceRange && (
                <span className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs">
                  {filters.priceRange === "free" ? "Free" : filters.priceRange === "low" ? "₱1-₱500" : filters.priceRange === "mid" ? "₱501-₱2,000" : "₱2,001+"}
                </span>
              )}
              <button
                onClick={() => setFilters({ search: "", category: "", game: "", priceRange: "" })}
                className="text-gray-500 hover:text-white text-xs underline"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {PAID_MOD_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group cursor-pointer"
            >
              <Link to={`/category?cat=${cat.id}`}>
                <div className={`h-32 rounded-2xl bg-gradient-to-br ${cat.color} p-0.5 group-hover:scale-105 transition-transform duration-300`}>
                  <div className="h-full bg-gray-950 rounded-[15px] p-4 flex flex-col items-center justify-center gap-2">
                    <Tag className="w-8 h-8 text-white/80" />
                    <h3 className="text-white font-black text-lg">{cat.label}</h3>
                    <p className="text-gray-400 text-xs text-center">Premium quality content</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Listings Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-xl flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Paid Mods Feed
            </h3>
            <p className="text-gray-400 text-sm">
              {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-400 text-lg">No paid mods found</p>
              <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Link to={`/listing?id=${listing.id}`}>
                    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group-hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                      {/* Image */}
                      <div className="aspect-video relative overflow-hidden">
                        {listing.images?.[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center">
                            <Gamepad2 className="w-12 h-12 text-gray-700" />
                          </div>
                        )}
                        {listing.is_premium && (
                          <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-yellow-500 text-black text-xs font-bold">
                            Premium
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {listing.title}
                        </h4>
                        
                        {listing.game_name && (
                          <div className="flex items-center gap-1.5">
                            <Gamepad2 className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-400 text-xs">{listing.game_name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 font-bold text-sm">
                              {listing.price === 0 ? "FREE" : `₱${listing.price?.toLocaleString()}`}
                            </span>
                          </div>
                          {listing.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300">
                              {PAID_MOD_CATEGORIES.find(c => c.id === listing.category)?.label || listing.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}