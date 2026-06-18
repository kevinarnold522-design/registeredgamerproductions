import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Mobile-only hint that nudges users to scroll. Disappears once they scroll.
export default function ScrollDownHint({ label = "Scroll down for more" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setVisible(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="md:hidden flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-semibold text-purple-200 bg-purple-900/40 border-b border-purple-700/40"
        >
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex items-center gap-1"
          >
            {label}
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}