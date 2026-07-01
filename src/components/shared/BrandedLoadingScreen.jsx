import React from "react";
import { motion } from "framer-motion";

export default function BrandedLoadingScreen({
  label = "Loading Your Experience...",
  fullScreen = false,
  minHeight = "60vh",
  className = "",
}) {
  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-50" : "w-full"} flex items-center justify-center bg-gray-950 px-4 ${className}`}
      style={fullScreen ? undefined : { minHeight }}
    >
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-4 flex w-full max-w-lg items-center gap-3 rounded-2xl border border-purple-500/30 bg-gray-900/70 px-4 py-3 shadow-[0_0_36px_rgba(124,58,237,0.18)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white shadow-[0_0_18px_rgba(168,85,247,0.55)]">
            GP
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-300">Gamebar</p>
            <p className="text-xs text-gray-400">Booting experience</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/30 bg-[#12091f] p-1.5 shadow-[0_0_40px_rgba(124,58,237,0.22)]">
          <motion.div
            className="relative h-8 rounded-xl bg-gradient-to-r from-violet-800 via-purple-500 to-fuchsia-400 shadow-[0_0_24px_rgba(168,85,247,0.65)]"
            animate={{
              width: ["32%", "68%", "54%", "86%", "100%"],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-y-0 right-0 w-20 rounded-full bg-gradient-to-r from-white/0 via-white/55 to-white/0 blur-[2px]"
              animate={{ x: [-18, 26, -18] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        <motion.p
          className="mt-5 text-lg font-semibold tracking-wide text-white sm:text-2xl"
          animate={{ opacity: [0.78, 1, 0.78] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
