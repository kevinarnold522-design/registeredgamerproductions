import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Pencil, Check, Upload, X, Plus, Trash2, Send, Search, Eye, Filter, CheckSquare, Square, Gamepad2, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import { formatListingPrice } from "@/lib/currency";

// Per-category subcategory card configs
const SUBCATEGORY_CONFIG = {
  gaming: [
    { id: "NBA2K",        emoji: "🏀", title: "NBA 2K",        desc: "Rosters, cyberfaces & courts",    color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)",  badge: "🏀 Top" },
    { id: "FIFA",         emoji: "⚽", title: "EA FC / FIFA",   desc: "Squad updates, kits & stadiums",  color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",   glow: "rgba(59,130,246,0.6)", badge: "Soccer" },
    { id: "WWE2K",        emoji: "🤼", title: "WWE 2K",         desc: "Rosters, arenas & attires",       color: "from-red-950 to-red-900",      border: "border-red-500/50",    glow: "rgba(239,68,68,0.6)",  badge: "Hot" },
    { id: "COD",          emoji: "🎖️", title: "Call of Duty",   desc: "Warzone, MW & more",              color: "from-gray-900 to-gray-800",    border: "border-gray-500/50",   glow: "rgba(156,163,175,0.6)", badge: "FPS" },
    { id: "Fortnite",     emoji: "🏗️", title: "Fortnite",       desc: "Skins, Battle Royale tips",       color: "from-cyan-950 to-cyan-900",    border: "border-cyan-500/50",   glow: "rgba(6,182,212,0.6)",  badge: "BR" },
    { id: "GTA",          emoji: "🚗", title: "GTA",            desc: "GTA V, GTA SA & mods",            color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Open World" },
    { id: "Minecraft",    emoji: "⛏️", title: "Minecraft",      desc: "Builds, seeds & servers",         color: "from-green-950 to-green-900",  border: "border-green-500/50",  glow: "rgba(74,222,128,0.6)", badge: "Sandbox" },
    { id: "Valorant",     emoji: "🔫", title: "Valorant",       desc: "Agents, ranks & pro tips",        color: "from-red-950 to-red-900",      border: "border-red-500/50",    glow: "rgba(239,68,68,0.6)",  badge: "FPS" },
    { id: "PES",          emoji: "🏟️", title: "PES / Football Life", desc: "Option files & patches",     color: "from-indigo-950 to-indigo-900",border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)", badge: "Soccer" },
    { id: "Madden",       emoji: "🏈", title: "Madden NFL",     desc: "Franchises & Ultimate Team",      color: "from-teal-950 to-teal-900",    border: "border-teal-500/50",   glow: "rgba(20,184,166,0.6)", badge: "NFL" },
    { id: "Tekken",       emoji: "🥋", title: "Tekken",         desc: "Characters, combos & tournaments",color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",   glow: "rgba(59,130,246,0.6)", badge: "Fighting" },
    { id: "Roblox",       emoji: "🧱", title: "Roblox",         desc: "Games, Robux & dev tools",        color: "from-pink-950 to-pink-900",    border: "border-pink-500/50",   glow: "rgba(236,72,153,0.6)", badge: "Sandbox" },
  ],
  modding: [
    { id: "WWE2K",         emoji: "🤼", title: "WWE2K",         desc: "Mods, rosters, attires & arenas",   color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Hot" },
    { id: "Football Life", emoji: "⚽", title: "Football Life", desc: "Patches, kits & stadium mods",      color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Popular" },
    { id: "GTA 4",         emoji: "🚗", title: "GTA 4",         desc: "Car packs, maps & scripts",         color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Classic" },
    { id: "GTA 5",         emoji: "🏙️", title: "GTA 5",         desc: "Scripts, textures & full packs",   color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",   badge: "🔥 Top" },
    { id: "GTA SA",        emoji: "🌴", title: "GTA SA",        desc: "Texture packs, mods & cheats",      color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)",  badge: "Legend" },
    { id: "Android",       emoji: "📱", title: "Android",       desc: "APK mods, patched games & tools",   color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Mobile" },
    { id: "PES",           emoji: "🏟️", title: "PES",           desc: "Option files, kits & gameplay",    color: "from-cyan-950 to-cyan-900",   border: "border-cyan-500/50",    glow: "rgba(6,182,212,0.6)",    badge: "Soccer" },
    { id: "FIFA",          emoji: "🥅", title: "FIFA",          desc: "Squad updates, kits & stadiums",    color: "from-indigo-950 to-indigo-900", border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)",  badge: "Soccer" },
    { id: "NBA2K",         emoji: "🏀", title: "NBA2K",         desc: "Cyberfaces, courts & rosters",      color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)",  badge: "🔥 Top" },
    { id: "PPSSPP/PSP",    emoji: "🎮", title: "PPSSPP / PSP",  desc: "ISO files, cheats & texture packs", color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Retro" },
    { id: "PS2",           emoji: "🕹️", title: "PS2",           desc: "ISO mods & classic game patches",  color: "from-slate-900 to-slate-800", border: "border-slate-500/50",   glow: "rgba(100,116,139,0.6)",  badge: "Classic" },
    { id: "PC",            emoji: "🖥️", title: "PC",            desc: "PC mods, trainers & patches",       color: "from-gray-900 to-gray-800",   border: "border-gray-500/50",    glow: "rgba(156,163,175,0.6)",  badge: "All Games" },
  ],
  games: [
    { id: "PC",              emoji: "🖥️", title: "PC Games",        desc: "Steam, Epic, GOG & more",         color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",  badge: "Steam" },
    { id: "PlayStation",     emoji: "🎮", title: "PlayStation",      desc: "PS4, PS5 — digital & disc",       color: "from-indigo-950 to-indigo-900",border: "border-indigo-500/50",  glow: "rgba(99,102,241,0.6)", badge: "PS4/PS5" },
    { id: "Xbox",            emoji: "🟩", title: "Xbox",             desc: "Xbox One & Series X/S deals",     color: "from-green-950 to-green-900",  border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)", badge: "Series X" },
    { id: "Nintendo Switch", emoji: "🔴", title: "Nintendo Switch",  desc: "Physical & digital Switch titles", color: "from-red-950 to-red-900",      border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",  badge: "Nintendo" },
    { id: "Mobile",          emoji: "📱", title: "Mobile Games",     desc: "Android & iOS top titles",         color: "from-teal-950 to-teal-900",    border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)", badge: "Mobile" },
  ],
  premium_mods: [
    { id: "NBA 2K", emoji: "🏀", title: "NBA 2K", desc: "Browse paid mods", color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Premium" },
    { id: "Football Life", emoji: "⚽", title: "Football Life", desc: "Browse paid mods", color: "from-green-950 to-green-900", border: "border-green-500/50", glow: "rgba(74,222,128,0.6)", badge: "Premium" },
    { id: "GTA", emoji: "🚗", title: "GTA", desc: "Browse paid mods", color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)", badge: "Premium" },
    { id: "Assetto Corsa", emoji: "🏎️", title: "Assetto Corsa", desc: "Browse paid mods", color: "from-red-950 to-red-900", border: "border-red-500/50", glow: "rgba(239,68,68,0.6)", badge: "Premium" },
    { id: "Minecraft", emoji: "⛏️", title: "Minecraft", desc: "Browse paid mods", color: "from-emerald-950 to-emerald-900", border: "border-emerald-500/50", glow: "rgba(16,185,129,0.6)", badge: "Premium" },
    { id: "WWE 2K", emoji: "🤼", title: "WWE 2K", desc: "Browse paid mods", color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Premium" },
  ],
  buy_sell: [
    { id: "Game Accounts",          emoji: "🔑", title: "Game Accounts",          desc: "Ranked & smurf accounts",          color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Hot" },
    { id: "In-Game Items",          emoji: "💎", title: "In-Game Items",           desc: "Rare items, boosters & keys",       color: "from-cyan-950 to-cyan-900",    border: "border-cyan-500/50",   glow: "rgba(6,182,212,0.6)",  badge: "Trade" },
    { id: "Skins",                  emoji: "🎨", title: "Skins",                   desc: "Character, weapon & vehicle skins", color: "from-pink-950 to-pink-900",    border: "border-pink-500/50",   glow: "rgba(236,72,153,0.6)", badge: "Rare" },
    { id: "Gift Cards",             emoji: "🎁", title: "Gift Cards",              desc: "Steam, PSN, Xbox & more",           color: "from-green-950 to-green-900",  border: "border-green-500/50",  glow: "rgba(74,222,128,0.6)", badge: "Digital" },
    { id: "Premium Mods - WWE2K",   emoji: "🤼", title: "Premium WWE2K Mods",      desc: "Full DLC & roster mods",            color: "from-red-950 to-red-900",      border: "border-red-500/50",    glow: "rgba(239,68,68,0.6)",  badge: "Premium" },
    { id: "Premium Mods - GTA 5",   emoji: "🏙️", title: "Premium GTA 5 Mods",     desc: "Script & visual mega-packs",        color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Premium" },
    { id: "Premium Mods - GTA SA",  emoji: "🌴", title: "Premium GTA SA Mods",     desc: "San Andreas visual overhauls",      color: "from-orange-950 to-orange-900",border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Premium" },
    { id: "Premium Mods - FIFA",    emoji: "🥅", title: "Premium FIFA Mods",       desc: "Updated kits, squads & faces",      color: "from-indigo-950 to-indigo-900",border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)", badge: "Premium" },
    { id: "Premium Mods - PES",     emoji: "🏟️", title: "Premium PES Mods",        desc: "Option files & stadium packs",      color: "from-teal-950 to-teal-900",    border: "border-teal-500/50",   glow: "rgba(20,184,166,0.6)", badge: "Premium" },
    { id: "Premium Mods - NBA2K",   emoji: "🏀", title: "Premium NBA2K Mods",      desc: "Cyberfaces, courts & jerseys",      color: "from-purple-950 to-purple-900",border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Premium" },
    { id: "Premium Mods - Football Life", emoji: "⚽", title: "Premium Football Life Mods", desc: "Kits, balls & stadium packs", color: "from-green-950 to-green-900", border: "border-green-500/50",  glow: "rgba(74,222,128,0.6)", badge: "Premium" },
    { id: "Premium Mods - PPSSPP/PSP", emoji: "🎮", title: "Premium PPSSPP/PSP Mods", desc: "ISO packs & texture bundles",    color: "from-pink-950 to-pink-900",    border: "border-pink-500/50",   glow: "rgba(236,72,153,0.6)", badge: "Premium" },
  ],
  tournaments: [
    { id: "FPS",           emoji: "🎯", title: "FPS",            desc: "CS2, Valorant, COD & more",      color: "from-red-950 to-red-900",      border: "border-red-500/50",    glow: "rgba(239,68,68,0.6)",  badge: "Shooter" },
    { id: "Battle Royale", emoji: "🪂", title: "Battle Royale",  desc: "PUBG, Fortnite, Free Fire",      color: "from-orange-950 to-orange-900",border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Top" },
    { id: "MOBA",          emoji: "🧙", title: "MOBA",           desc: "MLBB, DOTA2, LoL events",        color: "from-purple-950 to-purple-900",border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Esports" },
    { id: "Sports",        emoji: "🏆", title: "Sports",         desc: "FIFA, NBA2K, PES cups",          color: "from-green-950 to-green-900",  border: "border-green-500/50",  glow: "rgba(74,222,128,0.6)", badge: "Online" },
    { id: "Fighting",      emoji: "🥊", title: "Fighting",       desc: "Tekken, MK, Street Fighter",     color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "1v1" },
    { id: "Mobile Gaming", emoji: "📱", title: "Mobile Gaming",  desc: "Mobile Legends, CODM & more",    color: "from-teal-950 to-teal-900",    border: "border-teal-500/50",   glow: "rgba(20,184,166,0.6)", badge: "Mobile" },
  ],
  content: [
    { id: "Gaming Videos", emoji: "🎮", title: "Gaming Videos", desc: "Gameplay & full playthroughs",  color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",   glow: "rgba(59,130,246,0.6)", badge: "Watch" },
    { id: "Streaming",     emoji: "📡", title: "Streaming",     desc: "Live stream replays & VODs",    color: "from-red-950 to-red-900",      border: "border-red-500/50",    glow: "rgba(239,68,68,0.6)",  badge: "Live" },
    { id: "Tutorials",     emoji: "📚", title: "Tutorials",     desc: "Guides, tips & how-to videos",  color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Learn" },
    { id: "Reviews",       emoji: "⭐", title: "Reviews",       desc: "Honest game & gear reviews",    color: "from-purple-950 to-purple-900",border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Rate" },
    { id: "Highlights",    emoji: "✂️", title: "Highlights",    desc: "Best clips & epic moments",     color: "from-orange-950 to-orange-900",border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Clips" },
    { id: "Clips",         emoji: "🎬", title: "Clips",         desc: "Short-form gaming clips",       color: "from-pink-950 to-pink-900",    border: "border-pink-500/50",   glow: "rgba(236,72,153,0.6)", badge: "Short" },
  ],
  jobs: [
    { id: "QA Testing",        emoji: "🔍", title: "QA Testing",        desc: "Game testing & bug hunting",      color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",   glow: "rgba(59,130,246,0.6)", badge: "Remote" },
    { id: "Game Dev",          emoji: "💻", title: "Game Dev",          desc: "Unity, Unreal, indie dev roles",  color: "from-purple-950 to-purple-900",border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Dev" },
    { id: "Community Manager", emoji: "🤝", title: "Community Manager", desc: "Discord, social & fan management", color: "from-green-950 to-green-900",  border: "border-green-500/50",  glow: "rgba(74,222,128,0.6)", badge: "Social" },
    { id: "Esports Coach",     emoji: "🏆", title: "Esports Coach",     desc: "Train & grow competitive teams",  color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Coach" },
    { id: "Content Creator",   emoji: "🎥", title: "Content Creator",   desc: "Brand deals, sponsored content",  color: "from-pink-950 to-pink-900",    border: "border-pink-500/50",   glow: "rgba(236,72,153,0.6)", badge: "Creator" },
  ],
  livestream: [
    { id: "Gameplay Streams", emoji: "🎮", title: "Gameplay Streams", desc: "Live gaming sessions",            color: "from-red-950 to-red-900",      border: "border-red-500/50",    glow: "rgba(239,68,68,0.6)",  badge: "LIVE" },
    { id: "Tournaments",      emoji: "🏆", title: "Tournaments",      desc: "Competitive live events",         color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Event" },
    { id: "Esports Events",   emoji: "🎯", title: "Esports Events",   desc: "Pro-level esports broadcasts",    color: "from-purple-950 to-purple-900",border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Pro" },
    { id: "Mod Reviews",      emoji: "🔧", title: "Mod Reviews",      desc: "Live mod showcase & testing",     color: "from-orange-950 to-orange-900",border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Mods" },
    { id: "Q&A Sessions",     emoji: "❓", title: "Q&A Sessions",     desc: "Creator & community Q&As",        color: "from-teal-950 to-teal-900",    border: "border-teal-500/50",   glow: "rgba(20,184,166,0.6)", badge: "Talk" },
    { id: "Unboxing",         emoji: "📦", title: "Unboxing",         desc: "Gear & game unboxing streams",    color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",   glow: "rgba(59,130,246,0.6)", badge: "New" },
  ],
  services: [
    { id: "PC Repair",       emoji: "🔧", title: "PC Repair",       desc: "Hardware fixes & upgrades",        color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",   glow: "rgba(59,130,246,0.6)", badge: "Tech" },
    { id: "Custom Builds",   emoji: "🖥️", title: "Custom Builds",   desc: "PC builds tailored for gaming",    color: "from-purple-950 to-purple-900",border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Build" },
    { id: "Coaching",        emoji: "🏆", title: "Coaching",        desc: "Rank up with pro coaching",        color: "from-yellow-950 to-yellow-900",border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Pro" },
    { id: "Boosting",        emoji: "⚡", title: "Boosting",        desc: "Rank boosting & leveling",         color: "from-orange-950 to-orange-900",border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Fast" },
    { id: "Design Services", emoji: "🎨", title: "Design Services", desc: "Logos, banners & overlays",        color: "from-pink-950 to-pink-900",    border: "border-pink-500/50",   glow: "rgba(236,72,153,0.6)", badge: "Creative" },
  ],
};

const CARD_SIZES = ["sm", "md", "lg"];
const CARD_HEIGHT = { sm: "h-36", md: "h-48", lg: "h-64" };

// Upload-only edit overlay (no URL fields)
function SubcardEditOverlay({ item, cat, onClose, onSaved }) {
  const [name, setName] = useState(item.title || "");
  const [logoUrl, setLogoUrl] = useState(item.customLogo || "");
  const [coverUrl, setCoverUrl] = useState(item.customCover || "");
  const [cardSize, setCardSize] = useState(item.cardSize || "md");
  const [uploading, setUploading] = useState(null);
  const logoRef = useRef(null);
  const coverRef = useRef(null);

  const uploadToR2 = (file, folder) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await base44.functions.invoke("uploadToR2", {
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          dataUrl: reader.result,
          folder,
        });
        resolve(res.data.file_url);
      } catch (error) { reject(error); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleUpload = async (file, type) => {
    if (!file) return;
    setUploading(type);
    const file_url = await uploadToR2(file, type === "logo" ? "subcategory-logos" : "subcategory-covers");
    if (type === "logo") setLogoUrl(file_url);
    else setCoverUrl(file_url);
    setUploading(null);
  };

  const handleSave = () => {
    const key = `subcat_${cat}_${item.id}`;
    const data = { logo: logoUrl, cover: coverUrl, name, cardSize };
    localStorage.setItem(key, JSON.stringify(data));
    onSaved({ ...item, title: name, customLogo: logoUrl, customCover: coverUrl, cardSize });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 bg-black/97 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto" onClick={e => e.preventDefault()}>
      <div className="flex items-center justify-between">
        <p className="text-white text-xs font-black">Edit Card</p>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Name / Title</p>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-purple-500" />
      </div>
      {/* Card size */}
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Card Size</p>
        <div className="flex gap-1">
          {CARD_SIZES.map(s => (
            <button key={s} onClick={() => setCardSize(s)}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${cardSize === s ? "bg-purple-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {/* Logo upload — device + URL */}
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Profile Picture / Logo</p>
        <div className="flex gap-1 mb-1">
          <button onClick={() => logoRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-purple-900/40 border border-purple-700/50 text-purple-300 text-[10px] font-bold hover:bg-purple-900/70 transition-all">
            <Upload className="w-3 h-3" />{uploading === "logo" ? "…" : "Device"}
          </button>
          <input ref={logoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleUpload(e.target.files[0], "logo")} />
        </div>
        <div className="flex gap-1">
          <input
            placeholder="Or paste image URL"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-[9px] placeholder-gray-600 focus:outline-none"
            onBlur={e => { if (e.target.value.trim()) { setLogoUrl(e.target.value.trim()); e.target.value = ""; } }}
            onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { setLogoUrl(e.target.value.trim()); e.target.value = ""; } }}
          />
          <span className="text-[8px] text-blue-400 flex items-center px-1">URL</span>
        </div>
        {logoUrl && <img src={logoUrl} className="mt-1 w-10 h-10 rounded-lg object-cover border border-gray-700" alt="" />}
      </div>
      {/* Cover upload — device + URL */}
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Cover / Background</p>
        <div className="flex gap-1 mb-1">
          <button onClick={() => coverRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-300 text-[10px] font-bold hover:bg-blue-900/70 transition-all">
            <Upload className="w-3 h-3" />{uploading === "cover" ? "…" : "Device"}
          </button>
          <input ref={coverRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleUpload(e.target.files[0], "cover")} />
        </div>
        <div className="flex gap-1">
          <input
            placeholder="Or paste cover URL"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-[9px] placeholder-gray-600 focus:outline-none"
            onBlur={e => { if (e.target.value.trim()) { setCoverUrl(e.target.value.trim()); e.target.value = ""; } }}
            onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { setCoverUrl(e.target.value.trim()); e.target.value = ""; } }}
          />
          <span className="text-[8px] text-blue-400 flex items-center px-1">URL</span>
        </div>
        {coverUrl && <img src={coverUrl} className="mt-1 w-full h-10 rounded-lg object-cover opacity-70 border border-gray-700" alt="" />}
      </div>
      <button onClick={handleSave} className="w-full py-1.5 rounded-lg bg-green-700 text-white text-[10px] font-black flex items-center justify-center gap-1">
        <Check className="w-3 h-3" /> Save
      </button>
    </div>
  );
}

// Newsfeed for a subcategory (posts with franchise_id + subcategory tag)
function SubcardNewsfeed({ cat, subcatId, subcatTitle, user, userProfile, franchiseId }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load posts for this subcategory — filter by franchise_id if available, else by cat
    const loadPosts = async () => {
      try {
        const allPosts = await base44.entities.CommunityPost.filter({ franchise_id: cat + "_" + subcatId });
        const active = allPosts.filter(p => p.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setPosts(active.slice(0, 30));
      } catch (e) { setPosts([]); }
      setLoading(false);
    };
    loadPosts();
  }, [cat, subcatId]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    const post = await base44.entities.CommunityPost.create({
      community_id: cat,
      franchise_id: cat + "_" + subcatId,
      author_email: user.email,
      author_username: userProfile?.username || user.full_name || "Gamer",
      author_avatar: userProfile?.avatar_url || "",
      content: newPost,
      likes: 0,
      status: "active",
      section_id: subcatId,
    });
    setPosts(prev => [post, ...prev]);
    setNewPost("");
    setPosting(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-800 flex-shrink-0">
        <p className="text-white text-xs font-black">{subcatTitle} Feed</p>
        <p className="text-gray-600 text-[10px]">Posts here also appear in parent newsfeed</p>
      </div>
      {user && (
        <div className="px-3 py-2 border-b border-gray-800 flex gap-2 flex-shrink-0">
          <input value={newPost} onChange={e => setNewPost(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePost()}
            placeholder={`Post in ${subcatTitle}...`}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          <button onClick={handlePost} disabled={!newPost.trim() || posting}
            className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center disabled:opacity-50 flex-shrink-0">
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-600 text-xs">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-xs">No posts yet. Be first!</div>
        ) : posts.map(post => (
          <div key={post.id} className="px-3 py-2.5 border-b border-gray-800/60">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                {post.author_avatar
                  ? <img src={post.author_avatar} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">{(post.author_username || "G")[0]}</div>}
              </div>
              <p className="text-gray-400 text-[10px] font-bold">{post.author_username}</p>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubcardItem({ item, cat, index, canAdmin, canDelete, isAccountMod, onItemUpdate, onDelete, onRequestDelete, user, userProfile, activeSubcat, onSetActiveSubcat }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const saved = (() => { try { return JSON.parse(localStorage.getItem(`subcat_${cat}_${item.id}`) || "{}"); } catch { return {}; } })();
  const displayItem = { ...item, customLogo: saved.logo || item.customLogo, customCover: saved.cover || item.customCover, cardSize: saved.cardSize || item.cardSize || "md" };
  const isActive = activeSubcat === item.id;
  // Route directly to landing page on card click
  const href = cat === "tournaments" ? `/tournaments` : `/sub-landing?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(item.id)}`;
  const cardH = CARD_HEIGHT[displayItem.cardSize] || CARD_HEIGHT.md;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 120 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block rounded-2xl cursor-pointer group"
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
        style={{ opacity: hovered || isActive ? 1 : 0, boxShadow: `0 0 24px 6px ${displayItem.glow}` }} />

      {/* Admin controls */}
      {canAdmin && !editing && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.preventDefault(); setEditing(true); }}
            className="w-6 h-6 rounded-lg bg-black/70 hover:bg-purple-700 flex items-center justify-center" title="Edit card">
            <Pencil className="w-3 h-3 text-white" />
          </button>
          {canDelete && (
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); }}
              className="w-6 h-6 rounded-lg bg-black/70 hover:bg-red-700 flex items-center justify-center">
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      )}

      {editing && (
        <SubcardEditOverlay item={displayItem} cat={cat} onClose={() => setEditing(false)}
          onSaved={(updated) => { onItemUpdate?.(updated); setEditing(false); }} />
      )}

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            label={`${item.title} card`}
            isAdmin={isAdmin(item._userEmail)}
            isAccountMod={isAccountMod}
            onDelete={() => { onDelete?.(); setShowDeleteModal(false); }}
            onRequestDelete={() => { onRequestDelete?.(); setShowDeleteModal(false); }}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>

      <a href={href} onClick={editing ? e => e.preventDefault() : undefined}
        className={`block relative ${cardH} rounded-2xl border-2 ${displayItem.border} ${isActive ? "ring-2 ring-purple-500/60" : ""} bg-gradient-to-br ${displayItem.color} p-3 flex flex-col justify-between transition-all duration-300 overflow-hidden`}>
        {displayItem.customCover && (
          <div className="absolute inset-0 opacity-25 rounded-2xl" style={{ backgroundImage: `url(${displayItem.customCover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="relative flex items-start justify-between">
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-white/70 text-[8px] font-bold uppercase tracking-wide">{displayItem.badge}</span>
        </div>
        <motion.div className="relative text-3xl"
          animate={hovered ? { scale: 1.15, rotate: [0, -6, 6, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}>
          <Gamepad2 className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]" />
        </motion.div>
        <div className="relative">
          <p className="text-white font-black text-xs leading-tight">{displayItem.title}</p>
          <p className="text-white/40 text-[9px] mt-0.5 leading-tight line-clamp-1">{displayItem.desc}</p>
        </div>
        <div className="relative flex items-center justify-between mt-1">
          <span className="text-white/30 text-[9px] font-bold">Browse</span>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); const url = encodeURIComponent(href); window.open(`https://wa.me/?text=${encodeURIComponent(`${displayItem.title} on GAMER.PRODUCTIONS`)}%20${url}`, "_blank"); }}
            className="w-4 h-4 rounded bg-green-700/70 flex items-center justify-center text-white" title="Share"><Send className="w-2.5 h-2.5" /></button>
        </div>
        <motion.div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${displayItem.glow}, transparent)` }}
          animate={{ opacity: hovered ? 1 : 0 }} />
      </a>
    </motion.div>
  );
}

function AddSubcategoryModal({ cat, onClose, onAdded }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [desc, setDesc] = useState("");
  const handleAdd = () => {
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const colors = ["from-purple-950 to-purple-900", "from-blue-950 to-blue-900", "from-green-950 to-green-900", "from-red-950 to-red-900", "from-yellow-950 to-yellow-900"];
    const glows = ["rgba(168,85,247,0.6)", "rgba(59,130,246,0.6)", "rgba(74,222,128,0.6)", "rgba(239,68,68,0.6)", "rgba(234,179,8,0.6)"];
    const borders = ["border-purple-500/50", "border-blue-500/50", "border-green-500/50", "border-red-500/50", "border-yellow-500/50"];
    const ri = Math.floor(Math.random() * colors.length);
    const newItem = { id, title: name, emoji, desc, color: colors[ri], glow: glows[ri], border: borders[ri], badge: "New", customLogo: "", customCover: "", cardSize: "md" };
    const key = `extra_subcat_${cat}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([...existing, newItem]));
    onAdded(newItem);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.9)" }}>
      <div className="bg-gray-950 border border-purple-700/40 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black">Add Subcategory Card</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PS3 Mods"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <button onClick={handleAdd}
            className="w-full py-2.5 rounded-xl font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            <Plus className="w-4 h-4 inline mr-1" /> Add Card
          </button>
        </div>
      </div>
    </div>
  );
}

function VisibleListingRow({ item, userProfile }) {
  const rowRef = useRef(null);
  const countedRef = useRef(false);

  useEffect(() => {
    if (!rowRef.current || !item?.id) return;
    if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || countedRef.current) return;
      countedRef.current = true;
      const key = `subcat_view_seen_${item.id}`;
      try {
        if (typeof window.sessionStorage !== "undefined") {
          if (window.sessionStorage.getItem(key)) return;
          window.sessionStorage.setItem(key, "1");
        }
      } catch {}
      base44.entities.Listing.update(item.id, { views: (item.views || 0) + 1 }).catch(() => {});
    }, { threshold: 0.55 });
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [item?.id]);

  return (
    <Link ref={rowRef} key={item.id} to={`/listing?id=${item.id}`}
      className="flex gap-3 px-3 py-3 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors group">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
        {item.images?.[0]
          ? <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
          : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-purple-300" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-purple-300 transition-colors">{item.title}</p>
        <p className="text-gray-500 text-[10px]">by @{item.seller_username} · Listing</p>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="font-black text-xs text-purple-300">{item.is_free || !item.price ? "FREE" : formatListingPrice(item.price, item.currency)}</p>
          <span className="flex items-center gap-1 text-[10px] text-cyan-300 font-bold"><Eye className="w-3 h-3" />{(item.views || 0).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

// Feed of listings + community posts for the entire category
function CategoryFeed({ cat, user, userProfile }) {
  const { user: authUser, isLoadingAuth } = useAuth();
  const [sessionUser, setSessionUser] = useState(null);
  const effectiveUser = user || authUser || sessionUser;
  const [listings, setListings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!user && !authUser) {
      base44.auth.me().then(me => setSessionUser(me)).catch(() => {});
    }
  }, [user, authUser]);

  useEffect(() => {
    const load = async () => {
      try {
        const [l, p] = await Promise.all([
          base44.entities.Listing.filter({ category: cat, status: "active" }, "-created_date", 20),
          base44.entities.CommunityPost.filter({ community_id: cat }, "-created_date", 20),
        ]);
        setListings(l);
        setPosts(p.filter(x => x.status === "active"));
      } catch {}
      setLoading(false);
    };
    load();
  }, [cat]);

  const handlePost = async () => {
    if (!newPost.trim() || !effectiveUser) return;
    setPosting(true);
    const p = await base44.entities.CommunityPost.create({
      community_id: cat,
      franchise_id: cat,
      author_email: effectiveUser.email,
      author_username: userProfile?.username || effectiveUser.full_name || "Gamer",
      author_avatar: userProfile?.avatar_url || "",
      content: newPost,
      likes: 0,
      status: "active",
    });
    setPosts(prev => [p, ...prev]);
    setNewPost("");
    setPosting(false);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  // Merge & sort listings + posts by date
  const merged = [
    ...listings.map(l => ({ type: "listing", item: l, date: l.created_date })),
    ...posts.map(p => ({ type: "post", item: p, date: p.created_date })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      {/* Post input */}
      {isLoadingAuth ? null : effectiveUser ? (
        <div className="px-3 py-2.5 border-b border-gray-800 flex gap-2 flex-shrink-0">
          <input value={newPost} onChange={e => setNewPost(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePost()}
            placeholder={`Post in ${cat}...`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          <button onClick={handlePost} disabled={!newPost.trim() || posting}
            className="w-8 h-8 rounded-xl bg-purple-700 flex items-center justify-center disabled:opacity-50">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      ) : (
        <div className="px-3 py-2 border-b border-gray-800 flex-shrink-0 text-center">
        <button onClick={() => base44.auth.redirectToLogin()} className="text-xs text-purple-400 font-bold hover:underline">Log in to post →</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {merged.length === 0 ? (
          <div className="p-8 text-center">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-gray-600 text-sm">No listings or posts yet</p>
          </div>
        ) : merged.map(({ type, item }) => (
          type === "listing" ? (
            <VisibleListingRow key={item.id} item={item} userProfile={userProfile} />
          ) : (
            <div key={item.id} className="px-3 py-3 border-b border-gray-800/60">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                  {item.author_avatar
                    ? <img src={item.author_avatar} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">{(item.author_username || "G")[0]}</div>}
                </div>
                <p className="text-gray-400 text-[10px] font-bold">{item.author_username}</p>
                <p className="text-gray-700 text-[9px]">{new Date(item.created_date).toLocaleDateString()}</p>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{item.content}</p>
            </div>
          )
        ))}
      </div>
    </>
  );
}

export default function SubcategoryCards({ cat, categoryName, userEmail, userProfile, user, franchiseId }) {
  const [items, setItems] = useState(() => {
    const base = SUBCATEGORY_CONFIG[cat] || [];
    const loaded = base.map(item => {
      try {
        const saved = JSON.parse(localStorage.getItem(`subcat_${cat}_${item.id}`) || "{}");
        return { ...item, title: saved.name || item.title, customLogo: saved.logo || "", customCover: saved.cover || "", cardSize: saved.cardSize || "md" };
      } catch { return item; }
    });
    try {
      const extra = JSON.parse(localStorage.getItem(`extra_subcat_${cat}`) || "[]");
      return [...loaded, ...extra];
    } catch { return loaded; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [groupFilterSearch, setGroupFilterSearch] = useState("");
  const [visibleSubcats, setVisibleSubcats] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`subcat_visible_${cat}`) || "null");
      return saved ? new Set(saved) : null;
    } catch { return null; }
  });
  // Resizable sidebar width (px)
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [mobileFeedOpen, setMobileFeedOpen] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
  const containerRef = useRef(null);

  const onDragStart = useCallback((e) => {
    const point = e.touches?.[0] || e;
    dragging.current = true;
    startX.current = point.clientX;
    startW.current = sidebarWidth;
    document.body.style.userSelect = "none";
  }, [sidebarWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const point = e.touches?.[0] || e;
      const delta = point.clientX - startX.current;
      const newW = Math.max(140, Math.min(340, startW.current + delta));
      setSidebarWidth(newW);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, []);

  const canAdmin = isAdmin(userEmail);
  const isAccountMod = userProfile?.moderator_type === "account_moderator";
  const canDelete = canAdmin || isAccountMod;

  const handleItemUpdate = (updated) => setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
  const handleDelete = (itemId) => {
    const key = `extra_subcat_${cat}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify(existing.filter(x => x.id !== itemId)));
    localStorage.removeItem(`subcat_${cat}_${itemId}`);
    setItems(prev => prev.filter(it => it.id !== itemId));
  };
  const handleRequestDelete = () => alert("✅ Deletion request sent to admin for review.");
  const handleAdded = (newItem) => setItems(prev => [...prev, newItem]);

  const isVisible = (id) => !visibleSubcats || visibleSubcats.has(id);
  const toggleSubcatVisible = (id) => {
    setVisibleSubcats(prev => {
      const base = prev || new Set(items.map(item => item.id));
      const next = new Set(base);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(`subcat_visible_${cat}`, JSON.stringify([...next]));
      return next;
    });
  };
  const selectAllSubcats = () => { setVisibleSubcats(null); localStorage.removeItem(`subcat_visible_${cat}`); };
  const unselectAllSubcats = () => {
    setVisibleSubcats(new Set());
    localStorage.setItem(`subcat_visible_${cat}`, JSON.stringify([]));
  };

  const filteredItems = items.filter(item =>
    isVisible(item.id) && (!search || item.title.toLowerCase().includes(search.toLowerCase()) || item.desc?.toLowerCase().includes(search.toLowerCase()))
  );

  if (!items.length && !canAdmin) return null;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-1">Browse by</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {categoryName} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Subcategories</span>
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Click a card to go to its landing page{canAdmin ? " · Hover to edit" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subcategories..."
                className="bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 w-44"
              />
            </div>
            <button onClick={() => setShowGroupFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showGroupFilter ? "border-cyan-500/60 bg-cyan-900/20 text-cyan-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"}`}>
              <Filter className="w-3.5 h-3.5" /> Filter Groups {visibleSubcats && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
            </button>
            {(canAdmin || isAccountMod) && (
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                <Plus className="w-4 h-4" /> Add Card
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGroupFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-white font-bold text-sm">Select {categoryName} Groups</p>
                <div className="flex gap-2">
                  <button onClick={selectAllSubcats} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Select All</button>
                  <button onClick={unselectAllSubcats} className="text-xs text-gray-500 hover:text-red-400 font-semibold flex items-center gap-1"><Square className="w-3 h-3" /> Unselect All</button>
                </div>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input value={groupFilterSearch} onChange={e => setGroupFilterSearch(e.target.value)} placeholder="Search groups..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                {items.filter(item => !groupFilterSearch || item.title.toLowerCase().includes(groupFilterSearch.toLowerCase())).map(item => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer group/lbl">
                    <button type="button" onClick={() => toggleSubcatVisible(item.id)} className="flex-shrink-0">
                      {isVisible(item.id) ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-gray-600 group-hover/lbl:text-gray-400" />}
                    </button>
                    <span className={`text-xs font-semibold transition-colors truncate ${isVisible(item.id) ? "text-white" : "text-gray-600 group-hover/lbl:text-gray-400"}`}>{item.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subcategory cards grid (category-specific feeds removed — a single
          global "All categories" newsfeed is shown on the category page instead) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-600 text-xs">No matches</div>
        )}
        {filteredItems.map((item, i) => (
          <SubcardItem
            key={item.id}
            item={{ ...item, _userEmail: userEmail }}
            cat={cat} index={i}
            canAdmin={canAdmin || isAccountMod}
            canDelete={canDelete}
            isAccountMod={isAccountMod && !canAdmin}
            onItemUpdate={handleItemUpdate}
            onDelete={() => handleDelete(item.id)}
            onRequestDelete={() => handleRequestDelete()}
            user={user}
            userProfile={userProfile}
            activeSubcat={null}
            onSetActiveSubcat={() => {}}
          />
        ))}
      </div>

      <AnimatePresence>
        {showAdd && <AddSubcategoryModal cat={cat} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      </AnimatePresence>
    </div>
  );
}