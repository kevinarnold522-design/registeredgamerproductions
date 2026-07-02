import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Plus, Tag, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "@/components/shared/Pagination";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import ListingImageSlider from "@/components/listings/ListingImageSlider";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import { isServiceListing } from "@/lib/constants";
import { formatListingPrice } from "@/lib/currency";
import { findCanonicalCategoryValue, listingMatchesCategory, listingMatchesSubcategory, normalizeCategoryId } from "@/lib/categoryMatching";
import LandingSearchHeader from "@/components/shared/LandingSearchHeader";
import { getActiveListings, peekActiveListings } from "@/lib/homeDataCache";
import { getPublicSiteUrl } from "@/lib/publicSiteUrl";

const PER_PAGE = 10;

export default function SubcategoryLandingPage({ user, profile: _profile, cat, sub, parentCategoryName }) {
  const normalizedSub = findCanonicalCategoryValue(sub, []) || sub;
  const filterSubcategoryListings = (rows) =>
    (Array.isArray(rows) ? rows : []).filter((listing) => {
      const matchCategory = listingMatchesCategory(listing, normalizeCategoryId(cat));
      const matchSub = listingMatchesSubcategory(listing, normalizedSub, { allowPrefixMatch: ["premium_mods", "modding"].includes(cat) });
      const matchPremium = cat !== "premium_mods" || (listing.product_type === "digital" && (listing.is_premium || Number(listing.price || 0) > 0));
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((listing, i) => {
            const anim = listing.card_animation || "fade";
            const initMap = {
              fade: { opacity: 0 },
              slide_up: { opacity: 0, y: 40 },
              slide_left: { opacity: 0, x: -40 },
              zoom: { opacity: 0, scale: 0.8 },
              flip: { opacity: 0, rotateY: 90 },
              bounce: { opacity: 0, y: -30 },
              glow: { opacity: 0 },
              rotate: { opacity: 0, rotate: -15 },
              none: {},
            };
            const animMap = {
              fade: { opacity: 1 },
              slide_up: { opacity: 1, y: 0 },
              slide_left: { opacity: 1, x: 0 },
              zoom: { opacity: 1, scale: 1 },
              flip: { opacity: 1, rotateY: 0 },
              bounce: { opacity: 1, y: 0 },
              glow: { opacity: 1 },
              rotate: { opacity: 1, rotate: 0 },
              none: {},
            };
            const glowColors = { red: "rgba(239,68,68,.85)", purple: "rgba(168,85,247,.85)", blue: "rgba(59,130,246,.85)", green: "rgba(34,197,94,.85)", gold: "rgba(250,204,21,.9)", multi: "rgba(236,72,153,.9)" };
            const glowStyle = { ...(anim === "glow" ? { boxShadow: "0 0 24px 4px rgba(139,92,246,0.5)" } : {}), "--listing-glow-color": listing.card_glow_color === "custom" ? (listing.card_glow_hex || "#a855f7") : glowColors[listing.card_glow_color || "purple"] };
            const glowClass = `listing-glow-frame ${listing.card_glow_style === "radiant" ? "listing-glow-radiant" : listing.card_glow_style === "solid" ? "listing-glow-solid" : "listing-glow-lines"} ${listing.card_glow_speed === "fast" ? "listing-glow-fast" : listing.card_glow_speed === "cycle" ? "listing-glow-cycle" : ""}`;
            return (
            <motion.a
              href={getPublicSiteUrl(`/listing?id=${listing.id}`)}
              key={listing.id}
              initial={initMap[anim] || { opacity: 0, y: 20 }}
              animate={animMap[anim] || { opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: anim === "bounce" ? "spring" : "tween", stiffness: 200, bounce: 0.5 }}
              style={glowStyle}
              className={`bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors block cursor-pointer ${glowClass}`}
            >
              {(listing.preview_video_url || listing.video_url || listing.youtube_url) ? (
                <UniversalVideoPreview url={listing.preview_video_url || listing.video_url || listing.youtube_url} poster={listing.images?.[0]} className="w-full h-40 object-cover" />
              ) : (
                <ListingImageSlider images={listing.images || []} title={listing.title} />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-bold truncate">{listing.title}</p>
                  <span className="flex items-center gap-1 text-cyan-300 text-[10px] font-bold"><Eye className="w-3 h-3" />{(listing.views || 0).toLocaleString()}</span>
                </div>
                <p className="text-gray-500 text-xs mt-1 truncate">{listing.seller_username || listing.seller_email}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-purple-400 font-black">
                    {!listing.price || listing.is_free ? "FREE" : formatListingPrice(listing.price, listing.currency)}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${listing.condition === "new" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                    {listing.condition || "digital"}
                  </span>
                </div>
              </div>
            </motion.a>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
