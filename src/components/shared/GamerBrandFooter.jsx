import React from "react";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import MascotShowcase from "@/components/shared/MascotShowcase";
import BrandLogo from "@/components/shared/BrandLogo";

export default function GamerBrandFooter({ showMascots = true }) {
  const socials = [
    { label: "YouTube", href: "https://youtube.com", icon: Youtube, color: "text-red-300" },
    { label: "Facebook", href: "https://facebook.com", icon: Facebook, color: "text-blue-300" },
    { label: "Instagram", href: "https://instagram.com", icon: Instagram, color: "text-pink-300" },
    { label: "Discord", href: "https://discord.com", brand: "discord", color: "text-indigo-300" },
    { label: "TikTok", href: "https://tiktok.com", brand: "tiktok", color: "text-white" },
    { label: "Contact", href: "/contact", icon: MessageCircle, color: "text-cyan-300" },
  ];

  return (
    <footer className="relative px-4 pt-8 pb-10 bg-gray-950 border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {showMascots && <MascotShowcase compact />}
        <div className="rounded-3xl border border-purple-500/25 bg-gray-900/70 p-5 text-center shadow-[0_0_34px_rgba(124,58,237,0.16)]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-300 mb-2">GAMER.PRODUCTIONS</p>
          <h3 className="text-white text-2xl font-black">Level Up. Connect. Dominate.</h3>
          <p className="text-gray-500 text-sm mt-2">Gaming marketplace, communities, mods, content, and creator tools.</p>
          <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
            {socials.map(item => {
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="theme-glow-action inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-950/80 border border-purple-500/25 text-xs font-bold text-gray-300 hover:text-white transition-all">
                  {item.brand ? <BrandLogo brand={item.brand} label={item.label} className="w-4 h-4" /> : <Icon className={`w-4 h-4 theme-glow-icon ${item.color}`} />}
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}