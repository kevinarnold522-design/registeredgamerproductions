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
            </
