import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Plus, Tag, Search } from "lucide-react";

export default function SubcategoryLandingPage({ user, profile, cat, sub, parentCategoryName }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.Listing.filter({ category: cat, subcategory: sub, status: "active" });
        setListings(results);
      } catch {}
      setLoading(false);
    };
    load();
  }, [cat, sub]);

  const filtered = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <a href={`/category?cat=${cat}`} className="hover:text-white transition-colors capitalize">{parentCategoryName}</a>
        <span>/</span>
        <span className="text-white capitalize">{sub.replace(/_/g, " ")}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black capitalize">{sub.replace(/_/g, " ")}</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {user && (
          <a
            href={`/create-listing?cat=${cat}&sub=${sub}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Listing
          </a>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
          <Tag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold mb-1">No listings yet</p>
          <p className="text-gray-600 text-sm">Be the first to post in this subcategory!</p>
          {user && (
            <a
              href={`/create-listing?cat=${cat}&sub=${sub}`}
              className="mt-4 inline-block px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90"
            >
              Create Listing
            </a>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors"
            >
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                  <Tag className="w-8 h-8 text-gray-600" />
                </div>
              )}
              <div className="p-4">
                <p className="text-white font-bold truncate">{listing.title}</p>
                <p className="text-gray-500 text-xs mt-1 truncate">{listing.seller_username || listing.seller_email}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-purple-400 font-black">
                    {listing.is_free ? "FREE" : `₱${listing.price?.toLocaleString()}`}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${listing.condition === "new" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                    {listing.condition || "digital"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}