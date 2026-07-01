import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Puzzle, Gamepad2, Wrench, Briefcase, Crown, Users, Sparkles } from "lucide-react";

// Each option maps to a create-listing category (auto-populates category + subcategory),
// or routes to the community page for community posts.
const POST_TYPES = [
  { id: "mods", label: "Mods", desc: "Free or community mods", icon: Puzzle, color: "from-orange-600 to-red-600", to: "/create-listing?cat=modding" },
  { id: "premium_mods", label: "Premium Mod", desc: "Paid / premium mods", icon: Sparkles, color: "from-amber-600 to-yellow-600", to: "/create-listing?cat=premium_mods" },
  { id: "game", label: "Game", desc: "Add a full game", icon: Gamepad2, color: "from-emerald-600 to-green-600", to: "/create-listing?cat=games" },
  { id: "tools", label: "Tools", desc: "Paid tools & utilities", icon: Wrench, color: "from-blue-600 to-cyan-600", to: "/create-listing?cat=paid_tools" },
  { id: "service", label: "Service", desc: "Offer a gaming service", icon: Briefcase, color: "from-purple-600 to-indigo-600", to: "/create-listing?cat=buy_sell&sub=Services" },
  { id: "membership", label: "Membership", desc: "Sell exclusive membership", icon: Crown, color: "from-pink-600 to-rose-600", to: "/create-listing?cat=premium_mods&sub=VIP%20Content" },
  { id: "community", label: "Post in Community", desc: "Share with a community", icon: Users, color: "from-cyan-600 to-teal-600", to: "/gaming-community" },
];

export default function PostTypeModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  const go = (to) => {
    onClose?.();
    navigate(to);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-3xl border border-purple-700/40 bg-gradient-to-br from-gray-950 to-purple-950/30 p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-black text-white">What do you want to post?</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-5">Pick a type — we'll set up the right category and subcategory for you.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POST_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => go(t.to)}
                className={`group flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${t.color} bg-opacity-10 border border-white/10 hover:scale-[1.03] transition-transform`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                  <t.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-sm">{t.label}</span>
                <span className="text-gray-400 text-[10px] text-center leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
