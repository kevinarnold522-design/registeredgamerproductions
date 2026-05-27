import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMAIL_PROVIDERS = [
  { name: "Gmail",            icon: "🔵", webmail: "https://mail.google.com",           match: ["gmail"] },
  { name: "Yahoo Mail",       icon: "🟣", webmail: "https://mail.yahoo.com",            match: ["yahoo"] },
  { name: "Outlook / Hotmail",icon: "🔷", webmail: "https://outlook.live.com/mail/0/",  match: ["outlook","hotmail","live","msn"] },
  { name: "iCloud Mail",      icon: "☁️", webmail: "https://www.icloud.com/mail",       match: ["icloud","me.com"] },
  { name: "ProtonMail",       icon: "🛡️", webmail: "https://mail.proton.me",            match: ["proton","protonmail"] },
  { name: "Zoho Mail",        icon: "🟠", webmail: "https://mail.zoho.com",             match: ["zoho"] },
  { name: "AOL Mail",         icon: "🔴", webmail: "https://mail.aol.com",              match: ["aol"] },
];

function getProvider(email) {
  return EMAIL_PROVIDERS.find(p => p.match.some(m => email.toLowerCase().includes(m)));
}

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const provider = getProvider(email);

  // Always return to the homepage root — Base44 appends the token and redirects there
  const returnUrl = "https://gamerproductions.vercel.app/";

  const handleSendLink = () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email."); return; }
    setLoading(true);
    setError("");
    // Redirect to Base44 login page — it sends the magic link and after clicking it
    // the user is redirected back to returnUrl (homepage) already authenticated.
    base44.auth.redirectToLogin(returnUrl);
  };

  const handleOpenInbox = (p) => {
    // Build a deep-link URL with the email pre-filled if possible
    const gmailSearch = `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(email)}#search/GAMER+Productions`;
    const url = p.name === "Gmail" && email.includes("gmail") ? gmailSearch : p.webmail;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const reset = () => { setStep("email"); setEmail(""); setError(""); setLoading(false); };

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
              <span className="text-white font-black text-sm">Sign In</span>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "email" && (
            <>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Enter your email — we'll send a magic link. Click it to sign in instantly and be taken back to the site.
              </p>

              {/* Email input */}
              <div className="mb-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSendLink()}
                    placeholder="you@gmail.com"
                    autoFocus
                    className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                {provider && !error && (
                  <p className="text-purple-400 text-xs mt-1">{provider.icon} {provider.name} detected</p>
                )}
              </div>

              {/* Send magic link */}
              <button
                onClick={handleSendLink}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-5 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? "Redirecting…" : "Send Magic Link"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-[11px]">After signing in, open your inbox</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              {/* Inbox shortcuts */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {/* Detected provider first, highlighted */}
                {provider && (
                  <button
                    onClick={() => handleOpenInbox(provider)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-600/40 hover:bg-purple-900/50 transition-colors mb-2"
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-bold">Open {provider.name}</p>
                      <p className="text-gray-400 text-xs">Find your magic link here</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </button>
                )}
                <p className="text-gray-600 text-[10px] uppercase font-semibold px-1">All providers</p>
                {EMAIL_PROVIDERS.map(ep => (
                  <button
                    key={ep.name}
                    onClick={() => handleOpenInbox(ep)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/40 hover:bg-gray-800/80 transition-colors text-left"
                  >
                    <span className="text-lg">{ep.icon}</span>
                    <span className="flex-1 text-white text-xs font-semibold">{ep.name}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">Open →</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-gray-800 pt-4 mt-4 text-center">
            <p className="text-gray-500 text-sm">
              New here?{" "}
              <button onClick={() => { onClose(); onSwitchToSignUp?.(); }} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Create Free Account →
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}