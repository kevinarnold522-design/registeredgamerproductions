import React from "react";
import { motion } from "framer-motion";
import { Youtube, DollarSign, CheckCircle, Star, Zap } from "lucide-react";

const requirements = [
  { icon: "👥", label: "1,000 Subscribers", desc: "Real subscribers on your channel" },
  { icon: "👁️", label: "100,000 Real Views", desc: "Organic views on your content" },
  { icon: "⏱️", label: "5,000 Watch Hours", desc: "Total watch time on your videos" },
];

export default function MonetizationBadge() {
  return (
    <section className="py-16 px-4 bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-semibold mb-4">
              <Star className="w-3 h-3" />
              Gaming Checkmark Program
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
              Get the{" "}
              <span className="text-yellow-400">🎮 Gaming Checkmark</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Meet the monetization requirements and earn the exclusive Gaming Checkmark badge — 
              then earn <span className="text-green-400 font-bold">$1 for every 1,000 views</span> on your content.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {requirements.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-yellow-500/20 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">{r.icon}</div>
              <p className="text-yellow-300 font-black text-lg">{r.label}</p>
              <p className="text-gray-500 text-xs mt-1">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="rounded-2xl p-6 text-center border border-purple-500/30"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))" }}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5">
              <span className="text-2xl">🎮</span>
              <div className="text-left">
                <p className="text-yellow-300 font-black text-sm">Gaming Checkmark</p>
                <p className="text-gray-400 text-xs">Verified Gaming Creator</p>
              </div>
              <CheckCircle className="w-5 h-5 text-yellow-400 ml-2" />
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2.5">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <p className="text-green-300 font-black text-sm">$1 per 1,000 views</p>
                <p className="text-gray-400 text-xs">Direct earnings to PayPal</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mb-4">
            Only verified Gaming Checkmark holders see their monetization details and earnings dashboard.
          </p>
          <a href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-sm hover:opacity-90 transition-opacity">
            <Zap className="w-4 h-4" />
            Apply for Gaming Checkmark
          </a>
        </motion.div>
      </div>
    </section>
  );
}