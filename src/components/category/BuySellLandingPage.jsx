import React, { useState, useEffect } from "react";
import SubcategoryCards from "./SubcategoryCards";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Send, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "@/lib/constants";
import { Link } from "react-router-dom";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import GamerSocialsBar from "@/components/shared/GamerSocialsBar";
import MascotShowcase from "@/components/shared/MascotShowcase";
import Pagination from "@/components/shared/Pagination";
import { formatListingPrice } from "@/lib/currency";

const PER_PAGE = 15;

const buySellCat = CATEGORIES.find(c => c.id === "buy_sell");

function ListingCard({ listing, index }) {
  return (
    <motion.a
      href={`/listing?id=${listing.id}`}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: "0 0 25px rgba(234,179,8,0.2)" }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group cursor-pointer hover:border-yellow-500/30 transition-colors block"
    >
      <ListingImageSlider images={listing.images || []} title={listing.title} badge={listing.is_premium ? "PREMIUM" : null} />
      <div className="p-4">
        <p className="text-white font-bold text-sm truncate mb-1">{listing.title}</p>
        <p className="text-gray-500 text-xs line-clamp-2 mb-2">{listing.description || "No description."}</p>
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 font-black text-sm">{!listing.price || listing.is_free ? "FREE" : formatListingPrice(listing.price, listing.currency)}</span>
          {listing.subcategory && (
            <span className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-400 text-[10px]">{listing.subcategory}</span>
          )}
        </div>
        <p className="theme-glow-action inline-flex items-center gap-1.5 text-gray-400 text-[10px] mt-1 rounded-lg px-1.5 py-0.5"><CalendarDays className="w-3 h-3 theme-glow-icon" /> Posted Date: {listing.created_date ? new Date(listing.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</p>
      </div>
    </motion.a>
  );
}

export default function BuySellLandingPage({ user, profile, sub }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState(sub || "all");
  const [page, setPage] = useState(1);

  const canPost = user;

  useEffect(() => {
    const basePromise = base44.entities.Listing.filter({ status: "active", category: "buy_sell" }, "-created_date", 80);
    const extraPromise = base44.entities.Listing.filter({ status: "active" }, "-created_date", 120)
      .then((all) => all.filter((x) => Array.isArray(x.newsfeed_categories) && x.newsfeed_categories.includes("buy_sell") && x.category !== "games"))
      .catch(() => []);

    Promise.all([basePromise, extraPromise]).then(([base, extra]) => {
      const seen = new Set((base || []).map((x) => x.id));
      const merged = [...(base || []), ...(extra || []).filter((x) => !seen.has(x.id))].filter((x) => x.is_approved !== false);
      setListings(merged);
      setLoading(false);
    });
  }, []);

  useEffect(() => { setPage(1); }, [activeSub, search]);

  const filtered = listings.filter(l => {
    const matchSub = activeSub === "all" || l.subcategory === activeSub;
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #12100a 0%, #0a0800 50%, #030712 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(234,179,8,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.6) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/" className="text-yellow-400 text-sm hover:text-yellow-300 mb-4 flex items-center gap-1">← Back to Home</Link>
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

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <MascotShowcase compact={false} />
        <GamerSocialsBar className="mt-4" />
      </div>

      <SubcategoryCards cat="buy_sell" categoryName="Buy & Sell" user={user} userEmail={user?.email} userProfile={profile} />

      {/* Filters */}
      <div className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button onClick={() => setActiveSub("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeSub === "all" ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
              All
            </button>
            {buySellCat?.subcategories.map(s => (
              <Link key={s} to={`/category?cat=buy_sell&sub=${encodeURIComponent(s)}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${activeSub === s ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                {s}
              </Link>
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
            <Link to="/create-listing?cat=buy_sell" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-sm hover:opacity-90 whitespace-nowrap">
              <Send className="w-4 h-4" /> Post
            </Link>
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
            {canPost && <Link to="/create-listing?cat=buy_sell" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600 text-white font-bold text-sm"><Send className="w-4 h-4" /> Post</Link>}
          </div>
        ) : (
          <>
            <div className="mb-6"><Pagination page={page} totalPages={totalPages} onChange={goToPage} /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paged.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
            </div>
            <div className="mt-8"><Pagination page={page} totalPages={totalPages} onChange={goToPage} /></div>
          </>
        )}
      </div>
      <GamerBrandFooter />
    </div>
  );
}
