import React, { useEffect, useState } from "react";
import { Megaphone, Ban, Save, CheckCircle, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

const SETTINGS_KEY = "html_ad";

// Admin-only manager for the global HTML/JS ad code shown to all users after 5 min.
// Admin (kevinarnold522@gmail.com) can permanently block/ban all HTML ad codes.
export default function HtmlAdManager({ user }) {
  const [row, setRow] = useState(null);
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const admin = isAdmin(user?.email);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: SETTINGS_KEY })
      .then((rows) => {
        const r = rows?.[0];
        if (r) {
          setRow(r);
          setCode(r.ad_html_code || "");
          setEnabled(r.ad_enabled !== false);
        }
      })
      .catch(() => {});
  }, []);

  if (!admin) return null;

  const persist = async (nextEnabled, nextCode) => {
    setSaving(true);
    setSaved(false);
    const payload = { key: SETTINGS_KEY, ad_html_code: nextCode, ad_enabled: nextEnabled };
    try {
      if (row?.id) {
        await base44.entities.SiteSettings.update(row.id, payload);
      } else {
        const created = await base44.entities.SiteSettings.create(payload);
        setRow(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e?.message || "Could not save ad settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => persist(enabled, code);
  const handleToggleBan = () => {
    const next = !enabled;
    setEnabled(next);
    persist(next, code);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-pink-400" /> Global HTML Ad Code
      </h3>
      <p className="text-gray-500 text-xs">Paste raw HTML/JS ad code. It shows to all users 5 minutes after they visit.</p>

      <div className={`flex items-center justify-between rounded-xl border p-4 ${enabled ? "bg-green-900/15 border-green-700/40" : "bg-red-900/20 border-red-700/50"}`}>
        <div className="flex items-center gap-2">
          {enabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
          <span className={`text-sm font-bold ${enabled ? "text-green-300" : "text-red-300"}`}>
            {enabled ? "Ads are ACTIVE" : "Ads are PERMANENTLY BLOCKED"}
          </span>
        </div>
        <button onClick={handleToggleBan} disabled={saving}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50 ${enabled ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
          <Ban className="w-3.5 h-3.5" /> {enabled ? "Block & Ban All Ad Codes" : "Re-enable Ads"}
        </button>
      </div>

      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={6}
        placeholder="<script>...</script> or any HTML ad code"
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 text-sm font-mono resize-none" />

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-50">
        <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Ad Code"}
      </button>
    </div>
  );
}