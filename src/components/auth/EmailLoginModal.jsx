import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Zap, ArrowRight, ExternalLink, CheckCircle, Gamepad2 } from "lucide-react";
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
  const [step, setStep] = useState("email");
  const [error, setError] = useState("");

  const detectedProvider = EMAIL_PROVIDERS.find(p =>
    p.match.some(m => email.toLowerCase().includes(m))
  );

  // PRIMARY login: redirects to the platform's own login page (magic link), 
  // then comes BACK to "/" upon success. No extra tab is opened.
  const handleMagicLogin = () => {
    base44.auth.redirectToLogin("/");
  };

  // Send magic link then show "check your email" step, and open inbox in same window
  const handleSendAndOpenInbox = (provider) => {
    // Store the return path so after clicking the magic link they land on the site
    localStorage.setItem("login_return", "/");
    // Redirect to platform login (sends magic link to their email)
    base44.auth.redirectToLogin("/");
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
                💡 <strong>How it works:</strong> Click "Sign In" below — you'll get a magic link sent to your email. Click it to be instantly logged in and brought back to GAMER Productions.
              </div>

              {/* PRIMARY: Direct platform login — stays within the site */}
              <button
                onClick={handleMagicLogin}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-base hover:opacity-90 transition-opacity mb-4"
                style={{ boxShadow: "0 0 24px rgba(139,92,246,0.5)" }}
              >
                <Zap className="w-5 h-5" /> Sign In to GAMER Productions
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">type email to open your inbox after</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              {/* Email input for provider detection */}
              <div className="mb-4">
                <label className="text-gray-400 text-xs font-semibold block mb-1.5">Your email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@gmail.com, you@yahoo.com..."
                    className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                {detectedProvider && (
                  <p className="text-purple-400 text-xs mt-1 flex items-center gap-1">
                    {detectedProvider.icon} Detected: <strong>{detectedProvider.name}</strong>
                  </p>
                )}
              </div>

              {/* Detected provider shortcut */}
              {detectedProvider && (
                <button
                  onClick={() => handleSendAndOpenInbox(detectedProvider)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-600/50 hover:bg-purple-900/50 transition-colors mb-3"
                >
                  <span className="text-2xl">{detectedProvider.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-bold">Sign in via {detectedProvider.name}</p>
                    <p className="text-gray-400 text-xs">Magic link will be sent to your inbox</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </button>
              )}

              {/* All providers list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <p className="text-gray-600 text-[10px] uppercase font-semibold mb-1">Or choose your email provider:</p>
                {EMAIL_PROVIDERS.map(ep => (
                  <button
                    key={ep.name}
                    onClick={() => handleSendAndOpenInbox(ep)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-lg">{ep.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{ep.name}</p>
                      <p className="text-gray-500 text-[10px]">{ep.hint}</p>
                    </div>
                    <span className="text-[10px] bg-purple-900/40 border border-purple-700/40 text-purple-300 px-2 py-1 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1">
                      Sign In <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </>
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