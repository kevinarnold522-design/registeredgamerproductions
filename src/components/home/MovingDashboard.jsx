import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, Zap, Monitor, Smartphone, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MascotShowcase from "@/components/shared/MascotShowcase";
import StandardListingCard from "@/components/listings/StandardListingCard";
import { getActiveListings } from "@/lib/homeDataCache";
import { computeMonthlyRanks } from "@/lib/monthlyRank";

// Cyberpunk 2077-inspired color palette combined with site theme
const CP = {
  yellow: "#f5c518",
  cyan: "#00d4ff",
  pink: "#ff2d78",
  purple: "#a855f7",
  darkBg: "#2a0a26",
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

// Standardized superglow card (same design as the modding community listings),
// wrapped at a fixed width so it fits inside the horizontal scroll rows.
function ScrollCard({ item, user, profile, rank }) {
  return (
    <div className="w-[420px] max-w-[88vw] flex-shrink-0">
      <StandardListingCard listing={item} user={user} profile={profile} monthlyRank={rank} />
    </div>
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
  const [rankMap, setRankMap] = useState(new Map());

  useEffect(() => {
    if (currentUser) setUser(currentUser);
    if (currentProfile) setProfile(currentProfile);
  }, [currentUser, currentProfile]);

  useEffect(() => {
    const load = async () => {
      const [listings, profilesRes] = await Promise.all([getActiveListings(), base44.entities.UserProfile.list()]);
      const profiles = Array.isArray(profilesRes) ? profilesRes : (profilesRes?.data || profilesRes?.records || []);
      setSellerProfiles(Object.fromEntries(profiles.map(p => [p.user_email, p])));
      // Deduplicate by id
      const seen = new Set();
      const unique = listings.filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; });
      const realActive = unique.filter(l => l.is_approved !== false);
      setRankMap(computeMonthlyRanks(realActive));
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
    <section className="py-16 overflow-hidden relative" style={{ background: `linear-gradient(180deg, #2a0a26 0%, ${CP.darkBg} 40%, #3a0d36 70%, #2a0a26 100%)` }}>
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
            {pcGames.map((g, i) => <ScrollCard key={i} item={g} user={user} profile={profile} rank={rankMap.get(g.id)} />)}
          </ScrollRow>
        </div>
      )}

      {/* Real mobile game listings */}
      {mobileGames.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Smartphone} label="MOBILE GAME LISTINGS" color={CP.pink} />
          <ScrollRow speed={42} reverse>
            {mobileGames.map((g, i) => <ScrollCard key={i} item={g} user={user} profile={profile} rank={rankMap.get(g.id)} />)}
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
            {paidMods.map((m, i) => <ScrollCard key={i} item={m} user={user} profile={profile} rank={rankMap.get(m.id)} />)}
          </ScrollRow>
        </div>
      )}

      {/* Free Mods */}
      {freeMods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="FREE MODS — Community" color="#4ade80" />
          <ScrollRow speed={38}>
            {freeMods.map((m, i) => <ScrollCard key={i} item={m} user={user} profile={profile} rank={rankMap.get(m.id)} />)}
          </ScrollRow>
        </div>
      )}

      {/* Fallback: all mods if no split available */}
      {paidMods.length === 0 && freeMods.length === 0 && mods.length > 0 && (
        <div className="mb-8">
          <SectionLabel icon={Package} label="TOP MODS" color={CP.yellow} />
          <ScrollRow speed={35} reverse>
            {mods.map((m, i) => <ScrollCard key={i} item={m} user={user} profile={profile} rank={rankMap.get(m.id)} />)}
          </ScrollRow>
        </div>
      )}

      {/* Marketplace */}
      {products.length > 0 && (
        <div>
          <SectionLabel icon={TrendingUp} label="MARKETPLACE LISTINGS" color="#4ade80" />
          <ScrollRow speed={45}>
            {products.map((p, i) => <ScrollCard key={i} item={p} user={user} profile={profile} rank={rankMap.get(p.id)} />)}
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