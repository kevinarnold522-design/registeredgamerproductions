import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ArrowLeft, Shield, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import ListingImageSlider from "@/components/listings/ListingImageSlider";

// Unique themed designs per subcategory
const SUB_THEMES = {
  // Games
  "PC":           { color: "#60a5fa", bg: "from-blue-950 to-gray-950",    accent: "blue",   emoji: "🖥️" },
  "PlayStation":  { color: "#003087", bg: "from-blue-950 to-indigo-950",  accent: "blue",   emoji: "🎮" },
  "Xbox":         { color: "#107C10", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "🟩" },
  "Nintendo Switch":{ color: "#e4000f", bg: "from-red-950 to-gray-950",  accent: "red",    emoji: "🔴" },
  "Mobile":       { color: "#a78bfa", bg: "from-purple-950 to-gray-950", accent: "purple", emoji: "📱" },
  // Modding
  "WWE2K":        { color: "#fcd34d", bg: "from-yellow-950 to-gray-950",  accent: "yellow", emoji: "🤼" },
  "Football Life":{ color: "#34d399", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "⚽" },
  "GTA 4":        { color: "#f87171", bg: "from-red-950 to-gray-950",     accent: "red",    emoji: "🚗" },
  "GTA 5":        { color: "#f97316", bg: "from-orange-950 to-gray-950",  accent: "orange", emoji: "🔫" },
  "GTA SA":       { color: "#fb923c", bg: "from-orange-950 to-amber-950", accent: "orange", emoji: "🏙️" },
  "Android":      { color: "#86efac", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "🤖" },
  "PES":          { color: "#4ade80", bg: "from-green-950 to-emerald-950",accent: "green",  emoji: "⚽" },
  "FIFA":         { color: "#facc15", bg: "from-yellow-950 to-gray-950",  accent: "yellow", emoji: "⚽" },
  "NBA2K":        { color: "#f87171", bg: "from-red-950 to-gray-950",     accent: "red",    emoji: "🏀" },
  "PPSSPP/PSP":   { color: "#818cf8", bg: "from-indigo-950 to-gray-950",  accent: "indigo", emoji: "🎮" },
  "PS2":          { color: "#60a5fa", bg: "from-blue-950 to-gray-950",    accent: "blue",   emoji: "🎮" },
  // Tournaments
  "FPS":          { color: "#f87171", bg: "from-red-950 to-gray-950",     accent: "red",    emoji: "🎯" },
  "Battle Royale":{ color: "#fb923c", bg: "from-orange-950 to-gray-950",  accent: "orange", emoji: "🏆" },
  "MOBA":         { color: "#a78bfa", bg: "from-purple-950 to-gray-950",  accent: "purple", emoji: "⚔️" },
  "Sports":       { color: "#4ade80", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "🏟️" },
  "Fighting":     { color: "#f97316", bg: "from-orange-950 to-gray-950",  accent: "orange", emoji: "🥊" },
  "Mobile Gaming":{ color: "#c084fc", bg: "from-purple-950 to-gray-950",  accent: "purple", emoji: "📱" },
  // Jobs
  "QA Testing":   { color: "#34d399", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "🐛" },
  "Game Dev":     { color: "#60a5fa", bg: "from-blue-950 to-gray-950",    accent: "blue",   emoji: "💻" },
  "Community Manager": { color: "#f472b6", bg: "from-pink-950 to-gray-950", accent: "pink", emoji: "👥" },
  "Esports Coach":{ color: "#facc15", bg: "from-yellow-950 to-gray-950",  accent: "yellow", emoji: "🏆" },
  "Content Creator":{ color: "#f87171", bg: "from-red-950 to-gray-950",   accent: "red",    emoji: "🎬" },
  // Services
  "PC Repair":    { color: "#60a5fa", bg: "from-blue-950 to-gray-950",    accent: "blue",   emoji: "🔧" },
  "Custom Builds":{ color: "#a78bfa", bg: "from-purple-950 to-gray-950",  accent: "purple", emoji: "🖥️" },
  "Coaching":     { color: "#facc15", bg: "from-yellow-950 to-gray-950",  accent: "yellow", emoji: "🎓" },
  "Boosting":     { color: "#34d399", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "⚡" },
  "Design Services":{ color: "#f472b6", bg: "from-pink-950 to-gray-950",  accent: "pink",   emoji: "🎨" },
  // Content
  "Gaming Videos":{ color: "#60a5fa", bg: "from-blue-950 to-gray-950",   accent: "blue",   emoji: "📹" },
  "Streaming":    { color: "#f87171", bg: "from-red-950 to-gray-950",     accent: "red",    emoji: "📡" },
  "Tutorials":    { color: "#4ade80", bg: "from-green-950 to-gray-950",   accent: "green",  emoji: "📚" },
  "Reviews":      { color: "#facc15", bg: "from-yellow-950 to-gray-950",  accent: "yellow", emoji: "⭐" },
  "Highlights":   { color: "#f97316", bg: "from-orange-950 to-gray-950",  accent: "orange", emoji: "🌟" },
  "Clips":        { color: "#a78bfa", bg: "from-purple-950 to-gray-950",  accent: "purple", emoji: "🎞️" },
};

