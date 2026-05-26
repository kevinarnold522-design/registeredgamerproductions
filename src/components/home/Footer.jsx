import React from "react";
import { Link } from "react-router-dom";
import { GamerLogo } from "@/components/icons/GameIcons";
import { Twitter, Youtube, Twitch, Instagram, MessageCircle, ExternalLink } from "lucide-react";
import PlatformLinksBar from "@/components/home/PlatformLinksBar";
import LinkShortenerBar from "@/components/home/LinkShortenerBar";

const links = {
  Platform: [
    { label: "Games", href: "/category?cat=games" },
    { label: "Gaming Gear", href: "/category?cat=buy_sell" },
    { label: "Buy & Sell", href: "/category?cat=buy_sell" },
    { label: "Tournaments", href: "/category?cat=tournaments" },
    { label: "Content", href: "/category?cat=content" },
  ],
  Community: [
    { label: "Forums", href: "#" },
    { label: "Discord Server", href: "#", external: true },
    { label: "Leaderboards", href: "/analytics" },
    { label: "Events", href: "/category?cat=tournaments" },
    { label: "Esports", href: "/category?cat=tournaments" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about" },
    { label: "Music Library", href: "/music-library" },
    { label: "Analytics", href: "/analytics" },
    { label: "Contact", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Report Issue", href: "#" },
    { label: "Refund Policy", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const socials = [
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com", external: true },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com", external: true },
  { icon: Twitch, label: "Twitch", href: "https://twitch.tv", external: true },
  { icon: MessageCircle, label: "Discord", href: "https://discord.com", external: true },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com", external: true },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-900 pt-0 pb-8 px-0">
      <PlatformLinksBar />
      <LinkShortenerBar />
      <div className="pt-16 pb-0 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Top */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GamerLogo size={36} />
                <div>
                  <span className="font-black text-white text-sm block">GAMER</span>
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm">
                    Productions
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                GAMER Productions — Streaming, Mods, Social &amp; Gaming Marketplace. Your global platform built for gamers, by a gamer.
              </p>
              <div className="flex gap-3 flex-wrap">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-purple-400 hover:border-purple-700/50 transition-colors"
                    aria-label={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <h4 className="text-white font-bold text-sm mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {items.map((item) => {
                    const isExternal = item.external || item.href.startsWith("http");
                    const isInternal = item.href.startsWith("/");
                    return (
                      <li key={item.label}>
                        {isInternal ? (
                          <Link
                            to={item.href}
                            className="text-gray-500 hover:text-purple-400 text-sm transition-colors"
                          >
                            {item.label}
                          </Link>
                        ) : isExternal ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-purple-400 text-sm transition-colors inline-flex items-center gap-1"
                          >
                            {item.label}
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-gray-600 text-sm cursor-not-allowed">{item.label}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider + Bottom bar */}
          <div className="border-t border-gray-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              &copy; 2026 GAMER Productions &middot; Founded by Kevin Roberto &middot; Built for Gamers
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-gray-700 text-xs">1 Community &middot; 1 Mindset &middot; 1 Goal</span>
              <span className="text-gray-700 text-xs">&middot;</span>
              <span className="text-gray-700 text-xs">Humbly Growing Thanks to You, Gamer!</span>
            </div>
          </div>

          {/* Badge strip */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              "✅ Free to Join",
              "🔒 Secure Payments",
              "🌍 Available Worldwide",
              "💰 Earn from Content",
              "🎮 100% Gaming Focused",
              "🚀 Est. 2026",
            ].map((b) => (
              <span key={b} className="text-xs text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}