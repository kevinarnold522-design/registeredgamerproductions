import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, CheckCircle } from "lucide-react";

const SOCIALS = [
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourprofile",
    icon: "f",
    color: "#1877f2",
    bg: "#0d1b2e",
    border: "#1877f2",
    glow: "rgba(24,119,242,0.5)",
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
    icon: "📸",
    color: "#e1306c",
    bg: "#1a0010",
    border: "#e1306c",
    glow: "rgba(225,48,108,0.5)",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    placeholder: "+639XXXXXXXXX or https://wa.me/...",
    icon: "💬",
    color: "#25d366",
    bg: "#001a0a",
    border: "#25d366",
    glow: "rgba(37,211,102,0.5)",
  },
  {
    id: "telegram",
    label: "Telegram",
    placeholder: "@yourusername or https://t.me/...",
    icon: "✈️",
    color: "#229ed9",
    bg: "#00111a",
    border: "#229ed9",
    glow: "rgba(34,158,217,0.5)",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
    icon: "▶",
    color: "#ff0000",
    bg: "#1a0000",
    border: "#ff0000",
    glow: "rgba(255,0,0,0.4)",
  },
  {
    id: "kofi",
    label: "Ko-fi",
    placeholder: "https://ko-fi.com/yourusername",
    icon: "☕",
    color: "#ff6347",
    bg: "#1a0a0a",
    border: "#ff6347",
    glow: "rgba(255,99,71,0.5)",
  },
  {
    id: "buymeacoffee",
    label: "Buy Me a Coffee",
    placeholder: "https://buymeacoffee.com/yourusername",
    icon: "💛",
    color: "#ffdd00",
    bg: "#1a1500",
    border: "#ffdd00",
    glow: "rgba(255,221,0,0.5)",
  },
];

export default function SocialLinksPanel({ profile, isOwnProfile, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [links, setLinks] = useState(profile?.social_links || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Also save kofi and buymeacoffee to their dedicated fields
    const updates = { social_links: links };
    if (links.kofi) updates.kofi_url = links.kofi;
    if (links.buymeacoffee) updates.buymeacoffee_url = links.buymeacoffee;
    await base44.entities.UserProfile.update(profile.id, updates);
    onUpdated({ ...profile, social_links: links, kofi_url: links.kofi || profile.kofi_url, buymeacoffee_url: links.buymeacoffee || profile.buymeacoffee_url });
    setSaving(false);
    setEditing(false);
  };

  const linked = SOCIALS.filter(s => links[s.id]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🌐</span>
          <h3 className="text-white font-bold text-sm">Social Links</h3>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs px-3 py-1.5 rounded-lg border border-pink-700/50 text-pink-400 hover:bg-pink-900/20 transition-colors font-semibold"
          >
            {editing ? "Cancel" : "Link Socials"}
          </button>
        )}
      </div>

      {!editing && linked.length === 0 && isOwnProfile && (
        <p className="text-gray-600 text-xs">Link your social accounts to show them on your profile.</p>
      )}

      {!editing && linked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linked.map(s => (
            <a
              key={s.id}
              href={links[s.id].startsWith("http") ? links[s.id] : `https://${links[s.id]}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: s.bg,
                border: `1.5px solid ${s.border}`,
                boxShadow: `0 0 8px ${s.glow}`,
                borderRadius: 10,
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
              }}
            >
              <span style={{ color: s.color, fontWeight: "bold", fontSize: 13 }}>{s.icon}</span>
              <span className="text-white text-xs font-bold">{s.label}</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          ))}
        </div>
      )}

      {editing && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          {SOCIALS.map(s => (
            <div key={s.id} className="flex items-center gap-3">
              <div
                style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: s.bg,
                  border: `1.5px solid ${s.border}`,
                  boxShadow: `0 0 6px ${s.glow}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 14, color: s.color, fontWeight: "bold",
                }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold mb-1">{s.label}</p>
                <input
                  value={links[s.id] || ""}
                  onChange={e => setLinks({ ...links, [s.id]: e.target.value })}
                  placeholder={s.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
              {links[s.id] && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 mt-2"
            style={{ background: "linear-gradient(135deg, #1877f2, #e1306c)" }}
          >
            {saving ? "Saving..." : "Save Social Links"}
          </button>
        </div>
      )}
    </div>
  );
}