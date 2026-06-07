import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

export default function ImageGalleryModal({ images, isOpen, onClose, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || !images?.length) return null;

  const next = () => setCurrentIndex(i => (i + 1) % images.length);
  const prev = () => setCurrentIndex(i => (i - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between w-full mb-4">
                <p className="text-white font-bold text-sm">{currentIndex + 1} / {images.length}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.open(images[currentIndex], "_blank")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={() => { navigator.clipboard?.writeText(images[currentIndex]); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={onClose} className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative flex-1 w-full max-h-[70vh] rounded-2xl overflow-hidden border border-gray-800 bg-black">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt=""
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-gray-900/80 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-gray-900/80 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentIndex ? "border-purple-500 scale-105" : "border-gray-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}