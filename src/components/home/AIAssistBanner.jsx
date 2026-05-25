import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Sparkles, X, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function AIAssistBanner({ user }) {
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-900/80 via-pink-900/60 to-purple-900/80 border-b border-purple-600/40"
        style={{ zIndex: 45 }}
      >
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* AI Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/50">
              <Wand2 className="w-4 h-4 text-white" />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-pink-500/30 border border-pink-500/50 text-pink-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                ✨ NEW
              </span>
              <p className="text-white font-bold text-sm whitespace-nowrap">
                Studio is here!
              </p>
              <p className="text-purple-300 text-xs hidden sm:block truncate">
                Create, enhance & publish gaming videos with AI — script, thumbnail, music, copyright scan & more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/ai-video-studio"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/40 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" />
              Try Studio
              <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}