import React, { useState, useEffect } from "react";
import { getActiveListings } from "@/lib/homeDataCache";
import HomeListingCard from "@/components/home/HomeListingCard";

export default function FeaturedGames() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActiveListings();
        setListings(data.filter(item => item.category === "games").slice(0, 6));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <section className="py-20 px-4 bg-gray-950/45">
      <div className="max-w-7xl mx-auto text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </section>
  );

  if (listings.length === 0) return (
    <section className="py-16 px-4 bg-gray-950/45">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-2">Best Deals</p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Featured <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Games</span>
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-gray-400 font-semibold">No game listings yet</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to list a game!</p>
          <a href="/register" className="inline-flex mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
            Start Selling
          </a>
        </div>
      </div>
    </section>
  );

  return (
    <section id="games" className="py-20 px-4 bg-gray-950/45">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-1">Community Listings</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Featured <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Games</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Listed by our community sellers</p>
          </div>
          <a href="/category?cat=games" className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">All Games →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing, i) => (
            <HomeListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
