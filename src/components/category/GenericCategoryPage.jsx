import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Radio, SlidersHorizontal, X, Send, Newspaper, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "@/components/shared/Pagination";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import StandardListingCard from "@/components/listings/StandardListingCard";
import { isServiceListing } from "@/lib/constants";
import { findCanonicalCategoryValue, listingMatchesCategory, listingMatchesSubcategory, normalizeCategoryId } from "@/lib/categoryMatching";
import LandingSearchHeader from "@/components/shared/LandingSearchHeader";
import { getActiveListings, peekActiveListings } from "@/lib/homeDataCache";
import { base44 } from "@/api/base44Client";
import { TOP_FRANCHISES } from "@/lib/franchises";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import NewsfeedPagination from "@/components/community/NewsfeedPagination";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import ListerAvatarBadge from "@/components/shared/ListerAvatarBadge";
import { formatListingPrice } from "@/lib/currency";
import { getPublicSiteUrl } from "@/lib/publicSiteUrl";
import ListingImageFrame from "@/components/listings/ListingImageFrame";

const PER_PAGE = 12;
const NEWSFEED_PER_PAGE = 10;
const CATEGORY_NEWSFEED_CATEGORIES = new Set(["modding", "premium_mods"]);

function getInitialActiveSub(sub, categoryData) {
  return findCanonicalCategoryValue(sub, categoryData?.subcategories || []) || sub || "all";
}

function buildCategoryListings(rows, cat, activeSub) {
  const normalizedCat = normalizeCategoryId(cat);
  let cleaned = (Array.isArray(rows) ? rows : [])
    .filter((listing) => listingMatchesCategory(listing, normalizedCat, { includeNewsfeed: false }))
    .filter((listing) => listing.is_approved !== false);

  if (["premium_mods", "games", "paid_tools", "content_streaming"].includes(cat)) {
    cleaned = cleaned.filter((listing) => !isServiceListing(listing));
  }
  if (cat === "games") {
    cleaned = cleaned.filter((listing) => normalizeCategoryId(listing.category) === "games" && !isServiceListing(listing));
  }
  if (cat === "premium_mods") {
    cleaned = cleaned.filter((listing) =>
      !isServiceListing(listing) &&
      listing.product_type === "digital" &&
      Number(listing.price || 0) > 0 &&
      !listing.is_free
    );
  }
  if (cat === "premium_mods" && activeSub !== "all") {
    cleaned = cleaned.filter((listing) =>
      listingMatchesSubcategory(listing, activeSub, { allowPrefixMatch: true })
    );
  }

  return cleaned;
}

function getCategoryFeedFranchiseIds(listings, cat, activeSub, categoryData) {
  const franchiseIds = new Set(
    (Array.isArray(listings) ? listings : [])
      .map((listing) => listing?.community_franchise_id)
      .filter(Boolean)
  );

  const referenceValues =
    activeSub && activeSub !== "all"
      ? [activeSub]
      : Array.isArray(categoryData?.subcategories)
        ? categoryData.subcategories
        : [];

  TOP_FRANCHISES.forEach((franchise) => {
    const franchiseValues = [franchise.id, franchise.name, ...(Array.isArray(franchise.subgames) ? franchise.subgames : [])];
    if (
      referenceValues.some((value) => findCanonicalCategoryValue(value, franchiseValues)) ||
      (cat === "modding" && findCanonicalCategoryValue("modding", franchiseValues))
    ) {
      franchiseIds.add(franchise.id);
    }
  });

  return franchiseIds;
}

