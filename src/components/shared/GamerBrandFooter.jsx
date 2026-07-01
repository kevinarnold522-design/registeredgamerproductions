import React from "react";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { MASCOTS } from "@/components/shared/MascotShowcase";
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
      className={`relative px-4 ${isTop ? "pt-2 pb-2" : "pt-8 pb-10 bg-gray-950 border-t border-purple-900/30"} ${className}`}
    >
      <div className={`max-w-7xl mx-auto ${isTop ? "space-y-2" : "space-y-6"}`}>
        <div className={`rounded-3xl border border-purple-500/25 bg-gray-900/70 shadow-[0_0_34px_rgba(124,58,237,0.16)] ${isTop ? "p-2.5" : "p-5 text-center"}`}>
          {isTop ? (
            <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
              <div className="order-2 min-w-0 overflow-hidden lg:order-1">
                <div className="flex items-center gap-2 overflow-x-auto rounded-2xl px-1 py-1">
                  {showMascots && MASCOTS.map((mascot) => (
                    <div key={mascot.id} className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-gray-950/55 lg:h-14 lg:w-14">
                      <div className="absolute inset-2 rounded-full blur-xl opacity-75" style={{ background: mascot.glow }} />
                      <img
                        src={mascot.image}
                        alt={mascot.name}
                        className="relative z-10 h-8 w-8 object-contain lg:h-10 lg:w-10"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 rounded-2xl border border-fuchsia-400/25 bg-[linear-gradient(135deg,rgba(17,24,39,0.92),rgba(88,28,135,0.22),rgba(217,70,239,0.16))] px-4 py-2 text-center shadow-[0_0_20px_rgba(217,70,239,0.12)] lg:order-2">
                <p className="text-[9px] font-black uppercase tracking-[0.32em] text-fuchsia-300">Connect With Us</p>
                <p className="mt-1 bg-gradient-to-r from-purple-200 via-fuchsia-100 to-pink-200 bg-clip-text text-sm font-black text-transparent">Official social hub & contact center</p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-gray-400 uppercase">GAMER.PRODUCTIONS</p>
              </div>
              <div className="order-3 flex items-center justify-center flex-wrap gap-1.5 lg:justify-end lg:pl-2">
                {socials.map(item => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="theme-glow-action inline-flex items-center justify-center rounded-xl bg-gray-950/70 border border-purple-500/25 px-2 py-1.5 text-gray-300 hover:text-white transition-all">
                      {item.brand ? <BrandLogo brand={item.brand} label={item.label} className="w-3.5 h-3.5" /> : <Icon className={`w-3.5 h-3.5 theme-glow-icon ${item.color}`} />}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <p className="font-black uppercase tracking-[0.35em] text-purple-300 mb-2 text-[10px]">GAMER.PRODUCTIONS</p>
              <h3 className="text-white font-black text-2xl">Level Up. Connect. Dominate.</h3>
              <p className="text-gray-500 text-sm mt-2">Gaming marketplace, communities, mods, content, and creator tools.</p>
              <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
                {socials.map(item => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="theme-glow-action inline-flex items-center rounded-xl bg-gray-950/80 border border-purple-500/25 gap-2 px-3 py-2 text-xs font-bold text-gray-300 hover:text-white transition-all">
                      {item.brand ? <BrandLogo brand={item.brand} label={item.label} className="w-4 h-4" /> : <Icon className={`w-4 h-4 theme-glow-icon ${item.color}`} />}
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
