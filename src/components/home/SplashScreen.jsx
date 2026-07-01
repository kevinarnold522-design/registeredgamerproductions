import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onDismiss }) {
  const [tapped, setTapped] = React.useState(false);
  const dismissingRef = React.useRef(false);
  const starCount = typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 60;

  const dismissSmooth = React.useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    setTapped(true);
    setTimeout(() => onDismiss(), 420);
  }, [onDismiss]);
  
  useEffect(() => {
    const autoDismiss = setTimeout(() => dismissSmooth(), 900);
    const handlePointer = () => dismissSmooth();
    window.addEventListener("pointerdown", handlePointer, { passive: true });
    window.addEventListener("touchstart", handlePointer, { passive: true });
    return () => {
      clearTimeout(autoDismiss);
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("touchstart", handlePointer);
    };
  }, [dismissSmooth]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: "radial-gradient(ellipse at center, #0f0f2e 0%, #000000 100%)",
      }}
      onClick={dismissSmooth}
      onTouchStart={dismissSmooth}
    >
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: starCount }).map((_, i) => (
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
          onClick={(e) => { e.stopPropagation(); dismissSmooth(); }}
        />
        <div className="mx-auto mt-3 w-64 max-w-[78vw] rounded-full border border-purple-500/40 bg-white/5 p-1 shadow-[0_0_30px_rgba(168,85,247,0.18)]">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-violet-600 via-purple-400 to-fuchsia-500"
            initial={{ width: "12%", opacity: 0.75 }}
            animate={{ width: ["12%", "52%", "84%", "100%"], opacity: [0.75, 1, 1, 0.95] }}
            transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-purple-300">
          Loading
        </p>
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
