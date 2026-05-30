import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Gamepad2, Shield, RefreshCw, CheckCircle, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// --- Helper Functions ---
const SAVED_EMAILS_KEY = "gamer_saved_emails";
function getSavedEmails() { try { return JSON.parse(localStorage.getItem(SAVED_EMAILS_KEY) || "[]"); } catch { return []; } }
function saveEmail(email) { if (!email) return; const all = getSavedEmails().filter(e => e !== email); all.unshift(email); localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(all.slice(0, 5))); }

export default function EmailLoginModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Auth Functions ---
  const loginWithProvider = async (provider) => {
    setLoading(true);
    setError("");
    
    // Auth Options
    const authOptions = { redirectTo: window.location.origin };
    if (provider === 'google') authOptions.queryParams = { prompt: 'select_account' };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider, // 'google', 'facebook', 'azure', 'openidconnect' (for Yahoo/AOL)
      options: authOptions,
    });

    if (error) { setError(error.message); setLoading(false); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <motion.div onClick={e => e.stopPropagation()} className="bg-gray-950 p-7 rounded-3xl w-full max-w-md border border-purple-700/40">
          <div className="flex justify-between mb-5">
            <h2 className="text-white font-black">Sign In</h2>
            <button onClick={onClose}><X className="text-white" /></button>
          </div>

          {/* Social Providers */}
          <div className="space-y-3">
            <button onClick={() => loginWithProvider("google")} className="w-full py-3 bg-white text-black rounded-xl font-bold">Google</button>
            <button onClick={() => loginWithProvider("facebook")} className="w-full py-3 bg-[#1877F2] text-white rounded-xl font-bold">Facebook</button>
            <button onClick={() => loginWithProvider("azure")} className="w-full py-3 bg-[#0078d4] text-white rounded-xl font-bold">Outlook / Microsoft</button>
            <button onClick={() => loginWithProvider("openidconnect")} className="w-full py-3 bg-purple-700 text-white rounded-xl font-bold">Yahoo / AOL</button>
          </div>

          {/* Sign Out Button (Example placement) */}
          <button onClick={signOut} className="mt-6 flex items-center gap-2 text-gray-500 hover:text-white text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
<div className="space-y-3">
  <button onClick={() => loginWithProvider("google")} className="w-full flex items-center gap-3 py-3 px-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors">
    <img src="/logos/google.svg" alt="Google" className="w-5 h-5" />
    Continue with Google
  </button>
  
  <button onClick={() => loginWithProvider("facebook")} className="w-full flex items-center gap-3 py-3 px-4 bg-[#1877F2] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
    <img src="/logos/facebook.svg" alt="Facebook" className="w-5 h-5" />
    Continue with Facebook
  </button>

  <button onClick={() => loginWithProvider("azure")} className="w-full flex items-center gap-3 py-3 px-4 bg-[#0078d4] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
    <img src="/logos/outlook.svg" alt="Outlook" className="w-5 h-5" />
    Continue with Outlook
  </button>

  <button onClick={() => loginWithProvider("openidconnect")} className="w-full flex items-center gap-3 py-3 px-4 bg-[#6001d2] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
    <img src="/logos/yahoo.svg" alt="Yahoo" className="w-5 h-5" />
    Continue with Yahoo / AOL
  </button>
</div>
