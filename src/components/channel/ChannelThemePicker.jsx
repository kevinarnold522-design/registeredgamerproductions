import React, { useState } from "react";
import { Palette, X, Check } from "lucide-react";

const THEMES = [
  { id: "default", label: "Default", bg: "linear-gradient(135deg,#1a0533,#0f0f2e)", accent: "#a855f7" },
  { id: "fire", label: "Fire", bg: "linear-gradient(135deg,#450a0a,#7f1d1d)", accent: "#ef4444" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(135deg,#0c1a4d,#0e4f6b)", accent: "#06b6d4" },
  { id: "forest", label: "Forest", bg: "linear-gradient(135deg,#052e16,#14532d)", accent: "#22c55e" },
  { id: "gold", label: "Gold", bg: "linear-gradient(135deg,#2d1700,#4a2800)", accent: "#f59e0b" },
  { id: "neon", label: "Neon", bg: "linear-gradient(135deg,#0a0a0a,#1a0a2e)", accent: "#00ffcc" },
  { id: "sakura", label: "Sakura", bg: "linear-gradient(135deg,#2d0a1e,#4a1530)", accent: "#ec4899" },
  { id: "galaxy", label: "Galaxy", bg: "linear-gradient(135deg,#0a0a1e,#1e0a3d)", accent: "#818cf8" },
  { id: "sunset", label: "Sunset", bg: "linear-gradient(135deg,#2d0a0a,#3d1a0a)", accent: "#f97316" },
  { id: "midnight", label: "Midnight", bg: "linear-gradient(135deg,#050510,#0a0a1e)", accent: "#6366f1" },
];

export default function ChannelThemePicker({ currentTheme, onSelect }) {
  const [open, setOpen] = useState(false);
  const selected = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:border-purple-500/50 hover:text-purple-300 transition-colors"
      >
        <Palette className="w-3.5 h-3.5" />
        <span>Theme</span>
        <div className="w-3 h-3 rounded-full" style={{ background: selected.accent }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-950 border border-purple-700/40 rounded-2xl p-3 shadow-2xl z-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">Channel Theme</p>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { onSelect(theme.id); setOpen(false); }}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${currentTheme === theme.id ? "border-purple-500" : "border-transparent hover:border-gray-700"}`}
                  style={{ background: theme.bg }}
                >
                  {currentTheme === theme.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 8px ${theme.accent}60` }} />
                  <span className="text-white text-xs font-semibold">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { THEMES };