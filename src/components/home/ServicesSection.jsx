import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, BarChart2, Headphones, RefreshCw } from "lucide-react";

const services = [
  "1 Community",
  "Game Catalog & Inventory",
  "Secure Payments",
  "Esports Analytics",
  "Gamer Support Portal",
];

const features = [
  {
    icon: "🔧",
    title: "Modding Community — Upload, share and sell mods for WWE2K, GTA, FIFA, NBA2K, PPSSPP, PS2 & more",
  },
  {
    icon: "🛒",
    title: "Marketplace — Buy and sell gaming accounts, items, mods, and gear directly from community members",
  },
  {
    icon: "🎬",
    title: "Share gaming videos, content, streams and highlights with the community",
  },
  {
    icon: "🕹️",
    title: "Built for Gamers — by a Gamer. Founded by Kevin Roberto in 2026.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Service tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-14">
          {services.map((s, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border cursor-default ${
                i === 0
                  ? "bg-purple-600/20 border-purple-600/60 text-purple-300"
                  : "bg-gray-900 border-gray-700 text-gray-400"
              }`}
            >
              {s}
            </motion.span>
          ))}
        </div>

        {/* Main card */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left - cycle visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center py-10"
          >
            <div className="relative w-64 h-64">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-700/30 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-4 rounded-full border border-pink-700/20 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
              {/* Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl mb-1">🕹️</span>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">GAMER</span>
                <span className="text-sm text-white font-bold">PRODUCTIONS</span>
              </div>
              {/* Orbit icons */}
              {[
                { icon: "🛒", label: "PLAYER", angle: 0 },
                { icon: "🏆", label: "WIN", angle: 120 },
                { icon: "🎮", label: "PLAY", angle: 240 },
              ].map(({ icon, label, angle }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 110;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                return (
                  <div
                    key={label}
                    className="absolute flex flex-col items-center"
                    style={{ left: `calc(50% + ${x}px - 24px)`, top: `calc(50% + ${y}px - 24px)` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-900 border border-purple-700/50 flex flex-col items-center justify-center">
                      <span className="text-lg">{icon}</span>
                      <span className="text-gray-400 text-[9px] font-bold">{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right - features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-3">
              GAMER Productions
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              SERVICES: ALL-IN-ONE{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GAMER HUB
              </span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              GAMER Productions — local gaming community, real connections. We bring you the best deals, reviews,
              and esports content — all in one place.
            </p>
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{f.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}