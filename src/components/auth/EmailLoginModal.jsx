import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Base URL of the Cloudflare auth Worker (set VITE_AUTH_BASE_URL for prod;
// falls back to same-origin /auth routes).
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || "";

// ── Brand logos ──
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.5 35.3 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.1C9.5 36.7 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.3 5.3C43.1 34.7 44 29.7 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
);
const FacebookLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z"/></svg>
);
const YahooLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#6001D2" d="M3 4h4.2l2.8 6.9L12.9 4H17l-5.1 11.8V20H8.1v-4.2L3 4z"/><circle fill="#6001D2" cx="18.5" cy="17.5" r="2"/><path fill="#6001D2" d="M17.3 4h3.6l-1.4 7.4h-2.9z"/></svg>
);
const GmailLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 6v12a2 2 0 0 1-2 2h-1V8.6l-7 5.2-7-5.2V20H4a2 2 0 0 1-2-2V6c0-.3.1-.6.2-.8L12 12.5l9.8-7.3c.1.2.2.5.2.8z"/><path fill="#34A853" d="M3 20H4V8.6l8 6 8-6V20h1a2 2 0 0 0 2-2V6L12 13.5 2 6v12a2 2 0 0 0 2 2z" opacity=".0"/><path fill="#EA4335" d="M2 6l10 7.5L22 6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6z"/></svg>
);

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${AUTH_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Login failed.");
      } else {
        setMessage("Signed in! Redirecting...");
        window.location.href = "/";
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    setMessage(`Connecting to ${provider}...`);
    const next = encodeURIComponent("/");
    window.location.href = `${AUTH_BASE}/auth/${provider.toLowerCase()}?next=${next}`;
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
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-black text-2xl">Sign Up / In</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Email / Password — Cloudflare auth */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-5">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Processing..." : "Sign In"}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-widest font-bold">Or Sign In With</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Social Provider Grid — Google first, with brand logos */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-white/10 rounded-xl py-3 px-4 text-gray-800 text-sm hover:bg-gray-100 transition-colors font-semibold"
            >
              <GoogleLogo />
              <span>Continue with Google</span>
            </button>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin("Facebook")}
                className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-3 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
                title="Continue with Facebook"
              >
                <FacebookLogo />
              </button>
              <button
                onClick={() => handleSocialLogin("Yahoo")}
                className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-3 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
                title="Continue with Yahoo"
              >
                <YahooLogo />
              </button>
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-3 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
                title="Continue with Gmail"
              >
                <GmailLogo />
              </button>
            </div>
          </div>

          {onSwitchToSignUp && (
            <p className="text-center text-gray-500 text-sm mb-2">
              New here?{" "}
              <button onClick={onSwitchToSignUp} className="text-purple-400 hover:text-purple-300 font-semibold">
                Create an account
              </button>
            </p>
          )}

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