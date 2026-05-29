import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  IconController, IconMod, IconStream, IconTrophy, IconStore,
  IconPlay, IconJobs, IconServices
} from "@/components/icons/GameIcons";
// Note: IconGear removed — Gaming Gear is now a subcategory of Buy & Sell

// Direct routing — each category maps to /category?cat=ID
const moddingCategory = {
  icon: IconMod,
  iconColor: "#fb923c",
  title: "Modding Community",
  sub: "Upload, Share & Download Mods — GTA, FIFA, NBA2K, PPSSPP, Minecraft & more",
  color: "from-orange-950 via-amber-950 to-gray-950",
  borderColor: "border-orange-500/60",
  glowColor: "rgba(249,115,22,0.7)",
  href: "/category?cat=modding",
  tags: ["PPSSPP", "GTA 5", "FIFA", "NBA2K", "Minecraft", "Android"],
};

const communityCategory = {
  icon: () => <span style={{ fontSize: 32 }}>🌐</span>,
  iconColor: "#a78bfa",
  title: "Gaming Community",
  sub: "50+ Franchise Communities · CoD, FIFA, Minecraft & more",
  color: "from-violet-950 to-purple-900",
  borderColor: "border-violet-500/60",
  glowColor: "rgba(139,92,246,0.7)",
  href: "/gaming-community",
  badge: "NEW",
  isNew: true,
};

const otherCategories = [
  {
    icon: IconController, iconColor: "#a855f7",
    title: "Games",
    sub: "Top deals from Steam, Epic · Android & iOS titles",
    color: "from-purple-950 to-purple-900",
    borderColor: "border-purple-500/50", glowColor: "rgba(139,92,246,0.6)",
    href: "/category?cat=games",
    badge: "Steam · Epic · Mobile",
  },
  {
    icon: IconStore, iconColor: "#eab308",
    title: "Buy & Sell",
    sub: "Accounts, Items, Gear, Gift Cards & Premium Mods",
    color: "from-yellow-950 to-yellow-900",
    borderColor: "border-yellow-500/50", glowColor: "rgba(234,179,8,0.6)",
    href: "/category?cat=buy_sell",
    badge: "All Users",
  },
  {
    icon: IconTrophy, iconColor: "#4ade80",
    title: "Tournaments",
    sub: "MLBB, CS2, Valorant, FIFA, NBA2K & global events",
    color: "from-green-950 to-green-900",
    borderColor: "border-green-500/50", glowColor: "rgba(74,222,128,0.6)",
    href: "/category?cat=tournaments",
    badge: "Global",
  },
  {
    icon: IconStream, iconColor: "#f87171",
    title: "Live Streams",
    sub: "Watch & Go Live Now",
    color: "from-red-950 to-red-900",
    borderColor: "border-red-500/50", glowColor: "rgba(239,68,68,0.6)",
    href: "/category?cat=livestream",
    live: true,
    badge: "LIVE",
  },
  {
    icon: IconPlay, iconColor: "#60a5fa",
    title: "Content",
    sub: "Videos, Clips, Reviews & Highlights",
    color: "from-blue-950 to-blue-900",
    borderColor: "border-blue-500/50", glowColor: "rgba(59,130,246,0.6)",
    href: "/category?cat=content",
    badge: "Videos",
  },
  {
    icon: IconJobs, iconColor: "#f87171",
    title: "Gaming Jobs",
    sub: "QA, Dev, Coaching & Community",
    color: "from-rose-950 to-rose-900",
    borderColor: "border-rose-500/50", glowColor: "rgba(248,113,113,0.5)",
    href: "/category?cat=jobs",
    badge: "Careers",
  },
  {
    icon: IconServices, iconColor: "#818cf8",
    title: "Services",
    sub: "PC Repair, Coaching, Design & More",
    color: "from-indigo-950 to-indigo-900",
    borderColor: "border-indigo-500/50", glowColor: "rgba(99,102,241,0.6)",
    href: "/category?cat=services",
    badge: "Pro Help",
  },
];

