import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import HomeListingCard from "@/components/home/HomeListingCard";
import { getActiveListings } from "@/lib/homeDataCache";
import { computeMonthlyRanks } from "@/lib/monthlyRank";

// Horizontal auto-scrolling row of standardized listing cards.
function ScrollRow({ children, speed = 36, reverse = false }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-4"
        style={{ animation: `cmdScroll${reverse ? "R" : ""} ${speed}s linear infinite`, width: "max-content" }}
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes cmdScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes cmdScrollR { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function ScrollCard({ item, user, profile, rank }) {
  return (
    <div className="w-[320px] max-w-[84vw] flex-shrink-0">
      <HomeListingCard listing={{ ...item, monthlyRank: rank }} user={user} profile={profile} className="h-full" />
    </div>
  );
}

/**
 * A self-contained moving dashboard for a single category.
 * @param {function} filterFn - (listing) => boolean, which listings belong here
 */
export default function CategoryMovingDashboard({
  title,
  subtitle,
  accent = "#a855f7",
  icon: Icon,
  filterFn,
  viewAllHref,
  user,
  profile,
  reverse = false,
}) {
  const [items, setItems] = useState([]);
  const [rankMap, setRankMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveListings().then((listings) => {
      const seen = new Set();
      const unique = listings.filter((l) => { if (seen.has(l.id)) return false; seen.add(l.id); return true; });
      const matched = unique.filter((l) => l.is_approved !== false && filterFn(l)).slice(0, 16);
      setRankMap(computeMonthlyRanks(matched));
      setItems(matched);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
            style={{ background: `${accent}15`, border: `1px solid ${accent}40` }}>
            {Icon && <Icon className="w-3.5 h-3.5" style={{ color: accent }} />}
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>LIVE FEED</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white" style={{ textShadow: `0 0 24px ${accent}50` }}>{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </motion.div>
      </div>

      <ScrollRow speed={40} reverse={reverse}>
        {items.map((item, i) => <ScrollCard key={i} item={item} user={user} profile={profile} rank={rankMap.get(item.id)} />)}
      </ScrollRow>

      {viewAllHref && (
        <div className="max-w-7xl mx-auto px-4 mt-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${accent}50, transparent)` }} />
          <a href={viewAllHref} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
            style={{ background: `${accent}15`, border: `1px solid ${accent}40`, color: accent }}>
            <ExternalLink className="w-3 h-3" /> VIEW ALL
          </a>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${accent}50, transparent)` }} />
        </div>
      )}
    </section>
  );
}