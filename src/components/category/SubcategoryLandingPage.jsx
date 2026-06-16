import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Eye, Plus, Tag, Search, Send } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import { isServiceListing } from "@/lib/constants";

const PER_PAGE = 10;

export default function SubcategoryLandingPage({ user, profile, cat, sub, parentCategoryName }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.Listing.filter({ category: cat, status: "active" }, "-created_date", 200);
        setListings(results.filter(l => {
          const matchSub = l.subcategory === sub || (l.subcategories || []).includes(sub) || (cat === "premium_mods" && (l.tool_target_game === sub || l.game_name === sub));
          const matchPremium = cat !== "premium_mods" || (l.product_type === "digital" && (l.is_premium || Number(l.price || 0) > 0));
          return l.is_approved !== false && matchSub && matchPremium && !isServiceListing(l);
        }));
      } catch {}
      setLoading(false);
    };
    load();
  }, [cat, sub]);

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
            href={`/create-listing?cat=${cat}&sub=${sub}${cat === "premium_mods" ? `&game=${encodeURIComponent(sub)}` : ""}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {cat === "games" ? <Plus className="w-4 h-4" /> : <Send className="w-4 h-4" />} {cat === "games" ? "Add a Game" : cat === "premium_mods" ? "Sell a Premium Mod" : "Post"}
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
              href={`/create-listing?cat=${cat}&sub=${sub}${cat === "premium_mods" ? `&game=${encodeURIComponent(sub)}` : ""}`}
              className="mt-4 inline-block px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90"
            >
              {cat === "games" ? "Add a Game" : "Post"}
            </a>
          )}
        </div>
      ) : (
        <>
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
              href={`/listing?id=${listing.id}`}
              key={listing.id}
              initial={initMap[anim] || { opacity: 0, y: 20 }}
              animate={animMap[anim] || { opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: anim === "bounce" ? "spring" : "tween", stiffness: 200, bounce: 0.5 }}
              style={glowStyle}
              className={`bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors block cursor-pointer ${glowClass}`}
            >
              {(listing.preview_video_url || listing.video_url || listing.youtube_url) ? (
                <UniversalVideoPreview url={listing.preview_video_url || listing.video_url || listing.youtube_url} poster={listing.images?.[0]} className="w-full h-40 object-cover" />
              ) : listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                  <Tag className="w-8 h-8 text-gray-600" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-bold truncate">{listing.title}</p>
                  <span className="flex items-center gap-1 text-cyan-300 text-[10px] font-bold"><Eye className="w-3 h-3" />{(listing.views || 0).toLocaleString()}</span>
                </div>
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
            </motion.a>
            );
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}