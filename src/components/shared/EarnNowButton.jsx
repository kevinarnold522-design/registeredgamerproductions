import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EarnNowButton() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(a => setAuthed(a));
  }, []);

  if (authed === null) return null;

  const href = authed ? "/" : "/register";

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.img
        src="https://media.base44.com/images/public/6a126acdde36b8358b1010f3/2c492ba5e_86DEEF8D-A166-44B9-8CC9-D721135C9BB9.png"
        alt="GP"
        className="w-7 h-7 object-contain"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))" }}
      />
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