import React from "react";
import { motion } from "framer-motion";
// lucide icons not needed - using custom GameIcons
import { IconMod, IconStore, IconPlay, IconController } from "@/components/icons/GameIcons";

const services = [
  "1 Community",
  "Game Catalog & Inventory",
  "Secure Payments",
  "Esports Analytics",
  "Gamer Support Portal",
];

const features = [
  {
    Icon: IconMod,
    color: "#fb923c",
    title: "Modding Community — Upload, share and sell mods for WWE2K, GTA, FIFA, NBA2K, PPSSPP, PS2 & more",
  },
  {
    Icon: IconStore,
    color: "#4ade80",
    title: "Marketplace — Buy and sell gaming accounts, items, mods, and gear directly from community members",
  },
  {
    Icon: IconPlay,
    color: "#60a5fa",
    title: "Content Social Platform — Share gaming videos for ALL games, streams, highlights with the community",
  },
  {
    Icon: IconController,
    color: "#a855f7",
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
                <IconController size={40} color="#a855f7" />
                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">GAMER</span>
                <span className="text-sm text-white font-bold">PRODUCTIONS</span>
              </div>
              {/* Orbit icons */}
              {[
                { icon: IconStore, color: "#4ade80", label: "MARKET", angle: 0 },
                { icon: IconMod, color: "#fb923c", label: "MODS", angle: 120 },
                { icon: IconPlay, color: "#60a5fa", label: "STREAM", angle: 240 },
              ].map(({ icon: OIcon, color, label, angle }) => {
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
                    <div className="w-12 h-12 rounded-full bg-gray-900 border border-purple-700/50 flex flex-col items-center justify-center gap-0.5">
                      <OIcon size={16} color={color} />
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
              GAMER Productions — the global gaming community. Stream, share mods, sell gear, and connect with gamers worldwide. We bring you the best gaming content, deals, and community — all in one platform.
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
                  <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.Icon size={16} color={f.color} />
                  </div>
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