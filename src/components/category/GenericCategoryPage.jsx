import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Radio, SlidersHorizontal, X, Play, Send, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SubcategoryCards from "./SubcategoryCards";
import ShareButton from "@/components/shared/ShareButton";
import ListingSellerBadge from "@/components/listings/ListingSellerBadge";
import StickySearchBar from "@/components/shared/StickySearchBar";
import Pagination from "@/components/shared/Pagination";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import StorePlatformBadges from "@/components/shared/StorePlatformBadges";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import MascotShowcase from "@/components/shared/MascotShowcase";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
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
    const listingsPromise = cat === "modding"
      ? Promise.all([
          base44.entities.Listing.filter({ status: "active", category: "modding" }, "-created_date", 80),
          base44.entities.Listing.filter({ status: "active", category: "premium_mods" }, "-created_date", 80),
        ]).then(([mods, premiumMods]) => [...mods, ...premiumMods])
      : base44.entities.Listing.filter({ status: "active", category: cat }, "-created_date", 80);

    listingsPromise.then(l => {
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
      if (cat === "premium_mods" && activeSub !== "all") {
        const normalizedSub = activeSub.toLowerCase().replace(/\s+/g, "");
        cleaned = cleaned.filter(x => [x.tool_target_game, x.game_name, x.subcategory, ...(x.subcategories || [])].filter(Boolean).map(v => String(v).toLowerCase().replace(/\s+/g, "")).some(v => v === normalizedSub || (normalizedSub === "gta" && v.startsWith("gta"))));
      }
      setListings(cleaned);
      setLoading(false);
    });
  }, [cat, activeSub]);

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
        <GamerBrandFooter />
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
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-amber-300 text-xs font-black uppercase tracking-widest">PREMIUM MOD COLLECTIONS</p>
                <h2 className="text-white text-2xl font-black">Shop paid mods by game</h2>
                <p className="text-gray-500 text-sm mt-1">Choose a game card below to browse its landing page, newsfeed, and custom cards.</p>
              </div>
              {canPost && <a href="/create-listing?cat=premium_mods" className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-bold hover:bg-amber-500/30">Sell a Premium Mod</a>}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <MascotShowcase
          compact={cat !== "games" && cat !== "modding" && cat !== "premium_mods"}
        />
      </div>

      {/* Subcategory cards grid */}
      {!sub && <SubcategoryCards cat={cat} categoryName={meta.title} userEmail={user?.email} user={user} userProfile={profile} />}

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
...
      </div>
      <GamerBrandFooter />
    </div>
  );
}