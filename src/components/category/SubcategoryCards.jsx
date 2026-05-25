import React, { useState } from "react";
import { motion } from "framer-motion";

// Per-category subcategory card configs
const SUBCATEGORY_CONFIG = {
  modding: [
    { id: "WWE2K",         emoji: "🤼", title: "WWE2K",         desc: "Mods, rosters, attires & arenas",   color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Hot" },
    { id: "Football Life", emoji: "⚽", title: "Football Life", desc: "Patches, kits & stadium mods",      color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Popular" },
    { id: "GTA 4",         emoji: "🚗", title: "GTA 4",         desc: "Car packs, maps & scripts",         color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Classic" },
    { id: "GTA 5",         emoji: "🏙️", title: "GTA 5",         desc: "Scripts, textures & full packs",   color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",   badge: "🔥 Top" },
    { id: "GTA SA",        emoji: "🌴", title: "GTA SA",        desc: "Texture packs, mods & cheats",      color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)",  badge: "Legend" },
    { id: "Android",       emoji: "📱", title: "Android",       desc: "APK mods, patched games & tools",   color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Mobile" },
    { id: "PES",           emoji: "🏟️", title: "PES",           desc: "Option files, kits & gameplay",    color: "from-cyan-950 to-cyan-900",   border: "border-cyan-500/50",    glow: "rgba(6,182,212,0.6)",    badge: "Soccer" },
    { id: "FIFA",          emoji: "🥅", title: "FIFA",          desc: "Squad updates, kits & stadiums",    color: "from-indigo-950 to-indigo-900", border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)",  badge: "Soccer" },
    { id: "NBA2K",         emoji: "🏀", title: "NBA2K",         desc: "Cyberfaces, courts & rosters",      color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)",  badge: "🔥 Top" },
    { id: "PPSSPP/PSP",    emoji: "🎮", title: "PPSSPP / PSP",  desc: "ISO files, cheats & texture packs", color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Retro" },
    { id: "PS2",           emoji: "🕹️", title: "PS2",           desc: "ISO mods & classic game patches",  color: "from-slate-900 to-slate-800", border: "border-slate-500/50",   glow: "rgba(100,116,139,0.6)",  badge: "Classic" },
    { id: "PC",            emoji: "🖥️", title: "PC",            desc: "PC mods, trainers & patches",       color: "from-gray-900 to-gray-800",   border: "border-gray-500/50",    glow: "rgba(156,163,175,0.6)",  badge: "All Games" },
  ],
  games: [
    { id: "PC",               emoji: "🖥️", title: "PC Games",         desc: "Steam, Epic, GOG & more",           color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Steam" },
    { id: "PlayStation",      emoji: "🎮", title: "PlayStation",       desc: "PS4, PS5 — digital & disc",         color: "from-indigo-950 to-indigo-900", border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)",  badge: "PS4/PS5" },
    { id: "Xbox",             emoji: "🟩", title: "Xbox",              desc: "Xbox One & Series X/S deals",       color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Series X" },
    { id: "Nintendo Switch",  emoji: "🔴", title: "Nintendo Switch",   desc: "Physical & digital Switch titles",   color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Nintendo" },
    { id: "Mobile",           emoji: "📱", title: "Mobile Games",      desc: "Android & iOS top titles",           color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Mobile" },
  ],
  buy_sell: [
    { id: "Game Accounts",             emoji: "🔑", title: "Game Accounts",              desc: "Ranked & smurf accounts",            color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",   badge: "Hot" },
    { id: "In-Game Items",             emoji: "💎", title: "In-Game Items",              desc: "Rare items, boosters & keys",        color: "from-cyan-950 to-cyan-900",   border: "border-cyan-500/50",    glow: "rgba(6,182,212,0.6)",    badge: "Trade" },
    { id: "Skins",                     emoji: "🎨", title: "Skins",                      desc: "Character, weapon & vehicle skins",  color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Rare" },
    { id: "Gift Cards",                emoji: "🎁", title: "Gift Cards",                 desc: "Steam, PSN, Xbox & more",            color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Digital" },
    { id: "Premium Mods - WWE2K",      emoji: "🤼", title: "Premium WWE2K Mods",         desc: "Full DLC & roster mods",             color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Premium" },
    { id: "Premium Mods - GTA 5",      emoji: "🏙️", title: "Premium GTA 5 Mods",        desc: "Script & visual mega-packs",         color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Premium" },
    { id: "Premium Mods - GTA SA",     emoji: "🌴", title: "Premium GTA SA Mods",        desc: "San Andreas visual overhauls",       color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Premium" },
    { id: "Premium Mods - FIFA",       emoji: "🥅", title: "Premium FIFA Mods",          desc: "Updated kits, squads & faces",       color: "from-indigo-950 to-indigo-900", border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)", badge: "Premium" },
    { id: "Premium Mods - PES",        emoji: "🏟️", title: "Premium PES Mods",          desc: "Option files & stadium packs",       color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Premium" },
    { id: "Premium Mods - NBA2K",      emoji: "🏀", title: "Premium NBA2K Mods",         desc: "Cyberfaces, courts & jerseys",       color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Premium" },
    { id: "Premium Mods - Football Life", emoji: "⚽", title: "Premium Football Life Mods", desc: "Kits, balls & stadium packs",     color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Premium" },
    { id: "Premium Mods - PPSSPP/PSP", emoji: "🎮", title: "Premium PPSSPP/PSP Mods",    desc: "ISO packs & texture bundles",        color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Premium" },
  ],
  tournaments: [
    { id: "FPS",            emoji: "🎯", title: "FPS",             desc: "CS2, Valorant, COD & more",          color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Shooter" },
    { id: "Battle Royale",  emoji: "🪂", title: "Battle Royale",   desc: "PUBG, Fortnite, Free Fire",          color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)",  badge: "Top" },
    { id: "MOBA",           emoji: "🧙", title: "MOBA",            desc: "MLBB, DOTA2, LoL events",            color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Esports" },
    { id: "Sports",         emoji: "🏆", title: "Sports",          desc: "FIFA, NBA2K, PES cups",              color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Online" },
    { id: "Fighting",       emoji: "🥊", title: "Fighting",        desc: "Tekken, MK, Street Fighter",         color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "1v1" },
    { id: "Mobile Gaming",  emoji: "📱", title: "Mobile Gaming",   desc: "Mobile Legends, CODM & more",        color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Mobile" },
  ],
  content: [
    { id: "Gaming Videos",  emoji: "🎮", title: "Gaming Videos",  desc: "Gameplay & full playthroughs",       color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Watch" },
    { id: "Streaming",      emoji: "📡", title: "Streaming",      desc: "Live stream replays & VODs",         color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Live" },
    { id: "Tutorials",      emoji: "📚", title: "Tutorials",      desc: "Guides, tips & how-to videos",       color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Learn" },
    { id: "Reviews",        emoji: "⭐", title: "Reviews",        desc: "Honest game & gear reviews",         color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Rate" },
    { id: "Highlights",     emoji: "✂️", title: "Highlights",     desc: "Best clips & epic moments",          color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Clips" },
    { id: "Clips",          emoji: "🎬", title: "Clips",          desc: "Short-form gaming clips",            color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Short" },
  ],
  jobs: [
    { id: "QA Testing",          emoji: "🔍", title: "QA Testing",          desc: "Game testing & bug hunting",         color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Remote" },
    { id: "Game Dev",            emoji: "💻", title: "Game Dev",            desc: "Unity, Unreal, indie dev roles",     color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Dev" },
    { id: "Community Manager",   emoji: "🤝", title: "Community Manager",   desc: "Discord, social & fan management",  color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Social" },
    { id: "Esports Coach",       emoji: "🏆", title: "Esports Coach",       desc: "Train & grow competitive teams",     color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Coach" },
    { id: "Content Creator",     emoji: "🎥", title: "Content Creator",     desc: "Brand deals, sponsored content",     color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Creator" },
  ],
  livestream: [
    { id: "Gameplay Streams",  emoji: "🎮", title: "Gameplay Streams",  desc: "Live gaming sessions",               color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "LIVE" },
    { id: "Tournaments",       emoji: "🏆", title: "Tournaments",       desc: "Competitive live events",            color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Event" },
    { id: "Esports Events",    emoji: "🎯", title: "Esports Events",    desc: "Pro-level esports broadcasts",       color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Pro" },
    { id: "Mod Reviews",       emoji: "🔧", title: "Mod Reviews",       desc: "Live mod showcase & testing",        color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Mods" },
    { id: "Q&A Sessions",      emoji: "❓", title: "Q&A Sessions",      desc: "Creator & community Q&As",           color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Talk" },
    { id: "Unboxing",          emoji: "📦", title: "Unboxing",          desc: "Gear & game unboxing streams",       color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "New" },
  ],
  services: [
    { id: "PC Repair",          emoji: "🔧", title: "PC Repair",          desc: "Hardware fixes & upgrades",          color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Tech" },
    { id: "Custom Builds",      emoji: "🖥️", title: "Custom Builds",      desc: "PC builds tailored for gaming",      color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Build" },
    { id: "Coaching",           emoji: "🏆", title: "Coaching",           desc: "Rank up with pro coaching",          color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Pro" },
    { id: "Boosting",           emoji: "⚡", title: "Boosting",           desc: "Rank boosting & leveling",           color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Fast" },
    { id: "Design Services",    emoji: "🎨", title: "Design Services",    desc: "Logos, banners & overlays",          color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Creative" },
  ],
};

function SubcardItem({ item, cat, index }) {
  const [hovered, setHovered] = useState(false);
  const href = `/category?cat=${cat}&sub=${encodeURIComponent(item.id)}`;

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block rounded-2xl cursor-pointer"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
        style={{ opacity: hovered ? 1 : 0, boxShadow: `0 0 32px 8px ${item.glow}` }}
      />

      <div className={`relative h-48 rounded-2xl border-2 ${item.border} bg-gradient-to-br ${item.color} p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden`}>
        {/* Badge */}
        <div className="flex justify-between items-start">
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-white/70 text-[9px] font-bold uppercase tracking-wide">
            {item.badge}
          </span>
          <motion.span
            className="text-white/20 text-xs font-bold"
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 4 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        </div>

        {/* Emoji */}
        <motion.div
          className="text-4xl"
          animate={hovered ? { scale: 1.25, rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.35 }}
        >
          {item.emoji}
        </motion.div>

        {/* Text */}
        <div>
          <p className="text-white font-black text-base leading-tight">{item.title}</p>
          <p className="text-white/40 text-[10px] mt-0.5 leading-tight line-clamp-2">{item.desc}</p>
        </div>

        {/* Bottom shimmer on hover */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${item.glow}, transparent)` }}
          animate={{ opacity: hovered ? 1 : 0 }}
        />
      </div>
    </motion.a>
  );
}

export default function SubcategoryCards({ cat, categoryName }) {
  const items = SUBCATEGORY_CONFIG[cat] || [];

  if (!items.length) return null;

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">Browse by</p>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          {categoryName} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Subcategories</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Click a card to explore listings</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <SubcardItem key={item.id} item={item} cat={cat} index={i} />
        ))}
      </div>
    </div>
  );
}