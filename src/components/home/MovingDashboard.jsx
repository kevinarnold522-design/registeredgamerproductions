import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Package, Star, Eye, TrendingUp, Zap, Download, Monitor, Smartphone, ExternalLink, Heart, MessageCircle, Share2, Flag, Bookmark, Repeat, CalendarDays, Tags } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import MascotShowcase from "@/components/shared/MascotShowcase";
import { getActiveListings } from "@/lib/homeDataCache";

// Cyberpunk 2077-inspired color palette combined with site theme
const CP = {
  yellow: "#f5c518",
  cyan: "#00d4ff",
  pink: "#ff2d78",
  purple: "#a855f7",
  darkBg: "#050008",
};

function listingGlow(item) {
  const colors = { red: "rgba(239,68,68,.85)", purple: "rgba(168,85,247,.85)", blue: "rgba(59,130,246,.85)", green: "rgba(34,197,94,.85)", gold: "rgba(250,204,21,.9)", multi: "rgba(236,72,153,.9)" };
  return {
    className: `listing-glow-frame ${item?.card_glow_style === "radiant" ? "listing-glow-radiant" : item?.card_glow_style === "solid" ? "listing-glow-solid" : "listing-glow-lines"} ${item?.card_glow_speed === "fast" ? "listing-glow-fast" : item?.card_glow_speed === "cycle" ? "listing-glow-cycle" : ""}`,
    style: { "--listing-glow-color": item?.card_glow_color === "custom" ? (item?.card_glow_hex || "#a855f7") : colors[item?.card_glow_color || "purple"] }
  };
}

function ScrollRow({ children, speed = 30, reverse = false }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          animation: `scrollX${reverse ? "R" : ""} ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes scrollX { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scrollXR { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function FireBurst() {
  return null;
}

function CardActions({ item, user, profile }) {
  return <div className="mt-1.5"><ListingEngagementBar listing={item} user={user} profile={profile} compact /></div>;
}

function OwnerPill({ item }) {
  const date = item.created_date ? new Date(item.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently";
  return (
    <div className="theme-glow-action mt-1 inline-flex items-center gap-2 max-w-full rounded-xl px-1.5 py-1 bg-black/20 border border-cyan-400/20">
      <CalendarDays className="w-3.5 h-3.5 theme-glow-icon flex-shrink-0" />
      <span className="min-w-0 text-left">
        <span className="block text-[8px] uppercase tracking-wider text-cyan-300/70 font-black">Posted Date</span>
        <span className="block text-[10px] text-cyan-100/85 truncate">{date}</span>
      </span>
    </div>
  );
}

function PlacementBadges({ item }) {
  const badges = [item.category, item.modding_subcategory, ...(item.subcategories || [])].filter(Boolean).slice(0, 3);
  if (badges.length === 0) return null;
  return <div className="mt-1 flex flex-wrap gap-1">{badges.map(b => <span key={b} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[8px] font-black text-purple-200"><Tags className="w-2 h-2" />{b}</span>)}</div>;
}

function ModCard({ mod, user, profile, owner }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(mod.likes || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    base44.entities.Listing.update(mod.id, { likes: liked ? likeCount - 1 : likeCount + 1 }).catch(() => {});
  };

  const glow = listingGlow(mod);
  return (
    <motion.a
      href={`/listing?id=${mod.id}`}
      whileHover={{ scale: 1.05, y: -6, boxShadow: "0 0 40px rgba(245,197,24,0.4), 0 0 80px rgba(245,197,24,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative w-52 flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer block ${glow.className}`}
      style={{
        ...glow.style,
        background: "rgba(18,8,0,0.55)",
        border: "1px solid rgba(245,197,24,0.35)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 4px 24px rgba(245,197,24,0.08), inset 0 0 20px rgba(245,197,24,0.03)",
      }}
    >
      <FireBurst />
      <div className="relative h-32 overflow-hidden">
        {mod.images?.[0] ? (
          <img src={mod.images[0]} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ background: "linear-gradient(135deg, #1a0a00, #0a0500)" }}>
            <Package className="w-10 h-10 text-amber-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: CP.yellow }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: CP.pink }} />
        {mod.is_premium && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black" style={{ background: `${CP.yellow}30`, border: `1px solid ${CP.yellow}60`, color: CP.yellow }}>PREMIUM</div>
        )}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1 py-0.5 rounded text-[8px]" style={{ background: "rgba(0,0,0,0.7)", color: CP.cyan }}>
          <Eye className="w-2 h-2 theme-glow-icon" /> {(mod.views || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-xs truncate">{mod.title}</p>
        <OwnerPill item={mod} owner={owner} />
        <PlacementBadges item={mod} />
        <p className="font-black mt-0.5 text-xs" style={{ color: CP.yellow }}>{mod.price > 0 ? `₱${mod.price?.toLocaleString()}` : "FREE"}</p>
        <div className="flex items-center gap-1 mt-1" style={{ color: `${CP.cyan}80` }}>
          <Download className="w-2.5 h-2.5 theme-glow-icon" /><span className="text-[8px]">{(mod.downloads || 0).toLocaleString()} downloads</span>
        </div>
        <CardActions item={mod} liked={liked} likeCount={likeCount} onLike={handleLike} user={user} profile={profile} />
      </div>
    </motion.a>
  );
}

