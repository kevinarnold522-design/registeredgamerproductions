import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { signInWithProvider } from "@/lib/supabaseAuth";

// ── Brand logos ──
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.5 35.3 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.1C9.5 36.7 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.3 5.3C43.1 34.7 44 29.7 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
);
const YahooLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#6001D2" d="M3 4h4.2l2.8 6.9L12.9 4H17l-5.1 11.8V20H8.1v-4.2L3 4z"/><circle fill="#6001D2" cx="18.5" cy="17.5" r="2"/><path fill="#6001D2" d="M17.3 4h3.6l-1.4 7.4h-2.9z"/></svg>
);
const GmailLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 6v12a2 2 0 0 1-2 2h-1V8.6l-7 5.2-7-5.2V20H4a2 2 0 0 1-2-2V6c0-.3.1-.6.2-.8L12 12.5l9.8-7.3c.1.2.2.5.2.8z"/><path fill="#EA4335" d="M2 6l10 7.5L22 6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6z"/></svg>
);

export default function EmailLoginModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSocialLogin = async (provider) => {
    setMessage(`Connecting to ${provider}...`);
    try {
      await signInWithProvider(provider, "/");
    } catch (err) {
      setMessage(err.message || `Could not connect to ${provider}.`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-white font-black text-2xl">Sign Up / In</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-6">Continue with one of these to get started.</p>

          {/* Social Providers — 3 email providers only */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-white/10 rounded-xl py-3 px-4 text-gray-800 text-sm hover:bg-gray-100 transition-colors font-semibold"
            >
              <GoogleLogo />
              <span>Continue with Google</span>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin("Yahoo")}
                className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-3 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
                title="Continue with Yahoo"
              >
                <YahooLogo /> Yahoo
              </button>
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-3 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
                title="Continue with Gmail"
              >
                <GmailLogo /> Gmail
              </button>
            </div>
          </div>

          {message && (
            <p className="text-center text-xs font-medium text-white bg-white/5 py-2 px-3 rounded-xl border border-white/5">
              {message}
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}