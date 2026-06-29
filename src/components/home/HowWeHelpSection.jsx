import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Youtube, Link2, Wand2, Store, DollarSign, CheckCircle,
  ShoppingCart, Heart, Users, Play, Zap
} from "lucide-react";

const groups = [
  {
    id: "creator",
    emoji: "🎨",
    label: "Digital Creators",
    tagline: "Turn your passion into income",
    color: "border-purple-500/40 bg-purple-900/10",
    activeColor: "border-purple-400/70 bg-purple-900/20",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    perks: [
      { icon: <Youtube className="w-4 h-4 text-red-400" />, title: "Share YouTube Videos", desc: "Post your gaming videos directly to the GAMER Productions community feed" },
      { icon: <Play className="w-4 h-4 text-purple-400" />, title: "AI Video Creation Tools", desc: "AI-generated titles, descriptions, thumbnail ideas & SEO — powered by GPT" },
      { icon: <Link2 className="w-4 h-4 text-blue-400" />, title: "Top Link Shorteners", desc: "Bitly, TinyURL, Rebrandly, T2M — shorten your mod & content links to earn from clicks" },
      { icon: <DollarSign className="w-4 h-4 text-green-400" />, title: "Earn $1 per 1,000 Views", desc: "After full monetization approval (1K subs + 100K views + 5K watch hours) — paid to PayPal" },
      { icon: <CheckCircle className="w-4 h-4 text-yellow-400" />, title: "🎮 Gaming Checkmark", desc: "Exclusive verified badge for approved creators — builds trust and visibility" },
      { icon: <Users className="w-4 h-4 text-pink-400" />, title: "Your Own Channel Page", desc: "A personal channel where fans can follow your videos, mods, and content" },
      { icon: <Wand2 className="w-4 h-4 text-cyan-400" />, title: "AI Video Script Writer", desc: "Generate full video scripts and hooks optimized for gaming content on YouTube" },
    ],
  },
  {
    id: "business",
    emoji: "🏢",
    label: "Businesses & Sellers",
    tagline: "Grow your gaming brand",
    color: "border-green-500/40 bg-green-900/10",
    activeColor: "border-green-400/70 bg-green-900/20",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/30",
    perks: [
      { icon: <Store className="w-4 h-4 text-green-400" />, title: "Full Marketplace Access", desc: "List games, gear, mods, services, food, travel deals & more across 10+ categories" },
      { icon: <DollarSign className="w-4 h-4 text-yellow-400" />, title: "Direct Payout via PayPal", desc: "90% of every sale goes straight to your PayPal — platform takes just 10% commission" },
      { icon: <CheckCircle className="w-4 h-4 text-blue-400" />, title: "Verified Business Badge", desc: "Submit your docs and get a verified badge — builds buyer trust and boosts conversions" },
      { icon: <Youtube className="w-4 h-4 text-red-400" />, title: "Video Marketing Tools", desc: "Share promotional videos on our platform to market your products to thousands of gamers" },
      { icon: <Wand2 className="w-4 h-4 text-purple-400" />, title: "AI Product Listing Assistant", desc: "AI writes compelling product titles, descriptions, and tags to maximize sales" },
      { icon: <Users className="w-4 h-4 text-pink-400" />, title: "Business Channel & Profile", desc: "Your own branded page showing all your listings, videos, and reviews in one place" },
    ],
  },
  {
    id: "user",
    emoji: "🎮",
    label: "Regular Gamers",
    tagline: "Everything a gamer needs",
    color: "border-blue-500/40 bg-blue-900/10",
    activeColor: "border-blue-400/70 bg-blue-900/20",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    perks: [
      { icon: <ShoppingCart className="w-4 h-4 text-blue-400" />, title: "Buy Games, Gear & More", desc: "Access the full marketplace — games, gear, accounts, mods, services and tournament spots" },
      { icon: <Youtube className="w-4 h-4 text-red-400" />, title: "Share Your Gaming Videos", desc: "Link your YouTube and share highlights, clips & streams with the whole community" },
      { icon: <Wand2 className="w-4 h-4 text-purple-400" />, title: "AI Video Assist", desc: "AI helps you write better video titles, descriptions, and improve your content game" },
      { icon: <Heart className="w-4 h-4 text-pink-400" />, title: "Favourites & Wishlist", desc: "Save listings you love and come back to them anytime" },
      { icon: <Users className="w-4 h-4 text-cyan-400" />, title: "Personal Channel Page", desc: "Your own gamer channel — share videos, display your stats, connect social accounts" },
      { icon: <Play className="w-4 h-4 text-green-400" />, title: "Discover Community Content", desc: "Watch gameplay, tutorials, reviews and highlights from creators in the community" },
    ],
  },
];

export default function HowWeHelpSection() {
  const [activeGroup, setActiveGroup] = useState("creator");
  const navigate = useNavigate();

  const current = groups.find(g => g.id === activeGroup);

  return (
    <section className="py-20 px-4" style={{ background: "linear-gradient(180deg, #030712 0%, #0a0a1a 100%)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-semibold mb-4">
            <Zap className="w-3 h-3" /> How GAMER Productions Helps You
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            Built for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Everyone</span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Whether you create, sell, or just game — GAMER Productions has tools designed specifically for you.
          </p>
        </motion.div>

        {/* Group Selector */}
        <div className="grid grid-cols-1 gap-3 mb-10 max-w-2xl mx-auto sm:grid-cols-3">
          {groups.map((g) => (
            <motion.button key={g.id} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGroup(g.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${activeGroup === g.id ? g.activeColor : g.color}`}>
              <span className="text-3xl">{g.emoji}</span>
              <span className={`text-xs font-black text-center leading-tight ${activeGroup === g.id ? "text-white" : "text-gray-400"}`}>{g.label}</span>
              {activeGroup === g.id && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${g.badgeColor} font-semibold`}>Selected</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Perks Grid */}
        <AnimatePresence mode="wait">
          <motion.div key={activeGroup}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}>
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm font-semibold">{current.tagline}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {current.perks.map((perk, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-3 p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {perk.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{perk.title}</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{perk.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => navigate(`/register?type=${activeGroup === "creator" ? "digital_creator" : activeGroup === "business" ? "business" : "regular"}`)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity">
                <Zap className="w-4 h-4" />
                Join as {current.label}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
