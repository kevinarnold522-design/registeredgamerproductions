import React from "react";
import { motion } from "framer-motion";

const items = [
  "🎮 Elden Ring DLC — $29.99",
  "🖥️ ASUS ROG Monitor 240Hz — $349",
  "🏆 Valorant Champions Tour 2026",
  "✈️ Tokyo Game Show — Register Now",
  "🎧 HyperX Cloud III — $79.99",
  "💻 RTX 5090 Gaming PC — $2,499",
  "🛒 Steam Sale — Up to 90% Off",
  "🎬 Join Free — Be Part of the Community",
  "🔥 Call of Duty Season 5 Live Now",
  "🎮 PlayStation 6 Pre-Order Open",
  "🏅 Esports League Registration Open",
  "🖱️ Logitech G Pro X Superlight 2 — $159",
];

export default function MarqueeTicker() {
  const doubled = [...items, ...items];

  return (
    <div className="relative bg-gradient-to-r from-purple-900/80 via-pink-900/60 to-purple-900/80 border-y border-purple-700/30 py-3 overflow-hidden">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
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