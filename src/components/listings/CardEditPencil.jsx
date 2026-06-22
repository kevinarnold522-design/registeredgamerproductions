import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

const SIZE_OPTIONS = [
  { id: "sm", label: "Small" },
  { id: "md", label: "Medium" },
  { id: "lg", label: "Large" },
];
const GLOW_STYLES = [
  { id: "radiant", label: "Radiant" },
  { id: "lines", label: "Lines" },
  { id: "solid", label: "Solid" },
];
const GLOW_COLORS = [
  { id: "purple", hex: "#a855f7" },
  { id: "red", hex: "#ef4444" },
  { id: "blue", hex: "#3b82f6" },
  { id: "green", hex: "#22c55e" },
  { id: "gold", hex: "#eab308" },
  { id: "multi", hex: "#ec4899" },
];

/**
 * Inline card editor — shows a floating pencil for the listing owner or any admin.
 * Lets them change card size, glow style, glow color, and category/section name
 * directly on the card without leaving the page.
 */
export default function CardEditPencil({ listing, user, onSaved }) {
  const isOwner = user && listing && user.email === listing.seller_email;
  const canEdit = isOwner || isAdmin(user?.email);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [size, setSize] = useState(listing.card_size || "md");
  const [glowStyle, setGlowStyle] = useState(listing.card_glow_style || "radiant");
  const [glowColor, setGlowColor] = useState(listing.card_glow_color || "purple");
  const [customHex, setCustomHex] = useState(listing.card_glow_hex || "#a855f7");
  const [catName, setCatName] = useState(listing.card_category_label || listing.category || "");

  if (!canEdit) return null;

  const save = async () => {
    setSaving(true);
    const data = {
      card_size: size,
      card_glow_style: glowStyle,
      card_glow_color: glowColor,
      card_glow_hex: glowColor === "custom" ? customHex : undefined,
      card_category_label: catName.trim(),
    };
    try {
      await base44.entities.Listing.update(listing.id, data);
      onSaved?.({ ...listing, ...data });
    } catch {}
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="absolute top-2 left-2 z-30" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
        title="Edit card"
        className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm border border-purple-500/50 text-purple-200 flex items-center justify-center hover:bg-purple-900/70 transition-all"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            className="absolute top-9 left-0 w-60 bg-gray-950 border border-purple-700/50 rounded-2xl p-3 shadow-2xl space-y-3"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="flex items-center justify-between">
              <p className="text-white text-xs font-black">Edit Card</p>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}>
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
              </button>
            </div>

            {/* Category / section name */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Category name</label>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Premium Mods"
                className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Size */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Size</label>
              <div className="flex gap-1.5 mt-1">
                {SIZE_OPTIONS.map(s => (
                  <button key={s.id} onClick={() => setSize(s.id)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors ${size === s.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glow style */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Glow style</label>
              <div className="flex gap-1.5 mt-1">
                {GLOW_STYLES.map(g => (
                  <button key={g.id} onClick={() => setGlowStyle(g.id)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors ${glowStyle === g.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glow color */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Glow color</label>
              <div className="flex gap-1.5 mt-1 flex-wrap items-center">
                {GLOW_COLORS.map(c => (
                  <button key={c.id} onClick={() => setGlowColor(c.id)}
                    title={c.id}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${glowColor === c.id ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: c.hex }} />
                ))}
                <button onClick={() => setGlowColor("custom")}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${glowColor === "custom" ? "border-white scale-110" : "border-gray-600"}`}
                  style={{ background: customHex }} title="Custom">
                  <Pencil className="w-2.5 h-2.5 text-white" />
                </button>
                {glowColor === "custom" && (
                  <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                )}
              </div>
            </div>

            <button onClick={save} disabled={saving}
              className="w-full py-1.5 rounded-lg text-white text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              <Check className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}