import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Rocket } from "lucide-react";

// Fires a left → right AI rocket swoosh on every route change.
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

  const rockets = [
    { top: "22%", size: 30, delay: 0, color: "#a855f7" },
    { top: "44%", size: 38, delay: 0.06, color: "#22d3ee" },
    { top: "66%", size: 30, delay: 0.12, color: "#ec4899" },
  ];

  return (
    <AnimatePresence>
      {flying && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          {/* Sweeping light wipe */}
          <motion.div
            initial={{ x: "-30%", opacity: 0 }}
            animate={{ x: "130%", opacity: [0, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3"
            style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.25), rgba(34,211,238,0.2), transparent)" }}
          />

          {rockets.map((r, i) => (
            <motion.div
              key={i}
              initial={{ x: "-12vw", opacity: 0 }}
              animate={{ x: "112vw", opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, delay: r.delay, ease: "easeInOut" }}
              className="absolute"
              style={{ top: r.top, color: r.color }}
            >
              <div className="relative flex items-center">
                {/* Exhaust trail */}
                <div
                  className="absolute right-full mr-1 h-1.5 rounded-full"
                  style={{
                    width: r.size * 3,
                    background: `linear-gradient(90deg, transparent, ${r.color})`,
                    filter: "blur(2px)",
                  }}
                />
                <Rocket
                  style={{
                    width: r.size,
                    height: r.size,
                    transform: "rotate(45deg)",
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