function SmallCard({ cat, index }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const CatIcon = cat.icon;

  return (
    <motion.div
      onClick={() => navigate(cat.href)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="relative rounded-2xl cursor-pointer block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0, boxShadow: `0 0 28px 6px ${cat.glowColor}` }} />

      <div className={`relative h-44 rounded-2xl border-2 ${cat.borderColor} bg-gradient-to-br ${cat.color} p-4 flex flex-col items-center justify-center gap-3 transition-all`}>
        {cat.live && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600/80 text-white text-[8px] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
          </div>
        )}
        {cat.badge && !cat.live && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/40 text-white/60 text-[8px] font-semibold">{cat.badge}</div>
        )}
        <motion.div
          animate={hovered ? { scale: 1.2, rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.35 }}
        >
          <CatIcon size={32} color={cat.iconColor} />
        </motion.div>
        <div className="text-center">
          <div className="text-white font-bold text-sm group-hover:text-white transition-colors">{cat.title}</div>
          <div className="text-white/40 text-[10px] mt-0.5 leading-tight">{cat.sub}</div>
        </div>
        {/* Hover arrow */}
        <div className={`absolute bottom-3 right-3 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <span className="text-white/60 text-xs font-bold">→</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CategoryCards() {
  const [modHovered, setModHovered] = useState(false);
  const navigate = useNavigate();
  const ModIcon = moddingCategory.icon;

  return (
    <section id="categories" className="py-16 px-4 bg-gray-950/90 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">GAMER.Productions</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Browse by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">Click any category to explore</p>
        </motion.div>

        {/* MODDING — Hero large card */}
        <motion.div
          onClick={() => navigate(moddingCategory.href)}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative mb-6 rounded-3xl cursor-pointer overflow-hidden block"
          style={{
            height: "240px",
            border: `2px solid ${modHovered ? "rgba(249,115,22,0.8)" : "rgba(249,115,22,0.3)"}`,
            transition: "border-color 0.3s",
            boxShadow: modHovered ? "0 0 50px 12px rgba(249,115,22,0.4), 0 0 100px 30px rgba(249,115,22,0.15)" : "0 0 20px rgba(249,115,22,0.1)",
          }}
          onMouseEnter={() => setModHovered(true)}
          onMouseLeave={() => setModHovered(false)}
          whileHover={{ scale: 1.005 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-amber-950 to-gray-950" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(249,115,22,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <motion.div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.3), transparent)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />

          <div className="relative z-10 h-full flex items-center px-8 md:px-16 gap-8">
            <motion.div animate={modHovered ? { rotate: [0, -10, 10, 0], scale: 1.15 } : { scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="w-20 h-20 rounded-2xl bg-orange-900/40 border-2 border-orange-500/50 flex items-center justify-center"
                style={{ boxShadow: modHovered ? "0 0 30px rgba(249,115,22,0.6)" : "none" }}>
                <ModIcon size={44} color="#fb923c" />
              </div>
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-wider">Featured</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase">Most Popular</span>
              </div>
              <h3 className="text-white font-black text-3xl md:text-4xl mb-2" style={{ textShadow: modHovered ? "0 0 30px rgba(249,115,22,0.8)" : "none" }}>
                Modding Community
              </h3>
              <p className="text-orange-200/70 text-base max-w-xl">
                Upload, share & download mods — <strong className="text-orange-300">PPSSPP, Football Life, PES, FIFA, NBA2K, GTA5, GTA SA, WWE2K, Minecraft, Android</strong> & more.
              </p>
              {/* game tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {moddingCategory.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-300 text-[10px] font-semibold">{t}</span>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-orange-300 font-bold text-sm">
              Explore → 
            </div>
          </div>
        </motion.div>

        {/* Gaming Community — second hero card */}
        <motion.div
          onClick={() => navigate(communityCategory.href)}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative mb-6 rounded-3xl cursor-pointer overflow-hidden"
          style={{
            height: "200px",
            border: "2px solid rgba(139,92,246,0.5)",
            boxShadow: "0 0 30px rgba(139,92,246,0.15)",
          }}
          whileHover={{ scale: 1.005, boxShadow: "0 0 60px rgba(139,92,246,0.35)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-gray-950" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <motion.div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
          <div className="relative z-10 h-full flex items-center px-8 md:px-16 gap-8">
            <div className="w-20 h-20 rounded-2xl bg-purple-900/40 border-2 border-purple-500/50 flex items-center justify-center text-4xl"
              style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
              🌐
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider">NEW</span>
                <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-black uppercase">50+ Franchises</span>
              </div>
              <h3 className="text-white font-black text-3xl md:text-4xl mb-2">Gaming Community</h3>
              <p className="text-purple-200/70 text-base max-w-xl">
                Join communities for <strong className="text-purple-300">Call of Duty, Minecraft, GTA, Valorant, FIFA, NBA2K, UFC, WWE, Mario</strong> & 40+ more franchises.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-purple-300 font-bold text-sm">Explore →</div>
          </div>
        </motion.div>

        {/* Other Categories — direct click cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {otherCategories.map((cat, i) => (
            <SmallCard key={i} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}