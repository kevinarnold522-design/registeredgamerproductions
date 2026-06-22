import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Link, Eye, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const HIGHLIGHTS = [
  {
    icon: Link,
    color: "from-blue-600 to-cyan-500",
    bg: "bg-blue-900/20 border-blue-600/30",
    title: "Earn $5 with Link Shortener",
    desc: "Shorten links through our platform and earn $5 for every qualifying referral. Start sharing your game links, mods, and content today!",
    cta: "Start Earning",
    href: "/dashboard?tab=links",
    badge: "$5 / link",
    badgeColor: "bg-blue-500/30 text-blue-300",
  },
  {
    icon: Eye,
    color: "from-green-600 to-emerald-500",
    bg: "bg-green-900/20 border-green-600/30",
    title: "$1 Per 1,000 Views",
    desc: "Once monetized, earn $1 for every 1,000 views on your content. Upload videos, grow your audience, and watch the revenue roll in! ⚠️ Original content is mandatory — monetization will NOT be approved for copied, reposted, or third-party content. All content must be 100% original.",
    cta: "Get Monetized",
    href: "/channel",
    badge: "$1 / 1K views",
    badgeColor: "bg-green-500/30 text-green-300",
  },
  {
    icon: DollarSign,
    color: "from-yellow-600 to-orange-500",
    bg: "bg-yellow-900/20 border-yellow-600/30",
    title: "$10 Daily Login Reward",
    desc: "Log in every single day for 365 days straight to unlock a $10 cash reward. Build your streak and don't miss a day!",
    cta: "Track My Streak",
    href: "/dashboard?tab=rewards",
    badge: "$10 reward",
    badgeColor: "bg-yellow-500/30 text-yellow-300",
  },
  {
    icon: TrendingUp,
    color: "from-purple-600 to-pink-500",
    bg: "bg-purple-900/20 border-purple-600/30",
    title: "Sell Mods, Skins & More",
    desc: "List your digital products on the marketplace. Earn 90% of every sale — we only take a small 10% platform fee.",
    cta: "Create Listing",
    href: "/create-listing",
    badge: "90% payout",
    badgeColor: "bg-purple-500/30 text-purple-300",
  },
];

export default function MonetizationHighlights() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {HIGHLIGHTS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`rounded-2xl border p-5 ${item.bg}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${item.badgeColor}`}>
              {item.badge}
            </span>
          </div>
          <h3 className="text-white font-black text-sm mb-1.5">{item.title}</h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-3">{item.desc}</p>
          <RouterLink
            to={item.href}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${item.color} text-white text-xs font-black hover:opacity-90 transition-opacity`}
          >
            {item.cta}
            <ArrowRight className="w-3 h-3" />
          </RouterLink>
        </motion.div>
      ))}
    </div>
  );
}