import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const games = [
  {
    title: "Elden Ring: Nightreign",
    genre: "Action RPG",
    badge: "🔥 Most Hyped",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=70",
    avgPrice: "$59.99",
    bestDeal: "$39.99",
    bestPlatform: "Steam",
    platforms: [
      { name: "Steam", url: "https://store.steampowered.com", price: "$39.99" },
      { name: "PlayStation Store", url: "https://www.playstation.com", price: "$49.99" },
      { name: "Xbox Store", url: "https://www.xbox.com", price: "$49.99" },
    ],
  },
  {
    title: "Call of Duty: Black Ops 7",
    genre: "FPS / Shooter",
    badge: "⚡ Top Seller",
    image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&q=70",
    avgPrice: "$69.99",
    bestDeal: "$49.99",
    bestPlatform: "Battle.net",
    platforms: [
      { name: "Battle.net", url: "https://us.battle.net", price: "$49.99" },
      { name: "Xbox Store", url: "https://www.xbox.com", price: "$69.99" },
      { name: "PlayStation Store", url: "https://www.playstation.com", price: "$69.99" },
    ],
  },
  {
    title: "Valorant Episode 10",
    genre: "Tactical Shooter",
    badge: "🆓 Free to Play",
    image: "https://images.unsplash.com/photo-1640272788428-dc4b8023a7be?w=600&q=70",
    avgPrice: "Free",
    bestDeal: "Free",
    bestPlatform: "Riot Games",
    platforms: [
      { name: "Riot Games", url: "https://playvalorant.com", price: "Free" },
    ],
  },
  {
    title: "Cyberpunk 2077: Phantom DLC 2",
    genre: "Open World RPG",
    badge: "🌟 Award Winner",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70",
    avgPrice: "$29.99",
    bestDeal: "$19.99",
    bestPlatform: "GOG",
    platforms: [
      { name: "GOG", url: "https://www.gog.com", price: "$19.99" },
      { name: "Steam", url: "https://store.steampowered.com", price: "$24.99" },
      { name: "Epic Games", url: "https://www.epicgames.com", price: "$29.99" },
    ],
  },
  {
    title: "The Legend of Zelda: Echoes",
    genre: "Adventure",
    badge: "🎖️ GOTY Contender",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=70",
    avgPrice: "$69.99",
    bestDeal: "$59.99",
    bestPlatform: "Nintendo eShop",
    platforms: [
      { name: "Nintendo eShop", url: "https://www.nintendo.com", price: "$59.99" },
    ],
  },
  {
    title: "Fortnite: Chapter 6 Season 3",
    genre: "Battle Royale",
    badge: "🎮 Trending",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=70",
    avgPrice: "Free",
    bestDeal: "Free",
    bestPlatform: "Epic Games",
    platforms: [
      { name: "Epic Games", url: "https://www.epicgames.com", price: "Free" },
      { name: "PlayStation Store", url: "https://www.playstation.com", price: "Free" },
      { name: "Xbox Store", url: "https://www.xbox.com", price: "Free" },
    ],
  },
];

function GameCard({ game }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700/50 transition-colors"
    >
      <div className="relative">
        <img src={game.image} alt={game.title} className="w-full h-44 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 text-xs font-bold bg-gray-950/80 text-purple-300 border border-purple-700/50 px-2.5 py-1 rounded-full">
          {game.badge}
        </span>
      </div>

      <div className="p-5">
        <p className="text-purple-400 text-xs font-semibold mb-1">{game.genre}</p>
        <h3 className="text-white font-bold text-lg mb-3 leading-tight">{game.title}</h3>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-gray-500 text-[10px]">Avg Price</p>
            <p className="text-white text-sm font-bold">{game.avgPrice}</p>
          </div>
          <div className="bg-purple-900/40 border border-purple-700/50 rounded-lg p-2">
            <p className="text-gray-500 text-[10px]">Best Deal</p>
            <p className="text-purple-300 text-sm font-bold">{game.bestDeal}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-gray-500 text-[10px]">Best On</p>
            <p className="text-white text-xs font-bold leading-tight">{game.bestPlatform}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-purple-400 font-semibold py-2 hover:text-purple-300 transition-colors"
        >
          <span>Compare Platforms</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-2">
            {game.platforms.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-gray-800/60 hover:bg-gray-800 rounded-lg px-3 py-2.5 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${new URL(p.url).hostname}&sz=32`}
                    alt={p.name}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-gray-300 text-sm">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold text-sm">from {p.price}</span>
                  <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-purple-400" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FeaturedGames() {
  return (
    <section id="games" className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-1">
              Best Deals
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Featured{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Games
              </span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Steam, Epic, PlayStation, Xbox & Nintendo — compare all stores in one place
            </p>
          </div>
          <a href="#" className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
            All Games →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game, i) => (
            <GameCard key={i} game={game} />
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Prices are indicative. Click each platform to buy directly on their official site.
        </p>
      </div>
    </section>
  );
}