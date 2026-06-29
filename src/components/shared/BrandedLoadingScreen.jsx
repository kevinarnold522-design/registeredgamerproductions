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
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.48, 0.28] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-[2rem] bg-purple-600/25 blur-3xl"
            />
            <div
              className="relative flex h-28 w-28 items-center justify-center text-5xl font-black tracking-tight text-purple-400"
              style={{
                clipPath: "polygon(50% 0%, 88% 20%, 88% 80%, 50% 100%, 12% 80%, 12% 20%)",
                background: "linear-gradient(180deg, rgba(124,58,237,0.28) 0%, rgba(76,29,149,0.12) 100%)",
                border: "1px solid rgba(168,85,247,0.45)",
                boxShadow: "0 0 30px rgba(139,92,246,0.35), inset 0 0 18px rgba(139,92,246,0.18)",
              }}
            >
              <span className="bg-gradient-to-b from-fuchsia-300 via-purple-400 to-violet-700 bg-clip-text text-transparent">
                GP
              </span>
            </div>
          </div>
        </motion.div>

        <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-full border border-white/10 bg-white/10 p-1 shadow-[0_0_40px_rgba(124,58,237,0.16)]">
          <motion.div
            className="relative h-7 rounded-full bg-gradient-to-r from-violet-800 via-purple-500 to-fuchsia-400 shadow-[0_0_24px_rgba(168,85,247,0.65)]"
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
          className="mt-7 text-2xl font-semibold tracking-wide text-white sm:text-4xl"
          animate={{ opacity: [0.78, 1, 0.78] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
