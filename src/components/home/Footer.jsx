import React from "react";
import { GamerLogo } from "@/components/icons/GameIcons";
import { Twitter, Youtube, Twitch, Instagram, MessageCircle } from "lucide-react";
import PlatformLinksBar from "@/components/home/PlatformLinksBar";
import LinkShortenerBar from "@/components/home/LinkShortenerBar";

const links = {
  Platform: ["Games", "Gaming Gear", "Buy & Sell", "Tournaments", "Content"],
  Community: ["Forums", "Discord Server", "Leaderboards", "Events", "Esports"],
  Company: ["About Us", "Our Story", "Careers", "Press Kit", "Contact"],
  Support: ["Help Center", "Report Issue", "Refund Policy", "Privacy Policy", "Terms of Service"],
};

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Twitch, label: "Twitch", href: "#" },
  { icon: MessageCircle, label: "Discord", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-900 pt-0 pb-8 px-0">
      {/* Platform & Link Shortener bars */}
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
              GAMER Productions — Streaming, Mods, Social & Gaming Marketplace. Your global platform built for gamers, by a gamer.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
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
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-purple-400 text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 GAMER Productions · Founded by Kevin Roberto · Built for Gamers
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-xs">1 Community · 1 Mindset · 1 Goal</span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-gray-700 text-xs">Humbly Growing Thanks to You, Gamer!</span>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}