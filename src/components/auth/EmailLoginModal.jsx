import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, ExternalLink, Clock, Trash2 } from "lucide-react";
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

const SAVED_EMAILS_KEY = "gamer_saved_emails";
const RETURN_URL = "https://gamerproductions.vercel.app/";

function getProvider(email) {
  if (!email) return null;
  return EMAIL_PROVIDERS.find(p => p.match.some(m => email.toLowerCase().includes(m))) || null;
}

function getSavedEmails() {
  try { return JSON.parse(localStorage.getItem(SAVED_EMAILS_KEY) || "[]"); } catch { return []; }
}

function saveEmail(email) {
  if (!email) return;
  const emails = getSavedEmails().filter(e => e !== email);
  emails.unshift(email);
  localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(emails.slice(0, 5)));
}

function removeSavedEmail(email) {
  const emails = getSavedEmails().filter(e => e !== email);
  localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(emails));
}

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [savedEmails, setSavedEmails] = useState([]);

  useEffect(() => {
    if (isOpen) setSavedEmails(getSavedEmails());
  }, [isOpen]);

  const provider = getProvider(email);

  const handleSignIn = (emailToUse) => {
    const target = (emailToUse || email).trim();
    if (target) {
      // Validate if user typed something
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
        setError("Please enter a valid email address.");
        return;
      }
      // Save this email for quick future logins
      saveEmail(target);
      setSavedEmails(getSavedEmails());
    }
    // Redirect to Base44 login — after magic link click, Base44 sends user back to RETURN_URL
    // with access_token in URL. app-params.js reads it, stores in localStorage, strips URL.
    // The page then loads as authenticated automatically.
    base44.auth.redirectToLogin(RETURN_URL);
  };

  const handleOpenInbox = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(p.webmail, "_blank", "noopener,noreferrer");
  };

  const handleRemove = (e, em) => {
    e.stopPropagation();
    removeSavedEmail(em);
    setSavedEmails(getSavedEmails());
  };

  const handleClose = () => {
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

          {/* Saved emails — one-click sign in */}
          {savedEmails.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-500 text-[10px] uppercase font-semibold mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent accounts
              </p>
              <div className="space-y-1.5">
                {savedEmails.map(em => {
                  const p = getProvider(em);
                  return (
                    <div key={em} className="flex items-center gap-2">
                      <button
                        onClick={() => handleSignIn(em)}
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/25 border border-purple-600/30 hover:bg-purple-900/50 hover:border-purple-500/60 transition-all text-left"
                      >
                        <span className="text-xl">{p ? p.icon : "📧"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold truncate">{em}</p>
                          <p className="text-gray-500 text-xs">Click to sign in instantly</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      </button>
                      <button
                        onClick={e => handleRemove(e, em)}
                        className="p-2 text-gray-700 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-[11px]">or use a different email</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="mb-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                placeholder="your@email.com"
                autoFocus={savedEmails.length === 0}
                className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            {provider && !error && (
              <p className="text-purple-400 text-xs mt-1">{provider.icon} {provider.name} detected</p>
            )}
          </div>

          {/* Primary sign in button */}
          <button
            onClick={() => handleSignIn()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-5"
            style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
          >
            <Mail className="w-4 h-4" />
            {email.trim() ? "Continue to Sign In" : "Sign In with Email"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Inbox shortcuts */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-[11px]">Open your inbox for the magic link</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
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