import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Radio, SlidersHorizontal, X, Play, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SubcategoryCards from "./SubcategoryCards";
import ShareButton from "@/components/shared/ShareButton";
import ListingSellerBadge from "@/components/listings/ListingSellerBadge";
import StickySearchBar from "@/components/shared/StickySearchBar";
import Pagination from "@/components/shared/Pagination";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import StorePlatformBadges from "@/components/shared/StorePlatformBadges";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import { isServiceListing } from "@/lib/constants";

const PER_PAGE = 10;

const CATEGORY_META = {
  modding: {
    title: "Modding Community",
    subtitle: "Upload, share & download mods — PPSSPP, GTA, FIFA, NBA2K, WWE2K, Football Life & more.",
    color: "#fb923c",
    bg: "from-orange-950 to-gray-950",
    grid: "linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)",
    accent: "orange",
  },
  games: {
    title: "Games",
    subtitle: "Top deals on PC, PlayStation, Xbox, Nintendo Switch & Mobile games.",
    color: "#a855f7",
    bg: "from-purple-950 to-gray-950",
    grid: "linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)",
    accent: "purple",
  },
  tournaments: {
    title: "Tournaments",
    subtitle: "Join and host FPS, Battle Royale, MOBA, Sports & Mobile Gaming tournaments.",
    color: "#4ade80",
    bg: "from-green-950 to-gray-950",
    grid: "linear-gradient(rgba(74,222,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.5) 1px, transparent 1px)",
    accent: "green",
  },
  jobs: {
    title: "Gaming Jobs",
    subtitle: "Find gaming industry jobs — QA, Dev, Coaching, Content & more.",
    color: "#f87171",
    bg: "from-rose-950 to-gray-950",
    grid: "linear-gradient(rgba(248,113,113,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,113,113,0.5) 1px, transparent 1px)",
    accent: "rose",
  },
  services: {
    title: "Services",
    subtitle: "PC Repair, Custom Builds, Coaching, Boosting, Design & Mod Installation.",
    color: "#818cf8",
    bg: "from-indigo-950 to-gray-950",
    grid: "linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)",
    accent: "indigo",
  },
  livestream: {
    title: "Live Streams",
    subtitle: "Watch live gaming events and go live yourself.",
    color: "#f87171",
    bg: "from-red-950 to-gray-950",
    grid: "linear-gradient(rgba(239,68,68,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.5) 1px, transparent 1px)",
    accent: "red",
  },
  paid_tools: {
    title: "Tools",
    subtitle: "Premium gaming utilities, launchers, automation tools, and creator software.",
    color: "#f472b6",
    bg: "from-pink-950 to-gray-950",
    grid: "linear-gradient(rgba(244,114,182,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,0.5) 1px, transparent 1px)",
    accent: "pink",
  },
  premium_mods: {
    title: "Premium Mods Store",
    subtitle: "Paid premium mods by game collection, subcategory, and creator storefront.",
    color: "#f59e0b",
    bg: "from-amber-950 to-gray-950",
    grid: "linear-gradient(rgba(245,158,11,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.45) 1px, transparent 1px)",
    accent: "amber",
  },
  content_streaming: {
    title: "Content/Streaming",
    subtitle: "Gaming videos, clips, reviews, tutorials, and live streaming content.",
    color: "#60a5fa",
    bg: "from-blue-950 to-gray-950",
    grid: "linear-gradient(rgba(96,165,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.5) 1px, transparent 1px)",
    accent: "blue",
  },
};

