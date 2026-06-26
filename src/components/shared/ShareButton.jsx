import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, Check, Facebook, Instagram, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copyToClipboard";

// Use the live site origin so shared links open the real app (not a stale domain).
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

// Build the share URL for any content type
export function buildShareUrl(type, id) {
  const paths = {
    listing: `/listing?id=${id}`,
    post: `/channel?post=${id}`,
    video: `/channel?video=${id}`,
    stream: `/category?cat=livestream&stream=${id}`,
  };
  return `${BASE_URL}${paths[type] || "/"}`;
}

const PLATFORMS = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    getUrl: (url, text) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-600 hover:bg-green-700",
    getUrl: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90",
    getUrl: null,
    action: "copy",
  },
  {
    name: "X / Twitter",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.74-8.852L1.254 2.25H8.08l4.261 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black hover:bg-gray-900 border border-gray-700",
    getUrl: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Messenger",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
      </svg>
    ),
    color: "bg-blue-500 hover:bg-blue-600",
    getUrl: (url, text) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: "bg-sky-500 hover:bg-sky-600",
    getUrl: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

// File-hosting platforms — clicking copies the share link so users can paste it there
const FILE_PLATFORMS = [
  {
    name: "MediaFire",
    bgColor: "#1299DA",
    icon: () => (
      <svg viewBox="0 0 64 64" className="w-5 h-5">
        {/* MediaFire "M" flame shape — blue */}
        <path fill="#fff" d="M10 54 C10 54 16 38 20 30 C22 26 24 24 26 24 C28 24 29 26 30 29 L32 36 L34 29 C35 26 36 24 38 24 C40 24 42 26 44 30 C48 38 54 54 54 54 L46 54 C46 54 42 42 40 36 C39 33 38 31 37 31 C36 31 35 33 34 36 L32 44 L30 36 C29 33 28 31 27 31 C26 31 25 33 24 36 C22 42 18 54 18 54 Z"/>
      </svg>
    ),
  },
  {
    name: "MEGA",
    bgColor: "#D9272E",
    icon: () => (
      <svg viewBox="0 0 64 64" className="w-5 h-5">
        {/* MEGA bold red M */}
        <path fill="#fff" d="M8 48 L8 16 L20 16 L32 30 L44 16 L56 16 L56 48 L46 48 L46 28 L34 42 L30 42 L18 28 L18 48 Z"/>
        <rect fill="#D9272E" x="34" y="34" width="22" height="14" rx="2"/>
        <path fill="#fff" d="M36 37 L36 47 L38 47 L38 40 L42 44 L46 40 L46 47 L48 47 L48 37 L46 37 L42 41 L38 37 Z"/>
      </svg>
    ),
  },
  {
    name: "ModsFire",
    bgColor: "#FF5722",
    icon: () => (
      <svg viewBox="0 0 64 64" className="w-5 h-5">
        {/* ModsFire — orange flame with M */}
        <path fill="#fff" d="M32 6 C24 14 18 20 18 30 C18 36 21 40 24 43 C23 40 24 37 26 35 C27 38 28 40 30 42 C29 39 30 36 32 34 C34 36 35 39 34 42 C36 40 37 38 38 35 C40 37 41 40 40 43 C43 40 46 36 46 30 C46 20 40 14 32 6 Z"/>
        <path fill="#FF5722" d="M26 44 C26 48 28 52 32 54 C36 52 38 48 38 44 C36 46 34 47 32 47 C30 47 28 46 26 44 Z"/>
      </svg>
    ),
  },
  {
    name: "ShareMod",
    bgColor: "#7C3AED",
    icon: () => (
      <svg viewBox="0 0 64 64" className="w-5 h-5">
        {/* ShareMod — controller + share arrow */}
        <circle fill="#fff" cx="16" cy="32" r="8"/>
        <circle fill="#fff" cx="48" cy="16" r="8"/>
        <circle fill="#fff" cx="48" cy="48" r="8"/>
        <line x1="22" y1="28" x2="42" y2="19" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
        <line x1="22" y1="36" x2="42" y2="45" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function ShareButton({ type, id, title, compact = false }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = buildShareUrl(type, id);
  const shareText = title ? `Check this out on GAMER Productions: ${title}` : "Check this out on GAMER Productions!";

  const trackShare = async () => {
    if (type !== "listing" || !id) return;
    const listing = await base44.entities.Listing.get(id);
    await base44.entities.Listing.update(id, { shares: (Number(listing?.shares) || 0) + 1 });
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (!ok) { toast.error("Couldn't copy the link"); return; }
    await trackShare();
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlatform = async (platform) => {
    if (platform.action === "copy") {
      handleCopy();
      return;
    }
    await trackShare();
    const url = platform.getUrl(shareUrl, shareText);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`theme-glow-action flex items-center gap-1.5 text-gray-300 hover:text-purple-200 transition-colors rounded-lg ${compact ? "p-1.5" : "px-3 py-1.5 hover:bg-purple-900/20 text-xs font-semibold"}`}
        title="Share"
      >
        <Share2 className="w-4 h-4 theme-glow-icon" />
        {!compact && <span>Share</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              className="absolute z-50 bottom-full mb-2 right-0 w-72 rounded-2xl p-3 shadow-2xl"
              style={{
                background: "rgba(10,10,30,0.97)",
                border: "1px solid rgba(139,92,246,0.4)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-xs font-bold">Share to</span>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Social platforms */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.name}
                      onClick={() => handlePlatform(p)}
                      title={p.name}
                      className={`flex flex-col items-center gap-1 py-2 rounded-xl text-white text-[9px] font-semibold ${p.color} transition-all`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate w-full text-center px-0.5">{p.name.split("/")[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* File hosting platforms */}
              <div className="mb-3">
                <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mb-1.5">Copy link for file hosts</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {FILE_PLATFORMS.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.name}
                        onClick={handleCopy}
                        title={`Copy link for ${p.name}`}
                        className="flex flex-col items-center gap-1 py-2 rounded-xl text-white text-[9px] font-bold transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                        style={{ background: p.bgColor }}
                      >
                        <Icon />
                        <span className="truncate w-full text-center px-0.5">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Copy link */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-xs text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                <span className="flex-1 text-left truncate font-mono text-gray-400 text-[10px]">{shareUrl.slice(0, 36)}…</span>
                <span className={`font-semibold ${copied ? "text-green-400" : "text-purple-400"}`}>
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}