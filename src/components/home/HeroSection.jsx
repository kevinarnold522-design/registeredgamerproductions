import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Zap, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";

function CreateListingHeroButton() {
  const [show, setShow] = useState(false);
  const [accountType, setAccountType] = useState(null);
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (auth) => {
      if (!auth) return;
      const me = await base44.auth.me();
      const { isAdmin } = await import("@/lib/constants");
      if (isAdmin(me?.email)) { setShow(true); setAccountType("admin"); return; }
      const profiles = await base44.entities.UserProfile.filter({ user_email: me?.email });
      const type = profiles[0]?.account_type;
      if (type === "digital_creator" || type === "business") { setShow(true); setAccountType(type); }
    });
  }, []);
  if (!show) return null;
  return (
    <motion.a
      href="/create-listing"
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      className="px-8 py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 text-white"
      style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}
    >
      <span>🏪</span> Create Listing
    </motion.a>
  );
}

function SignInHeroButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => setShow(!auth));
  }, []);
  if (!show) return null;
  return (
    <motion.button
      onClick={() => base44.auth.redirectToLogin("https://gamerproductions.vercel.app/")}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      className="px-10 py-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-500 text-white font-black text-lg hover:from-gray-700 hover:to-gray-600 transition-all flex items-center justify-center gap-2 shadow-lg"
    >
      Log In
    </motion.button>
  );
}

function LiveStats() {
  const [stats, setStats] = useState({ listings: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserCount, setAdminUserCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (auth) {
          const me = await base44.auth.me();
          const { isAdmin: checkAdmin } = await import("@/lib/constants");
          if (checkAdmin(me?.email)) {
            setIsAdmin(true);
            const profiles = await base44.entities.UserProfile.list();
            setAdminUserCount(profiles.length);
          }
        }
        const listings = await base44.entities.Listing.list();
        setStats({ listings: listings.filter(l => l.status === "active").length });
      } catch {}
    };
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className="flex flex-wrap justify-center gap-8 mb-14 text-center">
      {/* Registered Gamers — admin only */}
      {isAdmin && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative px-6 py-3 rounded-2xl"
          style={{
            background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1))",
            border: "1px solid rgba(139,92,246,0.4)",
            boxShadow: "0 0 20px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1)",
          }}
        >
          <motion.div
            animate={{ textShadow: ["0 0 10px #a855f7", "0 0 30px #ec4899", "0 0 10px #a855f7"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            {adminUserCount > 0 ? adminUserCount.toLocaleString() : "—"}
          </motion.div>
          <div className="text-xs text-purple-300 uppercase tracking-wider mt-1 font-semibold">⚡ Registered Gamers</div>
        </motion.div>
      )}

      <div className="text-center">
        <div className="text-3xl font-black text-white">{stats.listings > 0 ? stats.listings.toLocaleString() : "—"}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Active Listings</div>
      </div>

      <div className="text-center">
        <div className="flex items-center gap-1 justify-center">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span className="text-3xl font-black text-white">LIVE</span>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Platform Status</div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Radio className="w-5 h-5 text-red-400" />
          <span className="text-3xl font-black text-red-400">ON AIR</span>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Streaming Now</div>
      </div>
    </motion.div>
  );
}

