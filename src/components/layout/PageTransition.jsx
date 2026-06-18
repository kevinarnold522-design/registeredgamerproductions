import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Rocket } from "lucide-react";

// Fires a bottom-right → upper-left AI rocket swoosh on every route change.
export default function PageTransition() {
  const location = useLocation();
  const [flying, setFlying] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the very first mount so it only plays on actual navigation
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setFlying(true);
    const t = setTimeout(() => setFlying(false), 900);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  // Lanes are vertical offsets the rockets keep while travelling diagonally.
  const rockets = [
    { lane: -120, size: 30, delay: 0, color: "#a855f7" },
    { lane: 0, size: 38, delay: 0.06, color: "#22d3ee" },
    { lane: 120, size: 30, delay: 0.12, color: "#ec4899" },
  ];

  return (
    <AnimatePresence>
      {flying && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          {/* Diagonal sweeping light wipe (bottom-right → upper-left) */}
          <motion.div
            initial={{ x: "60%", y: "60%", opacity: 0 }}
            animate={{ x: "-60%", y: "-60%", opacity: [0, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, transparent, rgba(168,85,247,0.25), rgba(34,211,238,0.2), transparent)" }}
          />

          {rockets.map((r, i) => (
            <motion.div
              key={i}
              initial={{ x: "60vw", y: `calc(60vh + ${r.lane}px)`, opacity: 0 }}
              animate={{ x: "-60vw", y: `calc(-60vh + ${r.lane}px)`, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, delay: r.delay, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2"
              style={{ color: r.color }}
            >
              <div className="relative flex items-center">
                {/* Exhaust trail — points back toward bottom-right */}
                <div
                  className="absolute left-full ml-1 h-1.5 rounded-full"
                  style={{
                    width: r.size * 3,
                    background: `linear-gradient(270deg, transparent, ${r.color})`,
                    filter: "blur(2px)",
                  }}
                />
                <Rocket
                  style={{
                    width: r.size,
                    height: r.size,
                    transform: "rotate(-45deg)",
                    filter: `drop-shadow(0 0 10px ${r.color}) drop-shadow(0 0 20px ${r.color})`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}