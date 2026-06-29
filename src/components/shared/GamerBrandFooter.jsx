import React from "react";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import MascotShowcase from "@/components/shared/MascotShowcase";
import BrandLogo from "@/components/shared/BrandLogo";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export default function GamerBrandFooter({ showMascots = true, position = "bottom", className = "" }) {
  const isTop = position === "top";
  const socials = [
    { label: "YouTube", href: OFFICIAL_LINKS.youtube, icon: Youtube, color: "text-red-300" },
    { label: "Facebook", href: OFFICIAL_LINKS.facebook, icon: Facebook, color: "text-blue-300" },
    { label: "Instagram", href: OFFICIAL_LINKS.instagram, icon: Instagram, color: "text-pink-300" },
    { label: "Discord", href: OFFICIAL_LINKS.discord, brand: "discord", color: "text-indigo-300" },
    { label: "TikTok", href: OFFICIAL_LINKS.tiktok, brand: "tiktok", color: "text-white" },
    { label: "Contact", href: "/contact", icon: MessageCircle, color: "text-cyan-300" },
  ];

  return (
    <section
      className={`relative px-4 ${isTop ? "pt-4 pb-4" : "pt-8 pb-10 bg-gray-950 border-t border-purple-900/30"} ${className}`}
    >
      <div className={`max-w-7xl mx-auto ${isTop ? "space-y-4" : "space-y-6"}`}>
        {showMascots && <MascotShowcase compact />}
        <div className={`rounded-3xl border border-purple-500/25 bg-gray-900/70 text-center shadow-[0_0_34px_rgba(124,58,237,0.16)] ${isTop ? "p-3" : "p-5"}`}>
          <p className={`font-black uppercase tracking-[0.35em] text-purple-300 mb-2 ${isTop ? "text-[8px]" : "text-[10px]"}`}>GAMER.PRODUCTIONS</p>
          <h3 className={`text-white font-black ${isTop ? "text-lg" : "text-2xl"}`}>Level Up. Connect. Dominate.</h3>
          <p className={`text-gray-500 mt-1.5 ${isTop ? "text-xs" : "text-sm mt-2"}`}>Gaming marketplace, communities, mods, content, and creator tools.</p>
          <div className={`flex items-center justify-center flex-wrap ${isTop ? "gap-1.5 mt-3" : "gap-2 mt-5"}`}>
            {socials.map(item => {
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`theme-glow-action inline-flex items-center rounded-xl bg-gray-950/80 border border-purple-500/25 font-bold text-gray-300 hover:text-white transition-all ${isTop ? "gap-1.5 px-2 py-1.5 text-[11px]" : "gap-2 px-3 py-2 text-xs"}`}>
                  {item.brand ? <BrandLogo brand={item.brand} label={item.label} className={isTop ? "w-3.5 h-3.5" : "w-4 h-4"} /> : <Icon className={`${isTop ? "w-3.5 h-3.5" : "w-4 h-4"} theme-glow-icon ${item.color}`} />}
                  {!isTop && item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
