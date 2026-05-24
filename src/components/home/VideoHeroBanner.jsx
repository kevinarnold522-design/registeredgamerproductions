import React from "react";
import { motion } from "framer-motion";
import { Play, DollarSign, Youtube, Gamepad2, CheckCircle } from "lucide-react";

export default function VideoHeroBanner() {
  return (
    <div
      className="w-full py-4 px-4"
      style={{
        background: "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(139,92,246,0.2) 50%, rgba(6,182,212,0.1) 100%)",
        borderBottom: "1px solid rgba(220,38,38,0.3)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">
              🎬 Start Sharing Your Videos &amp; Get Monetized!
            </p>
            <p className="text-gray-300 text-xs">
              Earn <span className="text-green-400 font-bold">$1 per 1,000 views</span> · Link your YouTube · 
              Get the <span className="text-yellow-400 font-bold">🎮 Gaming Checkmark</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 flex-shrink-0"
        >
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />1,000 Subs</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />100K Views</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />5,000 Watch Hours</span>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <DollarSign className="w-4 h-4" />
            Start Earning
          </a>
        </motion.div>
      </div>
    </div>
  );
}