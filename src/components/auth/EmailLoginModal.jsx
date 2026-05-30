import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function EmailLoginModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginWithProvider = async (provider) => {
    setLoading(true);
    setError("");
    
    // Auth options for redirecting back to your site
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-black text-2xl">Sign In</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="space-y-3">
            <SocialButton onClick={() => loginWithProvider("google")} bg="bg-white" text="text-black" icon="/logos/google.svg" label="Google" />
            <SocialButton onClick={() => loginWithProvider("facebook")} bg="bg-[#1877F2]" text="text-white" icon="/logos/facebook.svg" label="Facebook" />
            <SocialButton onClick={() => loginWithProvider("azure")} bg="bg-[#0078d4]" text="text-white" icon="/logos/outlook.svg" label="Outlook" />
            <SocialButton onClick={() => loginWithProvider("openidconnect")} bg="bg-[#6001d2]" text="text-white" icon="/logos/yahoo.svg" label="Yahoo / AOL" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SocialButton({ onClick, bg, text, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-3 px-5 ${bg} ${text} rounded-2xl font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all`}
    >
      <img src={icon} alt={label} className="w-5 h-5 object-contain" />
      Continue with {label}
    </button>
  );
}
