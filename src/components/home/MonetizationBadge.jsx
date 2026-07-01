import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, DollarSign, Star, Zap, AlertCircle, Clock } from "lucide-react";

const requirements = [
  {
    icon: "👥",
    label: "1,000 Subscribers",
    desc: "Real, organic subscribers on your YouTube channel",
    required: true,
  },
  {
    icon: "👁️",
    label: "100,000 Views",
    desc: "Total organic views across your videos",
    required: true,
  },
  {
    icon: "⏱️",
    label: "5,000 Watch Hours",
    desc: "Total cumulative watch time on your content",
    required: true,
  },
];

const steps = [
  { step: "1", label: "Register as Digital Creator", desc: "Create your free account", icon: "📝", done: false },
  { step: "2", label: "Link Your YouTube Channel", desc: "Connect your channel in dashboard", icon: "🔗", done: false },
  { step: "3", label: "Meet ALL 3 Requirements", desc: "1K subs + 100K views + 5K watch hours", icon: "📊", done: false },
  { step: "4", label: "Submit for Review", desc: "Admin manually verifies your stats", icon: "🔍", done: false },
  { step: "5", label: "Get Approved & Start Earning", desc: "🎮 Gaming Checkmark + $1 per 1,000 views", icon: "💰", done: false, highlight: true },
];

export default function MonetizationBadge() {
  return (
    <section className="py-16 px-4 bg-gray-950/45">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-semibold mb-4">
              <Star className="w-3 h-3" />
              Gaming Checkmark Program
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Get Paid to Make{" "}
              <span className="text-yellow-400">Gaming Content</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Earn real money on GAMER Productions. Once your monetization is{" "}
              <span className="text-green-400 font-bold">fully approved</span>, you earn{" "}
              <span className="text-green-400 font-bold">$1 USD for every 1,000 views</span> — paid directly to your PayPal.
            </p>
          </motion.div>
        </div>

        {/* Requirements — clearly highlighted */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gray-900 border-2 border-yellow-500/40 rounded-3xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-300 font-black text-base">ALL 3 Requirements Must Be Met</p>
            <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">Admin-verified</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {requirements.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 bg-gray-800/60 border border-yellow-500/20 rounded-2xl p-4">
                <span className="text-3xl flex-shrink-0">{r.icon}</span>
                <div>
                  <p className="text-yellow-300 font-black text-sm">{r.label}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 bg-red-900/20 border border-red-700/30 rounded-xl p-3">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs leading-relaxed">
              <strong>You will NOT earn $1/1,000 views until ALL 3 requirements are met AND your application is manually approved by our admin team.</strong> Partial completion does not unlock earnings.
            </p>
          </div>
        </motion.div>

        {/* How it works — step by step */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-8">
          <p className="text-white font-black text-lg mb-4">How to Get Monetized — Step by Step</p>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${s.highlight ? "border-green-500/50 bg-green-900/15" : "border-gray-800 bg-gray-900/60"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${s.highlight ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                  {s.step}
                </div>
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${s.highlight ? "text-green-300" : "text-white"}`}>{s.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
                {s.highlight && (
                  <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                    💰 Earning Starts Here
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Earnings + badge CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="rounded-3xl p-6 text-center border border-purple-500/30"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))" }}>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <span className="text-2xl">🎮</span>
              <div className="text-left">
                <p className="text-yellow-300 font-black text-sm">Gaming Checkmark</p>
                <p className="text-gray-400 text-xs">Only for fully approved creators</p>
              </div>
              <CheckCircle className="w-5 h-5 text-yellow-400 ml-1" />
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border-2 border-green-500/50 rounded-xl px-4 py-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <p className="text-green-300 font-black text-sm">$1 per 1,000 views</p>
                <p className="text-gray-400 text-xs">Paid to PayPal — approved creators only</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-400" />
            <p className="text-orange-300 text-xs font-semibold">Approval takes 3–7 business days after submission</p>
          </div>
          <p className="text-gray-500 text-xs mb-5 max-w-md mx-auto">
            Earnings only begin <strong className="text-white">after full admin approval</strong>. You will receive an email when your Gaming Checkmark is granted.
          </p>
          <button
            onClick={() => window.location.href = "/register?type=digital_creator"}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-sm hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Apply for Gaming Checkmark
          </button>
        </motion.div>

      </div>
    </section>
  );
}