const defaultTheme = { color: "#a78bfa", bg: "from-purple-950 to-gray-950", accent: "purple", emoji: "🎮" };

function ListingCard({ listing, user, onEdit, index }) {
  const canEdit = user && (isAdmin(user.email) || listing.seller_email === user.email);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group cursor-pointer hover:border-purple-500/40 transition-colors relative"
    >
      <ListingImageSlider
        images={listing.images || []}
        title={listing.title}
        badge={listing.is_premium ? "PREMIUM" : null}
        discountPct={listing.discount_pct || null}
      />
      <div className="p-4">
        <p className="text-white font-bold text-sm truncate">{listing.title}</p>
        <p className="text-gray-500 text-xs line-clamp-2 mt-0.5 mb-2">{listing.description}</p>
        <div className="flex items-center justify-between">
          {listing.is_free || listing.price === 0 ? (
            <span className="text-green-400 font-black text-sm">FREE</span>
          ) : (
            <span className="text-purple-400 font-black text-sm">₱{listing.price?.toLocaleString()}</span>
          )}
          <span className="text-gray-600 text-[10px]">by {listing.seller_username || "Seller"}</span>
        </div>
        {canEdit && (
          <button onClick={e => { e.stopPropagation(); onEdit(listing); }}
            className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300 text-xs font-semibold hover:bg-blue-900/50 transition-colors">
            <Pencil className="w-3 h-3" /> Edit Listing
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function SubcategoryLandingPage({ user, profile, cat, sub, parentCategoryName }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const theme = SUB_THEMES[sub] || defaultTheme;
  const canCreate = user && (isAdmin(user.email) || profile?.account_type === "digital_creator" || profile?.account_type === "business");
  const admin = user && isAdmin(user.email);

  useEffect(() => {
    base44.entities.Listing.filter({ status: "active", category: cat, subcategory: sub }, "-created_date", 60).then(l => {
      setListings(l);
      setLoading(false);
    });
  }, [cat, sub]);

  const filtered = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (listing) => {
    window.location.href = `/create-listing?edit=${listing.id}&cat=${cat}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero — unique per subcategory */}
      <div className={`relative py-14 px-4 bg-gradient-to-br ${theme.bg}`}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${theme.color}66 1px, transparent 1px), linear-gradient(90deg, ${theme.color}66 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />
        {/* Glow orb */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${theme.color}, transparent)` }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <a href={`/category?cat=${cat}`} className="flex items-center gap-1 text-sm mb-4 hover:opacity-80 transition-opacity" style={{ color: theme.color }}>
            <ArrowLeft className="w-4 h-4" /> Back to {parentCategoryName}
          </a>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-2"
              style={{ background: `${theme.color}22`, borderColor: `${theme.color}44`, boxShadow: `0 0 30px ${theme.color}44` }}>
              {theme.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase border" style={{ color: theme.color, borderColor: `${theme.color}50`, background: `${theme.color}15` }}>
                  {parentCategoryName}
                </span>
                {admin && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">{sub}</h1>
              <p className="text-sm mt-0.5" style={{ color: `${theme.color}99` }}>{filtered.length} listing{filtered.length !== 1 ? "s" : ""} available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + Create */}
        <div className="flex gap-3 mb-6 items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${sub}...`}
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
          </div>
          {canCreate && (
            <a href={`/create-listing?cat=${cat}&sub=${encodeURIComponent(sub)}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all whitespace-nowrap"
              style={{ background: `linear-gradient(135deg, ${theme.color}cc, ${theme.color}88)`, boxShadow: `0 0 20px ${theme.color}44` }}>
              <Plus className="w-4 h-4" />
              {admin ? "⚡ Create Listing (Admin)" : "Add Listing"}
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.color, borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{theme.emoji}</div>
            <p className="text-white font-black text-xl mb-2">No {sub} listings yet</p>
            <p className="text-gray-500 text-sm mb-6">Be the first to add one!</p>
            {canCreate && (
              <a href={`/create-listing?cat=${cat}&sub=${encodeURIComponent(sub)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${theme.color}cc, ${theme.color}88)` }}>
                <Plus className="w-4 h-4" /> Create First Listing
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((l, i) => <ListingCard key={l.id} listing={l} user={user} onEdit={handleEdit} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}