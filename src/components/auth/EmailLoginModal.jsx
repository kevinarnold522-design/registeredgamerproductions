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

  const loginWithProvider = async (provider) => {
    setLoading(true);
    setError("");
    
    const authOptions = { redirectTo: window.location.origin };
    
    // Force Google account picker
    if (provider === 'google') {
      authOptions.queryParams = { prompt: 'select_account' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: authOptions,
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
    
    const { error } = await supabase.auth.signInWithOtp({ email: target, options: { shouldCreateUser: true } });
    if (error) {
      setError(error.message || "Could not send code.");
      setLoading(false);
    } else {
      saveEmail(target); setSavedEmails(getSavedEmails()); setEmail(target); setStep("otp");
      startCooldown(); setLoading(false); setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const submitOtp = async (code) => {
    const finalCode = code || otp.join("");
    const { error } = await supabase.auth.verifyOtp({ email, token: finalCode, type: 'email' });
    if (error) {
      setError("Invalid code."); setOtp(["","","","","",""]); setLoading(false);
    } else {
      window.location.replace("/");
    }
  };

  const handleClose = () => { resetAll(); onClose(); };
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.88)" }} onClick={handleClose}>
        <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 24 }} onClick={e => e.stopPropagation()} className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-white" /><span className="text-white font-black text-sm">Sign In</span></div>
            <button onClick={handleClose}><X className="w-5 h-5 text-white" /></button>
          </div>
          
          {/* Social Login Button */}
          <button onClick={() => loginWithProvider("google")} className="w-full bg-white text-gray-800 p-3 rounded-2xl font-bold mb-4">
            Continue with Google
          </button>
          
          {/* Add your existing Tab logic and inputs here as they were before */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
