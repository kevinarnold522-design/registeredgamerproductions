import React from "react";
import { motion } from "framer-motion";
import { Radio, Package, Users, Gamepad2, DollarSign, Shield, Zap, Globe, TrendingUp, Heart } from "lucide-react";

const pillars = [
  {
    icon: <Radio className="w-6 h-6 text-red-400" />,
    title: "Live Streaming Platform",
    desc: "Stream gameplay, tournaments & events directly on GAMER Productions. Monetize your live audience with tips, subscriptions, and ad revenue share. We support RTMP integration with OBS, Streamlabs, and mobile broadcasters.",
    color: "border-red-700/40 bg-red-900/10",
    tag: "🔴 LIVE",
    tagColor: "bg-red-900/30 text-red-300",
  },
  {
    icon: <Package className="w-6 h-6 text-orange-400" />,
    title: "Mods Sharing Community",
    desc: "The #1 destination for gaming mods in Southeast Asia. Creators upload and sell premium mods for GTA, FIFA, PES, WWE2K, NBA2K and more. All mods are verified, safe, and AI-scanned for duplicate or stolen content.",
    color: "border-orange-700/40 bg-orange-900/10",
    tag: "🔧 MODS",
    tagColor: "bg-orange-900/30 text-orange-300",
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Social Platform for Gamers",
    desc: "Build your personal channel, gain followers, share content, and connect with the gaming community. Like, comment, and support your favorite creators. Our platform is where gamers become a real community — not just users.",
    color: "border-purple-700/40 bg-purple-900/10",
    tag: "👥 SOCIAL",
    tagColor: "bg-purple-900/30 text-purple-300",
  },
  {
    icon: <Gamepad2 className="w-6 h-6 text-cyan-400" />,
    title: "Gaming Community Hub",
    desc: "Tournaments, esports events, clan recruitment, gaming news, and community polls — all under one roof. Whether you're a casual gamer or a competitive pro, GAMER Productions is your home base for all things gaming.",
    color: "border-cyan-700/40 bg-cyan-900/10",
    tag: "🎮 COMMUNITY",
    tagColor: "bg-cyan-900/30 text-cyan-300",
  },
];

const howWeEarn = [
  { icon: <DollarSign className="w-5 h-5 text-green-400" />, title: "10% Marketplace Commission", desc: "We take a 10% cut on every marketplace transaction — sellers keep 90% of their earnings." },
  { icon: <TrendingUp className="w-5 h-5 text-purple-400" />, title: "Creator Monetization Share", desc: "Creators earn $1 per 1,000 video views after reaching monetization thresholds. We share revenue fairly." },
  { icon: <Shield className="w-5 h-5 text-blue-400" />, title: "Verified Badge Memberships", desc: "Premium verification tiers for businesses and creators to unlock advanced tools and visibility." },
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Featured Listings & Boosts", desc: "Sellers can boost their listings to appear at the top of search results and category pages." },
];

export default function BusinessModelSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#050010 0%,#030712 100%)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-semibold mb-4">
            <Globe className="w-3 h-3" /> What Is GAMER Productions?
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            More Than a Website —{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              An Ecosystem
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            GAMER Productions is a <strong className="text-purple-300">Streaming Platform</strong>, a <strong className="text-orange-300">Mods Sharing Community</strong>, a <strong className="text-pink-300">Social Platform</strong>, and a full <strong className="text-cyan-300">Gaming Marketplace</strong> — all in one. Built from the ground up for gamers, by a gamer.
          </p>
        </motion.div>

        {/* 4 Pillars */}
        <div className="grid sm:grid-cols-2 gap-5 mb-14">
          {pillars.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border ${p.color} group hover:scale-[1.02] transition-transform`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-black text-base">{p.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.tagColor}`}>{p.tag}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How We Earn */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gray-900 rounded-3xl border border-purple-700/20 p-8">
          <div className="text-center mb-8">
            <h3 className="text-white font-black text-2xl mb-2 flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 text-pink-400" /> Our Business Model — Built on Fairness
            </h3>
            <p className="text-gray-500 text-sm">We only succeed when our creators and sellers succeed. That's the GAMER Productions promise.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howWeEarn.map((item, i) => (
              <div key={i} className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center mx-auto mb-3">{item.icon}</div>
                <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Founded by */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-10 text-center">
          <p className="text-gray-600 text-sm">
            Founded in <strong className="text-purple-400">2026</strong> by <strong className="text-white">Kevin Roberto</strong> · Philippines 🇵🇭 ·{" "}
            <span className="text-gray-500">Built for Gamers, by a Gamer 🕹️</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}