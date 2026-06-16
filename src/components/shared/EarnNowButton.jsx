import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EarnNowButton() {
  const [authed, setAuthed] = useState(null);

  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async a => {
      setAuthed(a);
      if (a) {
        const me = await base44.auth.me().catch(() => null);
        if (me?.email) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email }).catch(() => []);
          setAccountType(profiles[0]?.account_type || "regular");
        }
      }
    });
  }, []);

  if (authed === null) return null;
  if (authed || accountType === "digital_creator" || accountType === "business") return null;

  const href = "/register";

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.span
        aria-label="Gamer Productions"
        className="w-7 h-7 flex items-center justify-center text-xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))" }}
      >🎮</motion.span>
    <motion.a
      href={href}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-white text-xs select-none overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)",
        backgroundSize: "200% 200%",
        animation: "earnBtnShift 2.5s ease infinite",
        boxShadow: "0 0 18px rgba(124,58,237,0.7), 0 0 36px rgba(236,72,153,0.4), 0 0 60px rgba(245,158,11,0.2)",
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Purple fire glow ring */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          animation: "earnGlow 1.8s ease-in-out infinite",
          background: "radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, transparent 70%)",
        }}
      />
      <Zap className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">💰 Earn Now</span>
      <style>{`
        @keyframes earnBtnShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes earnGlow { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
      `}</style>
    </motion.a>
    </div>
  );
}