function buildCategoryNewsfeedItems({ posts, listings, franchiseIds, search, category }) {
  const normalizedSearch = String(search || "").trim().toLowerCase();
  const isModdingFeed = category === "modding" || category === "premium_mods";
  const modSignalRegex = /\bmod|mods|modding|cyberface|face ?mod|facepack|patch|roster|trainer|script|texture|addon|option file|stadium|kit|boots?\b/i;
  const visiblePosts = (Array.isArray(posts) ? posts : [])
    .filter((post) => post?.status === "active")
    .filter((post) => !franchiseIds.size || franchiseIds.has(post?.franchise_id))
    .filter((post) => {
      const text = [
        post?.content,
        post?.description,
        post?.author_username,
        post?.franchise_id,
        post?.section_id,
        ...(Array.isArray(post?.community_tags) ? post.community_tags : []),
      ]
        .filter(Boolean)
        .join(" ");
      if (isModdingFeed && !modSignalRegex.test(text)) {
        return false;
      }
      if (!normalizedSearch) return true;
      return text.toLowerCase().includes(normalizedSearch);
    })
    .map((item) => ({ type: "post", item, date: item?.created_date }));

  const visibleListings = (Array.isArray(listings) ? listings : [])
    .filter((listing) => {
      if (!normalizedSearch) return true;
      return [
        listing?.title,
        listing?.description,
        listing?.seller_username,
        listing?.game_name,
        listing?.community_franchise_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .map((item) => ({ type: "listing", item, date: item?.created_date }));

  return [...visiblePosts, ...visibleListings].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

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
  store: {
    title: "Store",
    subtitle: "Game accounts, in-game items, skins, gift cards, accessories & top tech.",
    color: "#fbbf24",
    bg: "from-amber-950 to-gray-950",
    grid: "linear-gradient(rgba(251,191,36,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.45) 1px, transparent 1px)",
    accent: "amber",
  },
  cloud_gaming: {
    title: "Cloud Gaming",
    subtitle: "GeForce NOW, Xbox Cloud, PS Plus, Boosteroid & more — play anywhere.",
    color: "#67e8f9",
    bg: "from-cyan-950 to-gray-950",
    grid: "linear-gradient(rgba(103,232,249,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.45) 1px, transparent 1px)",
    accent: "cyan",
  },
};

export default function GenericCategoryPage({ user, profile, cat, sub, categoryData }) {
  const initialActiveSub = getInitialActiveSub(sub, categoryData);
  const [listings, setListings] = useState(() => buildCategoryListings(peekActiveListings(), cat, initialActiveSub));
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(listings.length > 0);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [isTier1, setIsTier1] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState(
    () => initialActiveSub
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [productType, setProductType] = useState("all");
  const [moddingGame, setModdingGame] = useState("all");
  const [page, setPage] = useState(1);
  const [feedPage, setFeedPage] = useState(1);
  const meta = CATEGORY_META[cat] || CATEGORY_META.services;
  const canPost = user;
  const showCategoryNewsfeed = CATEGORY_NEWSFEED_CATEGORIES.has(cat);

  // Keep the active subcategory in sync with the URL when it changes
  useEffect(() => {
    setActiveSub(getInitialActiveSub(sub, categoryData));
  }, [sub, categoryData?.subcategories]);

  useEffect(() => {
    setListings(buildCategoryListings(peekActiveListings(), cat, activeSub));
    setLoading(true);
    getActiveListings().then((rows) => {
      setListings(buildCategoryListings(rows, cat, activeSub));
      setHasLoaded(true);
      setLoading(false);
    }).catch(() => {
      setHasLoaded(true);
      setLoading(false);
    });
  }, [cat, activeSub]);

  useEffect(() => {
    if (!showCategoryNewsfeed) {
      setCategoryPosts([]);
      return;
    }

    let cancelled = false;
    base44.entities.CommunityPost.list("-created_date", 250)
      .then((rows) => {
        if (!cancelled) setCategoryPosts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setCategoryPosts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [showCategoryNewsfeed]);

  useEffect(() => {
    if (!user?.email) {
      setIsTier1(false);
      return;
    }

    base44.entities.Tier1Subscription.filter({ user_email: user.email, status: "active" })
      .then((subs) => setIsTier1(Array.isArray(subs) && subs.length > 0))
      .catch(() => setIsTier1(false));
  }, [user?.email]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [activeSub, search, sortBy, priceMin, priceMax, isFree, productType, moddingGame]);
  useEffect(() => { setFeedPage(1); }, [activeSub, search, sortBy, priceMin, priceMax, isFree, productType, moddingGame, cat]);

  const resetFilters = () => { setSortBy("newest"); setPriceMin(""); setPriceMax(""); setIsFree(false); setProductType("all"); setModdingGame("all"); setSearch(""); };
  const hasActiveFilters = sortBy !== "newest" || priceMin || priceMax || isFree || productType !== "all" || moddingGame !== "all" || search;

  // Modding: build the list of game categories present in the listings
  const moddingGameOptions = cat === "modding"
    ? Array.from(new Set(listings.flatMap(l => [l.modding_subcategory, l.tool_target_game, l.game_name].filter(Boolean).map(v => String(v))))).sort()
    : [];

  const filtered = listings.filter(l => {
    const matchSub = listingMatchesSubcategory(l, activeSub, { allowPrefixMatch: ["premium_mods", "modding"].includes(cat) });
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase()) || l.seller_username?.toLowerCase().includes(search.toLowerCase());
    const matchFree = !isFree || l.price === 0 || l.is_free;
    const matchMin = priceMin === "" || (l.price || 0) >= parseFloat(priceMin);
    const matchMax = priceMax === "" || (l.price || 0) <= parseFloat(priceMax);
    const matchType = productType === "all" || l.product_type === productType;
    const matchModdingGame = moddingGame === "all" || [l.modding_subcategory, l.tool_target_game, l.game_name].filter(Boolean).map(v => String(v)).includes(moddingGame);
    return matchSub && matchSearch && matchFree && matchMin && matchMax && matchType && matchModdingGame;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
    if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const categoryFeedFranchiseIds = useMemo(
    () => getCategoryFeedFranchiseIds(filtered, cat, activeSub, categoryData),
    [filtered, cat, activeSub, categoryData]
  );

  const categoryNewsfeedItems = useMemo(
    () =>
      buildCategoryNewsfeedItems({
        posts: categoryPosts,
        listings: filtered,
        franchiseIds: categoryFeedFranchiseIds,
        search,
        category: cat,
      }),
    [categoryPosts, filtered, categoryFeedFranchiseIds, search, cat]
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const feedTotalPages = Math.max(1, Math.ceil(categoryNewsfeedItems.length / NEWSFEED_PER_PAGE));
  const pagedFeed = categoryNewsfeedItems.slice((feedPage - 1) * NEWSFEED_PER_PAGE, feedPage * NEWSFEED_PER_PAGE);

  const handlePostUpdate = (postId, patch) => {
    setCategoryPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, ...patch } : post)));
  };

  if (cat === "livestream") {
    return (
      <div className="min-h-screen">
        <div className="relative py-14 px-4" style={{ background: "linear-gradient(135deg, #3a0d1f, #2a0a2e)" }}>
          <div className="max-w-7xl mx-auto relative z-10">
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
      {/* Hero */}
      <div className="relative py-14 px-4" style={{ background: `linear-gradient(135deg, #2a0a2e, #3a0d36)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: meta.grid, backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{meta.title}</h1>
          <p className="max-w-xl mb-1 text-base" style={{ color: `${meta.color}99` }}>{meta.subtitle}</p>
        </div>
      </div>

      <GamerBrandFooter position="top" className="px-0 pt-0 pb-3" />

      {cat === "premium_mods" && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="rounded-3xl border border-amber-700/30 bg-gradient-to-br from-amber-950/40 to-gray-900 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-amber-300 text-xs font-black uppercase tracking-widest">PREMIUM MOD COLLECTIONS</p>
                <h2 className="text-white text-2xl font-black">Shop paid mods by game</h2>
                <p className="text-gray-500 text-sm mt-1">Choose a game card below to browse its landing page, newsfeed, and custom cards.</p>
              </div>
              {canPost && <Link to="/create-listing?cat=premium_mods" className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-bold hover:bg-amber-500/30">Sell a Premium Mod</Link>}
            </div>
          </div>
        </div>
      )}

      {/* Subcategory cards */}
      {categoryData?.subcategories?.length > 0 && !sub && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Link to={`/category?cat=${cat}`}
              className={`group rounded-2xl border px-4 py-4 transition-all ${!activeSub || activeSub === "all" ? "border-purple-500/60 bg-gradient-to-br from-purple-900/35 to-gray-900 shadow-[0_0_22px_rgba(168,85,247,0.18)]" : "border-gray-800 bg-gray-900/75 hover:border-purple-500/35 hover:bg-gray-900"}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">Browse</p>
              <p className="mt-1 text-white font-black text-sm">All {meta.title}</p>
              <p className="mt-1 text-xs text-gray-500">See every listing in this category.</p>
            </Link>
            {categoryData.subcategories.map((s, index) => (
              <Link key={s} to={`/category?cat=${cat}&sub=${encodeURIComponent(s)}`}
                className={`group rounded-2xl border px-4 py-4 transition-all ${activeSub === s ? "border-purple-500/60 bg-gradient-to-br from-purple-900/35 to-gray-900 shadow-[0_0_22px_rgba(168,85,247,0.18)]" : "border-gray-800 bg-gray-900/75 hover:border-purple-500/35 hover:bg-gray-900"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-black text-sm leading-tight">{s}</p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-black text-purple-200">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Open the {s} subcategory feed and listings.</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
        <LandingSearchHeader
          className="mb-3"
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder={`Search ${meta.title}...`}
          rightSlot={
            <>
              <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${showAdvanced ? "border-purple-500/60 bg-purple-900/20 text-purple-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-purple-400" />}
              </button>
              {canPost && cat !== "tournaments" && (
                <Link to={`/create-listing?cat=${cat}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/30 whitespace-nowrap">
                {cat === "games" ? <Plus className="w-4 h-4" /> : <Send className="w-4 h-4" />} {cat === "games" ? "Add a Game" : cat === "premium_mods" ? "Sell a Premium Mod" : "Post"}
                </Link>
              )}
              {cat === "tournaments" && (
                <Link to="/tournaments" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600/20 border border-green-600/40 text-green-300 text-sm font-semibold hover:bg-green-600/30 whitespace-nowrap">
                <Plus className="w-4 h-4" /> {canPost ? "Create Tournament" : "View Tournaments"}
                </Link>
              )}
            </>
          }
        />

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
                  {cat === "modding" && moddingGameOptions.length > 0 && (
                    <div>
                      <label className="text-gray-500 text-xs font-semibold mb-1 block">Category / Game</label>
                      <select value={moddingGame} onChange={e => setModdingGame(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500">
                        <option value="all">All Games</option>
                        {moddingGameOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}
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

        {showCategoryNewsfeed && (
          <div className="mb-5 rounded-3xl border border-purple-700/30 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/40 overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-purple-900/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-purple-300 text-[11px] font-black uppercase tracking-[0.22em]">Community Newsfeed</p>
                  <h2 className="text-white text-2xl font-black">{meta.title} Newsfeed</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Latest community posts and listings for {activeSub !== "all" ? activeSub : meta.title.toLowerCase()}.
                  </p>
                </div>
              </div>
              <Link
                to="/gaming-newsfeed"
                className="px-4 py-2 rounded-xl border border-purple-500/40 bg-purple-500/15 text-purple-200 text-sm font-bold hover:bg-purple-500/25 transition-colors whitespace-nowrap"
              >
                View global newsfeed
              </Link>
            </div>

            <div className="p-4">
              {categoryNewsfeedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-950/60 px-4 py-12 text-center">
                  <p className="text-white text-lg font-bold">No newsfeed activity yet</p>
                  <p className="text-gray-500 text-sm mt-1">Posts and listings from matching communities will appear here automatically.</p>
                </div>
              ) : (
                <>
                  {feedTotalPages > 1 && (
                    <NewsfeedPagination page={feedPage} totalPages={feedTotalPages} onChange={setFeedPage} />
                  )}
                  <div className="space-y-3">
                    {pagedFeed.map(({ type, item }) => type === "post" ? (
                      <CommunityPostCard
                        key={`post-${item.id}`}
                        post={item}
                        user={user}
                        profile={profile}
                        isTier1={isTier1}
                        canManage={false}
                        canDelete={false}
                        onUpdate={handlePostUpdate}
                        accentColor={meta.color}
                      />
                    ) : (
                      <a
                        key={`listing-${item.id}`}
                        href={getPublicSiteUrl(`/listing?id=${item.id}`)}
                        className="flex gap-3 rounded-2xl border border-gray-800 bg-gray-900/70 p-3 hover:border-purple-600/40 transition-colors"
                      >
                        <div className="relative w-20 h-20 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                          {item.images?.[0] ? (
                            <ListingImageFrame
                              src={item.images[0]}
                              alt={item.title || "Listing"}
                              fallbackCategory={item.category || meta.title}
                              className="w-full h-full"
                              foregroundClassName="w-full h-full object-contain p-1.5"
                              backgroundClassName="w-full h-full object-cover scale-110 blur-lg opacity-35"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                          )}
                          <ListerAvatarBadge listing={item} size="w-5 h-5" className="absolute bottom-1 right-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-black via-zinc-950 to-amber-950/80 text-amber-200 text-[9px] font-black uppercase tracking-wide mb-1 shadow-[0_0_14px_rgba(234,179,8,0.25)]">
                            <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> Featured
                          </span>
                          <p className="text-white font-bold text-sm truncate">{item.title}</p>
                          <p className="text-gray-500 text-xs line-clamp-2 mt-1">{item.description}</p>
                          {item.download_host && <div className="mt-2"><DownloadHostBadge host={item.download_host} size="sm" /></div>}
                          <p className="text-purple-300 text-sm font-black mt-1">
                            {item.is_free || !item.price ? "FREE" : formatListingPrice(item.price, item.currency)}
                          </p>
                          <div className="mt-2"><ListingEngagementBar listing={item} user={user} profile={profile} compact /></div>
                        </div>
                      </a>
                    ))}
                  </div>
                  {feedTotalPages > 1 && (
                    <div className="mt-4">
                      <NewsfeedPagination page={feedPage} totalPages={feedTotalPages} onChange={setFeedPage} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.22em]">Listings Feed</p>
            <h2 className="text-white text-2xl font-black">{meta.title} Listings</h2>
          </div>
          <p className="text-gray-400 text-sm">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {!hasLoaded && loading && listings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl border border-gray-800 bg-gray-900/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-xl font-bold mb-2 text-gray-400">No listings yet</p>
            <p className="text-sm">Be the first to add one!</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paged.map((l) => (
              <StandardListingCard key={l.id} listing={l} user={user} profile={profile} />
            ))}
          </div>
          <div className="mt-8"><Pagination page={page} totalPages={totalPages} onChange={goToPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}
