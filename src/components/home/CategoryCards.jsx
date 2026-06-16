import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil, X, Check, Upload, Plus, Trash2 } from "lucide-react";
import {
  IconController, IconMod, IconStream, IconTrophy, IconStore,
  IconPlay, IconJobs, IconCommunity
} from "@/components/icons/GameIcons";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import { isAdmin } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";

const defaultModding = {
  icon: IconMod, iconColor: "#fb923c",
  title: "Modding Community",
  sub: "Upload, Share & Download Mods — GTA, FIFA, NBA2K, PPSSPP, Minecraft & more",
  color: "from-orange-950 via-amber-950 to-gray-950",
  borderColor: "border-orange-500/60", glowColor: "rgba(249,115,22,0.7)",
  href: "/category?cat=modding",
  tags: ["PPSSPP", "GTA 5", "FIFA", "NBA2K", "Minecraft", "Android"],
};

const defaultCommunity = {
  icon: IconCommunity, iconColor: "#a78bfa",
  title: "Gaming Community",
  sub: "50+ Franchise Communities · CoD, FIFA, Minecraft & more",
  color: "from-violet-950 to-purple-900",
  borderColor: "border-violet-500/60", glowColor: "rgba(139,92,246,0.7)",
  href: "/gaming-community",
};

const defaultOtherCategories = [
  { id: "games", icon: IconController, iconColor: "#a855f7", title: "Games", sub: "Top deals from Steam, Epic · Android & iOS titles", color: "from-purple-950 to-purple-900", borderColor: "border-purple-500/50", glowColor: "rgba(139,92,246,0.6)", href: "/category?cat=games", badge: "Steam · Epic · Mobile" },
  { id: "premium_mods", icon: IconMod, iconColor: "#fbbf24", title: "Premium Mods", sub: "Paid Mods, Scripts & Expansions — Exclusive Content", color: "from-amber-950 to-yellow-900", borderColor: "border-amber-500/50", glowColor: "rgba(251,191,36,0.6)", href: "/category?cat=premium_mods", badge: "Paid Only" },
  { id: "tournaments", icon: IconTrophy, iconColor: "#4ade80", title: "Tournaments", sub: "MLBB, CS2, Valorant, FIFA, NBA2K & global events", color: "from-green-950 to-green-900", borderColor: "border-green-500/50", glowColor: "rgba(74,222,128,0.6)", href: "/category?cat=tournaments", badge: "Global" },
  { id: "content_streaming", icon: IconPlay, iconColor: "#60a5fa", title: "Content/Streaming", sub: "Videos, Live Streams, Clips & Reviews", color: "from-blue-950 to-red-900", borderColor: "border-blue-500/50", glowColor: "rgba(59,130,246,0.6)", href: "/category?cat=content_streaming", badge: "Videos + LIVE" },
  { id: "paid_tools", icon: IconStore, iconColor: "#f472b6", title: "Tools", sub: "Premium Software, Utilities & Automation", color: "from-pink-950 to-pink-900", borderColor: "border-pink-500/50", glowColor: "rgba(244,114,182,0.6)", href: "/category?cat=paid_tools", badge: "Pro Tools" },
  { id: "jobs", icon: IconJobs, iconColor: "#f87171", title: "Gaming Jobs", sub: "QA, Dev, Coaching & Community", color: "from-rose-950 to-rose-900", borderColor: "border-rose-500/50", glowColor: "rgba(248,113,113,0.5)",href: "/category?cat=jobs", badge: "Careers" },
];

