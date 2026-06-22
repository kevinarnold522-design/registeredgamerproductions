import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket, Sparkles } from "lucide-react";

// First-login astronaut-themed "Hey Gamer" welcome modal.
// Shows once per user (tracked in localStorage), for new joiners only.
export default function HeyGamerWelcomeModal({ userEmail, username }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    const key = `hey_gamer_welcome_${userEmail}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, [userEmail]);

  const dismiss = () => {
    if (userEmail) localStorage.setItem(`hey_gamer_welcome_${userEmail}`, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: "rgba(3,3,16,0.85)", backdropFilter: "blur(6px)" }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl overflow-hidden border border-purple-600/50"
            style={{ background: "linear-gradient(160deg,#1a1340,#241a52 55%,#150e36)", boxShadow: "0 0 40px rgba(124,58,237,0.5)" }}
          >
            <button onClick={dismiss} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-gray-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>

            {/* Floating astronaut */}
            <div className="relative pt-8 pb-2 flex justify-center">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl"
                style={{ filter: "drop-shadow(0 0 18px rgba(168,85,247,0.7))" }}
              >
                👨‍🚀
              </motion.div>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-6 right-16 text-2xl"
              >
                🪐
              </motion.span>
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-2 left-14 text-xl"
              >
                ⭐
              </motion.span>
            </div>

            <div className="px-7 pb-7 text-center">
              <motion.h2
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-3xl font-black text-white"
              >
                Hey Gamer{username ? `, ${username}` : ""}! <span className="inline-block">🚀</span>
              </motion.h2>
              <p className="mt-2 text-purple-200 text-sm leading-relaxed">
                Welcome aboard <span className="font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Gamer.Productions</span> — your mission to the #1 gaming galaxy starts now.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: "🎮", label: "Play & Post" },
                  { icon: "🏆", label: "Win Points" },
                  { icon: "🎁", label: "Send Gifts" },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl bg-purple-900/30 border border-purple-700/40 py-2.5">
                    <div className="text-2xl">{f.icon}</div>
                    <div className="text-[10px] text-purple-200 font-bold mt-1">{f.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={dismiss}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm"
                style={{ boxShadow: "0 0 20px rgba(168,85,247,0.5)" }}
              >
                <Rocket className="w-4 h-4" /> Start Exploring
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}