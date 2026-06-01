import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EmailLoginModal({ isOpen, onClose }) {
  const loginWithProvider = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95 }} animate={{ scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-black text-2xl">Sign In</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>

          <div className="space-y-3">
            <SocialButton onClick={loginWithProvider} bg="bg-white" text="text-black" icon="/logos/google.svg" label="Google" />
            <SocialButton onClick={loginWithProvider} bg="bg-[#5865F2]" text="text-white" icon="/logos/discord.svg" label="Discord" />
            <SocialButton onClick={loginWithProvider} bg="bg-[#24292e]" text="text-white" icon="/logos/github.svg" label="GitHub" />
            <SocialButton onClick={loginWithProvider} bg="bg-[#0078d4]" text="text-white" icon="/logos/outlook.svg" label="Outlook" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SocialButton({ onClick, bg, text, icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 py-3 px-5 ${bg} ${text} rounded-2xl font-bold text-sm hover:brightness-110 transition-all`}>
      <img src={icon} alt={label} className="w-5 h-5 object-contain" />
      Continue with {label}
    </button>
  );
}