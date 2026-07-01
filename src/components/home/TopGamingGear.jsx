import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingImageFrame from "@/components/listings/ListingImageFrame";

export default function TopGamingGear() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Listing.filter({ category: "gear", status: "active" }, "-created_date", 6);
        setListings(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <section className="py-20 px-4 bg-gray-950/45">
      <div className="max-w-7xl mx-auto text-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </section>
  );

  if (listings.length === 0) return (
    <section className="py-16 px-4 bg-gray-950/45">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-pink-400 text-sm font-semibold uppercase tracking-wider mb-2">Best Gear</p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Top Gaming <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">Hardware</span>
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
          <Monitor className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No gear listings yet</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to list gaming gear!</p>
          <a href="/register" className="inline-flex mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
            Start Selling
          </a>
        </div>
      </div>
    </section>
  );

  return (
    <section id="gear" className="py-20 px-4 bg-gray-950/45">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <p className="text-pink-400 text-sm font-semibold uppercase tracking-wider mb-1">Community Listings</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Top Gaming <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">Hardware</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Listed by our community sellers</p>
          </div>
          <a href="/?cat=gear" className="text-pink-400 hover:text-pink-300 text-sm font-semibold transition-colors">All Gear →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing, i) => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-pink-700/50 transition-colors listing-glow-frame listing-glow-lines" style={{ "--listing-glow-color": "rgba(236,72,153,.85)" }}>
              <div className="relative h-44">
                {listing.images?.[0] ? (
                  <ListingImageFrame src={listing.images[0]} alt={listing.title} className="w-full h-full" foregroundClassName="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-800">🖥️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                {listing.is_premium && (
                  <span className="absolute top-3 left-3 text-xs font-bold bg-yellow-500/90 text-black px-2.5 py-1 rounded-full">⭐ Premium</span>
                )}
                <span className="absolute top-3 right-3 text-xs font-bold bg-gray-950/80 text-pink-300 border border-pink-700/50 px-2.5 py-1 rounded-full capitalize">
                  {listing.condition?.replace("_", " ") || "New"}
                </span>
              </div>
              <div className="p-5">
                <p className="text-pink-400 text-xs font-semibold mb-1">{listing.subcategory || "Gaming Gear"}</p>
                <h3 className="text-white font-bold text-lg mb-2 truncate">{listing.title}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{listing.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-400 font-black text-xl">${listing.price?.toLocaleString()}</span>
                  <span className="text-gray-600 text-xs">by @{listing.seller_username}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
