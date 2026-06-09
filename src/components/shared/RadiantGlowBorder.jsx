import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RadiantGlowBorder({ children, className = "", glowColor = "#a855f7" }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative rounded-2xl ${className}`} style={{ isolation: "isolate" }}>
      {/* Rotating gradient border */}
      <div
        className="absolute -inset-[2px] rounded-2xl overflow-hidden"
        style={{
          background: `conic-gradient(from ${rotation}deg, ${glowColor}, transparent 30deg, ${glowColor}66 60deg, transparent 90deg, ${glowColor} 120deg, transparent 150deg, ${glowColor}66 180deg, transparent 210deg, ${glowColor} 240deg, transparent 270deg, ${glowColor}66 300deg, transparent 330deg, ${glowColor})`,
          zIndex: -2,
        }}
      />
      
      {/* Glow effect */}
      <div
        className="absolute -inset-[3px] rounded-2xl blur-md opacity-60"
        style={{
          background: `conic-gradient(from ${rotation}deg, ${glowColor}, transparent 40deg, ${glowColor}66 80deg, transparent 120deg, ${glowColor} 160deg, transparent 200deg, ${glowColor}66 240deg, transparent 280deg, ${glowColor} 320deg, transparent 360deg)`,
          zIndex: -3,
          animation: "pulse-glow 2s ease-in-out infinite",
        }}
      />

      {/* Inner content container */}
      <div className="relative bg-gray-900 rounded-2xl h-full">
        {children}
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}