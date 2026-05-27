import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, Shield, RefreshCw, LogIn, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SAVED_EMAILS_KEY = "gamer_saved_emails";

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

function getSavedEmails() {
  try { return JSON.parse(localStorage.getItem(SAVED_EMAILS_KEY) || "[]"); } catch { return []; }
}

function saveEmail(email) {
  if (!email) return;
  const all = getSavedEmails().filter(e => e !== email);
  all.unshift(email);
  localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(all.slice(0, 5)));
}

function removeSavedEmail(email) {
  localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(getSavedEmails().filter(e => e !== email)));
}

// Step 1: Enter email → triggers OTP send
// Step 2: Enter 6-digit OTP code → verifyOtp → user is logged in, page reloads
export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [savedEmails, setSavedEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setSavedEmails(getSavedEmails()); reset(); }
  }, [isOpen]);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const reset = () => {
    setStep("email"); setEmail(""); setOtp(["","","","","",""]); setError(""); setLoading(false); setResendCooldown(0);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(cooldownRef.current); return 0; } return prev - 1; });
    }, 1000);
  };

  const sendOtp = async (targetEmail) => {
    const target = (targetEmail || email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await base44.auth.resendOtp(target);
      saveEmail(target);
      setSavedEmails(getSavedEmails());
      setEmail(target);
      setStep("otp");
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e) {
      const msg = e?.message || "";
      if (msg.includes("404") || msg.includes("not found") || msg.includes("NOT_FOUND")) {
        setError("Email sign-in is not enabled yet. Please use Google or Microsoft to sign in.");
      } else {
        setError(msg || "Failed to send code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    // Auto-submit when all filled
    if (val && idx === 5) {
      const code = [...next].join("");
      if (code.length === 6) submitOtp(code);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    if (pasted.length === 6) {
      setTimeout(() => submitOtp(pasted), 50);
    } else {
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const submitOtp = async (code) => {
    const finalCode = code || otp.join("");
    if (finalCode.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setLoading(true);
    setError("");
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: finalCode });
      // If SDK returns a token, set it
      if (result?.access_token) {
        base44.auth.setToken(result.access_token, true);
      }
      // Hard reload to re-initialize the SDK with fresh auth state
      window.location.reload();
    } catch (e) {
      setError(e?.message || "Invalid code. Please check your email and try again.");
      setOtp(["","","","","",""]);
      setLoading(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  const provider = getProvider(email);

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
              <span className="text-white font-black text-sm">
                {step === "email" ? "Sign In to GAMER Productions" : "Enter Your Code"}
              </span>
            </div>
            <button onClick={handleClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ─── STEP 1: EMAIL ─── */}
          {step === "email" && (
            <>
              {/* Saved accounts */}
              {savedEmails.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-500 text-[10px] uppercase font-semibold mb-2">Recent accounts</p>
                  <div className="space-y-1.5">
                    {savedEmails.map(em => {
                      const p = getProvider(em);
                      return (
                        <div key={em} className="flex items-center gap-2">
                          <button
                            onClick={() => sendOtp(em)}
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/25 border border-purple-600/30 hover:bg-purple-900/50 hover:border-purple-500/60 transition-all text-left"
                          >
                            <span className="text-xl">{p ? p.icon : "📧"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-bold truncate">{em}</p>
                              <p className="text-gray-500 text-xs">Send sign-in code</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); removeSavedEmail(em); setSavedEmails(getSavedEmails()); }}
                            className="p-2 text-gray-700 hover:text-red-400 transition-colors text-xs"
                          >✕</button>
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
                    onKeyDown={e => e.key === "Enter" && sendOtp()}
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

              <button
                onClick={() => sendOtp()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-5 disabled:opacity-60"
                style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? "Sending code..." : "Send Sign-In Code"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 mb-5 text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-400">How it works:</strong> Enter your email → we send a 6-digit code → enter the code here to sign in instantly. No password, no redirects.
              </div>

              {/* Social logins */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-500 text-[11px]">or sign in with</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => base44.auth.loginWithProvider("google", window.location.href)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 hover:bg-gray-800 transition-all text-white text-sm font-semibold"
                >
                  <span className="text-base">🔵</span> Google
                </button>
                <button
                  onClick={() => base44.auth.loginWithProvider("microsoft", window.location.href)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 hover:bg-gray-800 transition-all text-white text-sm font-semibold"
                >
                  <span className="text-base">🔷</span> Microsoft
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 2: OTP ─── */}
          {step === "otp" && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-600/40 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm">
                  We sent a 6-digit code to
                </p>
                <p className="text-white font-bold text-sm mt-0.5">{email}</p>
                <button onClick={() => setStep("email")} className="text-purple-400 text-xs mt-1 hover:text-purple-300 transition-colors underline">
                  Change email
                </button>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center mb-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-14 text-center text-2xl font-black bg-gray-900 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white outline-none transition-colors caret-transparent"
                    style={{ letterSpacing: 0 }}
                  />
                ))}
              </div>

              {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

              <button
                onClick={() => submitOtp()}
                disabled={loading || otp.join("").length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-4 disabled:opacity-50"
                style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-gray-600 text-xs">Resend code in {resendCooldown}s</p>
                ) : (
                  <button
                    onClick={() => sendOtp(email)}
                    className="text-purple-400 text-xs hover:text-purple-300 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend code
                  </button>
                )}
              </div>
            </>
          )}

          <div className="border-t border-gray-800 pt-4 mt-5 text-center">
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