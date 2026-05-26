import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, Zap, ArrowRight, User, Youtube, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * AuthGateModal — shown when a non-signed-in user tries to access a protected feature.
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   featureName: string  (e.g. "Tournaments", "Upload a Mod")
 */
export default function AuthGateModal({ open, onClose, featureName = "this feature" }) {
  const handleSignIn = () => {
    onClose();
    base44.auth.redirectToLogin("/");
  };

  const handleSignUp = (type = "regular") => {
    onClose();
    window.location.href = `/register?type=${type}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl shadow-purple-900/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-black text-sm">GAMER Productions</span>
              </div>
              <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h2 className="text-xl font-black text-white mb-1">Sign In Required</h2>
              <p className="text-gray-400 text-sm">
                You need an account to access <span className="text-purple-300 font-bold">{featureName}</span>. Join free — it only takes a minute!
              </p>
            </div>

            {/* Sign In */}
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-3"
              style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
            >
              <Zap className="w-4 h-4" />
              Sign In to My Account
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">or create a free account</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Account type buttons */}
            <div className="space-y-2">
              {[
                { id: "regular", icon: <User className="w-4 h-4 text-blue-400" />, label: "Regular Gamer", desc: "Browse, buy & explore", color: "border-blue-700/40 hover:border-blue-500/60" },
                { id: "digital_creator", icon: <Youtube className="w-4 h-4 text-red-400" />, label: "Digital Creator", desc: "Upload & earn from content", color: "border-purple-700/40 hover:border-purple-500/60" },
                { id: "business", icon: <Store className="w-4 h-4 text-green-400" />, label: "Business / Seller", desc: "List & sell gaming products", color: "border-green-700/40 hover:border-green-500/60" },
              ].map((t) => (
                <button key={t.id} onClick={() => handleSignUp(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border bg-gray-900/60 transition-colors text-left group ${t.color}`}>
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs">{t.label}</p>
                    <p className="text-gray-500 text-[10px]">{t.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}