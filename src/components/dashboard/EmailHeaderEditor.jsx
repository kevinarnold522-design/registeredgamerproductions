import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Save, Eye, RefreshCw } from "lucide-react";

const DEFAULTS = {
  email_header_title: "Welcome to GAMER Productions!",
  email_header_subtitle: "The #1 Gaming Hub Community",
  email_header_tagline: "Level Up. Connect. Dominate.",
  email_banner_color_start: "#7c3aed",
  email_banner_color_end: "#ec4899",
};

export default function EmailHeaderEditor() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const load = async () => {
      const rows = await base44.entities.SiteSettings.filter({ key: "welcome_email" });
      if (rows.length > 0) {
        setSettingsId(rows[0].id);
        setSettings({ ...DEFAULTS, ...rows[0] });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (settingsId) {
      await base44.entities.SiteSettings.update(settingsId, { ...settings, key: "welcome_email" });
    } else {
      const created = await base44.entities.SiteSettings.create({ ...settings, key: "welcome_email" });
      setSettingsId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const gradient = `linear-gradient(135deg, ${settings.email_banner_color_start}, ${settings.email_banner_color_end})`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
          <Mail className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Welcome Email Header</h3>
          <p className="text-gray-500 text-xs">Customize the banner shown in new user welcome emails</p>
        </div>
        <button onClick={() => setPreview(!preview)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:text-white transition-colors">
          <Eye className="w-3.5 h-3.5" />
          {preview ? "Hide Preview" : "Preview Email"}
        </button>
      </div>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Header Title</label>
          <input value={settings.email_header_title}
            onChange={e => setSettings(s => ({ ...s, email_header_title: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            placeholder="Welcome to GAMER Productions!" />
        </div>
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Subtitle</label>
          <input value={settings.email_header_subtitle}
            onChange={e => setSettings(s => ({ ...s, email_header_subtitle: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            placeholder="The #1 Gaming Hub Community" />
        </div>
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Tagline</label>
          <input value={settings.email_header_tagline}
            onChange={e => setSettings(s => ({ ...s, email_header_tagline: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            placeholder="Level Up. Connect. Dominate." />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Banner Color Start</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.email_banner_color_start}
                onChange={e => setSettings(s => ({ ...s, email_banner_color_start: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer" />
              <input value={settings.email_banner_color_start}
                onChange={e => setSettings(s => ({ ...s, email_banner_color_start: e.target.value }))}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Banner Color End</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.email_banner_color_end}
                onChange={e => setSettings(s => ({ ...s, email_banner_color_end: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer" />
              <input value={settings.email_banner_color_end}
                onChange={e => setSettings(s => ({ ...s, email_banner_color_end: e.target.value }))}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Email Header"}
      </button>

      {/* Live Email Preview */}
      {preview && (
        <div className="mt-4 rounded-2xl border border-purple-700/30 overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 text-gray-400 text-xs font-semibold flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> Email Preview
          </div>
          <div className="bg-gray-100 p-4">
            <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif", background: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
              {/* Banner */}
              <div style={{ background: gradient, padding: "40px 30px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎮</div>
                <div style={{ color: "white", fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>{settings.email_header_title}</div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6 }}>{settings.email_header_subtitle}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>{settings.email_header_tagline}</div>
              </div>
              {/* Body Preview */}
              <div style={{ padding: "28px 30px", background: "#111827" }}>
                <div style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Congratulations, [Username]! 🎉</div>
                <div style={{ color: "#f3f4f6", fontSize: 15, lineHeight: 1.7 }}>Your journey in the GAMER Productions community begins now. Explore games, gear, mods, and connect with thousands of gamers worldwide.</div>
              </div>
              {/* Footer preview */}
              <div style={{ background: "#0f172a", padding: "16px 30px", textAlign: "center" }}>
                <div style={{ color: "#6b7280", fontSize: 11 }}>© 2026 GAMER Productions · Founded by Kevin Roberto</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}