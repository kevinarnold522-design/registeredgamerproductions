import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Package, Star, Eye, TrendingUp, Zap, Download, Monitor, Smartphone, ExternalLink, Heart, MessageCircle, Share2, Flag, Bookmark, Repeat } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RepostButton from "@/components/shared/RepostButton";

// Cyberpunk 2077-inspired color palette combined with site theme
const CP = {
  yellow: "#f5c518",
  cyan: "#00d4ff",
  pink: "#ff2d78",
  purple: "#a855f7",
  darkBg: "#050008",
};

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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileHover={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 pointer-events-none z-20 flex items-end justify-center pb-1 overflow-hidden"
    >
      {["🔥","🔥","🔥"].map((f, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -18, 0], opacity: [0.7, 1, 0.7], scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          className="text-base"
          style={{ marginLeft: i === 1 ? 0 : i === 0 ? -6 : 6 }}
        >{f}</motion.span>
      ))}
    </motion.div>
  );
}

function CardActions({ item, liked, likeCount, onLike, user, profile }) {
  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/listing?id=${item.id}`;
    try { if (navigator.share) { await navigator.share({ title: item.title, url }); return; } } catch {}
    try { await navigator.clipboard.writeText(url); } catch {}
  };
  const handleFav = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const me = await base44.auth.me();
      if (!me) { base44.auth.redirectToLogin(window.location.href); return; }
      await base44.entities.Favorite.create({ user_email: me.email, listing_id: item.id, listing_title: item.title });
    } catch {}
  };
  const handleReport = (e) => {
    e.preventDefault(); e.stopPropagation();
    window.open(`/contact?report=${item.id}`, "_blank");
  };
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
      <button onClick={onLike} className="flex items-center gap-0.5 text-[8px] transition-colors" style={{ color: liked ? "#ec4899" : `${CP.pink}60` }}>
        <Heart className="w-2.5 h-2.5" style={{ fill: liked ? "#ec4899" : "none" }} /> {likeCount}
      </button>
      <a href={`/listing?id=${item.id}#comments`} onClick={e => e.stopPropagation()} className="flex items-center gap-0.5 text-[8px]" style={{ color: `${CP.cyan}60` }}>
        <MessageCircle className="w-2.5 h-2.5" />
      </a>
      <button onClick={handleShare} className="flex items-center gap-0.5 text-[8px]" style={{ color: `${CP.purple}80` }} title="Share">
        <Share2 className="w-2.5 h-2.5" />
      </button>
      <button onClick={handleFav} className="flex items-center gap-0.5 text-[8px]" style={{ color: `${CP.yellow}80` }} title="Save to Favourites">
        <Bookmark className="w-2.5 h-2.5" />
      </button>
      <RepostButton item={item} type="listing" user={user} profile={profile} compact />
      <button onClick={handleReport} className="flex items-center gap-0.5 text-[8px]" style={{ color: "rgba(239,68,68,0.5)" }} title="Report">
        <Flag className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

function ModCard({ mod, user, profile }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(mod.likes || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    base44.entities.Listing.update(mod.id, { likes: liked ? likeCount - 1 : likeCount + 1 }).catch(() => {});
  };

  return (
    <motion.a
      href={`/listing?id=${mod.id}`}
      whileHover={{ scale: 1.05, y: -6, boxShadow: "0 0 40px rgba(245,197,24,0.4), 0 0 80px rgba(245,197,24,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-52 flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer block"
      style={{
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
            <span className="text-4xl">🔧</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: CP.yellow }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: CP.pink }} />
        {mod.is_premium && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black" style={{ background: `${CP.yellow}30`, border: `1px solid ${CP.yellow}60`, color: CP.yellow }}>PREMIUM</div>
        )}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1 py-0.5 rounded text-[8px]" style={{ background: "rgba(0,0,0,0.7)", color: CP.cyan }}>
          <Eye className="w-2 h-2" /> {(mod.views || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-xs truncate">{mod.title}</p>
        <p className="font-black mt-0.5 text-xs" style={{ color: CP.yellow }}>{mod.price > 0 ? `₱${mod.price?.toLocaleString()}` : "FREE"}</p>
        <div className="flex items-center gap-1 mt-1" style={{ color: `${CP.cyan}80` }}>
          <Download className="w-2.5 h-2.5" /><span className="text-[8px]">{(mod.downloads || 0).toLocaleString()} downloads</span>
        </div>
        <CardActions item={mod} liked={liked} likeCount={likeCount} onLike={handleLike} user={user} profile={profile} />
      </div>
    </motion.a>
  );
}

function ProductCard({ product, user, profile }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likes || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    base44.entities.Listing.update(product.id, { likes: liked ? likeCount - 1 : likeCount + 1 }).catch(() => {});
  };

  return (
    <motion.a
      href={`/listing?id=${product.id}`}
      whileHover={{ scale: 1.05, y: -6, boxShadow: "0 0 40px rgba(0,212,255,0.35), 0 0 80px rgba(0,212,255,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-48 flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer block"
      style={{
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
          <div className="flex items-center justify-center h-full text-4xl" style={{ background: "linear-gradient(135deg, #001a0a, #000d05)" }}>🛒</div>
        )}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: CP.cyan }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: CP.pink }} />
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1 py-0.5 rounded text-[8px]" style={{ background: "rgba(0,0,0,0.7)", color: CP.cyan }}>
          <Eye className="w-2 h-2" /> {(product.views || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-xs truncate">{product.title}</p>
        <p className="font-black mt-0.5 text-xs" style={{ color: "#4ade80" }}>₱{(product.price || 0).toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1" style={{ color: `${CP.cyan}80` }}>
          <Download className="w-2 h-2" /><span className="text-[8px]">{(product.downloads || 0).toLocaleString()}</span>
        </div>
        <CardActions item={product} liked={liked} likeCount={likeCount} onLike={handleLike} user={user} profile={profile} />
      </div>
    </motion.a>
  );
}

// Static PC/Mobile game deals
const PC_DEALS = [
  { title: "Cyberpunk 2077", price: "$29.99", off: "-50%", store: "STEAM", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=160&fit=crop" },
  { title: "Elden Ring", price: "$39.99", off: "-33%", store: "STEAM", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=160&fit=crop" },
  { title: "GTA V", price: "$14.99", off: "-50%", store: "STEAM", img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=160&fit=crop" },
  { title: "Fortnite", price: "FREE", off: "FREE", store: "EPIC", img: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&h=160&fit=crop" },
  { title: "Baldur's Gate 3", price: "$59.99", off: "HOT", store: "STEAM", img: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=160&fit=crop" },
  { title: "Witcher 3", price: "$9.99", off: "-75%", store: "STEAM", img: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=300&h=160&fit=crop" },
];

const MOBILE_DEALS = [
  { title: "Mobile Legends", platform: "Android/iOS", genre: "MOBA", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=160&fit=crop" },
  { title: "PUBG Mobile", platform: "Android/iOS", genre: "BR", img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=160&fit=crop" },
  { title: "Genshin Impact", platform: "Android/iOS", genre: "RPG", img: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=160&fit=crop" },
  { title: "Free Fire", platform: "Android", genre: "BR", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=160&fit=crop" },
  { title: "COD Mobile", platform: "Android/iOS", genre: "FPS", img: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&h=160&fit=crop" },
  { title: "Minecraft PE", platform: "Android/iOS", genre: "Sandbox", img: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=300&h=160&fit=crop" },
];

function PCDealCard({ game }) {
  const isFree = game.price === "FREE";
  const isEpic = game.store === "EPIC";
  return (
    <motion.a href="/category?cat=games"
      whileHover={{ scale: 1.06, y: -6, boxShadow: isEpic ? "0 0 36px rgba(168,85,247,0.45)" : "0 0 36px rgba(0,212,255,0.4)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-44 flex-shrink-0 rounded-2xl overflow-hidden group block cursor-pointer"
      style={{
        background: "rgba(5,0,16,0.55)",
        border: `1px solid ${isEpic ? "rgba(168,85,247,0.4)" : "rgba(0,212,255,0.3)"}`,
        backdropFilter: "blur(18px)",
      }}>
      <FireBurst />
      <div className="relative h-24 overflow-hidden">
        <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-black"
          style={{ background: isFree ? "#16a34a" : `${CP.yellow}cc`, color: isFree ? "white" : "black" }}>{game.off}</div>
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold"
          style={{ background: isEpic ? "#7c3aed" : "#1d4ed8", color: "white" }}>{game.store}</div>
      </div>
      <div className="p-2.5">
        <p className="text-white font-bold text-xs truncate">{game.title}</p>
        <p className="font-black text-xs mt-0.5" style={{ color: isFree ? "#4ade80" : CP.yellow }}>{game.price}</p>
      </div>
    </motion.a>
  );
}

function MobileDealCard({ game }) {
  return (
    <motion.a href="/category?cat=games&sub=mobile"
      whileHover={{ scale: 1.06, y: -6, boxShadow: "0 0 36px rgba(255,45,120,0.4)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-40 flex-shrink-0 rounded-2xl overflow-hidden group block"
      style={{
        background: "rgba(0,5,13,0.55)",
        border: "1px solid rgba(255,45,120,0.3)",
        backdropFilter: "blur(18px)",
      }}>
      <FireBurst />
      <div className="relative h-24 overflow-hidden">
        <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${CP.pink}40`, border: `1px solid ${CP.pink}60`, color: CP.pink }}>{game.genre}</div>
      </div>
      <div className="p-2.5">
        <p className="text-white font-bold text-xs truncate">{game.title}</p>
        <p className="text-[9px] mt-0.5" style={{ color: `${CP.pink}99` }}>{game.platform}</p>
      </div>
    </motion.a>
  );
}

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

export default function MovingDashboard() {
  const [mods, setMods] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [freeMods, setFreeMods] = useState([]);
  const [paidMods, setPaidMods] = useState([]);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        base44.auth.me().then(me => {
          setUser(me);
          if (me) base44.entities.UserProfile.filter({ user_email: me.email }).then(p => p.length > 0 && setProfile(p[0]));
        });
      }
    });
    const load = async () => {
      const listings = await base44.entities.Listing.filter({ status: "active" }, "-created_date", 80);
      // Deduplicate by id
      const seen = new Set();
      const unique = listings.filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; });
      const allMods = unique.filter(l => l.category === "modding");
      setFreeMods(allMods.filter(m => !m.price || m.price === 0 || m.is_free).slice(0, 16));
      setPaidMods(allMods.filter(m => m.price > 0 && !m.is_free).slice(0, 16));
      setMods(allMods.slice(0, 16));
      setProducts(unique.filter(l => l.category !== "modding" && l.category !== "content").slice(0, 16));
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
            REAL-TIME · CONTENT · MODS · MARKETPLACE · PC & MOBILE DEALS
          </p>

          {/* Cyberpunk divider */}
          <div className="flex items-center gap-2 justify-center mt-3">
            <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(90deg, transparent, ${CP.cyan}60)` }} />
            <div className="w-2 h-2 rotate-45" style={{ background: CP.cyan }} />
            <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(90deg, ${CP.cyan}60, transparent)` }} />
          </div>
        </motion.div>
      </div>

      {/* PC Game Deals */}
      <div className="mb-8">
        <SectionLabel icon={Monitor} label="PC GAME DEALS — Steam & Epic" color={CP.cyan} />
        <ScrollRow speed={38}>
          {PC_DEALS.map((g, i) => <PCDealCard key={i} game={g} />)}
        </ScrollRow>
      </div>

      {/* Mobile Games */}
      <div className="mb-8">
        <SectionLabel icon={Smartphone} label="TOP MOBILE GAMES — Android & iOS" color={CP.pink} />
        <ScrollRow speed={42} reverse>
          {MOBILE_DEALS.map((g, i) => <MobileDealCard key={i} game={g} />)}
        </ScrollRow>
      </div>

      {/* Paid/Premium Mods */}
      {paidMods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="💎 PREMIUM MODS — Paid" color={CP.yellow} />
          <ScrollRow speed={35} reverse>
            {paidMods.map((m, i) => <ModCard key={i} mod={m} user={user} profile={profile} />)}
          </ScrollRow>
        </div>
      )}

      {/* Free Mods */}
      {freeMods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="🆓 FREE MODS — Community" color="#4ade80" />
          <ScrollRow speed={38}>
            {freeMods.map((m, i) => <ModCard key={i} mod={m} user={user} profile={profile} />)}
          </ScrollRow>
        </div>
      )}

      {/* Fallback: all mods if no split available */}
      {paidMods.length === 0 && freeMods.length === 0 && mods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="TOP MODS" color={CP.yellow} />
          <ScrollRow speed={35} reverse>
            {mods.map((m, i) => <ModCard key={i} mod={m} user={user} profile={profile} />)}
          </ScrollRow>
        </div>
      )}

      {/* Marketplace */}
      {products.length > 0 && (
        <div>
          <SectionLabel icon={TrendingUp} label="MARKETPLACE LISTINGS" color="#4ade80" />
          <ScrollRow speed={45}>
            {products.map((p, i) => <ProductCard key={i} product={p} user={user} profile={profile} />)}
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