function ProductCard({ product, user, profile, owner }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likes || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    base44.entities.Listing.update(product.id, { likes: liked ? likeCount - 1 : likeCount + 1 }).catch(() => {});
  };

  const glow = listingGlow(product);
  return (
    <motion.a
      href={`/listing?id=${product.id}`}
      whileHover={{ scale: 1.05, y: -6, boxShadow: "0 0 40px rgba(0,212,255,0.35), 0 0 80px rgba(0,212,255,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative w-48 flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer block ${glow.className}`}
      style={{
        ...glow.style,
        background: "rgba(0,18,8,0.55)",
        border: "1px solid rgba(0,212,255,0.3)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 4px 24px rgba(0,212,255,0.07), inset 0 0 20px rgba(0,212,255,0.03)",
      }}
    >
      <FireBurst />
      <div className="h-28 overflow-hidden relative">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ background: "linear-gradient(135deg, #001a0a, #000d05)" }}><Package className="w-9 h-9 text-green-300" /></div>
        )}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: CP.cyan }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: CP.pink }} />
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1 py-0.5 rounded text-[8px]" style={{ background: "rgba(0,0,0,0.7)", color: CP.cyan }}>
          <Eye className="w-2 h-2 theme-glow-icon" /> {(product.views || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-xs truncate">{product.title}</p>
        <OwnerPill item={product} owner={owner} />
        <PlacementBadges item={product} />
        <p className="font-black mt-0.5 text-xs" style={{ color: "#4ade80" }}>₱{(product.price || 0).toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1" style={{ color: `${CP.cyan}80` }}>
          <Download className="w-2 h-2 theme-glow-icon" /><span className="text-[8px]">{(product.downloads || 0).toLocaleString()}</span>
        </div>
        <CardActions item={product} liked={liked} likeCount={likeCount} onLike={handleLike} user={user} profile={profile} />
      </div>
    </motion.a>
  );
}

// Static PC/Mobile game deals
const PC_DEALS = [];

const MOBILE_DEALS = [];

// Section label component
function SectionLabel({ icon: Icon, label, color, pulse }) {
  return (
    <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center gap-2">
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-white font-bold text-sm">{label}</span>
      {pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-1" style={{ background: color }} />}
    </div>
  );
}

export default function MovingDashboard({ currentUser, currentProfile }) {
  const [mods, setMods] = useState([]);
  const [products, setProducts] = useState([]);
  const [pcGames, setPcGames] = useState([]);
  const [mobileGames, setMobileGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sellerProfiles, setSellerProfiles] = useState({});

  const [freeMods, setFreeMods] = useState([]);
  const [paidMods, setPaidMods] = useState([]);

  useEffect(() => {
    if (currentUser) setUser(currentUser);
    if (currentProfile) setProfile(currentProfile);
  }, [currentUser, currentProfile]);

  useEffect(() => {
    const load = async () => {
      const [listings, profiles] = await Promise.all([getActiveListings(), base44.entities.UserProfile.list()]);
      setSellerProfiles(Object.fromEntries(profiles.map(p => [p.user_email, p])));
      // Deduplicate by id
      const seen = new Set();
      const unique = listings.filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; });
      const realActive = unique.filter(l => l.is_approved !== false);
      const allMods = realActive.filter(l => l.category === "modding" || l.category === "premium_mods");
      const allGames = realActive.filter(l => l.category === "games");
      setPcGames(allGames.filter(g => (g.platforms || []).some(p => String(p).toLowerCase().includes("pc") || String(p).toLowerCase().includes("steam"))).slice(0, 16));
      setMobileGames(allGames.filter(g => (g.platforms || []).some(p => String(p).toLowerCase().includes("android") || String(p).toLowerCase().includes("mobile") || String(p).toLowerCase().includes("ios"))).slice(0, 16));
      setFreeMods(allMods.filter(m => !m.price || m.price === 0 || m.is_free).slice(0, 16));
      setPaidMods(allMods.filter(m => m.price > 0 && !m.is_free).slice(0, 16));
      setMods(allMods.slice(0, 16));
      setProducts(realActive.filter(l => l.category !== "modding" && l.category !== "content").slice(0, 16));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <section className="py-16 overflow-hidden relative" style={{ background: `linear-gradient(180deg, #030712 0%, ${CP.darkBg} 40%, #050005 70%, #030712 100%)` }}>
      {/* Cyberpunk scanline effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px)",
      }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          {/* Cyberpunk title style */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm mb-4" style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.3)",
            boxShadow: "0 0 20px rgba(0,212,255,0.1), inset 0 0 10px rgba(0,212,255,0.05)",
          }}>
            <Zap className="w-3 h-3 animate-pulse" style={{ color: CP.cyan }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: CP.cyan }}>LIVE · COMMUNITY FEED</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: CP.pink }} />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white mb-1" style={{
            textShadow: `0 0 30px ${CP.purple}60`,
          }}>
            What's{" "}
            <span style={{
              background: `linear-gradient(90deg, ${CP.cyan}, ${CP.purple}, ${CP.pink})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Trending
            </span>
          </h2>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: `${CP.cyan}60` }}>
            REAL-TIME · CONTENT · MODS · MARKETPLACE · PC & MOBILE LISTINGS
          </p>

          {/* Cyberpunk divider */}
          <div className="flex items-center gap-2 justify-center mt-3">
            <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(90deg, transparent, ${CP.cyan}60)` }} />
            <div className="w-2 h-2 rotate-45" style={{ background: CP.cyan }} />
            <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(90deg, ${CP.cyan}60, transparent)` }} />
          </div>
        </motion.div>
      </div>

      {/* Real PC game listings */}
      {pcGames.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Monitor} label="PC GAME LISTINGS" color={CP.cyan} />
          <ScrollRow speed={38}>
            {pcGames.map((g, i) => <ProductCard key={i} product={g} user={user} profile={profile} owner={sellerProfiles[g.seller_email]} />)}
          </ScrollRow>
        </div>
      )}

      {/* Real mobile game listings */}
      {mobileGames.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Smartphone} label="MOBILE GAME LISTINGS" color={CP.pink} />
          <ScrollRow speed={42} reverse>
            {mobileGames.map((g, i) => <ProductCard key={i} product={g} user={user} profile={profile} owner={sellerProfiles[g.seller_email]} />)}
          </ScrollRow>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mb-8">
        <MascotShowcase
          compact={false}
        />
      </div>

      {/* Paid/Premium Mods */}
      {paidMods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="PREMIUM MODS — Paid" color={CP.yellow} />
          <ScrollRow speed={35} reverse>
            {paidMods.map((m, i) => <ModCard key={i} mod={m} user={user} profile={profile} owner={sellerProfiles[m.seller_email]} />)}
          </ScrollRow>
        </div>
      )}

      {/* Free Mods */}
      {freeMods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="FREE MODS — Community" color="#4ade80" />
          <ScrollRow speed={38}>
            {freeMods.map((m, i) => <ModCard key={i} mod={m} user={user} profile={profile} owner={sellerProfiles[m.seller_email]} />)}
          </ScrollRow>
        </div>
      )}

      {/* Fallback: all mods if no split available */}
      {paidMods.length === 0 && freeMods.length === 0 && mods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="TOP MODS" color={CP.yellow} />
          <ScrollRow speed={35} reverse>
            {mods.map((m, i) => <ModCard key={i} mod={m} user={user} profile={profile} owner={sellerProfiles[m.seller_email]} />)}
          </ScrollRow>
        </div>
      )}

      {/* Marketplace */}
      {products.length > 0 && (
        <div>
          <SectionLabel icon={TrendingUp} label="MARKETPLACE LISTINGS" color="#4ade80" />
          <ScrollRow speed={45}>
            {products.map((p, i) => <ProductCard key={i} product={p} user={user} profile={profile} owner={sellerProfiles[p.seller_email]} />)}
          </ScrollRow>
        </div>
      )}

      {/* Cyberpunk bottom accent */}
      <div className="max-w-7xl mx-auto px-4 mt-10 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${CP.cyan}40, ${CP.purple}60, ${CP.pink}40, transparent)` }} />
        <a href="/category?cat=games" className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-xs font-bold transition-all hover:opacity-80"
          style={{ background: `${CP.cyan}15`, border: `1px solid ${CP.cyan}40`, color: CP.cyan }}>
          <ExternalLink className="w-3 h-3" /> VIEW ALL
        </a>
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${CP.pink}40, ${CP.purple}60, ${CP.cyan}40, transparent)` }} />
      </div>
    </section>
  );
}