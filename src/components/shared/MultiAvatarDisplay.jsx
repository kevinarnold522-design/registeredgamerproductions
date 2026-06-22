import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MultiAvatarDisplay — shows multiple profile pictures with an auto-transitioning
 * slide animation. Shows a single image when only one is provided.
 *
 * Props:
 *   images: string[]   — list of image URLs
 *   size: number       — pixel size (default 80)
 *   rounded: string    — tailwind rounded class (default "rounded-2xl")
 *   interval: number   — ms between transitions (default 3000)
 *   showDots: boolean  — show nav dots (default true when >1 image)
 *   fallback: ReactNode — shown when no images
 */
export default function MultiAvatarDisplay({
  images = [],
  size = 80,
  rounded = "rounded-2xl",
  interval = 3000,
  showDots = true,
  fallback = <span className="text-4xl">🎮</span>,
}) {
  const validImages = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % validImages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [validImages.length, interval]);

  if (validImages.length === 0) {
    return (
      <div
        className={`${rounded} bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden`}
        style={{ width: size, height: size }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className={`${rounded} overflow-hidden`} style={{ width: size, height: size }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={validImages[index]}
            src={validImages[index]}
            alt=""
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`w-full h-full object-cover absolute inset-0`}
          />
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      {showDots && validImages.length > 1 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="transition-all"
              style={{
                width: i === index ? 12 : 6,
                height: 4,
                borderRadius: 2,
                background: i === index ? "#a855f7" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}