// Inline edit panel for a small category card
function SmallCardEditOverlay({ cat, onClose, onSave }) {
  const [name, setName] = useState(cat.title);
  const [logoUrl, setLogoUrl] = useState(cat.customLogo || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await uploadFileToR2(file, "category-card-images");
    setLogoUrl(file_url);
    setUploading(false);
  };

  return (
    <div className="absolute inset-0 z-20 bg-black/95 rounded-2xl p-3 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <p className="text-white text-[10px] font-black">Edit Card</p>
        <button onClick={onClose}><X className="w-3 h-3 text-gray-400" /></button>
      </div>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Card name"
        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-purple-500" />
      <div className="flex gap-1">
        <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Logo URL..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-purple-500" />
        <button onClick={() => fileRef.current?.click()} className="px-2 py-1 rounded-lg bg-purple-700 text-white text-[10px] flex items-center gap-0.5">
          {uploading ? "..." : <><Upload className="w-2.5 h-2.5" /></>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => handleUpload(e.target.files[0])} />
      </div>
      {logoUrl && <img src={logoUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />}
      <button onClick={() => onSave({ title: name, customLogo: logoUrl })}
        className="w-full py-1 rounded-lg bg-green-700 text-white text-[10px] font-black flex items-center justify-center gap-1">
        <Check className="w-3 h-3" /> Save
      </button>
    </div>
  );
}

function SmallCard({ cat, index, canAdmin, onUpdate }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const CatIcon = cat.icon;

  return (
    <motion.div
      onClick={editing ? undefined : () => navigate(cat.href)}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="relative rounded-2xl cursor-pointer block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
    >
      {canAdmin && !editing && (
        <button
          onClick={e => { e.stopPropagation(); setEditing(true); }}
          className="absolute top-2 left-2 z-10 w-6 h-6 rounded-lg bg-black/70 hover:bg-purple-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <Pencil className="w-3 h-3 text-white" />
        </button>
      )}

      {editing && (
        <SmallCardEditOverlay
          cat={cat} onClose={() => setEditing(false)}
          onSave={data => { onUpdate?.(data); setEditing(false); }}
        />
      )}

      <div className={`relative h-56 rounded-2xl border-2 ${cat.borderColor} bg-gradient-to-br ${cat.color} p-4 flex flex-col items-center justify-center gap-3 transition-all`}
        style={{ boxShadow: hovered ? `0 0 24px 4px ${cat.glowColor}` : "none" }}>
        {cat.live && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600/80 text-white text-[8px] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
          </div>
        )}
        {cat.badge && !cat.live && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/40 text-white/60 text-[8px] font-semibold">{cat.badge}</div>
        )}
        <motion.div
          animate={hovered ? { scale: 1.2, rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.35 }}
        >
          {cat.customLogo
            ? <img src={cat.customLogo} className="w-12 h-12 rounded-xl object-cover" alt="" />
            : <CatIcon size={40} color={cat.iconColor} />
          }
        </motion.div>
        <div className="text-center">
          <div className="text-white font-bold text-sm">{cat.title}</div>
          <div className="text-white/40 text-[10px] mt-0.5 leading-tight">{cat.sub}</div>
        </div>
        <div className={`absolute bottom-3 right-3 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <span className="text-white/60 text-xs font-bold">→</span>
        </div>
      </div>
    </motion.div>
  );
}

// Admin "Add Category Card" tile
function AddCategoryTile({ onClick }) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="relative rounded-2xl cursor-pointer border-2 border-dashed border-purple-700/50 hover:border-purple-500 bg-purple-950/20 h-56 flex flex-col items-center justify-center gap-2 transition-all"
    >
      <Plus className="w-8 h-8 text-purple-500" />
      <p className="text-purple-400 text-xs font-bold">Add Category Card</p>
    </motion.div>
  );
}

// Modal to add a new custom category card
function AddCategoryModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [href, setHref] = useState("/category?cat=");
  const [logo, setLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await uploadFileToR2(file, "category-card-images");
    setLogo(file_url);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.9)" }}>
      <div className="bg-gray-950 border border-purple-700/40 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black">Add Category Card</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Esports"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Link (href)</label>
            <input value={href} onChange={e => setHref(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Icon/Logo</label>
            <div className="flex gap-2 mb-1">
              <input value={logo} onChange={e => setLogo(e.target.value)} placeholder="Paste URL..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <button onClick={() => fileRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-purple-700 text-white text-xs flex items-center gap-1">
                {uploading ? "..." : <><Upload className="w-3 h-3" /> Upload</>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => handleUpload(e.target.files[0])} />
            </div>
            {logo && <img src={logo} className="w-10 h-10 rounded-xl object-cover" alt="" />}
          </div>
          <button
            onClick={() => { if (!name.trim()) return; onAdd({ id: `custom_${Date.now()}`, title: name, sub: desc, href, customLogo: logo, icon: IconController, iconColor: "#a855f7", color: "from-purple-950 to-purple-900", borderColor: "border-purple-500/50", glowColor: "rgba(168,85,247,0.6)", badge: "New" }); onClose(); }}
            className="w-full py-2.5 rounded-xl font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            <Plus className="w-4 h-4 inline mr-1" /> Add Card
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryCards() {
  const [modHovered, setModHovered] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const admin = isAdmin(user?.email);
  const ModIcon = defaultModding.icon;

  // Persist extra admin-added cards
  const [extraCards, setExtraCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem("home_extra_cat_cards") || "[]"); } catch { return []; }
  });
  // Persist per-card edits (name/logo) for default cards
  const [cardOverrides, setCardOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem("home_cat_overrides") || "{}"); } catch { return {}; }
  });
  const [showAddModal, setShowAddModal] = useState(false);

  const saveExtra = (updated) => {
    localStorage.setItem("home_extra_cat_cards", JSON.stringify(updated));
    setExtraCards(updated);
  };

  const saveOverride = (id, data) => {
    const updated = { ...cardOverrides, [id]: data };
    localStorage.setItem("home_cat_overrides", JSON.stringify(updated));
    setCardOverrides(updated);
  };

  const handleAddCard = (card) => saveExtra([...extraCards, card]);

  const allSmall = [
    ...defaultOtherCategories.map(c => ({ ...c, ...(cardOverrides[c.id] || {}) })),
    ...extraCards,
  ];

  return (
    <section id="categories" className="py-16 px-4 bg-gray-950/90 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">GAMER.Productions</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Browse by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">Click any category to explore</p>
        </motion.div>

        {/* MODDING — Hero large card */}
        <motion.div
          onClick={() => navigate(defaultModding.href)}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative mb-6 rounded-3xl cursor-pointer overflow-hidden block group"
          style={{
            height: "240px",
            border: `2px solid ${modHovered ? "rgba(249,115,22,0.8)" : "rgba(249,115,22,0.3)"}`,
            transition: "border-color 0.3s",
            boxShadow: modHovered ? "0 0 40px 8px rgba(249,115,22,0.3)" : "0 0 20px rgba(249,115,22,0.1)",
          }}
          onMouseEnter={() => setModHovered(true)}
          onMouseLeave={() => setModHovered(false)}
          whileHover={{ scale: 1.005 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-amber-950 to-gray-950" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(249,115,22,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <motion.div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.3), transparent)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />

          <div className="relative z-10 h-full flex items-center px-8 md:px-16 gap-8">
            <motion.div animate={modHovered ? { rotate: [0, -10, 10, 0], scale: 1.15 } : { scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="w-20 h-20 rounded-2xl bg-orange-900/40 border-2 border-orange-500/50 flex items-center justify-center"
                style={{ boxShadow: modHovered ? "0 0 30px rgba(249,115,22,0.6)" : "none" }}>
                <ModIcon size={44} color="#fb923c" />
              </div>
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-wider">Featured</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase">Most Popular</span>
              </div>
              <h3 className="text-white font-black text-3xl md:text-4xl mb-2">Modding Community</h3>
              <p className="text-orange-200/70 text-base max-w-xl">
                Upload, share & download mods — <strong className="text-orange-300">PPSSPP, Football Life, PES, FIFA, NBA2K, GTA5, GTA SA, WWE2K, Minecraft, Android</strong> & more.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {defaultModding.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-300 text-[10px] font-semibold">{t}</span>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-orange-300 font-bold text-sm">Explore →</div>
          </div>
        </motion.div>

        {/* Gaming Community */}
        <motion.div
          onClick={() => navigate(defaultCommunity.href)}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative mb-6 rounded-3xl cursor-pointer overflow-hidden"
          style={{ height: "200px", border: "2px solid rgba(139,92,246,0.5)", boxShadow: "0 0 30px rgba(139,92,246,0.15)" }}
          whileHover={{ scale: 1.005, boxShadow: "0 0 50px rgba(139,92,246,0.3)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-gray-950" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <motion.div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
          <div className="relative z-10 h-full flex items-center px-8 md:px-16 gap-8">
            <div className="w-20 h-20 rounded-2xl bg-purple-900/40 border-2 border-purple-500/50 flex items-center justify-center">
              <IconCommunity size={44} color="#a78bfa" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider">NEW</span>
                <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-black uppercase">50+ Franchises</span>
              </div>
              <h3 className="text-white font-black text-3xl md:text-4xl mb-2">Gaming Community</h3>
              <p className="text-purple-200/70 text-base max-w-xl">
                Join communities for <strong className="text-purple-300">Call of Duty, Minecraft, GTA, Valorant, FIFA, NBA2K, UFC, WWE, Mario</strong> & 40+ more franchises.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-purple-300 font-bold text-sm">Explore →</div>
          </div>
        </motion.div>

        {/* Small category cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {allSmall.map((cat, i) => (
            <SmallCard
              key={cat.id || i}
              cat={cat}
              index={i}
              canAdmin={admin}
              onUpdate={data => {
                if (defaultOtherCategories.find(d => d.id === cat.id)) {
                  saveOverride(cat.id, data);
                } else {
                  saveExtra(extraCards.map(c => c.id === cat.id ? { ...c, ...data } : c));
                }
              }}
            />
          ))}
          {/* Admin: Add Category Card tile */}
          {admin && <AddCategoryTile onClick={() => setShowAddModal(true)} />}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && <AddCategoryModal onClose={() => setShowAddModal(false)} onAdd={handleAddCard} />}
      </AnimatePresence>
    </section>
  );
}