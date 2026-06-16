import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, Check, Facebook, Instagram, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BASE_URL = "https://gamerproductions.vercel.app";

// Build the share URL for any content type
export function buildShareUrl(type, id) {
  const paths = {
    listing: `/category?listing=${id}`,
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
    // Instagram doesn't support direct URL sharing via web — copy to clipboard instead
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
    navigator.clipboard.writeText(shareUrl);
    await trackShare();
    setCopied(true);
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
        className={`flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition-colors ${compact ? "p-1.5" : "px-3 py-1.5 rounded-lg hover:bg-purple-900/20 text-xs font-semibold"}`}
        title="Share"
      >
        <Share2 className="w-4 h-4" />
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
              className="absolute z-50 bottom-full mb-2 right-0 w-64 rounded-2xl p-3 shadow-2xl"
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