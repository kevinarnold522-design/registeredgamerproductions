import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Facebook, Instagram, Youtube, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "@/components/shared/BrandLogo";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

const CONTROLLER_COLORS = [
  "from-purple-600 to-pink-600",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-red-500 to-pink-500",
  "from-indigo-500 to-violet-500",
];

const SOCIALS = [
  { label: "YouTube", href: OFFICIAL_LINKS.youtube, icon: Youtube, color: "text-red-300" },
  { label: "Facebook", href: OFFICIAL_LINKS.facebook, icon: Facebook, color: "text-blue-300" },
  { label: "Instagram", href: OFFICIAL_LINKS.instagram, icon: Instagram, color: "text-pink-300" },
  { label: "Discord", href: OFFICIAL_LINKS.discord, brand: "discord", color: "text-indigo-300" },
  { label: "TikTok", href: OFFICIAL_LINKS.tiktok, brand: "tiktok", color: "text-white" },
];

export default function FloatingSearch() {
  const [query, setQuery] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setColorIdx(i => (i + 1) % CONTROLLER_COLORS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const submit = (e) => {
    e?.preventDefault?.();
    const clean = query.trim().replace(/[<>]/g, "");
    if (!clean) return;
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="sticky top-16 z-30 w-full bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 px-4 py-2">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <motion.div
          aria-hidden
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${CONTROLLER_COLORS[colorIdx]} transition-all duration-500`}
          animate={{ rotate: [0, -6, 6, -4, 4, 0], y: [0, -3, 0] }}
          transition={{ rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
          style={{ boxShadow: "0 0 16px rgba(168,85,247,0.5), 0 0 32px rgba(236,72,153,0.3)" }}
        >
          <Gamepad2 className="w-5 h-5 text-white" />
        </motion.div>
        <form
          onSubmit={submit}
          className="flex-1 min-w-0 flex items-center gap-2 rounded-2xl border border-purple-500/60 bg-gray-900 px-4 py-2.5"
          style={{ boxShadow: "0 0 16px rgba(168,85,247,0.45), inset 0 0 10px rgba(168,85,247,0.12)" }}
        >
          <Search className="w-4 h-4 text-purple-300 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GAMER Productions..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button type="submit" className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex-shrink-0">
            Search
          </button>
        </form>
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {SOCIALS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className="theme-glow-action w-8 h-8 rounded-xl bg-gray-900 border border-purple-500/25 flex items-center justify-center transition-all"
              >
                {item.brand
                  ? <BrandLogo brand={item.brand} label={item.label} className="w-4 h-4" />
                  : <Icon className={`w-4 h-4 theme-glow-icon ${item.color}`} />}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}