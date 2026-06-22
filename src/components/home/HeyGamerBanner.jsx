import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Inline astronaut-themed welcome banner for new joiners on the homepage.
// Stays until dismissed; hidden for users who have dismissed it before.
// A user is considered a "new joiner" within their first 7 days.
export default function HeyGamerBanner({ profile, username }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!profile?.user_email) return;
    const key = `hey_gamer_banner_${profile.user_email}`;
    if (localStorage.getItem(key)) return;

    const joined = profile.created_date ? new Date(profile.created_date) : null;
    const isNew = !joined || (Date.now() - joined.getTime()) < 7 * 24 * 60 * 60 * 1000;
    if (isNew) setShow(true);
  }, [profile?.user_email, profile?.created_date]);

  const dismiss = () => {
    if (profile?.user_email) localStorage.setItem(`hey_gamer_banner_${profile.user_email}`, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="relative mx-auto max-w-7xl px-4 mt-3"
        >
          <div
            className="relative flex items-center gap-4 rounded-2xl border border-purple-600/40 px-4 py-3 overflow-hidden"
            style={{ background: "linear-gradient(120deg,rgba(36,26,82,0.85),rgba(21,14,54,0.85))", boxShadow: "0 0 22px rgba(124,58,237,0.3)" }}
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl flex-shrink-0"
              style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.7))" }}
            >
              👨‍🚀
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm sm:text-base">
                Hey Gamer{username ? `, ${username}` : ""}! 🚀 Welcome to the galaxy.
              </p>
              <p className="text-purple-200/80 text-xs mt-0.5 truncate">
                Post content, win tournaments, earn points and send gifts to fellow gamers.
              </p>
            </div>
            <button onClick={dismiss} className="flex-shrink-0 p-1.5 rounded-full bg-black/30 text-gray-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}