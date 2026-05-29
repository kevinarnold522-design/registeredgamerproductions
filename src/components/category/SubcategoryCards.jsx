import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, Upload, X, Plus, Trash2, Send, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
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
    { id: "PC",              emoji: "🖥️", title: "PC Games",        desc: "Steam, Epic, GOG & more",         color: "from-blue-950 to-blue-900",    border: "border-blue-500/50",    glow: "rgba(59,130,246,0.6)",  badge: "Steam" },
    { id: "PlayStation",     emoji: "🎮", title: "PlayStation",      desc: "PS4, PS5 — digital & disc",       color: "from-indigo-950 to-indigo-900",border: "border-indigo-500/50",  glow: "rgba(99,102,241,0.6)", badge: "PS4/PS5" },
    { id: "Xbox",            emoji: "🟩", title: "Xbox",             desc: "Xbox One & Series X/S deals",     color: "from-green-950 to-green-900",  border: "border-green-500/50",   glow: "rgba(74,222,128,0.6)", badge: "Series X" },
    { id: "Nintendo Switch", emoji: "🔴", title: "Nintendo Switch",  desc: "Physical & digital Switch titles", color: "from-red-950 to-red-900",      border: "border-red-500/50",     glow: "rgba(239,68,68,0.6)",  badge: "Nintendo" },
    { id: "Mobile",          emoji: "📱", title: "Mobile Games",     desc: "Android & iOS top titles",         color: "from-teal-950 to-teal-900",    border: "border-teal-500/50",    glow: "rgba(20,184,166,0.6)", badge: "Mobile" },
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
      {/* Logo upload — device only */}
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Profile Picture / Logo</p>
        <button onClick={() => logoRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-purple-900/40 border border-purple-700/50 text-purple-300 text-[10px] font-bold hover:bg-purple-900/70 transition-all">
          <Upload className="w-3 h-3" />
          {uploading === "logo" ? "Uploading..." : logoUrl ? "Replace Photo" : "Upload from Device"}
        </button>
        <input ref={logoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleUpload(e.target.files[0], "logo")} />
        {logoUrl && <img src={logoUrl} className="mt-1 w-10 h-10 rounded-lg object-cover border border-gray-700" alt="" />}
      </div>
      {/* Cover upload — device only */}
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Cover / Background</p>
        <button onClick={() => coverRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-300 text-[10px] font-bold hover:bg-blue-900/70 transition-all">
          <Upload className="w-3 h-3" />
          {uploading === "cover" ? "Uploading..." : coverUrl ? "Replace Cover" : "Upload Cover from Device"}
        </button>
        <input ref={coverRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleUpload(e.target.files[0], "cover")} />
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

      <div onClick={editing ? undefined : () => onSetActiveSubcat(isActive ? null : item.id)}
        className={`relative ${cardH} rounded-2xl border-2 ${displayItem.border} ${isActive ? "ring-2 ring-purple-500/60" : ""} bg-gradient-to-br ${displayItem.color} p-3 flex flex-col justify-between transition-all duration-300 overflow-hidden`}>
        {displayItem.customCover && (
          <div className="absolute inset-0 opacity-25 rounded-2xl" style={{ backgroundImage: `url(${displayItem.customCover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="relative flex items-start justify-between">
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-white/70 text-[8px] font-bold uppercase tracking-wide">{displayItem.badge}</span>
          {isActive && <span className="text-purple-400 text-[8px] font-black">● OPEN</span>}
        </div>
        <motion.div className="relative text-3xl"
          animate={hovered ? { scale: 1.15, rotate: [0, -6, 6, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}>
          {displayItem.customLogo
            ? <img src={displayItem.customLogo} className="w-8 h-8 rounded-xl object-cover" alt="" />
            : displayItem.emoji}
        </motion.div>
        <div className="relative">
          <p className="text-white font-black text-xs leading-tight">{displayItem.title}</p>
          <p className="text-white/40 text-[9px] mt-0.5 leading-tight line-clamp-1">{displayItem.desc}</p>
        </div>
        <div className="relative flex items-center justify-between mt-1">
          <a href={href} onClick={e => e.stopPropagation()}
            className="text-white/30 hover:text-white/80 text-[9px] font-bold transition-colors">→ Browse</a>
          <div className="flex gap-1">
            <button onClick={e => { e.stopPropagation(); const url = encodeURIComponent(window.location.href); window.open(`https://wa.me/?text=${encodeURIComponent(`${displayItem.title} on GAMER.PRODUCTIONS 🎮`)}%20${url}`, "_blank"); }}
              className="w-4 h-4 rounded bg-green-700/70 flex items-center justify-center text-[8px] text-white" title="Share">💬</button>
            <a href={`/create-listing?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(displayItem.id)}`} onClick={e => e.stopPropagation()}
              className="w-4 h-4 rounded bg-purple-700/70 flex items-center justify-center text-[8px] text-white" title="Add Listing">+</a>
          </div>
        </div>
        <motion.div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${displayItem.glow}, transparent)` }}
          animate={{ opacity: hovered || isActive ? 1 : 0 }} />
      </div>
    </motion.div>
  );
}

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
  const [activeSubcat, setActiveSubcat] = useState(null);

  const canAdmin = isAdmin(userEmail);
  const isAccountMod = userProfile?.moderator_type === "account_moderator";
  const canDelete = canAdmin || isAccountMod;
  const activeItem = items.find(i => i.id === activeSubcat);

  const handleItemUpdate = (updated) => setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
  const handleDelete = (itemId) => {
    const key = `extra_subcat_${cat}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify(existing.filter(x => x.id !== itemId)));
    localStorage.removeItem(`subcat_${cat}_${itemId}`);
    setItems(prev => prev.filter(it => it.id !== itemId));
    if (activeSubcat === itemId) setActiveSubcat(null);
  };
  const handleRequestDelete = () => alert("✅ Deletion request sent to admin for review.");
  const handleAdded = (newItem) => setItems(prev => [...prev, newItem]);

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
            <p className="text-gray-500 text-xs mt-0.5">Click a card to open its newsfeed{canAdmin ? " · Hover to edit" : ""}</p>
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

      {/* Two-column layout: subcards left, newsfeed right */}
      <div className="flex gap-4">
        {/* LEFT: scrollable subcards column */}
        <div className="w-48 flex-shrink-0 flex flex-col gap-2 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
          {items.map((item, i) => (
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
              activeSubcat={activeSubcat}
              onSetActiveSubcat={setActiveSubcat}
            />
          ))}
        </div>

        {/* RIGHT: newsfeed panel — shows when a subcard is selected */}
        <div className="flex-1 min-w-0">
          {activeItem ? (
            <motion.div
              key={activeSubcat}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-[700px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col"
            >
              <SubcardNewsfeed
                cat={cat}
                subcatId={activeItem.id}
                subcatTitle={activeItem.title}
                user={user}
                userProfile={userProfile}
                franchiseId={franchiseId}
              />
            </motion.div>
          ) : (
            <div className="h-[700px] bg-gray-900/40 rounded-2xl border border-gray-800/50 border-dashed flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">👈</p>
                <p className="text-gray-500 text-sm font-semibold">Select a subcategory</p>
                <p className="text-gray-600 text-xs mt-1">to open its newsfeed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && <AddSubcategoryModal cat={cat} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      </AnimatePresence>
    </div>
  );
}