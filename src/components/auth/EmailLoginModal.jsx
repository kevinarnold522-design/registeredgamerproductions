import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Base URL of the Cloudflare auth Worker (set VITE_AUTH_BASE_URL for prod;
// falls back to same-origin /auth routes).
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || "";

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

          {/* Social Provider Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin("Facebook")}
              className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
            >
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleSocialLogin("Yahoo")}
              className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium col-span-2"
            >
              <span>Yahoo</span>
            </button>
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