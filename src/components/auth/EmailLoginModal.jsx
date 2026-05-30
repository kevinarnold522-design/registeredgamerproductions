import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, Shield, RefreshCw, CheckCircle, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const SAVED_EMAILS_KEY = "gamer_saved_emails";

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
function emailToUsername(email) {
  return email.split("@")[0].toLowerCase();
}
function findEmailByUsername(username) {
  const saved = getSavedEmails();
  return saved.find(e => emailToUsername(e) === username.toLowerCase()) || null;
}

export default function EmailLoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const [tab, setTab] = useState("social");
  const [step, setStep] = useState("input");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [savedEmails, setSavedEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setSavedEmails(getSavedEmails()); resetAll(); }
  }, [isOpen]);
  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const resetAll = () => {
    setStep("input"); setEmail(""); setUsername(""); setOtp(["","","","","",""]); setError(""); setLoading(false); setResendCooldown(0);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(cooldownRef.current); return 0; } return prev - 1; });
    }, 1000);
  };

  const loginWithProvider = async (provider) => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const sendOtp = async (targetEmail) => {
    const target = (targetEmail || email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    
    const { error } = await supabase.auth.signInWithOtp({
      email: target,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message || "Could not send code. Please try again.");
      setLoading(false);
    } else {
      saveEmail(target); 
      setSavedEmails(getSavedEmails());
      setEmail(target); 
      setStep("otp"); 
      startCooldown();
      setLoading(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleUsernameSubmit = async () => {
    const un = username.trim().toLowerCase();
    if (!un) { setError("Please enter your username."); return; }
    const found = findEmailByUsername(un);
    if (!found) {
      setError("Username not found on this device. Please sign in with email or Google first.");
      return;
    }
    setEmail(found);
    setTab("email");
    await sendOtp(found);
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (val && idx === 5) { const code = next.join(""); if (code.length === 6) submitOtp(code); }
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp]; pasted.split("").forEach((ch, i) => { next[i] = ch; }); setOtp(next);
    if (pasted.length === 6) setTimeout(() => submitOtp(pasted), 50);
    else otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const submitOtp = async (code) => {
    const finalCode = code || otp.join("");
    if (finalCode.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setLoading(true); setError("");
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: finalCode,
      type: 'email'
    });

    if (error) {
      setError(error.message || "Invalid code. Please try again.");
      setOtp(["","","","","",""]); 
      setLoading(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } else {
      window.location.replace("/");
    }
  };

  const handleClose = () => { resetAll(); onClose(); };

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
              <span className="text-white font-black text-sm">Sign In to GAMER Productions</span>
            </div>
            <button onClick={handleClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* OTP Step */}
          {step === "otp" ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-600/40 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm">We sent a 6-digit code to</p>
                <p className="text-white font-bold text-sm mt-0.5">{email}</p>
                <button onClick={() => setStep("input")} className="text-purple-400 text-xs mt-1 hover:text-purple-300 transition-colors underline">
                  Change email
                </button>
              </div>
              <div className="flex gap-2 justify-center mb-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx} ref={el => otpRefs.current[idx] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-14 text-center text-2xl font-black bg-gray-900 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white outline-none transition-colors caret-transparent"
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
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-gray-600 text-xs">Resend code in {resendCooldown}s</p>
                ) : (
                  <button onClick={() => sendOtp(email)} className="text-purple-400 text-xs hover:text-purple-300 transition-colors flex items-center gap-1 mx-auto">
                    <RefreshCw className="w-3 h-3" /> Resend code
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex rounded-xl bg-gray-900 p-1 mb-5 gap-1">
                {[
                  { key: "social", label: "Social" },
                  { key: "username", label: "Username" },
                  { key: "email", label: "Email" },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* SOCIAL TAB */}
              {tab === "social" && (
                <>
                  <p className="text-gray-400 text-xs text-center mb-4">Sign in instantly — no password needed</p>

                  {savedEmails.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-500 text-[10px] uppercase font-semibold mb-2">Recent accounts</p>
                      <div className="space-y-1.5">
                        {savedEmails.map(em => (
                          <div key={em} className="flex items-center gap-2">
                            <button
                              onClick={() => sendOtp(em)}
                              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/25 border border-purple-600/30 hover:bg-purple-900/50 hover:border-purple-500/60 transition-all text-left"
                            >
                              <span className="text-xl">📧</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate">{em}</p>
                                <p className="text-gray-500 text-xs">@{emailToUsername(em)}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            </button>
                            <button onClick={() => { removeSavedEmail(em); setSavedEmails(getSavedEmails()); }} className="p-2 text-gray-700 hover:text-red-400 transition-colors text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-800" />
                        <span className="text-gray-600 text-[11px]">or sign in with a new account</span>
                        <div className="flex-1 h-px bg-gray-800" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Facebook Login */}
                    <button
                      onClick={() => loginWithProvider("facebook")}
                      className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition-all"
                      style={{ background: "#1877F2", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                      <ArrowRight className="w-4 h-4 ml-auto text-white/60" />
                    </button>

                    {/* Google Login */}
                    <button
                      onClick={() => loginWithProvider("google")}
                      className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-gray-800 font-bold text-sm hover:bg-gray-100 transition-all"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                        <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.5 35.3 26.9 36 24 36c-5.1 0-9.5-3.1-11.4-7.6l-6.5 5C9.8 39.9 16.4 44 24 44z"/>
                        <path fill="#1976D2" d="M43.6 20.1c.3 1.3.4 2.6.4 3.9 0 6.1-2.1 11.2-5.7 14.5l-6.3-5.3c1.7-1.1 3-3 3.6-5.3H24v-8h19.6z"/>
                      </svg>
                      Continue with Google
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                    </button>
                  </div>
                </>
              )}

              {/* USERNAME TAB */}
              {tab === "username" && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-xs text-center">Enter your username to request a login link</p>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                  <button
                    onClick={handleUsernameSubmit}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity"
                  >
                    {loading ? "Sending..." : "Continue"}
                  </button>
                </div>
              )}

              {/* EMAIL TAB */}
              {tab === "email" && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-xs text-center">Sign in or create an account via magic link OTP</p>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                  <button
                    onClick={() => sendOtp()}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
