import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Droplets, PartyPopper, Hexagon, X } from "lucide-react";

const EFFECTS = [
  { id: "none", label: "None", icon: X, color: "#6b7280" },
  { id: "gambling_cards", label: "Gambling Cards", icon: Hexagon, color: "#a855f7" },
  { id: "fire", label: "🔥 Fire", icon: Flame, color: "#ef4444" },
  { id: "purple_fire", label: "💜 Purple Fire", icon: Flame, color: "#a855f7" },
  { id: "water", label: "💧 Water", icon: Droplets, color: "#3b82f6" },
  { id: "fireworks", label: "🎆 Fireworks", icon: PartyPopper, color: "#f59e0b" },
  { id: "glass", label: "✨ Glass (iO26)", icon: Sparkles, color: "#06b6d4" },
];

export function EffectSelector({ selectedEffect, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 z-50 min-w-[280px]"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
        <p className="text-white font-bold text-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Special Effects
        </p>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {EFFECTS.map(effect => (
          <button
            key={effect.id}
            onClick={() => onSelect(effect.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
              selectedEffect === effect.id
                ? "bg-purple-900/30 border-purple-500/50 text-white"
                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <effect.icon className="w-4 h-4" style={{ color: effect.color }} />
            <span className="text-xs font-semibold">{effect.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function SpecialEffectsRenderer({ effect, children }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (effect === "none" || !effect) return;

    const interval = setInterval(() => {
      const id = Date.now();
      setParticles(prev => [...prev.slice(-20), { id, x: Math.random() * 100, y: Math.random() * 100 }]);
    }, 300);

    return () => clearInterval(interval);
  }, [effect]);

  // Render effect overlay
  const renderEffect = () => {
    if (effect === "none" || !effect) return null;

    if (effect === "gambling_cards") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, x: Math.random() * 100 - 50, rotate: 0, opacity: 0 }}
              animate={{ 
                y: 300, 
                x: (Math.random() - 0.5) * 200, 
                rotate: Math.random() * 720 - 360,
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 2 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.3,
                ease: "easeInOut"
              }}
              className="absolute w-16 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg border-2 border-yellow-400/50 shadow-lg"
              style={{ 
                left: `${10 + i * 15}%`,
                boxShadow: "0 0 20px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.3)"
              }}
            >
              <div className="absolute inset-2 border border-yellow-400/30 rounded flex items-center justify-center">
                <span className="text-2xl">🎰</span>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // Regular fire effect
    if (effect === "fire") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 100, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: -50 - Math.random() * 100, 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.5, 1],
                x: (Math.random() - 0.5) * 50
              }}
              transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.12,
                ease: "easeOut"
              }}
              className="absolute w-4 h-12 bg-gradient-to-t from-orange-500 via-red-500 to-yellow-300 rounded-full blur-sm"
              style={{ 
                left: `${5 + (i * 4)}%`,
                bottom: 0,
                boxShadow: "0 0 20px rgba(239,68,68,0.8)"
              }}
            />
          ))}
          {/* Edge flames */}
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={`edge-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{ 
                duration: 0.8 + Math.random() * 0.4, 
                repeat: Infinity, 
                delay: i * 0.08,
              }}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 blur-[2px]"
              style={{
                left: `${i * 2.5}%`,
                top: i % 2 === 0 ? '2px' : 'auto',
                bottom: i % 2 === 0 ? 'auto' : '2px',
                boxShadow: "0 0 12px rgba(239,68,68,0.9)"
              }}
            />
          ))}
        </div>
      );
    }

    // Purple fire effect
    if (effect === "purple_fire") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 100, opacity: 0, scale: 0.4 }}
              animate={{ 
                y: -60 - Math.random() * 120, 
                opacity: [0, 1, 1, 0],
                scale: [0.4, 1.8, 0.8],
                x: (Math.random() - 0.5) * 60
              }}
              transition={{ 
                duration: 1.8 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.1,
                ease: "easeOut"
              }}
              className="absolute w-3 h-10 bg-gradient-to-t from-purple-600 via-pink-500 to-violet-400 rounded-full blur-md"
              style={{ 
                left: `${4 + (i * 3.5)}%`,
                bottom: 0,
                boxShadow: "0 0 24px rgba(168,85,247,0.9), 0 0 48px rgba(236,72,153,0.6)"
              }}
            />
          ))}
          {/* Purple edge flames */}
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={`edge-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.9, 0],
                scale: [0, 1.3, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 1 + Math.random() * 0.5, 
                repeat: Infinity, 
                delay: i * 0.1,
              }}
              className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-[3px]"
              style={{
                left: `${i * 2.8}%`,
                top: i % 2 === 0 ? '3px' : 'auto',
                bottom: i % 2 === 0 ? 'auto' : '3px',
                boxShadow: "0 0 16px rgba(168,85,247,1)"
              }}
            />
          ))}
        </div>
      );
    }

    // Enhanced water droplets
    if (effect === "water") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -60, opacity: 0, x: Math.random() * 100 }}
              animate={{ 
                y: 450, 
                opacity: [0, 0.8, 0.8, 0],
                x: `${10 + (i * 4) + Math.sin(i) * 20}%`,
                scaleY: [1, 1.5, 1],
              }}
              transition={{ 
                duration: 2.5 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: "easeInOut"
              }}
              className="absolute w-3 h-10 bg-gradient-to-b from-blue-400 via-cyan-300 to-transparent rounded-full blur-[1px]"
              style={{ 
                left: `${3 + (i * 4)}%`,
                top: 0,
                boxShadow: "0 0 20px rgba(59,130,246,0.7), inset 0 0 10px rgba(147,197,253,0.5)"
              }}
            />
          ))}
          {/* Water droplets on edges */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`drop-${i}`}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0],
                scale: [0, 1.2, 0.8],
                y: 15
              }}
              transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.12,
              }}
              className="absolute w-2 h-2 rounded-full bg-blue-400/60 blur-[1px]"
              style={{
                left: `${5 + i * 5}%`,
                top: i % 2 === 0 ? '4px' : 'auto',
                bottom: i % 2 === 0 ? 'auto' : '4px',
                boxShadow: "0 0 12px rgba(59,130,246,0.8)"
              }}
            />
          ))}
        </div>
      );
    }

    if (effect === "fireworks") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1.5, 2], 
                opacity: [1, 1, 0],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeOut"
              }}
              className="absolute w-32 h-32"
              style={{ 
                left: `${10 + (i % 4) * 25}%`,
                top: `${10 + Math.floor(i / 4) * 40}%`,
              }}
            >
              {[...Array(12)].map((_, j) => (
                <motion.div
                  key={j}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: `hsl(${(i * 45 + j * 30) % 360}, 100%, 60%)`,
                    boxShadow: "0 0 10px currentColor"
                  }}
                  initial={{ x: 0, y: 0 }}
                  animate={{ 
                    x: Math.cos(j * 30 * Math.PI / 180) * 60,
                    y: Math.sin(j * 30 * Math.PI / 180) * 60
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
                />
              ))}
            </motion.div>
          ))}
        </div>
      );
    }

    // Enhanced glass effect (iO26 style)
    if (effect === "glass") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible rounded-2xl" style={{ zIndex: 1 }}>
          {/* Base glass layer - very subtle to keep images visible */}
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(8px) saturate(180%)",
              boxShadow: "inset 0 0 40px rgba(255,255,255,0.08), inset 0 0 80px rgba(6,182,212,0.05)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          />
          
          {/* Animated light streaks */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.2, x: -150, rotate: -15 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                x: 400,
              }}
              transition={{ 
                duration: 4 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.7,
                ease: "easeInOut"
              }}
              className="absolute h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[1px]"
              style={{ 
                top: `${15 + i * 12}%`,
                width: "250px"
              }}
            />
          ))}
          
          {/* Sparkle points */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{ 
                duration: 2 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.3,
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-white blur-[1px]"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                boxShadow: "0 0 12px rgba(255,255,255,0.8)"
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative overflow-visible" style={{ isolation: "isolate" }}>
      {children}
      {renderEffect()}
    </div>
  );
}

export default SpecialEffectsRenderer;