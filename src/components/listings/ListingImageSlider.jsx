import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";

export default function ListingImageSlider({ images = [], title = "", badge = null, discountPct = null }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent(p => (p + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [images.length]);

  const prev = () => { setDirection(-1); setCurrent(p => (p - 1 + images.length) % images.length); };
  const next = () => { setDirection(1); setCurrent(p => (p + 1) % images.length); };

  const variants = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl rounded-t-2xl overflow-hidden">
        🎮
        {badge && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] font-black">{badge}</div>}
      </div>
    );
  }

  return (
    <div className="relative h-40 bg-gray-900 rounded-t-2xl overflow-hidden group">
      <AnimatePresence custom={direction} initial={false}>
        <motion.img
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.4 }}
          src={images[current]}
          alt={`${title} image ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {badge && <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] font-black">{badge}</div>}
        {discountPct && <div className="px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-black">-{discountPct}% OFF</div>}
      </div>

      {/* Nav arrows (only if multiple images) */}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}