const quickLinks = [
  { icon: "🎮", label: "Looking for Games?", sub: "PC, Console & Mobile", href: "/category?cat=games" },
  { icon: "📡", label: "Live Streams", sub: "Watch & go live", href: "/category?cat=livestream" },
  { icon: "🔥", label: "Hot Deals?", sub: "Best prices today", href: "/category?cat=buy_sell" },
  { icon: "🏆", label: "Tournaments?", sub: "Join & compete", href: "/category?cat=tournaments" },
  { icon: "🎧", label: "Looking for Audio?", sub: "Headsets & Speakers", href: "/category?cat=buy_sell" },
  { icon: "🔧", label: "Get Mods?", sub: "GTA, FIFA, WWE & more", href: "/category?cat=modding" },
  { icon: "🛒", label: "Buy & Sell?", sub: "Accounts & in-game items", href: "/category?cat=buy_sell" },
  { icon: "🎬", label: "Content Creator?", sub: "Streaming gear & tips", href: "/register?type=digital_creator" },
];

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(236,72,153,0.12) 0%, transparent 50%), #030712",
      }} />
      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Scan line animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.03) 50%, transparent 100%)", height: "200px" }}
        animate={{ y: ["-200px", "calc(100vh + 200px)"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
          <motion.span
            animate={{ boxShadow: ["0 0 15px rgba(139,92,246,0.3)", "0 0 30px rgba(236,72,153,0.4)", "0 0 15px rgba(139,92,246,0.3)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold tracking-wider uppercase"
          >
            <Zap className="w-3 h-3" />
            Streaming · Mods · Social · Community · Est. 2026
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight">
            <span className="text-white">Welcome to </span>
            <motion.span
              className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              GAMER.Productions
            </motion.span>
          </h1>
          {/* Animated tagline */}
          <motion.p
            className="mt-3 text-base sm:text-lg font-bold tracking-wide"
            style={{
              background: "linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
            }}
            animate={{
              opacity: [1, 0.2, 1, 0.2, 1],
              backgroundPosition: ["0% center", "100% center", "200% center"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            The One Stop Hub for All Gamers
          </motion.p>
          <p className="mt-4 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Stream Live · Share Mods · Build Community · Sell & Earn —{" "}
            <span className="text-purple-400 font-semibold">worldwide</span>.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {["Content Social Platform", "Live Streaming", "Mods Community", "Gaming Marketplace", "Share Any Game Videos"].map((tag, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-semibold">{tag}</span>
            ))}
          </div>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">
            Founded by Kevin Roberto in 2026 · Built for Gamers, by a Gamer
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row gap-3 justify-center mb-6 flex-wrap">
        <motion.button onClick={() => navigate("/register")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          style={{ boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
          <Zap className="w-5 h-5" /> Sign Up Free — Join Now
        </motion.button>
        <SignInHeroButton />
        <motion.button onClick={() => navigate("/category?cat=livestream")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-xl border-2 border-red-700/60 text-red-300 font-bold text-base hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
            <Radio className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Go Live Now
          </motion.button>
        <motion.a href="#categories" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="px-8 py-4 rounded-xl border border-purple-700/60 text-purple-300 font-bold text-base hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2">
          <Gamepad2 className="w-5 h-5" /> Browse Categories
        </motion.a>
        <CreateListingHeroButton />
        </motion.div>

        {/* Trust signals */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-10 text-xs text-gray-500">
          {["✅ Free to Join", "🔒 Secure Payments via PayPal & Stripe", "🌍 Available Worldwide", "💰 Earn from Content", "🎮 100% Gaming Focused"].map((t, i) => (
            <span key={i} className="flex items-center gap-1 font-medium">{t}</span>
          ))}
          {/* Verified badge highlight */}
          <span className="flex items-center gap-1.5 font-medium px-3 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.1))", border: "1px solid rgba(168,85,247,0.3)" }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              boxShadow: "0 0 6px rgba(168,85,247,0.8)",
            }}>
              <svg viewBox="0 0 12 10" fill="none" style={{ width: 8, height: 8 }}>
                <polyline points="1.5,5 4.5,8.5 10.5,1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ background: "linear-gradient(90deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>
              Verified Creator Badges
            </span>
          </span>
        </motion.div>

        {/* Live Stats */}
        <LiveStats />

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {quickLinks.map((item, i) => (
            <motion.button key={i} onClick={() => navigate(item.href)} whileHover={{ scale: 1.04, y: -3, boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-purple-700/60 transition-all cursor-pointer group">
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-xs font-semibold text-center leading-tight group-hover:text-purple-300 transition-colors">{item.label}</span>
              <span className="text-gray-500 text-xs text-center">{item.sub}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}