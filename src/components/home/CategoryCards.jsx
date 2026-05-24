import React, { useState } from "react";
import { motion } from "framer-motion";

const categories = [
  { icon: "🎮", title: "Games", sub: "PC, Console & Mobile Titles", back: "Browse Games", suit: "♠", rank: "A", color: "from-purple-900 to-purple-700", borderColor: "border-purple-500/50", glowColor: "rgba(139,92,246,0.6)", href: "/?cat=games" },
  { icon: "🖥️", title: "Gaming Gear", sub: "Keyboards, Mice & Monitors", back: "Shop Gear", suit: "♥", rank: "K", color: "from-pink-900 to-pink-700", borderColor: "border-pink-500/50", glowColor: "rgba(236,72,153,0.6)", href: "/?cat=gear" },
  { icon: "🔧", title: "Modding Community", sub: "WWE2K, GTA, FIFA, PES & More", back: "Browse Mods", suit: "♣", rank: "M", color: "from-orange-900 to-orange-700", borderColor: "border-orange-500/50", glowColor: "rgba(249,115,22,0.6)", href: "/?cat=modding" },
  { icon: "🛒", title: "Buy & Sell", sub: "Accounts, Items, Premium Mods", back: "Trade Now", suit: "♦", rank: "Q", color: "from-yellow-900 to-yellow-700", borderColor: "border-yellow-500/50", glowColor: "rgba(234,179,8,0.6)", href: "/?cat=buy_sell" },
  { icon: "🏆", title: "Tournaments", sub: "Esports & Competitions", back: "Join Event", suit: "♣", rank: "J", color: "from-green-900 to-green-700", borderColor: "border-green-500/50", glowColor: "rgba(74,222,128,0.6)", href: "/?cat=tournaments" },
  { icon: "📡", title: "Live Streams", sub: "Watch & Go Live Now", back: "Watch Live", suit: "♠", rank: "L", color: "from-red-900 to-red-700", borderColor: "border-red-500/50", glowColor: "rgba(239,68,68,0.6)", href: "#livestream" },
  { icon: "🎬", title: "Content", sub: "Gaming Videos & Clips", back: "Watch Now", suit: "♠", rank: "10", color: "from-blue-900 to-blue-700", borderColor: "border-blue-500/50", glowColor: "rgba(59,130,246,0.6)", href: "/?cat=content" },
  { icon: "💼", title: "Gaming Jobs", sub: "QA, Dev, Community & More", back: "Find Jobs", suit: "♦", rank: "9", color: "from-red-900 to-red-700", borderColor: "border-red-500/50", glowColor: "rgba(248,113,113,0.5)", href: "/?cat=jobs" },
  { icon: "🛠️", title: "Services", sub: "PC Repair, Coaching & More", back: "Browse Services", suit: "♥", rank: "8", color: "from-indigo-900 to-indigo-700", borderColor: "border-indigo-500/50", glowColor: "rgba(99,102,241,0.6)", href: "/?cat=services" },
];

function FlipCard({ cat, index }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="relative h-56 cursor-pointer"
      style={{ perspective: "1000px" }}
      onHoverStart={() => { setFlipped(true); setHovered(true); }}
      onHoverEnd={() => { setFlipped(false); setHovered(false); }}
      onClick={() => setFlipped(!flipped)}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: hovered ? 1 : 0,
          boxShadow: `0 0 30px 8px ${cat.glowColor}, 0 0 60px 16px ${cat.glowColor}40`,
          borderRadius: "1rem",
          zIndex: 10,
        }}
      />

      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 ${cat.borderColor} bg-gradient-to-br ${cat.color} p-5 flex flex-col justify-between`}
          style={{
            backfaceVisibility: "hidden",
            background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
          }}
        >
          {/* Live badge for livestreams */}
          {cat.rank === "L" && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[9px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
            </div>
          )}
          <div className="flex justify-between items-start">
            <span className="text-white/60 text-lg font-bold">{cat.rank}</span>
            <span className="text-white/40 text-lg">{cat.suit}</span>
          </div>
          <div className="text-center">
            <motion.div
              animate={hovered ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-2"
            >
              {cat.icon}
            </motion.div>
            <div className="text-white font-bold text-base">{cat.title}</div>
            <div className="text-white/60 text-xs mt-1">{cat.sub}</div>
          </div>
          <div className="flex justify-between items-end rotate-180">
            <span className="text-white/60 text-lg font-bold">{cat.rank}</span>
            <span className="text-white/40 text-lg">{cat.suit}</span>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 ${cat.borderColor} bg-gray-950 flex flex-col items-center justify-center gap-3`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-4xl">{cat.icon}</div>
          <div className="text-white font-bold text-base">{cat.title}</div>
          <a
            href={cat.href || "#categories"}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ boxShadow: `0 0 15px ${cat.glowColor}` }}
          >
            {cat.back}
          </a>
          <p className="text-gray-600 text-xs">Tap to explore</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CategoryCards() {
  return (
    <section id="categories" className="py-16 px-4 bg-gray-950 relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">GAMER Productions</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Browse by{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">Hover to flip • Glow activates on touch • Click to explore</p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {categories.map((cat, i) => (
            <FlipCard key={i} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}