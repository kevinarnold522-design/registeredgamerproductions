import React, { useState, useEffect } from "react";
import { Plus, Tag, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "@/components/shared/Pagination";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import HomeListingCard from "@/components/home/HomeListingCard";
import { isServiceListing } from "@/lib/constants";
import { findCanonicalCategoryValue, listingMatchesCategory, listingMatchesSubcategory, normalizeCategoryId } from "@/lib/categoryMatching";
import LandingSearchHeader from "@/components/shared/LandingSearchHeader";
import { getActiveListings, peekActiveListings } from "@/lib/homeDataCache";

const PER_PAGE = 10;

export default function SubcategoryLandingPage({ user, profile: _profile, cat, sub, parentCategoryName }) {
  const normalizedSub = findCanonicalCategoryValue(sub, []) || sub;
  const filterSubcategoryListings = (rows) =>
    (Array.isArray(rows) ? rows : []).filter((listing) => {
      const matchCategory = listingMatchesCategory(listing, normalizeCategoryId(cat), { includeNewsfeed: false });
      const matchSub = listingMatchesSubcategory(listing, normalizedSub, { allowPrefixMatch: ["premium_mods", "modding"].includes(cat) });
      const matchPremium = cat !== "premium_mods" || (listing.product_type === "digital" && Number(listing.price || 0) > 0 && !listing.is_free);
      return matchCategory && listing.is_approved !== false && matchSub && matchPremium && !isServiceListing(listing);
    });
  const [listings, setListings] = useState(() => filterSubcategoryListings(peekActiveListings()));
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(listings.length > 0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setListings(filterSubcategoryListings(peekActiveListings()));
        setLoading(true);
        const results = await getActiveListings();
        setListings(filterSubcategoryListings(results));
        setHasLoaded(true);
      } catch {
        setHasLoaded(true);
      }
      setLoading(false);
    };
    load();
  }, [cat, normalizedSub]);

  const filtered = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => { setPage(1); }, [search, cat, sub]);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-6xl mx-auto relative z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category?cat=${cat}`} className="hover:text-white transition-colors capitalize">{parentCategoryName}</Link>
        <span>/</span>
        <span className="text-white capitalize">{sub.replace(/_/g, " ")}</span>
      </div>

      <GamerBrandFooter position="top" className="px-0 pt-0 pb-6" />

      <LandingSearchHeader
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder="Search listings..."
        rightSlot={user ? (
          <Link
            to={`/create-listing?cat=${cat}&sub=${sub}${cat === "premium_mods" ? `&game=${encodeURIComponent(sub)}` : ""}`}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {cat === "games" ? <Plus className="w-4 h-4" /> : <Send className="w-4 h-4" />} {cat === "games" ? "Add a Game" : cat === "premium_mods" ? "Sell a Premium Mod" : "Post"}
          </Link>
        ) : null}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black capitalize">{sub.replace(/_/g, " ")}</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Listings */}
      {!hasLoaded && loading && listings.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-gray-800 bg-gray-900/60 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
          <Tag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold mb-1">No listings yet</p>
          <p className="text-gray-600 text-sm">Be the first to post in this subcategory!</p>
          {user && (
            <Link
              to={`/create-listing?cat=${cat}&sub=${sub}${cat === "premium_mods" ? `&game=${encodeURIComponent(sub)}` : ""}`}
              className="mt-4 inline-block px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90"
            >
              {cat === "games" ? "Add a Game" : "Post"}
            </Link>
          )}
        </div>
      ) : (
        <>
        <div className="mb-6"><Pagination page={page} totalPages={totalPages} onChange={goToPage} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map((listing, idx) => (
            <HomeListingCard key={listing.id} listing={listing} user={user} profile={_profile} index={idx} />
          ))}
        </div>
        </>
      )}
    </div>
  );
}
