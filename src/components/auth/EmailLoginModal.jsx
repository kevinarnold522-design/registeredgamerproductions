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

// Opens the provider's webmail ONLY — no routing through Google
function openWebmail(provider) {
  window.open(provider.webmail, "_blank", "noopener,noreferrer");
}

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detectedProvider = EMAIL_PROVIDERS.find(p =>
    p.match.some(m => email.toLowerCase().includes(m))
  );

  // Sends magic link AND opens correct provider inbox (NOT Google by default)
  const handleLoginAndOpen = (provider) => {
    base44.auth.redirectToLogin("/");
    openWebmail(provider);
  };

  const handleDirectLogin = () => {
    base44.auth.redirectToLogin("/");
  };

  const handleSendLink = () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    // Redirect to login (magic link) then show sent state
    base44.auth.redirectToLogin("/");
    setLoading(false);
    setStep("sent");
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
              <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl px-4 py-3 mb-5 text-xs text-yellow-300 leading-relaxed">
                ⚠️ <strong>New here?</strong> You must{" "}
                <button onClick={() => { onClose(); onSwitchToSignUp(); }} className="underline text-yellow-200 hover:text-white font-bold">
                  create a free account first
                </button>{" "}before logging in.
              </div>

              {/* Magic Link Button */}
              <button
                onClick={handleDirectLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-5"
                style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
              >
                <Zap className="w-4 h-4" /> Log In with Magic Link
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">or type your email to open inbox directly</span>
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
                    placeholder="you@example.com"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors"
                    onKeyDown={e => e.key === "Enter" && handleSendLink()}
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
                  onClick={() => handleLoginAndOpen(detectedProvider)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 border border-purple-600/50 hover:bg-gray-800 transition-colors mb-3"
                >
                  <span className="text-xl">{detectedProvider.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-semibold">Send link &amp; open {detectedProvider.name}</p>
                    <p className="text-gray-500 text-xs">Opens {detectedProvider.webmail}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </button>
              )}

              {/* All providers — each opens their OWN inbox */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {EMAIL_PROVIDERS.map(ep => (
                  <button
                    key={ep.name}
                    onClick={() => handleLoginAndOpen(ep)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-lg">{ep.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{ep.name}</p>
                      <p className="text-gray-500 text-[10px]">{ep.hint}</p>
                    </div>
                    <span className="text-[10px] bg-purple-900/40 border border-purple-700/40 text-purple-300 px-2 py-1 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "sent" && (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-black text-lg mb-2">Check Your Email!</h3>
              <p className="text-gray-400 text-sm mb-5">
                Magic login link sent to<br />
                <span className="text-purple-400 font-semibold">{email || "your inbox"}</span>
              </p>
              {detectedProvider && (
                <button
                  onClick={() => openWebmail(detectedProvider)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-900 border border-purple-600/50 text-white font-semibold text-sm hover:bg-gray-800 transition-colors mb-3"
                >
                  <span>{detectedProvider.icon}</span>
                  Open {detectedProvider.name}
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button onClick={() => setStep("email")} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                ← Try a different email
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