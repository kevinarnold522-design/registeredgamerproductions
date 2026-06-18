import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, Loader2 } from "lucide-react";

// All HTML ads, shown together for 10 seconds, then routes to the proper download.
const ADS = [
  { title: "Upgrade to Tier 1", body: "Ad-free, post in all communities, unlock Studio & more for $1/month.", cta: "Get Tier 1 →", href: "/payment", color: "from-purple-600 to-pink-600", bg: "bg-purple-900/30 border-purple-700/40" },
  { title: "Subscribe on YouTube", body: "Gaming tutorials, mods & highlights on our official channel.", cta: "Subscribe →", href: "https://youtube.com/@registeredgamerproductions?si=WfWn2yT15uvp5LnF", color: "from-red-600 to-red-500", bg: "bg-red-900/30 border-red-700/40", external: true },
  { title: "Follow on Facebook", body: "Latest mods, tournaments and gaming news.", cta: "Follow →", href: "https://www.facebook.com/share/1D9ey9w8Rw/?mibextid=wwXIfr", color: "from-blue-600 to-blue-500", bg: "bg-blue-900/30 border-blue-700/40", external: true },
  { title: "Sell Your Mods", body: "Are you a modder? Create a listing and start earning today.", cta: "Start Selling →", href: "/create-listing", color: "from-green-600 to-emerald-500", bg: "bg-green-900/30 border-green-700/40" },
  { title: "Join Communities", body: "Connect with thousands of gamers in your favourite franchises.", cta: "Explore →", href: "/gaming-community", color: "from-cyan-600 to-blue-600", bg: "bg-cyan-900/30 border-cyan-700/40" },
  { title: "Daily Rewards Streak", body: "Log in daily to build your streak and unlock real rewards.", cta: "Check In →", href: "/dashboard", color: "from-yellow-600 to-orange-500", bg: "bg-yellow-900/30 border-yellow-700/40" },
  { title: "Join Tournaments", body: "Compete with gamers across the Philippines and win prize pools.", cta: "View →", href: "/tournaments", color: "from-pink-600 to-rose-500", bg: "bg-pink-900/30 border-pink-700/40" },
];

const TOTAL = 10;

export default function DownloadAdUnlock({ onComplete }) {
  const [remaining, setRemaining] = useState(TOTAL);

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(t);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const ready = remaining === 0;
  const pct = ((TOTAL - remaining) / TOTAL) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 overflow-y-auto" style={{ background: "rgba(0,0,0,0.96)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-3xl border border-purple-700/40 bg-gray-950 p-6"
        style={{ boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}
      >
        <div className="text-center mb-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Sponsored — your download unlocks soon</p>
          {/* Countdown bar */}
          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }} animate={{ width: `${pct}%` }} transition={{ ease: "linear" }} />
          </div>
        </div>

        {/* All HTML ads at once */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {ADS.map((ad, i) => (
            <div key={i} className={`rounded-2xl border p-4 ${ad.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${ad.color} flex-shrink-0`}>
                  <Download className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-black text-sm">{ad.title}</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{ad.body}</p>
              <a href={ad.href} {...(ad.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs bg-gradient-to-r ${ad.color}`}>
                {ad.external && <ExternalLink className="w-3 h-3" />} {ad.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Footer action */}
        <div className="mt-5">
          {ready ? (
            <button onClick={onComplete}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              <Download className="w-4 h-4" /> Continue to Download →
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3.5">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-gray-300 text-sm font-bold">Download unlocking in {remaining}s...</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}