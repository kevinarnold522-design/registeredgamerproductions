import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";

const ADS = [
  {
    title: "Upgrade to Tier 1",
    body: "Get ad-free experience, post in all communities, unlock Studio & more for just $1/month!",
    cta: "Get Tier 1 →",
    href: "/payment",
    color: "from-purple-600 to-pink-600",
    bg: "bg-purple-900/30 border-purple-700/40",
  },
  {
    title: "Subscribe on YouTube",
    body: "Watch gaming tutorials, mods & highlights on our official channel!",
    cta: "Subscribe →",
    href: "https://youtube.com/@registeredgamerproductions?si=WfWn2yT15uvp5LnF",
    color: "from-red-600 to-red-500",
    bg: "bg-red-900/30 border-red-700/40",
    external: true,
  },
  {
    title: "Follow on Facebook",
    body: "Stay updated with the latest mods, tournaments and gaming news!",
    cta: "Follow →",
    href: "https://www.facebook.com/share/1D9ey9w8Rw/?mibextid=wwXIfr",
    color: "from-blue-600 to-blue-500",
    bg: "bg-blue-900/30 border-blue-700/40",
    external: true,
  },
  {
    title: "Sell Your Mods",
    body: "Are you a modder? Create a listing and start earning today on Gamer.Productions!",
    cta: "Start Selling →",
    href: "/create-listing",
    color: "from-green-600 to-emerald-500",
    bg: "bg-green-900/30 border-green-700/40",
  },
  {
    title: "Join Gaming Communities",
    body: "Connect with thousands of gamers in your favourite franchise communities!",
    cta: "Explore →",
    href: "/gaming-community",
    color: "from-cyan-600 to-blue-600",
    bg: "bg-cyan-900/30 border-cyan-700/40",
  },
  {
    title: "Daily Rewards Streak",
    body: "Log in every day to build your streak and unlock exclusive badges & real rewards!",
    cta: "Check In →",
    href: "/dashboard",
    color: "from-yellow-600 to-orange-500",
    bg: "bg-yellow-900/30 border-yellow-700/40",
  },
  {
    title: "Join Tournaments",
    body: "Compete with gamers across the Philippines and win prize pools!",
    cta: "View Tournaments →",
    href: "/tournaments",
    color: "from-pink-600 to-rose-500",
    bg: "bg-pink-900/30 border-pink-700/40",
  },
];

// 7-ad download gate
// isGuest: non signed-in users cannot close ads
export default function DownloadAdGate({ onComplete, isGuest = false }) {
  const [adIndex, setAdIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    setCountdown(5);
    setCanSkip(false);
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(t);
          setCanSkip(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [adIndex]);

  const handleNext = () => {
    if (adIndex < ADS.length - 1) {
      setAdIndex(i => i + 1);
    } else {
      onComplete();
    }
  };

  const ad = ADS[adIndex];
  const isLast = adIndex === ADS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.96)" }}>
      
      {/* Close button — ONLY for signed-in users */}
      {!isGuest && canSkip && isLast && (
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Guest: sign-in nudge for close button */}
      {isGuest && canSkip && (
        <div className="absolute top-4 right-4 z-10">
          <a href="/register"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white border border-purple-600/60"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            🔒 Sign in to close ads
          </a>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={adIndex}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -20 }}
          className={`w-full max-w-sm rounded-3xl border p-7 text-center ${ad.bg}`}
          style={{ boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {ADS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === adIndex ? "w-6 bg-purple-400" : i < adIndex ? "w-2 bg-green-500" : "w-2 bg-gray-700"}`} />
            ))}
          </div>

          <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-widest">
            Ad {adIndex + 1} of {ADS.length} — Download unlocking soon...
          </p>

          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${ad.color}`}>
            <Download className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-white font-black text-xl mb-2">{ad.title}</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{ad.body}</p>

          {/* Visit ad CTA */}
          {ad.external ? (
            <a href={ad.href} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-black text-sm mb-4 bg-gradient-to-r ${ad.color}`}>
              <ExternalLink className="w-4 h-4" /> {ad.cta}
            </a>
          ) : (
            <a href={ad.href}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-black text-sm mb-4 bg-gradient-to-r ${ad.color}`}>
              {ad.cta}
            </a>
          )}

          <div className="mt-2">
            {canSkip ? (
              isGuest ? (
                <div className="space-y-2">
                  <a href="/register"
                    className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    🔒 Sign In to Download Free
                  </a>
                  <p className="text-gray-600 text-xs">Sign in = no ads + instant download access</p>
                </div>
              ) : (
                <button onClick={handleNext}
                  className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  {isLast ? "Continue to Download →" : `Next Ad (${adIndex + 2}/${ADS.length}) →`}
                </button>
              )
            ) : (
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span className="text-gray-400 text-sm font-semibold">Continue in {countdown}s...</span>
              </div>
            )}
          </div>

          {isGuest && !canSkip && (
            <p className="text-gray-600 text-xs mt-3">
              <a href="/register" className="text-purple-400 hover:underline font-semibold">Sign up free</a> to skip ads & download instantly
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}