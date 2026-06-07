import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Download, Star, SlidersHorizontal, X, Filter, CheckSquare, Square, EyeOff, Eye, GripVertical } from "lucide-react";
import ModReviewModal from "@/components/shared/ModReviewModal";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";

const MODDING_SUBCATEGORIES = [
  "WWE2K", "Football Life", "GTA 4", "GTA 5", "GTA SA",
  "Android", "PES", "FIFA", "NBA2K", "PPSSPP/PSP", "PS2", "PC",
];

// Advanced filter state
const DEFAULT_FILTERS = {
  priceMin: "",
  priceMax: "",
  isFree: false,
  isPremium: false,
  platforms: [],
  sortBy: "newest",
};

export default function ModdingSection() {
  const [mods, setMods] = useState([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [reviewMod, setReviewMod] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showGroupFilter, setShowGroupFilter] = useState(true);
  const [visibleGroups, setVisibleGroups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("modding_visible_groups") || "null");
      return saved ? new Set(saved) : null;
    } catch { return null; }
  });
  const [hiddenIds, setHiddenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("modding_hidden_ids") || "[]")); } catch { return new Set(); }
  });
  const [showHiddenPanel, setShowHiddenPanel] = useState(false);

  const toggleGroup = (g) => {
    setVisibleGroups(prev => {
      const allIds = new Set(MODDING_SUBCATEGORIES);
      const base = prev || allIds;
      const n = new Set(base);
      if (n.has(g)) n.delete(g); else n.add(g);
      localStorage.setItem("modding_visible_groups", JSON.stringify([...n]));
      return n;
    });
  };
  const selectAll = () => { setVisibleGroups(null); localStorage.removeItem("modding_visible_groups"); };
  const clearAll = () => { setVisibleGroups(new Set()); localStorage.setItem("modding_visible_groups", JSON.stringify([])); };
  const toggleHide = (id) => {
    setHiddenIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      localStorage.setItem("modding_hidden_ids", JSON.stringify([...n]));
      return n;
    });
  };
  const isVisible = (id) => !visibleGroups || visibleGroups.has(id);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        base44.auth.me().then(me => {
          setUser(me);
          if (me) base44.entities.UserProfile.filter({ user_email: me.email }).then(p => p.length > 0 && setProfile(p[0]));
        });
      }
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Listing.filter({ category: "modding", status: "active" }, "-created_date", 40);
        setMods(data);
        const total = data.reduce((sum, m) => sum + (m.views || 0), 0);
        setTotalDownloads(total);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Auto-follow lister on download
  const handleDownload = async (e, mod) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    // Follow the lister
    if (mod.seller_email && mod.seller_email !== user.email) {
      const existing = await base44.entities.Follow.filter({ follower_email: user.email, following_email: mod.seller_email });
      if (existing.length === 0) {
        base44.entities.Follow.create({
          follower_email: user.email,
          following_email: mod.seller_email,
          follower_username: profile?.username || user.full_name || "Gamer",
          following_username: mod.seller_username || "",
          source: "manual",
        }).catch(() => {});
      }
    }
    window.location.href = `/listing?id=${mod.id}`;
  };

  // Apply subcategory filter: when a subcategory is active, HIDE mods not matching
  const subcatFiltered = activeFilter === "All" ? mods : mods.filter(m =>
    m.digital_subcategory === activeFilter ||
    m.modding_subcategory === activeFilter ||
    m.game_name === activeFilter ||
    m.game_platform === activeFilter ||
    (m.tags || []).includes(activeFilter)
  );

  // Advanced filters
  const filtered = subcatFiltered.filter(m => {
    if (filters.isFree && !(m.price === 0 || m.is_free)) return false;
    if (filters.isPremium && !m.is_premium) return false;
    if (filters.priceMin !== "" && (m.price || 0) < parseFloat(filters.priceMin)) return false;
    if (filters.priceMax !== "" && (m.price || 0) > parseFloat(filters.priceMax)) return false;
    if (filters.platforms.length > 0 && !(m.platforms || []).some(p => filters.platforms.includes(p))) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (filters.sortBy === "popular") return (b.views || 0) - (a.views || 0);
    if (filters.sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
    if (filters.sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
    if (filters.sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  const hasActiveFilters = filters.isFree || filters.isPremium || filters.priceMin || filters.priceMax || filters.platforms.length > 0 || filters.sortBy !== "newest";

  return (
    <section id="modding" className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-wider mb-1">Modding Community</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              🔧 Mods &{" "}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Downloads</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Premium and free mods by our community</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            
            {hiddenIds.size > 0 && (
              <button onClick={() => setShowHiddenPanel(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-400 hover:text-white transition-all">
                <Eye className="w-4 h-4" /> Show Hidden ({hiddenIds.size})
              </button>
            )}
            <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${showAdvanced || hasActiveFilters ? "border-orange-500/60 bg-orange-900/20 text-orange-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"}`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-orange-400 ml-1" />}
            </button>
            <div className="flex items-center gap-2 bg-orange-900/20 border border-orange-700/30 rounded-xl px-4 py-2.5">
              <Download className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-orange-400 font-black text-lg">{totalDownloads > 0 ? totalDownloads.toLocaleString() : "0"}</span>
                <p className="text-gray-500 text-xs">Total Downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Group Filter Panel — permanently visible */}
        <div className="mb-4">
          <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">📂 Filter Modding Communities</p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Show All</button>
                <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-300 font-semibold transition-colors">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
              {MODDING_SUBCATEGORIES.map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group/lbl">
                  <button type="button" onClick={() => toggleGroup(g)} className="flex-shrink-0">
                    {isVisible(g)
                      ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                      : <Square className="w-4 h-4 text-gray-600 group-hover/lbl:text-gray-400" />}
                  </button>
                  <span className={`text-xs font-semibold transition-colors truncate ${isVisible(g) ? "text-white" : "text-gray-600 group-hover/lbl:text-gray-400"}`}>{g}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden Panel */}
        <AnimatePresence>
          {showHiddenPanel && hiddenIds.size > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-3">
                <p className="text-gray-400 text-[10px] font-bold mb-2">Hidden Communities — click to unhide:</p>
                <div className="flex flex-wrap gap-1">
                  {[...hiddenIds].map(id => (
                    <button key={id} onClick={() => toggleHide(id)}
                      className="px-2 py-1 rounded-lg bg-gray-700 text-white text-[10px] font-semibold hover:bg-purple-700 transition-colors">
                      {id} 👁
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subcategory Filter — filtered by visible groups */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {["All", ...MODDING_SUBCATEGORIES.filter(g => isVisible(g) && !hiddenIds.has(g))].map((cat) => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative group ${activeFilter === cat
                ? "bg-orange-500/20 border border-orange-500/50 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"}`}>
              {cat}
              <button
                onClick={(e) => { e.stopPropagation(); toggleHide(cat); }}
                className="absolute top-1 right-1 w-4 h-4 rounded bg-black/60 text-gray-500 hover:text-red-400 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                title="Hide this community">
                <EyeOff className="w-2.5 h-2.5" />
              </button>
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6">
              <div className="bg-gray-900 border border-orange-700/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold text-sm">Advanced Filters</p>
                  {hasActiveFilters && (
                    <button onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                      <X className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Sort By</label>
                    <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500">
                      <option value="newest">Newest</option>
                      <option value="popular">Most Downloaded</option>
                      <option value="likes">Most Liked</option>
                      <option value="price_asc">Price: Low→High</option>
                      <option value="price_desc">Price: High→Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Min Price (₱)</label>
                    <input type="number" value={filters.priceMin} onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Max Price (₱)</label>
                    <input type="number" value={filters.priceMax} onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
                      placeholder="9999"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div className="flex flex-col gap-1.5 justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters.isFree} onChange={e => setFilters(f => ({ ...f, isFree: e.target.checked }))}
                        className="accent-green-500 w-3.5 h-3.5 rounded" />
                      <span className="text-green-400 text-xs font-semibold">Free Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters.isPremium} onChange={e => setFilters(f => ({ ...f, isPremium: e.target.checked }))}
                        className="accent-yellow-500 w-3.5 h-3.5 rounded" />
                      <span className="text-yellow-400 text-xs font-semibold">Premium Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {activeFilter !== "All" && (
          <p className="text-gray-500 text-sm mb-5">
            Showing <span className="text-orange-400 font-bold">{filtered.length}</span> mods for{" "}
            <span className="text-white font-bold">{activeFilter}</span>
            <button onClick={() => setActiveFilter("All")} className="ml-2 text-gray-600 hover:text-gray-400 text-xs">(clear)</button>
          </p>
        )}

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="text-5xl mb-4">🔧</div>
            <p className="text-gray-400 font-semibold">No mods found{activeFilter !== "All" ? ` for ${activeFilter}` : ""}</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or be the first to upload!</p>
            <a href="/register" className="inline-flex mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
              Upload Your Mod
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((mod, i) => (
              <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-700/50 transition-colors group">
                <a href={`/listing?id=${mod.id}`} className="block">
                  <div className="relative h-36">
                    {mod.images?.[0] ? (
                      <img src={mod.images[0]} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800">🔧</div>
                    )}
                    {mod.is_premium && (
                      <span className="absolute top-2 left-2 text-xs font-bold bg-yellow-500/90 text-black px-2 py-0.5 rounded-full">⭐ Premium</span>
                    )}
                    {(mod.price === 0 || mod.is_free) && (
                      <span className="absolute top-2 right-2 text-xs font-bold bg-green-500/90 text-black px-2 py-0.5 rounded-full">FREE</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-orange-400 text-xs font-semibold mb-0.5">{mod.digital_subcategory || mod.modding_subcategory || mod.game_name || mod.game_platform || "Mod"}</p>
                    <h3 className="text-white font-bold text-sm truncate">{mod.title}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`font-black text-sm ${mod.price === 0 || mod.is_free ? "text-green-400" : "text-yellow-400"}`}>
                        {mod.price === 0 || mod.is_free ? "FREE" : `₱${mod.price?.toLocaleString()}`}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReviewMod(mod); }}
                        className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      >
                        <Star className="w-3 h-3" /> Reviews
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">by @{mod.seller_username}</p>
                    {/* Engagement Bar */}
                    <div className="mt-2 pt-2 border-t border-gray-800">
                      <ListingEngagementBar listing={mod} user={user} profile={profile} compact />
                    </div>
                  </div>
                </a>
                {/* Download button — auto-follow */}
                <div className="px-3 pb-3">
                  <button onClick={(e) => handleDownload(e, mod)}
                    className="w-full py-1.5 rounded-lg text-xs font-black text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                    <Download className="w-3 h-3 inline mr-1" /> Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
            🔧 Upload & Sell Your Mods
          </a>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewMod && (
          <ModReviewModal
            listing={reviewMod}
            user={user}
            profile={profile}
            onClose={() => setReviewMod(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}