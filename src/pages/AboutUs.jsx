import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Users, TrendingUp, Shield, Star, Radio, Package, Music, CreditCard } from "lucide-react";

const pillars = [
  { icon: "📡", title: "Live Streaming & Socializing", desc: "Stream live gameplay, share videos, and build a dedicated community with chat widgets and AI-assisted branding." },
  { icon: "🛒", title: "Multi-Faceted Marketplace", desc: "Buy and sell gaming gear, accounts, and in-game items — with a 90% earnings payout structure for sellers." },
  { icon: "🔧", title: "Modding Community", desc: "A dedicated hub for sharing, downloading, and selling mods for popular titles like GTA, FIFA, and WWE2K." },
  { icon: "💰", title: "Earning Potential", desc: "From $1 per 1,000 views monetization (Gaming Checkmark Program) to a link-shortener reward system — earn from your passion." },
  { icon: "🎬", title: "Content Creation Tools", desc: "AI Video Studio, video uploads, and content management — everything creators need to grow and publish." },
  { icon: "🏆", title: "Tournaments & Esports", desc: "Compete, organize, and participate in gaming tournaments across all platforms and genres." },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 h-16 flex items-center px-6 justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-sm">GAMER <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Productions</span></span>
        </a>
        <a href="/" className="text-purple-400 text-sm font-semibold hover:text-purple-300">← Back to Home</a>
      </nav>

      <div className="pt-16">
        {/* Hero */}
        <div className="relative py-24 px-4 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.2), rgba(236,72,153,0.1), #030712)" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center relative z-10">
            <motion.span animate={{ boxShadow: ["0 0 15px rgba(139,92,246,0.3)", "0 0 30px rgba(236,72,153,0.4)", "0 0 15px rgba(139,92,246,0.3)"] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-6">
              <Zap className="w-3 h-3" /> About GAMER Productions
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="text-white">About </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">GAMER Productions</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              GAMER Productions is a streaming and social platform for gamers — and a trading platform for gamers to list different gaming items — alongside creating an all-in-one ecosystem for all gamers.
            </p>
          </motion.div>
        </div>

        {/* Main Description */}
        <div className="max-w-5xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-700/30 rounded-3xl p-8 md:p-12 mb-16 text-center">
            <div className="text-5xl mb-6">🎮</div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Exactly What GAMER Productions Is Building</h2>
            <p className="text-gray-300 text-base leading-relaxed max-w-3xl mx-auto">
              GAMER Productions is designed as an <span className="text-purple-300 font-semibold">all-in-one ecosystem</span> that merges several different gaming pillars into a single space — blending streaming, a digital marketplace, and mod-sharing under one roof. It creates a <span className="text-pink-300 font-semibold">centralized home base for gamers</span> worldwide.
            </p>
          </motion.div>

          {/* Six Pillars */}
          <h2 className="text-2xl font-black text-white text-center mb-8">The Six Pillars of GAMER Productions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {pillars.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-700/50 transition-colors">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-white font-bold text-base mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stripe Payment Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gray-900 border border-green-700/30 rounded-2xl p-6 mb-10">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-bold text-lg">Secure Payments via Stripe & PayPal</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              GAMER Productions supports both <span className="text-green-300 font-semibold">Stripe</span> and <span className="text-blue-300 font-semibold">PayPal</span> for all transactions. Buyers can pay securely using credit cards, debit cards, and digital wallets. Sellers receive 90% of each sale directly to their connected PayPal account. Stripe subscriptions are available for premium features and creator tools.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="text-center rounded-3xl p-10 mb-10"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1), rgba(6,182,212,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 text-base leading-relaxed max-w-2xl mx-auto">
              It is a massive undertaking to blend streaming, a digital marketplace, and mod-sharing under one roof — but it definitely creates a <span className="text-purple-300 font-semibold">centralized home base for gamers</span>. Whether you are a creator, trader, modder, or casual gamer — GAMER Productions is your platform.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {["1 Community", "1 Mindset", "1 Goal"].map((t, i) => (
                <span key={i} className="px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-700/40 text-purple-300 font-bold text-sm">{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Founder */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl flex-shrink-0">👑</div>
            <div>
              <p className="text-white font-black text-base">Founded by Kevin Roberto</p>
              <p className="text-purple-400 text-sm">CEO & President · GAMER Productions · Est. 2026</p>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">Built for Gamers, by a Gamer. Humbly growing thanks to you, Gamer!</p>
            </div>
          </motion.div>

          {/* CTA */}
          <div className="text-center mt-12">
            <a href="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity" style={{ boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
              <Zap className="w-5 h-5" /> Join GAMER Productions Free
            </a>
            <p className="text-gray-600 text-sm mt-3">No credit card required · Available worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}