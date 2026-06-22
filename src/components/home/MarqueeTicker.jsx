import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const defaultItems = [
  "🎮 Welcome to GAMER Productions",
  "🔧 Modding Community — Upload & Share Your Mods",
  "🏆 Join the Community — 1 Mindset · 1 Goal",
  "🛒 Buy & Sell Gaming Products",
  "🎬 Share Your Gaming Videos & Content",
  "⚡ Sign Up Free — No Credit Card Required",
];

export default function MarqueeTicker() {
  const [items, setItems] = useState(defaultItems);

  useEffect(() => {
    const load = async () => {
      try {
        const listings = await base44.entities.Listing.list("-created_date", 10);
        const liveItems = listings
          .filter(l => l.status === "active" && l.title)
          .map(l => `${l.category === "modding" ? "🔧" : l.category === "games" ? "🎮" : l.category === "gear" ? "🖥️" : "🛒"} ${l.title} — $${l.price?.toLocaleString()}`);
        if (liveItems.length > 0) {
          setItems([...defaultItems.slice(0, 3), ...liveItems]);
        }
      } catch {}
    };
    load();
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="relative bg-gradient-to-r from-purple-900/80 via-pink-900/60 to-purple-900/80 border-y border-purple-700/30 py-3 overflow-hidden">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-sm text-purple-200 font-medium flex-shrink-0">
            {item}
            <span className="mx-4 text-purple-600">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}