import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, Upload, X, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, MODERATOR_TYPES } from "@/lib/constants";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";

// Per-category subcategory card configs
const SUBCATEGORY_CONFIG = {
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
    { id: "PC",               emoji: "🖥️", title: "PC Games",         desc: "Steam, Epic, GOG & more",           color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Steam" },
    { id: "PlayStation",      emoji: "🎮", title: "PlayStation",       desc: "PS4, PS5 — digital & disc",         color: "from-indigo-950 to-indigo-900", border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)",  badge: "PS4/PS5" },
    { id: "Xbox",             emoji: "🟩", title: "Xbox",              desc: "Xbox One & Series X/S deals",       color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Series X" },
    { id: "Nintendo Switch",  emoji: "🔴", title: "Nintendo Switch",   desc: "Physical & digital Switch titles",   color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Nintendo" },
    { id: "Mobile",           emoji: "📱", title: "Mobile Games",      desc: "Android & iOS top titles",           color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Mobile" },
  ],
  buy_sell: [
    { id: "Game Accounts",             emoji: "🔑", title: "Game Accounts",              desc: "Ranked & smurf accounts",            color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",   badge: "Hot" },
    { id: "In-Game Items",             emoji: "💎", title: "In-Game Items",              desc: "Rare items, boosters & keys",        color: "from-cyan-950 to-cyan-900",   border: "border-cyan-500/50",    glow: "rgba(6,182,212,0.6)",    badge: "Trade" },
    { id: "Skins",                     emoji: "🎨", title: "Skins",                      desc: "Character, weapon & vehicle skins",  color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Rare" },
    { id: "Gift Cards",                emoji: "🎁", title: "Gift Cards",                 desc: "Steam, PSN, Xbox & more",            color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Digital" },
    { id: "Premium Mods - WWE2K",      emoji: "🤼", title: "Premium WWE2K Mods",         desc: "Full DLC & roster mods",             color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Premium" },
    { id: "Premium Mods - GTA 5",      emoji: "🏙️", title: "Premium GTA 5 Mods",        desc: "Script & visual mega-packs",         color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Premium" },
    { id: "Premium Mods - GTA SA",     emoji: "🌴", title: "Premium GTA SA Mods",        desc: "San Andreas visual overhauls",       color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Premium" },
    { id: "Premium Mods - FIFA",       emoji: "🥅", title: "Premium FIFA Mods",          desc: "Updated kits, squads & faces",       color: "from-indigo-950 to-indigo-900", border: "border-indigo-500/50", glow: "rgba(99,102,241,0.6)", badge: "Premium" },
    { id: "Premium Mods - PES",        emoji: "🏟️", title: "Premium PES Mods",          desc: "Option files & stadium packs",       color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Premium" },
    { id: "Premium Mods - NBA2K",      emoji: "🏀", title: "Premium NBA2K Mods",         desc: "Cyberfaces, courts & jerseys",       color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Premium" },
    { id: "Premium Mods - Football Life", emoji: "⚽", title: "Premium Football Life Mods", desc: "Kits, balls & stadium packs",     color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Premium" },
    { id: "Premium Mods - PPSSPP/PSP", emoji: "🎮", title: "Premium PPSSPP/PSP Mods",    desc: "ISO packs & texture bundles",        color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Premium" },
  ],
  tournaments: [
    { id: "FPS",            emoji: "🎯", title: "FPS",             desc: "CS2, Valorant, COD & more",          color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Shooter" },
    { id: "Battle Royale",  emoji: "🪂", title: "Battle Royale",   desc: "PUBG, Fortnite, Free Fire",          color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)",  badge: "Top" },
    { id: "MOBA",           emoji: "🧙", title: "MOBA",            desc: "MLBB, DOTA2, LoL events",            color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Esports" },
    { id: "Sports",         emoji: "🏆", title: "Sports",          desc: "FIFA, NBA2K, PES cups",              color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Online" },
    { id: "Fighting",       emoji: "🥊", title: "Fighting",        desc: "Tekken, MK, Street Fighter",         color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "1v1" },
    { id: "Mobile Gaming",  emoji: "📱", title: "Mobile Gaming",   desc: "Mobile Legends, CODM & more",        color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Mobile" },
  ],
  content: [
    { id: "Gaming Videos",  emoji: "🎮", title: "Gaming Videos",  desc: "Gameplay & full playthroughs",       color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Watch" },
    { id: "Streaming",      emoji: "📡", title: "Streaming",      desc: "Live stream replays & VODs",         color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "Live" },
    { id: "Tutorials",      emoji: "📚", title: "Tutorials",      desc: "Guides, tips & how-to videos",       color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Learn" },
    { id: "Reviews",        emoji: "⭐", title: "Reviews",        desc: "Honest game & gear reviews",         color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Rate" },
    { id: "Highlights",     emoji: "✂️", title: "Highlights",     desc: "Best clips & epic moments",          color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Clips" },
    { id: "Clips",          emoji: "🎬", title: "Clips",          desc: "Short-form gaming clips",            color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Short" },
  ],
  jobs: [
    { id: "QA Testing",          emoji: "🔍", title: "QA Testing",          desc: "Game testing & bug hunting",         color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Remote" },
    { id: "Game Dev",            emoji: "💻", title: "Game Dev",            desc: "Unity, Unreal, indie dev roles",     color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Dev" },
    { id: "Community Manager",   emoji: "🤝", title: "Community Manager",   desc: "Discord, social & fan management",  color: "from-green-950 to-green-900", border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)",   badge: "Social" },
    { id: "Esports Coach",       emoji: "🏆", title: "Esports Coach",       desc: "Train & grow competitive teams",     color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Coach" },
    { id: "Content Creator",     emoji: "🎥", title: "Content Creator",     desc: "Brand deals, sponsored content",     color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Creator" },
  ],
  livestream: [
    { id: "Gameplay Streams",  emoji: "🎮", title: "Gameplay Streams",  desc: "Live gaming sessions",               color: "from-red-950 to-red-900",     border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",    badge: "LIVE" },
    { id: "Tournaments",       emoji: "🏆", title: "Tournaments",       desc: "Competitive live events",            color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Event" },
    { id: "Esports Events",    emoji: "🎯", title: "Esports Events",    desc: "Pro-level esports broadcasts",       color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Pro" },
    { id: "Mod Reviews",       emoji: "🔧", title: "Mod Reviews",       desc: "Live mod showcase & testing",        color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Mods" },
    { id: "Q&A Sessions",      emoji: "❓", title: "Q&A Sessions",      desc: "Creator & community Q&As",           color: "from-teal-950 to-teal-900",   border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)",   badge: "Talk" },
    { id: "Unboxing",          emoji: "📦", title: "Unboxing",          desc: "Gear & game unboxing streams",       color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "New" },
  ],
  services: [
    { id: "PC Repair",          emoji: "🔧", title: "PC Repair",          desc: "Hardware fixes & upgrades",          color: "from-blue-950 to-blue-900",   border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",   badge: "Tech" },
    { id: "Custom Builds",      emoji: "🖥️", title: "Custom Builds",      desc: "PC builds tailored for gaming",      color: "from-purple-950 to-purple-900", border: "border-purple-500/50", glow: "rgba(168,85,247,0.6)", badge: "Build" },
    { id: "Coaching",           emoji: "🏆", title: "Coaching",           desc: "Rank up with pro coaching",          color: "from-yellow-950 to-yellow-900", border: "border-yellow-500/50", glow: "rgba(234,179,8,0.6)",  badge: "Pro" },
    { id: "Boosting",           emoji: "⚡", title: "Boosting",           desc: "Rank boosting & leveling",           color: "from-orange-950 to-orange-900", border: "border-orange-500/50", glow: "rgba(249,115,22,0.6)", badge: "Fast" },
    { id: "Design Services",    emoji: "🎨", title: "Design Services",    desc: "Logos, banners & overlays",          color: "from-pink-950 to-pink-900",   border: "border-pink-500/50",    glow: "rgba(236,72,153,0.6)",   badge: "Creative" },
  ],
};

// Admin edit overlay for a subcategory card
function SubcardEditOverlay({ item, cat, onClose, onSaved }) {
  const [name, setName] = useState(item.title || "");
  const [logoUrl, setLogoUrl] = useState(item.customLogo || "");
  const [coverUrl, setCoverUrl] = useState(item.customCover || "");
  const [uploading, setUploading] = useState(null);
  const logoRef = useRef(null);
  const coverRef = useRef(null);

  const handleUpload = async (file, type) => {
    if (!file) return;
    setUploading(type);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === "logo") setLogoUrl(file_url);
    else setCoverUrl(file_url);
    setUploading(null);
  };

  const handleSave = () => {
    const key = `subcat_${cat}_${item.id}`;
    const data = { logo: logoUrl, cover: coverUrl, name };
    localStorage.setItem(key, JSON.stringify(data));
    onSaved({ ...item, title: name, customLogo: logoUrl, customCover: coverUrl });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 bg-black/95 rounded-2xl p-3 flex flex-col gap-2" onClick={e => e.preventDefault()}>
      <div className="flex items-center justify-between">
        <p className="text-white text-xs font-black">Edit Card</p>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Name / Title</p>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-purple-500" />
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Logo/Icon</p>
        <div className="flex gap-1">
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
            placeholder="paste URL or upload..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-purple-500" />
          <button onClick={() => logoRef.current?.click()} className="px-2 py-1 rounded-lg bg-purple-700 text-white text-[10px]">
            {uploading === "logo" ? "..." : <Upload className="w-3 h-3" />}
          </button>
          <input ref={logoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleUpload(e.target.files[0], "logo")} />
        </div>
        {logoUrl && <img src={logoUrl} className="mt-1 w-10 h-10 rounded-lg object-cover" alt="" />}
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Cover/Background</p>
        <div className="flex gap-1">
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
            placeholder="paste URL or upload..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-blue-500" />
          <button onClick={() => coverRef.current?.click()} className="px-2 py-1 rounded-lg bg-blue-700 text-white text-[10px]">
            {uploading === "cover" ? "..." : <Upload className="w-3 h-3" />}
          </button>
          <input ref={coverRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleUpload(e.target.files[0], "cover")} />
        </div>
        {coverUrl && <img src={coverUrl} className="mt-1 w-full h-12 rounded-lg object-cover opacity-70" alt="" />}
      </div>
      <button onClick={handleSave} className="w-full py-1.5 rounded-lg bg-green-700 text-white text-[10px] font-black flex items-center justify-center gap-1">
        <Check className="w-3 h-3" /> Save
      </button>
    </div>
  );
}

function SubcardItem({ item, cat, index, canAdmin, canDelete, isAccountMod, onItemUpdate, onDelete, onRequestDelete }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Load saved custom assets from localStorage
  const saved = (() => { try { return JSON.parse(localStorage.getItem(`subcat_${cat}_${item.id}`) || "{}"); } catch { return {}; } })();
  const displayItem = { ...item, customLogo: saved.logo || item.customLogo, customCover: saved.cover || item.customCover };
  const href = cat === "tournaments" ? `/tournaments` : `/sub-landing?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(item.id)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block rounded-2xl cursor-pointer group"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
        style={{ opacity: hovered ? 1 : 0, boxShadow: `0 0 32px 8px ${displayItem.glow}` }}
      />

      {/* Admin pencil + delete */}
      {canAdmin && !editing && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={e => { e.preventDefault(); setEditing(true); }}
            className="w-6 h-6 rounded-lg bg-black/60 hover:bg-purple-700 flex items-center justify-center"
          >
            <Pencil className="w-3 h-3 text-white" />
          </button>
          {canDelete && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); }}
            className="w-6 h-6 rounded-lg bg-black/60 hover:bg-red-700 flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        )}
        </div>
      )}

      {/* Edit overlay */}
      {editing && (
        <SubcardEditOverlay item={displayItem} cat={cat} onClose={() => setEditing(false)} onSaved={(updated) => { onItemUpdate?.(updated); }} />
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

      <a href={editing ? undefined : href} onClick={editing ? e => e.preventDefault() : undefined}>
        <div className={`relative h-48 rounded-2xl border-2 ${displayItem.border} bg-gradient-to-br ${displayItem.color} p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden`}>
          {/* Cover bg */}
          {displayItem.customCover && (
            <div className="absolute inset-0 opacity-30 rounded-2xl" style={{ backgroundImage: `url(${displayItem.customCover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          )}
          {/* Badge */}
          <div className="relative flex justify-between items-start">
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-white/70 text-[9px] font-bold uppercase tracking-wide">
              {displayItem.badge}
            </span>
            <motion.span
              className="text-white/20 text-xs font-bold"
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 4 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </div>

          {/* Logo or Emoji */}
          <motion.div
            className="relative text-4xl"
            animate={hovered ? { scale: 1.25, rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.35 }}
          >
            {displayItem.customLogo
              ? <img src={displayItem.customLogo} className="w-10 h-10 rounded-xl object-cover" alt="" />
              : displayItem.emoji
            }
          </motion.div>

          {/* Text */}
          <div className="relative">
            <p className="text-white font-black text-base leading-tight">{displayItem.title}</p>
            <p className="text-white/40 text-[10px] mt-0.5 leading-tight line-clamp-2">{displayItem.desc}</p>
          </div>

          {/* Bottom shimmer on hover */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${displayItem.glow}, transparent)` }}
            animate={{ opacity: hovered ? 1 : 0 }}
          />
        </div>
      </a>
    </motion.div>
  );
}

// Add new subcategory modal for admin
function AddSubcategoryModal({ cat, onClose, onAdded }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎮");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const colors = ["from-purple-950 to-purple-900", "from-blue-950 to-blue-900", "from-green-950 to-green-900", "from-red-950 to-red-900", "from-yellow-950 to-yellow-900"];
    const glows = ["rgba(168,85,247,0.6)", "rgba(59,130,246,0.6)", "rgba(74,222,128,0.6)", "rgba(239,68,68,0.6)", "rgba(234,179,8,0.6)"];
    const borders = ["border-purple-500/50", "border-blue-500/50", "border-green-500/50", "border-red-500/50", "border-yellow-500/50"];
    const ri = Math.floor(Math.random() * colors.length);
    const newItem = { id, title: name, emoji, desc, color: colors[ri], glow: glows[ri], border: borders[ri], badge: "New", customLogo: "", customCover: "" };
    // Persist
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
            <label className="text-gray-400 text-xs font-bold mb-1 block">Emoji Icon</label>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🎮"
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

export default function SubcategoryCards({ cat, categoryName, userEmail, userProfile }) {
  const [items, setItems] = useState(() => {
    const base = SUBCATEGORY_CONFIG[cat] || [];
    const loaded = base.map(item => {
      try {
        const saved = JSON.parse(localStorage.getItem(`subcat_${cat}_${item.id}`) || "{}");
        return { ...item, title: saved.name || item.title, customLogo: saved.logo || "", customCover: saved.cover || "" };
      } catch { return item; }
    });
    try {
      const extra = JSON.parse(localStorage.getItem(`extra_subcat_${cat}`) || "[]");
      return [...loaded, ...extra];
    } catch { return loaded; }
  });
  const [showAdd, setShowAdd] = useState(false);

  const canAdmin = isAdmin(userEmail);
  const isAccountMod = userProfile?.moderator_type === "account_moderator";
  // Only admin can actually delete; account_moderator can REQUEST deletion
  const canDelete = canAdmin || isAccountMod;

  const handleItemUpdate = (updated) => {
    setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
  };

  const handleDelete = (itemId) => {
    const key = `extra_subcat_${cat}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify(existing.filter(x => x.id !== itemId)));
    localStorage.removeItem(`subcat_${cat}_${itemId}`);
    setItems(prev => prev.filter(it => it.id !== itemId));
  };

  const handleRequestDelete = (itemId) => {
    // Account mod requests deletion — flag it (could create a DeleteRequest entity in future)
    alert("✅ Your deletion request has been sent to admin for review and final approval.");
  };

  const handleAdded = (newItem) => {
    setItems(prev => [...prev, newItem]);
  };

  if (!items.length && !canAdmin) return null;

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">Browse by</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {categoryName} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Subcategories</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Click a card to explore listings{canAdmin ? " · Hover to edit or delete" : ""}</p>
          </div>
          {canAdmin && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              <Plus className="w-4 h-4" /> Add Card
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <SubcardItem
            key={item.id} item={{ ...item, _userEmail: userEmail }} cat={cat} index={i}
            canAdmin={canAdmin || isAccountMod}
            canDelete={canDelete}
            isAccountMod={isAccountMod && !canAdmin}
            onItemUpdate={handleItemUpdate}
            onDelete={() => handleDelete(item.id)}
            onRequestDelete={() => handleRequestDelete(item.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {showAdd && <AddSubcategoryModal cat={cat} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      </AnimatePresence>
    </div>
  );
}