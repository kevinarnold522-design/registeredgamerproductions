import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildListingFallbackImage } from "@/lib/listingImageFallback";

export default function ListingImageSlider({ images = [], title = "", badge = null, discountPct = null, heightClass = "h-40", fallbackSrc, fallbackCategory = "Listing" }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [failedImages, setFailedImages] = useState([]);

  const permanentFallback = useMemo(
    () => fallbackSrc || buildListingFallbackImage({ title, category: fallbackCategory }),
    [fallbackCategory, fallbackSrc, title]
  );
  const validImages = useMemo(
    () => [...new Set((Array.isArray(images) ? images : []).filter(Boolean))].filter((src) => !failedImages.includes(src)),
    [failedImages, images]
  );
  const slideImages = validImages.length ? validImages : [permanentFallback];

  useEffect(() => {
    if (slideImages.length <= 1) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent(p => (p + 1) % slideImages.length);
    }, 3500);
    return () => clearInterval(t);
  }, [slideImages.length]);

  useEffect(() => {
    setFailedImages([]);
  }, [images]);

  useEffect(() => {
    if (current >= slideImages.length) {
      setCurrent(0);
    }
  }, [current, slideImages.length]);

  const prev = () => { setDirection(-1); setCurrent(p => (p - 1 + slideImages.length) % slideImages.length); };
  const next = () => { setDirection(1); setCurrent(p => (p + 1) % slideImages.length); };

  const variants = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  if (!slideImages.length) {
    return (
      <div className={`relative ${heightClass} bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl rounded-t-2xl overflow-hidden`}>
        🎮
        {badge && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] font-black">{badge}</div>}
      </div>
    );
  }

  return (
    <div className={`relative ${heightClass} bg-gray-900 rounded-t-2xl overflow-hidden group`}>
      <div className="absolute inset-0">
        <img
          src={slideImages[current]}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover scale-110 blur-xl opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/40" />
      </div>
      <AnimatePresence custom={direction} initial={false}>
        <motion.img
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.4 }}
          src={slideImages[current]}
          alt={`${title} image ${current + 1}`}
          className="absolute inset-0 w-full h-full object-contain p-2"
          onError={() => {
            const failedSrc = slideImages[current];
            if (failedSrc && failedSrc !== permanentFallback) {
              setFailedImages((prev) => prev.includes(failedSrc) ? prev : [...prev, failedSrc]);
            }
          }}
        />
      </AnimatePresence>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {badge && <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] font-black">{badge}</div>}
        {discountPct && <div className="px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-black">-{discountPct}% OFF</div>}
      </div>

      {/* Nav arrows (only if multiple images) */}
      {slideImages.length > 1 && (
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
            {slideImages.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
