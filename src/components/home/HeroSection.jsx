import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Users, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

function LiveStats() {
  const [stats, setStats] = useState({ users: 0, listings: 0 });
  useEffect(() => {
    const load = async () => {
      try {
        const [profiles, listings] = await Promise.all([
          base44.entities.UserProfile.list(),
          base44.entities.Listing.list(),
        ]);
        setStats({ users: profiles.length, listings: listings.filter(l => l.status === "active").length });
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className="flex flex-wrap justify-center gap-8 mb-16 text-center">
      <div>
        <div className="text-2xl font-black text-white">{stats.users > 0 ? stats.users.toLocaleString() : "—"}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Registered Gamers</div>
      </div>
      <div>
        <div className="text-2xl font-black text-white">{stats.listings > 0 ? stats.listings.toLocaleString() : "—"}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Active Listings</div>
      </div>
      <div>
        <div className="flex items-center gap-1 justify-center"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span><span className="text-2xl font-black text-white">LIVE</span></div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Platform Status</div>
      </div>
    </motion.div>
  );
}

const quickLinks = [
  { icon: "🎮", label: "Looking for Games?", sub: "PC, Console & Mobile" },
  { icon: "🖥️", label: "Looking for Gear?", sub: "Keyboards, Mice & Monitors" },
  { icon: "🔥", label: "Hot Deals?", sub: "Best prices today" },
  { icon: "🏆", label: "Tournaments?", sub: "Join & compete" },
  { icon: "🎧", label: "Looking for Audio?", sub: "Headsets & Speakers" },
  { icon: "💻", label: "Looking for a PC?", sub: "Gaming rigs & laptops" },
  { icon: "🛒", label: "Buy & Sell?", sub: "Accounts & in-game items" },
  { icon: "🎬", label: "Content Creator?", sub: "Streaming gear & tips" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(236,72,153,0.1) 0%, transparent 50%), #030712",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold tracking-wider uppercase">
            <Zap className="w-3 h-3" />
            🎮 Proudly Built for Gamers · Est. 2026
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight">
            <span className="text-white">Welcome to </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              GAMER Productions
            </span>
          </h1>
          <p className="mt-4 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We connect gamers to the best games, gear, and community —{" "}
            <span className="text-purple-400 font-semibold">worldwide</span>.
          </p>
          <p className="mt-2 text-gray-500 text-sm max-w-xl mx-auto">
            Founded by Kevin Roberto in 2026 as a gaming hub that helps players and creators
            connect — a growing community thanks to you.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
        >
          <a
            href="#categories"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" />
            Explore Categories
          </a>
          <a
            href="#community"
            className="px-8 py-3.5 rounded-xl border border-purple-700/60 text-purple-300 font-bold text-base hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Join Community
          </a>
          <a
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Sign Up Now & Be Part of the Community
          </a>
        </motion.div>

        {/* Live Stats */}
        <LiveStats />

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {quickLinks.map((item, i) => (
            <motion.a
              key={i}
              href="#categories"
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-purple-700/60 transition-colors cursor-pointer group"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white text-xs font-semibold text-center leading-tight group-hover:text-purple-300 transition-colors">
                {item.label}
              </span>
              <span className="text-gray-500 text-xs text-center">{item.sub}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}