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
            <SocialButton onClick={loginWithProvider} bg="bg-white" text="text-black" icon={<GoogleIcon />} label="Google" />
            <SocialButton onClick={loginWithProvider} bg="bg-[#1877F2]" text="text-white" icon="/logos/facebook.svg" label="Facebook" />
            <SocialButton onClick={loginWithProvider} bg="bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5]" text="text-white" icon="/logos/instagram.svg" label="Instagram" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

function SocialButton({ onClick, bg, text, icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 py-3 px-5 ${bg} ${text} rounded-2xl font-bold text-sm hover:brightness-110 transition-all`}>
      {typeof icon === "string" ? <img src={icon} alt={label} className="w-5 h-5 object-contain" /> : icon}
      Continue with {label}
    </button>
  );
}