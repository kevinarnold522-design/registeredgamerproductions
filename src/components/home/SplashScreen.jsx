import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onDismiss }) {
  const [tapped, setTapped] = React.useState(false);
  
  useEffect(() => {
    const handleClick = () => onDismiss();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: "radial-gradient(ellipse at center, #0f0f2e 0%, #000000 100%)",
      }}
      onClick={onDismiss}
    >
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: Math.random() * 3 + 1,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        {/* New GP Logo - only animates on tap */}
        <motion.img
          src="https://media.base44.com/images/public/6a126acdde36b8358b1010f3/2c492ba5e_86DEEF8D-A166-44B9-8CC9-D721135C9BB9.png"
          alt="Gamer Productions"
          className="w-32 h-32 md:w-40 md:h-40 object-contain mb-4 mx-auto"
          animate={tapped ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] } : {}}
          transition={{ duration: 0.6 }}
          style={{ 
            filter: tapped ? "drop-shadow(0 0 24px rgba(168,85,247,0.8))" : "none",
            cursor: "pointer"
          }}
          onClick={(e) => { e.stopPropagation(); setTapped(true); }}
        />
        <div className="text-xs tracking-[0.4em] text-purple-400 uppercase mb-3">Welcome to</div>
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
            GAMER
          </h1>
        </div>
        <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Productions
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Streaming", "Mods", "Social Platform", "Gaming Community"].map((t, i) => (
            <span key={i} className="text-xs text-gray-500 uppercase tracking-widest">{t}{i < 3 ? " ·" : ""}</span>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-12 text-gray-500 text-sm"
      >
        Tap anywhere to continue
      </motion.p>
    </div>
  );
}