export default function GenericCategoryPage({ user, profile, cat, sub, categoryData }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState(sub || "all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [productType, setProductType] = useState("all");
  const [page, setPage] = useState(1);
  const meta = CATEGORY_META[cat] || CATEGORY_META.services;
  const canPost = user;

  useEffect(() => {
    base44.entities.Listing.filter({ status: "active", category: cat }, "-created_date", 200).then(l => {
      let cleaned = l.filter(x => x.is_approved !== false);
      // Marketplace discovery categories must never show service-type listings
      if (["premium_mods", "games", "paid_tools", "content_streaming"].includes(cat)) {
        cleaned = cleaned.filter(x => !isServiceListing(x));
      }
      // Games: only actual game listings — no community, modding, or service entries
      if (cat === "games") {
        cleaned = cleaned.filter(x => !x.modding_subcategory && !x.community_franchise_id && x.category === "games" && !isServiceListing(x));
      }
      // Premium Mods: only paid/premium digital mod products
      if (cat === "premium_mods") {
        cleaned = cleaned.filter(x => !isServiceListing(x) && x.product_type === "digital" && (x.is_premium || Number(x.price || 0) > 0));
      }
      setListings(cleaned);
      setLoading(false);
    });
  }, [cat]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [activeSub, search, sortBy, priceMin, priceMax, isFree, productType]);

  const resetFilters = () => { setSortBy("newest"); setPriceMin(""); setPriceMax(""); setIsFree(false); setProductType("all"); setSearch(""); };
  const hasActiveFilters = sortBy !== "newest" || priceMin || priceMax || isFree || productType !== "all" || search;

  const filtered = listings.filter(l => {
    const listingSubs = l.subcategories || (l.subcategory ? [l.subcategory] : []);
    const matchSub = activeSub === "all" || listingSubs.includes(activeSub);
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase()) || l.seller_username?.toLowerCase().includes(search.toLowerCase());
    const matchFree = !isFree || l.price === 0 || l.is_free;
    const matchMin = priceMin === "" || (l.price || 0) >= parseFloat(priceMin);
    const matchMax = priceMax === "" || (l.price || 0) <= parseFloat(priceMax);
    const matchType = productType === "all" || l.product_type === productType;
    return matchSub && matchSearch && matchFree && matchMin && matchMax && matchType;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
    if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (cat === "livestream") {
    return (
      <div className="min-h-screen">
        <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #0f0000, #030712)" }}>
          <div className="max-w-7xl mx-auto relative z-10">
            <a href="/" className="text-red-400 text-sm hover:text-red-300 mb-4 flex items-center gap-1">← Back to Home</a>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Live <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Streams</span>
            </h1>
            <p className="text-red-200/60 text-base mb-6">Watch and go live on GAMER Productions.</p>
            <div className="flex gap-4">
              <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:opacity-90">Watch on Twitch</a>
              <a href="https://youtube.com/live" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:opacity-90">YouTube Live</a>
              <a href="https://facebook.com/gaming" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:opacity-90">FB Gaming</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Radio className="w-16 h-16 mx-auto text-red-500 animate-pulse mb-4" />
          <p className="text-white font-black text-2xl mb-2">Live Streaming Coming Soon</p>
          <p className="text-gray-500">Integrated live streaming will be available soon. Connect your stream now!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <StickySearchBar />
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: `linear-gradient(135deg, #060008, #030712)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: meta.grid, backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <a href="/" className="text-sm hover:opacity-80 mb-4 flex items-center gap-1" style={{ color: meta.color }}>← Back to Home</a>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{meta.title}</h1>
          <p className="max-w-xl mb-1 text-base" style={{ color: `${meta.color}99` }}>{meta.subtitle}</p>
        </div>
      </div>

      {cat === "premium_mods" && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="rounded-3xl border border-amber-700/30 bg-gradient-to-br from-amber-950/40 to-gray-900 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div>
                <p className="text-amber-300 text-xs font-black uppercase tracking-widest">Premium mod collections</p>
                <h2 className="text-white text-2xl font-black">Shop paid mods by game</h2>
              </div>
              <a href="/create-listing?cat=premium_mods" className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-bold hover:bg-amber-500/30">Sell a Premium Mod</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {["NBA 2K", "Football Life", "GTA", "Assetto Corsa", "Minecraft", "WWE 2K"].map(game => (
                <button key={game} onClick={() => setSearch(game)} className="rounded-2xl bg-gray-950/70 border border-gray-800 px-3 py-4 text-left hover:border-amber-500/50 transition-colors">
                  <p className="text-white text-sm font-black">{game}</p>
                  <p className="text-gray-500 text-[11px] mt-1">Browse paid mods</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subcategory cards grid */}
      {!sub && <SubcategoryCards cat={cat} categoryName={meta.title} userEmail={user?.email} />}

      {/* Subcategory tabs */}
      {categoryData?.subcategories?.length > 0 && !sub && (
        <div className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <a href={`/category?cat=${cat}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${!activeSub || activeSub === "all" ? "bg-gray-700 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                All
              </a>
              {categoryData.subcategories.map(s => (
                <a key={s} href={`/category?cat=${cat}&sub=${encodeURIComponent(s)}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${activeSub === s ? "bg-gray-700 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-3 items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${meta.title}...`}
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
            {search && <button onClick={() => setSearch("")} className="text-gray-600 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${showAdvanced ? "border-purple-500/60 bg-purple-900/20 text-purple-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-purple-400" />}
            </button>
            {canPost && cat !== "tournaments" && (
              <a href={`/create-listing?cat=${cat}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/30 whitespace-nowrap">
                {cat === "games" ? <Plus className="w-4 h-4" /> : <Send className="w-4 h-4" />} {cat === "games" ? "Add a Game" : "Post"}
              </a>
            )}
            {cat === "tournaments" && (
              <a href="/tournaments" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600/20 border border-green-600/40 text-green-300 text-sm font-semibold hover:bg-green-600/30 whitespace-nowrap">
                <Plus className="w-4 h-4" /> {canPost ? "Create Tournament" : "View Tournaments"}
              </a>
            )}
          </div>
        </div>

        {/* Advanced filter panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold text-sm">Advanced Filters</p>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                      <X className="w-3 h-3" /> Reset all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold mb-1 block">Sort by</label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="popular">Most Views</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold mb-1 block">Type</label>
                    <select value={productType} onChange={e => setProductType(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                      <option value="all">All Types</option>
                      <option value="digital">Digital</option>
                      <option value="physical">Physical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold mb-1 block">Min Price</label>
                    <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold mb-1 block">Max Price</label>
                    <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Any"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-4 h-4 accent-green-500 rounded" />
                      <span className="text-green-400 text-xs font-semibold">Free Only</span>
                    </label>
                  </div>
                </div>
                <p className="text-gray-600 text-xs mt-2">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-3" />
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-xl font-bold mb-2 text-gray-400">No listings yet</p>
            <p className="text-sm">Be the first to add one!</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paged.map((l, i) => {
              const anim = l.card_animation || "slide_up";
              const initMap = { fade: { opacity: 0 }, slide_up: { opacity: 0, y: 30 }, slide_left: { opacity: 0, x: -30 }, zoom: { opacity: 0, scale: 0.85 }, flip: { opacity: 0, rotateY: 90 }, bounce: { opacity: 0, y: -20 }, glow: { opacity: 0 }, rotate: { opacity: 0, rotate: -10 }, none: {} };
              const animMap = { fade: { opacity: 1 }, slide_up: { opacity: 1, y: 0 }, slide_left: { opacity: 1, x: 0 }, zoom: { opacity: 1, scale: 1 }, flip: { opacity: 1, rotateY: 0 }, bounce: { opacity: 1, y: 0 }, glow: { opacity: 1 }, rotate: { opacity: 1, rotate: 0 }, none: {} };
              const glowColors = { red: "rgba(239,68,68,.85)", purple: "rgba(168,85,247,.85)", blue: "rgba(59,130,246,.85)", green: "rgba(34,197,94,.85)", gold: "rgba(250,204,21,.9)", multi: "rgba(236,72,153,.9)" };
              const glowStyle = { ...(anim === "glow" ? { boxShadow: "0 0 20px 3px rgba(139,92,246,0.4)" } : {}), "--listing-glow-color": glowColors[l.card_glow_color || "purple"] };
              const glowClass = `listing-glow-frame ${l.card_glow_style === "radiant" ? "listing-glow-radiant" : "listing-glow-lines"} ${l.card_glow_speed === "fast" ? "listing-glow-fast" : ""}`;
              return (
              <motion.a href={`/listing?id=${l.id}`} key={l.id} initial={initMap[anim] || { opacity: 0, y: 20 }} whileInView={animMap[anim] || { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04, type: anim === "bounce" ? "spring" : "tween", stiffness: 180 }}
                style={glowStyle}
                className={`bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-purple-500/30 transition-colors block cursor-pointer ${glowClass}`}>
                <div className="h-36 overflow-hidden relative bg-gray-800">
                  {(l.preview_video_url || l.video_url || l.youtube_url) ? (
                    <UniversalVideoPreview url={l.preview_video_url || l.video_url || l.youtube_url} poster={l.images?.[0]} className="w-full h-full object-cover" />
                  ) : l.images?.[0] ? (
                    <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700"><Play className="w-10 h-10" /></div>
                  )}
                  {cat === "games" && l.ign_rating != null && (
                    <div className="absolute top-2 right-2"><IgnRatingBadge rating={l.ign_rating} size="sm" /></div>
                  )}
                </div>
                <div className="p-4">
                 <p className="text-white font-bold text-sm truncate">{l.title}</p>
                 <p className="text-gray-500 text-xs mt-1 line-clamp-2">{l.description}</p>
                 <div className="flex items-center justify-between mt-2">
                   <p className="text-purple-400 font-black">{(!l.price || l.price === 0 || l.is_free) ? "FREE" : `₱${l.price?.toLocaleString()}`}</p>
                   <ShareButton type="listing" id={l.id} title={l.title} compact />
                 </div>
                 {l.subcategory && <span className="px-2 py-0.5 mt-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] inline-block">{l.subcategory}</span>}
                 {l.tool_target_game && <span className="px-2 py-0.5 mt-1 rounded-lg bg-blue-900/30 border border-blue-700/30 text-blue-300 text-[10px] inline-block">For: {l.tool_target_game}</span>}
                 {cat === "games" && l.store_platforms?.length > 0 && <div className="mt-2"><StorePlatformBadges platforms={l.store_platforms} links={l.store_platform_links} size="sm" /></div>}
                 <ListingSellerBadge sellerEmail={l.seller_email} sellerUsername={l.seller_username} />
                 </div>
                 </motion.a>
                 );
                 })}
                 </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}