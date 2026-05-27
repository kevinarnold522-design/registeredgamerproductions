import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMAIL_PROVIDERS = [
  { name: "Gmail",             icon: "🔵", webmail: "https://mail.google.com",          match: ["gmail"] },
  { name: "Yahoo Mail",        icon: "🟣", webmail: "https://mail.yahoo.com",           match: ["yahoo"] },
  { name: "Outlook / Hotmail", icon: "🔷", webmail: "https://outlook.live.com/mail/0/", match: ["outlook","hotmail","live","msn"] },
  { name: "iCloud Mail",       icon: "☁️", webmail: "https://www.icloud.com/mail",      match: ["icloud","me.com"] },
  { name: "ProtonMail",        icon: "🛡️", webmail: "https://mail.proton.me",           match: ["proton","protonmail"] },
  { name: "Zoho Mail",         icon: "🟠", webmail: "https://mail.zoho.com",            match: ["zoho"] },
  { name: "AOL Mail",          icon: "🔴", webmail: "https://mail.aol.com",             match: ["aol"] },
];

function getProvider(email) {
  if (!email) return null;
  return EMAIL_PROVIDERS.find(p => p.match.some(m => email.toLowerCase().includes(m))) || null;
}

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // "email" | "check"
  const [error, setError] = useState("");

  const provider = getProvider(email);

  // After clicking the magic link, Base44 redirects the user back to this URL already authenticated
  const returnUrl = "https://gamerproductions.vercel.app/";

  const handleGoToLogin = () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email."); return; }
    // This redirects the current tab to Base44's login page.
    // The user enters their email there, receives a magic link,
    // clicks it, and Base44 sends them back to returnUrl (already signed in).
    base44.auth.redirectToLogin(returnUrl);
  };

  const handleOpenInbox = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(p.webmail, "_blank", "noopener,noreferrer");
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.88)" }}
        onClick={handleClose}
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
            <button onClick={handleClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "email" && (
            <>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Click <strong className="text-white">Continue to Sign In</strong> — enter your email on the next screen, receive a magic link, click it, and you'll be brought straight back here.
              </p>

              {/* Optional email hint for provider detection only */}
              <div className="mb-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleGoToLogin()}
                    placeholder="your@email.com (optional)"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                {provider && !error && (
                  <p className="text-purple-400 text-xs mt-1">{provider.icon} {provider.name} detected</p>
                )}
              </div>

              {/* Primary CTA — goes to Base44 login, returns to Vercel homepage */}
              <button
                onClick={handleGoToLogin}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-5"
                style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
              >
                <Mail className="w-4 h-4" />
                Continue to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Inbox shortcuts — open in new tab, don't navigate away */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-[11px]">Open your inbox for the magic link</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {/* Detected provider highlighted */}
                {provider && (
                  <button
                    onClick={e => handleOpenInbox(provider, e)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-600/40 hover:bg-purple-900/50 transition-colors mb-1"
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-bold">Open {provider.name}</p>
                      <p className="text-gray-400 text-xs">Opens in new tab — find your magic link</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                  </button>
                )}
                {EMAIL_PROVIDERS.map(ep => (
                  <button
                    key={ep.name}
                    onClick={e => handleOpenInbox(ep, e)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/40 hover:bg-gray-800/80 transition-colors text-left"
                  >
                    <span className="text-lg">{ep.icon}</span>
                    <span className="flex-1 text-white text-xs font-semibold">{ep.name}</span>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-gray-800 pt-4 mt-4 text-center">
            <p className="text-gray-500 text-sm">
              New here?{" "}
              <button
                onClick={() => { handleClose(); onSwitchToSignUp?.(); }}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Create Free Account →
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}