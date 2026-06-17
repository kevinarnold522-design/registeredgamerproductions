import React, { useState } from "react";
import { Palette, X, Check, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const THEMES = [
  { id: "default", label: "Default", primary: "#8b5cf6", secondary: "#ec4899", background: "#050510", style: "gradient", angle: 135, glow: 60 },
  { id: "fire", label: "Fire", primary: "#ef4444", secondary: "#f97316", background: "#120409", style: "gradient", angle: 135, glow: 70 },
  { id: "ocean", label: "Ocean", primary: "#06b6d4", secondary: "#3b82f6", background: "#06111f", style: "gradient", angle: 140, glow: 62 },
  { id: "forest", label: "Forest", primary: "#22c55e", secondary: "#14b8a6", background: "#04130b", style: "cyber_grid", angle: 130, glow: 55 },
  { id: "gold", label: "Gold", primary: "#f59e0b", secondary: "#fde047", background: "#120903", style: "gradient", angle: 120, glow: 58 },
  { id: "neon", label: "Neon", primary: "#00ffcc", secondary: "#ff2d78", background: "#050510", style: "cyber_grid", angle: 135, glow: 88 },
  { id: "sakura", label: "Sakura", primary: "#ec4899", secondary: "#f9a8d4", background: "#160616", style: "gradient", angle: 145, glow: 64 },
  { id: "galaxy", label: "Galaxy", primary: "#818cf8", secondary: "#a855f7", background: "#07051a", style: "cyber_grid", angle: 125, glow: 72 },
  { id: "sunset", label: "Sunset", primary: "#f97316", secondary: "#ec4899", background: "#140606", style: "gradient", angle: 115, glow: 68 },
  { id: "midnight", label: "Midnight", primary: "#6366f1", secondary: "#22d3ee", background: "#050510", style: "solid", angle: 135, glow: 45 },
];

export function buildProfileTheme(profile = {}, fallbackStyle = "default") {
  const preset = THEMES.find(t => t.id === (profile?.profile_theme_style || fallbackStyle)) || THEMES[0];
  const primary = profile?.profile_theme_color || preset.primary;
  const secondary = profile?.profile_theme_secondary || preset.secondary;
  const background = profile?.profile_theme_background || preset.background;
  const angle = Number(profile?.profile_theme_gradient_angle ?? preset.angle);
  const glow = Number(profile?.profile_theme_neon_intensity ?? preset.glow);
  const style = profile?.profile_theme_background_style || preset.style;
  const bg = style === "solid" ? background : `linear-gradient(${angle}deg, ${background}, ${primary}33 48%, ${secondary}26 100%)`;
  const grid = style === "cyber_grid" ? "linear-gradient(rgba(139,92,246,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.12) 1px, transparent 1px)" : "none";
  return { primary, secondary, background, angle, glow, style, bg, grid, cta: `linear-gradient(${angle}deg, ${primary}, ${secondary})`, border: `0 0 ${Math.max(8, glow / 2)}px ${primary}${Math.round(Math.min(95, glow) * 2.2).toString(16).padStart(2, "0")}` };
}

export default function ChannelThemePicker({ profile, currentTheme, onSelect, onSaved }) {
  const [open, setOpen] = useState(false);
  const baseTheme = buildProfileTheme(profile, currentTheme);
  const [form, setForm] = useState({ profile_theme_style: profile?.profile_theme_style || currentTheme || "default", profile_theme_color: baseTheme.primary, profile_theme_secondary: baseTheme.secondary, profile_theme_background: baseTheme.background, profile_theme_background_style: baseTheme.style, profile_theme_gradient_angle: baseTheme.angle, profile_theme_neon_intensity: baseTheme.glow });
  const [saving, setSaving] = useState(false);

  const applyPreset = (theme) => {
    setForm({ profile_theme_style: theme.id, profile_theme_color: theme.primary, profile_theme_secondary: theme.secondary, profile_theme_background: theme.background, profile_theme_background_style: theme.style, profile_theme_gradient_angle: theme.angle, profile_theme_neon_intensity: theme.glow });
    onSelect?.(theme.id);
  };

  const saveTheme = async () => {
    if (!profile?.id) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, form);
    onSaved?.({ ...profile, ...form });
    onSelect?.(form.profile_theme_style);
    setSaving(false);
    setOpen(false);
  };

  const preview = buildProfileTheme(form, form.profile_theme_style);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:border-purple-500/50 hover:text-purple-300 transition-colors">
        <Palette className="w-3.5 h-3.5" /> Theme
        <span className="w-3 h-3 rounded-full" style={{ background: preview.primary, boxShadow: `0 0 10px ${preview.primary}` }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[min(92vw,420px)] bg-gray-950 border border-purple-700/40 rounded-2xl p-4 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-black text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-300" /> Channel Theme Studio</p>
                <p className="text-gray-500 text-xs">Customize your profile and listing landing look.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="rounded-2xl p-4 mb-4 border border-white/10" style={{ background: preview.bg, boxShadow: preview.border, backgroundImage: preview.grid, backgroundSize: "36px 36px" }}>
              <p className="text-white font-black text-lg">Live Preview</p>
              <button className="mt-3 px-4 py-2 rounded-xl text-white text-xs font-black" style={{ background: preview.cta, boxShadow: preview.border }}>Gradient CTA</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {THEMES.map(theme => (
                <button key={theme.id} onClick={() => applyPreset(theme)} className={`relative p-3 rounded-xl border text-left ${form.profile_theme_style === theme.id ? "border-purple-400" : "border-gray-800 hover:border-gray-700"}`} style={{ background: `linear-gradient(135deg, ${theme.background}, ${theme.primary}44, ${theme.secondary}33)` }}>
                  {form.profile_theme_style === theme.id && <Check className="absolute top-2 right-2 w-4 h-4 text-white" />}
                  <p className="text-white text-xs font-black">{theme.label}</p>
                  <div className="flex gap-1 mt-2"><span className="w-5 h-5 rounded-full" style={{ background: theme.primary }} /><span className="w-5 h-5 rounded-full" style={{ background: theme.secondary }} /></div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[["Primary", "profile_theme_color"], ["Secondary", "profile_theme_secondary"], ["Background", "profile_theme_background"]].map(([label, key]) => (
                <label key={key} className="text-gray-400 text-xs font-bold">{label}<input type="color" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value, profile_theme_style: "custom" }))} className="mt-1 w-full h-10 rounded-lg bg-gray-900 border border-gray-800" /></label>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-gray-400 text-xs font-bold block">Background Style
                <select value={form.profile_theme_background_style} onChange={e => setForm(f => ({ ...f, profile_theme_background_style: e.target.value, profile_theme_style: "custom" }))} className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs">
                  <option value="solid">Solid color</option>
                  <option value="gradient">Gradient fade</option>
                  <option value="cyber_grid">Cyber-grid matrix</option>
                </select>
              </label>
              <label className="text-gray-400 text-xs font-bold block">Gradient Angle: {form.profile_theme_gradient_angle}°
                <input type="range" min="0" max="360" value={form.profile_theme_gradient_angle} onChange={e => setForm(f => ({ ...f, profile_theme_gradient_angle: Number(e.target.value), profile_theme_style: "custom" }))} className="w-full accent-purple-500" />
              </label>
              <label className="text-gray-400 text-xs font-bold block">Neon Glow Intensity: {form.profile_theme_neon_intensity}%
                <input type="range" min="0" max="100" value={form.profile_theme_neon_intensity} onChange={e => setForm(f => ({ ...f, profile_theme_neon_intensity: Number(e.target.value), profile_theme_style: "custom" }))} className="w-full accent-pink-500" />
              </label>
            </div>

            <button onClick={saveTheme} disabled={saving} className="mt-4 w-full py-3 rounded-xl text-white text-sm font-black disabled:opacity-50" style={{ background: preview.cta, boxShadow: preview.border }}>{saving ? "Saving Theme..." : "Save Channel + Listing Theme"}</button>
          </div>
        </>
      )}
    </div>
  );
}

export { THEMES };