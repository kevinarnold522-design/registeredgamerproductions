import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, Shield, RefreshCw, CheckCircle, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const SAVED_EMAILS_KEY = "gamer_saved_emails";

// Helper functions (kept as provided)
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

  // FIXED: Integrated the provider logic here
  const loginWithProvider = async (provider) => {
    setLoading(true);
    setError("");
    
    const authOptions = {
      redirectTo: window.location.origin,
    };

    if (provider === 'google') {
      authOptions.queryParams = {
        prompt: 'select_account',
      };
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

  const startCooldown = () => {
    setResendCooldown(60);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(cooldownRef.current); return 0; } return prev - 1; });
    }, 1000);
  };

  const sendOtp = async (targetEmail) => {
    const target = (targetEmail || email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    
    const { error } = await supabase.auth.signInWithOtp({
      email: target,
      options: { shouldCreateUser: true },
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

  const submitOtp = async (code) => {
    const finalCode = code || otp.join("");
    if (finalCode.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setLoading(true); setError("");
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: finalCode,
      type: 'email'
    });

    if (error) {
      setError("Invalid code. Please try again.");
      setOtp(["","","","","",""]); 
      setLoading(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } else {
      window.location.replace("/");
    }
  };

  // ... (Keep the rest of your render code exactly as it was)
  // The rest of your JSX remains the same.
  const handleClose = () => { resetAll(); onClose(); };
  if (!isOpen) return null;
  return (
    // ... your existing JSX ...
  );
}
