import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Zap, ArrowRight, CheckCircle, Gamepad2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMAIL_PROVIDERS = [
  { name: "Gmail", icon: "🔵", hint: "gmail.com", webmail: "https://mail.google.com", match: ["gmail"] },
  { name: "Yahoo Mail", icon: "🟣", hint: "yahoo.com", webmail: "https://mail.yahoo.com", match: ["yahoo"] },
  { name: "Outlook / Hotmail", icon: "🔷", hint: "outlook.com / hotmail.com", webmail: "https://outlook.live.com/mail/0/", match: ["outlook", "hotmail", "live", "msn"] },
  { name: "iCloud Mail", icon: "☁️", hint: "icloud.com / me.com", webmail: "https://www.icloud.com/mail", match: ["icloud", "me.com"] },
  { name: "ProtonMail", icon: "🛡️", hint: "proton.me / protonmail.com", webmail: "https://mail.proton.me", match: ["proton", "protonmail"] },
  { name: "Zoho Mail", icon: "🟠", hint: "zoho.com", webmail: "https://mail.zoho.com", match: ["zoho"] },
  { name: "AOL Mail", icon: "🔴", hint: "aol.com", webmail: "https://mail.aol.com", match: ["aol"] },
];

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentToProvider, setSentToProvider] = useState(null);

  const detectedProvider = EMAIL_PROVIDERS.find(p =>
    p.match.some(m => email.toLowerCase().includes(m))
  );

  // The return URL after the magic link is clicked — always back to the homepage
  const returnUrl = window.location.origin + "/";

  const handleLogin = async (providerOverride) => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Redirect to Base44 login page — it will send the magic link to their email
      // and after clicking the link they'll be returned to returnUrl (homepage)
      base44.auth.redirectToLogin(returnUrl);
    } catch (e) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleOpenInbox = (provider) => {
    window.open(provider.webmail, "_blank", "noopener,noreferrer");
  };

  const handleReset = () => {
    setStep("email");
    setEmail("");
    setError("");
    setSentToProvider(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl shadow-purple-900/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-black text-sm">Log In — GAMER Productions</span>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "email" && (
            <>
              <div className="bg-blue-900/20 border border-blue-600/40 rounded-xl px-4 py-3 mb-5 text-xs text-blue-300 leading-relaxed">
                💡 <strong>How it works:</strong> Enter your email → click Sign In → check your inbox for a magic link → click it to land back on GAMER Productions, logged in.
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label className="text-gray-400 text-xs font-semibold block mb-1.5">Your email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="you@gmail.com"
                    autoFocus
                    className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                {detectedProvider && !error && (
                  <p className="text-purple-400 text-xs mt-1 flex items-center gap-1">
                    {detectedProvider.icon} Detected: <strong>{detectedProvider.name}</strong>
                  </p>
                )}
              </div>

              {/* Primary CTA */}
              <button
                onClick={() => handleLogin(detectedProvider)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-base hover:opacity-90 transition-opacity mb-4 disabled:opacity-60"
                style={{ boxShadow: "0 0 24px rgba(139,92,246,0.5)" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {loading ? "Redirecting..." : "Sign In with Magic Link"}
              </button>

              {/* Detected provider quick open */}
              {detectedProvider && (
                <button
                  onClick={() => handleOpenInbox(detectedProvider)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-600/50 hover:bg-purple-900/50 transition-colors mb-3"
                >
                  <span className="text-2xl">{detectedProvider.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-bold">Open {detectedProvider.name}</p>
                    <p className="text-gray-400 text-xs">Check your inbox for the magic link</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </button>
              )}

              {/* All providers */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                <p className="text-gray-600 text-[10px] uppercase font-semibold mb-1">Open your email inbox:</p>
                {EMAIL_PROVIDERS.map(ep => (
                  <button
                    key={ep.name}
                    onClick={() => handleOpenInbox(ep)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-lg">{ep.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{ep.name}</p>
                      <p className="text-gray-500 text-[10px]">{ep.hint}</p>
                    </div>
                    <span className="text-[10px] bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded-lg font-semibold whitespace-nowrap">
                      Open Inbox
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "sent" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-black text-lg mb-2">Check your inbox!</h3>
              <p className="text-gray-400 text-sm mb-1">We sent a magic link to:</p>
              <p className="text-purple-300 font-bold text-sm mb-5">{email}</p>
              <p className="text-gray-500 text-xs mb-6">Click the link in your email to log in. You'll be brought directly back to GAMER Productions.</p>

              {sentToProvider && (
                <button
                  onClick={() => handleOpenInbox(sentToProvider)}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 font-bold text-sm hover:bg-purple-600/30 transition-colors mb-3"
                >
                  <span className="text-xl">{sentToProvider.icon}</span>
                  Open {sentToProvider.name}
                </button>
              )}

              <button onClick={handleReset} className="text-gray-500 text-xs hover:text-gray-300 transition-colors underline">
                Use a different email
              </button>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4 mt-4 text-center">
            <p className="text-gray-500 text-sm">
              New here?{" "}
              <button onClick={() => { onClose(); onSwitchToSignUp(); }} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Create Free Account →
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}