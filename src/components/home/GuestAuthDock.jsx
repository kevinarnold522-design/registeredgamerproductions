import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailLoginModal from "@/components/auth/EmailLoginModal.jsx";
import EarnNowButton from "@/components/shared/EarnNowButton";

// Floating lower-left dock for guests: Earn Now, Get Started, Log In.
// Replaces the same buttons that used to sit in the top navbar.
export default function GuestAuthDock() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
        <EarnNowButton />
        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-black transition-all shadow-lg radiant-glow"
          style={{
            background: "linear-gradient(135deg, #ff6a00, #ee0979, #ff6a00)",
            backgroundSize: "200% 200%",
            animation: "fire-shift 2s ease infinite",
            boxShadow: "0 0 20px rgba(238,9,121,0.5), 0 0 40px rgba(255,106,0,0.3)",
          }}
        >
          Get Started
        </button>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white text-sm font-black hover:from-gray-700 hover:to-gray-600 transition-all shadow-lg radiant-glow"
        >
          Log In
        </button>
      </div>

      <EmailLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}