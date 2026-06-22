import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

// Animated controller icon - permanent floating element
export default function AnimatedController() {
  const [colorIdx, setColorIdx] = React.useState(0);
  
  const colorCycles = [
    "from-purple-600 to-pink-600",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-violet-500",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setColorIdx(i => (i + 1) % colorCycles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed top-20 left-4 z-30"
      animate={{ 
        rotate: [0, -6, 6, -4, 4, 0],
        y: [0, -4, 0]
      }}
      transition={{ 
        rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      style={{
        filter: "drop-shadow(0 0 12px rgba(168,85,247,0.6))",
      }}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorCycles[colorIdx]} transition-all duration-500`}
        style={{
          boxShadow: "0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(236,72,153,0.3)",
        }}
      >
        <Gamepad2 className="w-6 h-6 text-white" />
      </div>
    </motion.div>
  );
}