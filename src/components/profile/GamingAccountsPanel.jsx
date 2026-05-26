import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link2, CheckCircle, ExternalLink } from "lucide-react";

const PLATFORMS = [
  {
    id: "steam",
    label: "Steam",
    icon: "🎮",
    color: "#1b2838",
    border: "#4c6b91",
    glow: "rgba(76,107,145,0.6)",
    placeholder: "https://steamcommunity.com/id/yourname",
    linkUrl: "https://steamcommunity.com",
  },
  {
    id: "psn",
    label: "PlayStation Network",
    icon: "🎮",
    emoji: "🟦",
    color: "#003791",
    border: "#0070d1",
    glow: "rgba(0,112,209,0.6)",
    placeholder: "Your PSN ID",
    linkUrl: "https://psnprofiles.com",
  },
  {
    id: "xbox",
    label: "Xbox / GameTag",
    icon: "🎮",
    emoji: "🟩",
    color: "#107c10",
    border: "#52b043",
    glow: "rgba(82,176,67,0.6)",
    placeholder: "Your Xbox Gamertag",
    linkUrl: "https://xboxgamertag.com",
  },
  {
    id: "epic",
    label: "Epic Games",
    icon: "🎮",
    emoji: "🖤",
    color: "#1a1a1a",
    border: "#888",
    glow: "rgba(180,180,180,0.4)",
    placeholder: "Your Epic display name",
    linkUrl: "https://epicgames.com",
  },
  {
    id: "riot",
    label: "Riot Games (LoL / Valorant)",
    icon: "🎮",
    emoji: "🔴",
    color: "#1a0505",
    border: "#c89b3c",
    glow: "rgba(200,155,60,0.5)",
    placeholder: "YourName#TAG",
    linkUrl: "https://account.riotgames.com",
  },
  {
    id: "battlenet",
    label: "Battle.net (Blizzard)",
    icon: "🎮",
    emoji: "💙",
    color: "#00162b",
    border: "#148eff",
    glow: "rgba(20,142,255,0.5)",
    placeholder: "YourName#1234",
    linkUrl: "https://battle.net",
  },
  {
    id: "nintendo",
    label: "Nintendo Switch",
    icon: "🎮",
    emoji: "🔴",
    color: "#2c0000",
    border: "#e60012",
    glow: "rgba(230,0,18,0.5)",
    placeholder: "Friend Code: SW-XXXX-XXXX-XXXX",
    linkUrl: "https://nintendo.com",
  },
];

export default function GamingAccountsPanel({ profile, isOwnProfile, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [accounts, setAccounts] = useState(profile?.gaming_accounts || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, { gaming_accounts: accounts });
    onUpdated({ ...profile, gaming_accounts: accounts });
    setSaving(false);
    setEditing(false);
  };

  const linked = PLATFORMS.filter(p => accounts[p.id]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-bold text-sm">Gaming Accounts</h3>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs px-3 py-1.5 rounded-lg border border-purple-700/50 text-purple-400 hover:bg-purple-900/20 transition-colors font-semibold"
          >
            {editing ? "Cancel" : "Link Accounts"}
          </button>
        )}
      </div>

      {/* Linked platforms display */}
      {!editing && linked.length === 0 && (
        <p className="text-gray-600 text-xs">
          {isOwnProfile ? "Link your gaming accounts to show them on your profile." : "No gaming accounts linked."}
        </p>
      )}

      {!editing && linked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linked.map(p => (
            <div
              key={p.id}
              style={{
                background: p.color,
                border: `1.5px solid ${p.border}`,
                boxShadow: `0 0 8px ${p.glow}`,
                borderRadius: 10,
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{p.emoji || p.icon}</span>
              <span className="text-white text-xs font-bold">{p.label.split(" ")[0]}</span>
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-gray-300 text-[10px] max-w-[100px] truncate">{accounts[p.id]}</span>
              <a href={p.linkUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 text-gray-400 hover:text-white" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          {PLATFORMS.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div
                style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: p.color,
                  border: `1.5px solid ${p.border}`,
                  boxShadow: `0 0 6px ${p.glow}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 14,
                }}
              >
                {p.emoji || "🎮"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold mb-1">{p.label}</p>
                <input
                  value={accounts[p.id] || ""}
                  onChange={e => setAccounts({ ...accounts, [p.id]: e.target.value })}
                  placeholder={p.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {saving ? "Saving..." : "Save Gaming Accounts"}
          </button>
        </div>
      )}
    </div>
  );
}