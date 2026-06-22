import React from "react";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

// Compact horizontal row of official Gamer.Productions social links.
// Used at the top and bottom of the homepage.
const SOCIALS = [
{ label: "YouTube", href: OFFICIAL_LINKS.youtube, icon: Youtube, color: "text-red-300" },
{ label: "Facebook", href: OFFICIAL_LINKS.facebook, icon: Facebook, color: "text-blue-300" },
{ label: "Instagram", href: OFFICIAL_LINKS.instagram, icon: Instagram, color: "text-pink-300" },
{ label: "Discord", href: OFFICIAL_LINKS.discord, brand: "discord", color: "text-indigo-300" },
{ label: "TikTok", href: OFFICIAL_LINKS.tiktok, brand: "tiktok", color: "text-white" },
{ label: "Contact", href: "/contact", icon: MessageCircle, color: "text-cyan-300" }];


export default function GamerSocialsBar({ className = "" }) {
  return (
    <div className={`flex items-center justify-start sm:justify-center gap-2 flex-nowrap overflow-x-auto opacity-100 px-3 sm:px-6 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300/80 mr-1 flex-shrink-0">Follow Us</span>
      {SOCIALS.map((item) => {
        const Icon = item.icon;
        const external = item.href.startsWith("http");
        return (
          <a
            key={item.label}
            href={item.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="theme-glow-action inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950/70 border border-purple-500/25 text-xs font-bold text-gray-300 hover:text-white transition-all whitespace-nowrap">
            
            {item.brand ?
            <BrandLogo brand={item.brand} label={item.label} className="w-3.5 h-3.5" /> :
            <Icon className={`w-3.5 h-3.5 theme-glow-icon ${item.color}`} />}
            {item.label}
          </a>);

      })}
    </div>);

}