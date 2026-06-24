import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Zap, Radio, ShieldCheck, Lock, Globe2, CircleDollarSign, Clapperboard, Headphones, Wrench, ShoppingCart, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

function CreateListingHeroButton() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <motion.a
      href="/create-listing"
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      className="px-8 py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 text-white"
      style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}>
      
      <Gamepad2 className="w-5 h-5" /> Post
    </motion.a>);

}

function SignInHeroButton() {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth || user) return null;
  return (
    <motion.button
      onClick={() => base44.auth.redirectToLogin("https://gamerproductions.vercel.app/")}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
      className="px-10 py-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-500 text-white font-black text-lg hover:from-gray-700 hover:to-gray-600 transition-all flex items-center justify-center gap-2 shadow-lg">
      
      Log In
    </motion.button>);

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
        setStats({ listings: listings.filter((l) => l.status === "active").length });
      } catch {}
    };
    load();
  }, []);

  // Shared stat-card style so every stat (Registered Gamers, Active Listings,
  // LIVE, ON AIR) has the exact same glowing purple/pink design.
  const cardStyle = {
    background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1))",
    border: "1px solid rgba(139,92,246,0.4)",
    boxShadow: "0 0 20px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1)",
  };
  const valueClass = "text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-1.5";
  const labelClass = "text-xs text-purple-300 uppercase tracking-wider mt-1 font-semibold flex items-center justify-center gap-1";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
    className="flex flex-wrap justify-center gap-6 mb-8 text-center">
      {/* Registered Gamers — admin only */}
      {isAdmin &&
      <motion.div whileHover={{ scale: 1.05 }} className="relative px-6 py-3 rounded-2xl" style={cardStyle}>
        <div className={valueClass}>{adminUserCount > 0 ? adminUserCount.toLocaleString() : "—"}</div>
        <div className={labelClass}><Zap className="w-3 h-3" /> Registered Gamers</div>
      </motion.div>
      }

      <motion.div whileHover={{ scale: 1.05 }} className="relative px-6 py-3 rounded-2xl" style={cardStyle}>
        <div className={valueClass}>{stats.listings > 0 ? stats.listings.toLocaleString() : "—"}</div>
        <div className={labelClass}>Active Listings</div>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} className="relative px-6 py-3 rounded-2xl" style={cardStyle}>
        <div className={valueClass}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" /> LIVE
        </div>
        <div className={labelClass}>Platform Status</div>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} className="relative px-6 py-3 rounded-2xl" style={cardStyle}>
        <div className={valueClass}><Radio className="w-5 h-5" /> ON AIR</div>
        <div className={labelClass}>Streaming Now</div>
      </motion.div>
    </motion.div>);

}

export default function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(236,72,153,0.12) 0%, transparent 50%), rgba(3,7,18,0.35)"
      }} />
      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      {/* Scan line animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.03) 50%, transparent 100%)", height: "200px" }}
        animate={{ y: ["-200px", "calc(100vh + 200px)"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
      

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10">
        {/* GP Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col items-center mb-4">
          <motion.img
            src="https://media.base44.com/images/public/6a126acdde36b8358b1010f3/2c492ba5e_86DEEF8D-A166-44B9-8CC9-D721135C9BB9.png"
            alt="GP"
            className="w-10 h-10 object-contain mb-5"
            animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 14px rgba(168,85,247,0.8))" }} />
          
        </motion.div>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
          <motion.span
            animate={{ boxShadow: ["0 0 15px rgba(139,92,246,0.3)", "0 0 30px rgba(236,72,153,0.4)", "0 0 15px rgba(139,92,246,0.3)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold tracking-wider uppercase">
            
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
              transition={{ duration: 4, repeat: Infinity }}>
              
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
              backgroundSize: "200% auto"
            }}
            animate={{
              opacity: [1, 0.2, 1, 0.2, 1],
              backgroundPosition: ["0% center", "100% center", "200% center"]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            
            The One Stop Hub for All Gamers
          </motion.p>
          <p className="mt-4 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Stream Live · Share Mods · Build Community · Sell & Earn —{" "}
            <span className="text-purple-400 font-semibold">worldwide</span>.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {["Content Social Platform", "Live Streaming", "Mods Community", "Gaming Marketplace", "Share Any Game Videos"].map((tag, i) =>
            <span key={i} className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-semibold">{tag}</span>
            )}
          </div>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">
            Founded by Kevin Roberto in 2026 · Built for Gamers, by a Gamer
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row gap-3 justify-center mb-6 flex-wrap">
        {!user &&
          <motion.button onClick={() => navigate("/register")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          style={{ boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
            <Zap className="w-5 h-5" /> Join Now
          </motion.button>
          }
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
        className="flex flex-wrap justify-center gap-4 mb-6 text-xs text-gray-500">
          {[
          { icon: ShieldCheck, text: "Free to Join" },
          { icon: Lock, text: "Secure Payments via PayPal & Stripe" },
          { icon: Globe2, text: "Available Worldwide" },
          { icon: CircleDollarSign, text: "Earn from Content" },
          { icon: Gamepad2, text: "100% Gaming Focused" }].
          map(({ icon: Icon, text }, i) =>
          <span key={i} className="flex items-center gap-1 font-medium"><Icon className="w-3.5 h-3.5 text-purple-300" />{text}</span>
          )}
          {/* Verified badge highlight */}
          <span className="flex items-center gap-1.5 font-medium px-3 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.1))", border: "1px solid rgba(168,85,247,0.3)" }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              boxShadow: "0 0 6px rgba(168,85,247,0.8)"
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
      </div>
    </section>);

}