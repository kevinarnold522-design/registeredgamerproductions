import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { signInWithProvider } from "@/lib/supabaseAuth";

// ── Brand logos ──
const YahooLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#6001D2" d="M3 4h4.2l2.8 6.9L12.9 4H17l-5.1 11.8V20H8.1v-4.2L3 4z"/><circle fill="#6001D2" cx="18.5" cy="17.5" r="2"/><path fill="#6001D2" d="M17.3 4h3.6l-1.4 7.4h-2.9z"/></svg>
);
const GmailLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#4285F4" d="M22 6v12a2 2 0 0 1-2 2h-1V8.6l-7 5.2-7-5.2V20H4a2 2 0 0 1-2-2V6c0-.3.1-.6.2-.8L12 12.5l9.8-7.3c.1.2.2.5.2.8z"/><path fill="#EA4335" d="M2 6l10 7.5L22 6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6z"/></svg>
);
const FacebookLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9v-8.4H7.1V12h3v-2.6c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4C19.6 23 24 18 24 12z"/></svg>
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

          {/* Social Providers — Gmail primary, then Yahoo + Facebook */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleSocialLogin("Gmail")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-white/10 rounded-xl py-3 px-4 text-gray-800 text-sm hover:bg-gray-100 transition-colors font-semibold"
            >
              <GmailLogo size={18} />
              <span>Continue with Gmail</span>
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
                onClick={() => handleSocialLogin("Facebook")}
                className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-3 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
                title="Continue with Facebook"
              >
                <FacebookLogo /> Facebook
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