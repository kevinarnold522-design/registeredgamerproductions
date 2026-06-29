import React from "react";
import { motion } from "framer-motion";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";
import { Zap, Shield, Star, DollarSign, Wand2, Video, Music, Layers } from "lucide-react";

const perks = [
  { icon: Shield, label: "Trusted Member", desc: "Community-verified status" },
  { icon: DollarSign, label: "Earn & Sell", desc: "Unlock monetisation tools" },
  { icon: Star, label: "Post in Communities", desc: "Join & contribute to groups" },
  { icon: Zap, label: "Ad-Free Browsing", desc: "Clean, distraction-free experience" },
  { icon: Wand2, label: "Exclusive AI Studio", desc: "Generate AI art, overlays & thumbnails", highlight: true },
  { icon: Video, label: "Video Editor Pro", desc: "Full timeline editor + templates", highlight: true },
  { icon: Music, label: "Music Library", desc: "Royalty-free tracks for your content", highlight: true },
  { icon: Layers, label: "Social Media Studio", desc: "One-click branded posts & stories", highlight: true },
];

export default function VerifiedBadgeBanner() {
  return (
    <section className="relative overflow-hidden py-16 px-4">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 40%, #0a1a2e 100%)",
      }} />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ec4899 0%, transparent 50%)",
      }} />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Big badge display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <VerifiedCheckmark size="lg" showTooltip={false} />
            {/* Extra outer glow rings */}
            <div className="absolute inset-0 -m-6 rounded-full opacity-30 animate-ping" style={{
              background: "conic-gradient(from 0deg, #7c3aed, #ec4899, #00ccff, #7c3aed)",
              filter: "blur(16px)",
            }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
            Get the{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Verified Badge
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-3">
            Join thousands of trusted gamers. Unlock posting, selling, monetisation & exclusive perks — for just <span className="text-purple-300 font-black">$1/year</span>.
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <VerifiedCheckmark size="sm" showLabel label="Verified Partner" showTooltip={false} />
            <span className="text-gray-500 text-sm">· Only $1 / year · Cancel anytime</span>
          </div>
        </motion.div>

        {/* Perks grid */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 md:grid-cols-4">
          {perks.slice(0, 4).map((perk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="p-4 rounded-2xl border border-purple-700/30 bg-purple-900/10 text-center"
            >
              <perk.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">{perk.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{perk.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Studio exclusive perks */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-700/40 to-transparent" />
            <span className="text-purple-400 text-xs font-black uppercase tracking-widest px-3">🎬 Exclusive Studio Access</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-700/40 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {perks.slice(4).map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="p-4 rounded-2xl text-center"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.1))", border: "1px solid rgba(167,85,247,0.35)" }}
              >
                <perk.icon className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">{perk.label}</p>
                <p className="text-purple-300/60 text-xs mt-0.5">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.a
          href="/payment"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg shadow-2xl shadow-purple-900/50 hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
        >
          <VerifiedCheckmark size="sm" showTooltip={false} />
          Get Verified Now — $1/yr
        </motion.a>
      </div>
    </section>
  );
}
