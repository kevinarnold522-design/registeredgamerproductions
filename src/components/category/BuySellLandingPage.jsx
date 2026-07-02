import React, { useState, useEffect } from "react";
import SubcategoryCards from "./SubcategoryCards";
import { ShoppingCart, Send } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { Link } from "react-router-dom";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import HomeListingCard from "@/components/home/HomeListingCard";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";
import Pagination from "@/components/shared/Pagination";
import { findCanonicalCategoryValue, listingMatchesCategory, listingMatchesSubcategory } from "@/lib/categoryMatching";
import LandingSearchHeader from "@/components/shared/LandingSearchHeader";
import { getActiveListings } from "@/lib/homeDataCache";

const PER_PAGE = 15;

const buySellCat = CATEGORIES.find(c => c.id === "buy_sell");

export default function BuySellLandingPage({ user, profile, sub }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState(() =>
    findCanonicalCategoryValue(sub, buySellCat?.subcategories || []) || sub || "all"
  );
  const [page, setPage] = useState(1);

  const canPost = user;

  useEffect(() => {
    getActiveListings().then((all) => {
      const merged = (Array.isArray(all) ? all : [])
        .filter((listing) => listingMatchesCategory(listing, "buy_sell", { includeNewsfeed: false }))
        .filter((listing) => listing.is_approved !== false);
      setListings(merged);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setActiveSub(findCanonicalCategoryValue(sub, buySellCat?.subcategories || []) || sub || "all");
  }, [sub]);

  useEffect(() => { setPage(1); }, [activeSub, search]);

  const filtered = listings.filter(l => {
    const matchSub = listingMatchesSubcategory(l, activeSub);
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

      <GamerBrandFooter position="top" className="px-0 pt-0 pb-3" />

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
        <LandingSearchHeader
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search listings..."
          rightSlot={canPost ? (
            <Link to="/create-listing?cat=buy_sell" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-sm hover:opacity-90 whitespace-nowrap">
              <Send className="w-4 h-4" /> Post
            </Link>
          ) : null}
        />

        <p className="text-gray-500 text-sm mb-4">{filtered.length} listings</p>

        {loading ? (
          <BrandedLoadingScreen label="Loading Your Experience..." minHeight="22rem" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 font-bold">No listings in this category yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to list something!</p>
            {canPost && <Link to="/create-listing?cat=buy_sell" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600 text-white font-bold text-sm"><Send className="w-4 h-4" /> Post</Link>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paged.map((l, idx) => <HomeListingCard key={l.id} listing={l} user={user} profile={profile} index={idx} />)}
            </div>
            <div className="mt-8"><Pagination page={page} totalPages={totalPages} onChange={goToPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}
