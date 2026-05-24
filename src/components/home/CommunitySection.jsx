import React from "react";
import { motion } from "framer-motion";
import { Users, Gamepad2, Trophy, Zap, MessageSquare, Star } from "lucide-react";

const steps = [
  {
    icon: "🎮",
    title: "Create Your Profile",
    desc: "Sign up free and set up your gamer profile with your platforms, favorite genres, and gaming history.",
  },
  {
    icon: "🔍",
    title: "Discover & Compare",
    desc: "Find the best game deals, gear reviews, and community recommendations all in one place.",
  },
  {
    icon: "🏆",
    title: "Compete & Connect",
    desc: "Join tournaments, connect with other gamers, and build your reputation in the community.",
  },
];

const testimonials = [
  {
    name: "AceGamer_PH",
    role: "Esports Player",
    text: "RegisteredGamerProductions helped me find the best gear deals and connect with teammates. Best gaming hub out there!",
    rating: 5,
    avatar: "🎯",
  },
  {
    name: "PixelQueen22",
    role: "Content Creator",
    text: "I found all my streaming equipment here at the best prices. The community is super helpful too!",
    rating: 5,
    avatar: "🎬",
  },
  {
    name: "ProSniper99",
    role: "FPS Competitor",
    text: "Best place to compare game prices. I saved $40 on my last purchase by using their deal comparison!",
    rating: 5,
    avatar: "🎯",
  },
];

export default function CommunitySection() {
  return (
    <section id="community" className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2">
              1Community
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              One Platform.{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Every Gamer.
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              RegisteredGamerProductions — Est. 2026
            </p>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center"
            >
              <div className="text-5xl mb-4">{step.icon}</div>
              <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-600/50 flex items-center justify-center text-purple-400 font-bold text-sm mx-auto mb-3">
                {i + 1}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 mb-16 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.1) 50%, rgba(6,182,212,0.1) 100%)",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
        >
          <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
            Join{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              50,000+ Gamers
            </span>
          </h3>
          <p className="text-gray-400 mb-6 text-sm">
            Sign up free — no credit card required
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:opacity-90 transition-opacity"
          >
            <Zap className="w-5 h-5" />
            Sign Up Free — Be Part of the Community
          </a>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}