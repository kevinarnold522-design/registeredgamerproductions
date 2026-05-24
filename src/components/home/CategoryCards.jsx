import React, { useState } from "react";
import { motion } from "framer-motion";

const categories = [
  {
    icon: "🎮",
    title: "Games",
    sub: "PC, Console & Mobile Titles",
    back: "Browse Games",
    suit: "♠",
    rank: "A",
    color: "from-purple-900 to-purple-700",
    borderColor: "border-purple-500/50",
  },
  {
    icon: "🖥️",
    title: "Gaming Gear",
    sub: "Keyboards, Mice & Monitors",
    back: "Shop Gear",
    suit: "♥",
    rank: "K",
    color: "from-pink-900 to-pink-700",
    borderColor: "border-pink-500/50",
  },
  {
    icon: "🛒",
    title: "Buy & Sell",
    sub: "Accounts, Items & Skins",
    back: "Trade Now",
    suit: "♦",
    rank: "Q",
    color: "from-yellow-900 to-yellow-700",
    borderColor: "border-yellow-500/50",
  },
  {
    icon: "🏆",
    title: "Tournaments",
    sub: "Esports & Competitions",
    back: "Join Event",
    suit: "♣",
    rank: "J",
    color: "from-green-900 to-green-700",
    borderColor: "border-green-500/50",
  },
  {
    icon: "🎬",
    title: "Content",
    sub: "Streaming, Videos & Clips",
    back: "Watch Now",
    suit: "♠",
    rank: "10",
    color: "from-blue-900 to-blue-700",
    borderColor: "border-blue-500/50",
  },
  {
    icon: "💼",
    title: "Gaming Jobs",
    sub: "QA, Dev, Community & More",
    back: "Find Jobs",
    suit: "♦",
    rank: "9",
    color: "from-red-900 to-red-700",
    borderColor: "border-red-500/50",
  },
];

function FlipCard({ cat }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative h-52 cursor-pointer"
      style={{ perspective: "1000px" }}
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl border ${cat.borderColor} bg-gradient-to-br ${cat.color} p-5 flex flex-col justify-between`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex justify-between items-start">
            <span className="text-white/60 text-lg font-bold">{cat.rank}</span>
            <span className="text-white/40 text-lg">{cat.suit}</span>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">{cat.icon}</div>
            <div className="text-white font-bold text-lg">{cat.title}</div>
            <div className="text-white/60 text-xs mt-1">{cat.sub}</div>
          </div>
          <div className="flex justify-between items-end rotate-180">
            <span className="text-white/60 text-lg font-bold">{cat.rank}</span>
            <span className="text-white/40 text-lg">{cat.suit}</span>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl border ${cat.borderColor} bg-gray-900 flex flex-col items-center justify-center gap-3`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-4xl">{cat.icon}</div>
          <div className="text-white font-bold text-lg">{cat.title}</div>
          <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            {cat.back}
          </button>
          <p className="text-gray-500 text-xs">Tap to explore</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CategoryCards() {
  return (
    <section id="categories" className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-2">
            RegisteredGamerProductions
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Browse by{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">Hover to flip • Click to explore</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <FlipCard key={i} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}