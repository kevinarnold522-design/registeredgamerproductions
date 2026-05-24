import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const gear = [
  {
    title: "ASUS ROG Swift 360Hz Monitor",
    category: "Monitor",
    badge: "🏆 Top Pick",
    image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=70",
    avgPrice: "$499",
    bestDeal: "$389",
    bestPlatform: "Newegg",
    stores: [
      { name: "Newegg", url: "https://www.newegg.com", price: "$389" },
      { name: "Amazon", url: "https://www.amazon.com", price: "$419" },
      { name: "Best Buy", url: "https://www.bestbuy.com", price: "$449" },
    ],
  },
  {
    title: "Logitech G Pro X Superlight 2",
    category: "Gaming Mouse",
    badge: "⚡ Pro Choice",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=70",
    avgPrice: "$159",
    bestDeal: "$129",
    bestPlatform: "Amazon",
    stores: [
      { name: "Amazon", url: "https://www.amazon.com", price: "$129" },
      { name: "B&H Photo", url: "https://www.bhphotovideo.com", price: "$139" },
      { name: "Best Buy", url: "https://www.bestbuy.com", price: "$159" },
    ],
  },
  {
    title: "SteelSeries Apex Pro TKL",
    category: "Mechanical Keyboard",
    badge: "🔥 Best Seller",
    image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=600&q=70",
    avgPrice: "$199",
    bestDeal: "$159",
    bestPlatform: "Newegg",
    stores: [
      { name: "Newegg", url: "https://www.newegg.com", price: "$159" },
      { name: "Amazon", url: "https://www.amazon.com", price: "$179" },
      { name: "Best Buy", url: "https://www.bestbuy.com", price: "$199" },
    ],
  },
  {
    title: "HyperX Cloud III Wireless",
    category: "Gaming Headset",
    badge: "🎧 Fan Favorite",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=70",
    avgPrice: "$149",
    bestDeal: "$109",
    bestPlatform: "Amazon",
    stores: [
      { name: "Amazon", url: "https://www.amazon.com", price: "$109" },
      { name: "Best Buy", url: "https://www.bestbuy.com", price: "$129" },
      { name: "Newegg", url: "https://www.newegg.com", price: "$139" },
    ],
  },
  {
    title: "NVIDIA GeForce RTX 5080",
    category: "Graphics Card",
    badge: "🌟 Next-Gen",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=70",
    avgPrice: "$999",
    bestDeal: "$899",
    bestPlatform: "Newegg",
    stores: [
      { name: "Newegg", url: "https://www.newegg.com", price: "$899" },
      { name: "Amazon", url: "https://www.amazon.com", price: "$949" },
      { name: "Best Buy", url: "https://www.bestbuy.com", price: "$999" },
    ],
  },
  {
    title: "Corsair RM1000x PSU",
    category: "Power Supply",
    badge: "⚡ Reliable Pick",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=70",
    avgPrice: "$189",
    bestDeal: "$149",
    bestPlatform: "Amazon",
    stores: [
      { name: "Amazon", url: "https://www.amazon.com", price: "$149" },
      { name: "Newegg", url: "https://www.newegg.com", price: "$159" },
      { name: "Best Buy", url: "https://www.bestbuy.com", price: "$179" },
    ],
  },
];

function GearCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-pink-700/50 transition-colors"
    >
      <div className="relative">
        <img src={item.image} alt={item.title} className="w-full h-44 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 text-xs font-bold bg-gray-950/80 text-pink-300 border border-pink-700/50 px-2.5 py-1 rounded-full">
          {item.badge}
        </span>
      </div>

      <div className="p-5">
        <p className="text-pink-400 text-xs font-semibold mb-1">{item.category}</p>
        <h3 className="text-white font-bold text-lg mb-3 leading-tight">{item.title}</h3>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-gray-500 text-[10px]">Avg Price</p>
            <p className="text-white text-sm font-bold">{item.avgPrice}</p>
          </div>
          <div className="bg-pink-900/40 border border-pink-700/50 rounded-lg p-2">
            <p className="text-gray-500 text-[10px]">Best Deal</p>
            <p className="text-pink-300 text-sm font-bold">{item.bestDeal}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-gray-500 text-[10px]">Best On</p>
            <p className="text-white text-xs font-bold leading-tight">{item.bestPlatform}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-pink-400 font-semibold py-2 hover:text-pink-300 transition-colors"
        >
          <span>Compare Stores</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-2">
            {item.stores.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-gray-800/60 hover:bg-gray-800 rounded-lg px-3 py-2.5 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=32`}
                    alt={s.name}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-gray-300 text-sm">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-300 font-bold text-sm">from {s.price}</span>
                  <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-pink-400" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TopGamingGear() {
  return (
    <section id="gear" className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <p className="text-pink-400 text-sm font-semibold uppercase tracking-wider mb-1">
              Best Gear
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Top Gaming{" "}
              <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Hardware
              </span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Amazon, Newegg, Best Buy & more — compare all stores in one place
            </p>
          </div>
          <a href="#" className="text-pink-400 hover:text-pink-300 text-sm font-semibold transition-colors">
            All Gear →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gear.map((item, i) => (
            <GearCard key={i} item={item} />
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Prices are indicative. Click each store to buy directly on their official site.
        </p>
      </div>
    </section>
  );
}