import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Trophy, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";

const PLATFORMS = ["PC", "PlayStation 4", "PlayStation 5", "Xbox One", "Xbox Series X/S", "Nintendo Switch", "Mobile (Android)", "Mobile (iOS)", "Cross-Platform"];
const BRACKET_TYPES = [
  { id: "single_elimination", label: "Single Elimination" },
  { id: "double_elimination", label: "Double Elimination" },
  { id: "round_robin", label: "Round Robin" },
  { id: "swiss", label: "Swiss System" },
];

export default function CreateTournamentModal({ user, profile, franchiseId, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", game: "", game_platform: "PC", description: "", venue: "", is_online: true,
    stream_link: "", max_players: 16, prize_pool: "", entry_fee: 0,
    start_date: "", end_date: "", registration_deadline: "",
    rules: "", bracket_type: "single_elimination", cover_url: "",
    social_facebook: "", social_discord: "", social_youtube: "", contact_info: "",
    franchise_id: franchiseId || "", category: "tournaments",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const coverRef = React.useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await uploadFileToR2(file, "tournament-covers");
    set("cover_url", file_url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.game) return;
    setSaving(true);
    const tournament = await base44.entities.Tournament.create({
      ...form,
      organizer_email: user.email,
      organizer_username: profile?.username || user.full_name,
      participants: [],
      status: "upcoming",
    });
    onCreated?.(tournament);
    onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: "rgba(0,0,0,0.92)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-gray-950 border border-green-700/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl">Create Tournament</h2>
              <p className="text-gray-500 text-xs">Set up your gaming tournament</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Cover */}
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1.5 block">Cover Image</label>
            <div className="flex gap-3 items-center">
              {form.cover_url
                ? <img src={form.cover_url} className="w-20 h-12 rounded-xl object-cover border border-gray-700" alt="" />
                : <div className="w-20 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">🏆</div>
              }
              <button onClick={() => coverRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-green-700/60 bg-green-900/20 text-green-300 text-xs font-bold hover:bg-green-900/40 transition-all">
                <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Upload Cover"}
              </button>
              <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Tournament Name *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="e.g. GAMER Cup Season 1"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Game *</label>
              <input value={form.game} onChange={e => set("game", e.target.value)}
                placeholder="e.g. MLBB, Valorant, FIFA"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Platform</label>
              <select value={form.game_platform} onChange={e => set("game_platform", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Bracket Type</label>
              <select value={form.bracket_type} onChange={e => set("bracket_type", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500">
                {BRACKET_TYPES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>
          </div>

          {/* Online/Offline */}
          <div className="flex gap-3">
            <button onClick={() => set("is_online", true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${form.is_online ? "bg-green-600 border-green-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
              🌐 Online
            </button>
            <button onClick={() => set("is_online", false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${!form.is_online ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
              📍 On-Site / LAN
            </button>
          </div>

          {!form.is_online && (
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Venue Address</label>
              <input value={form.venue} onChange={e => set("venue", e.target.value)}
                placeholder="e.g. SM Mall of Asia Arena, Pasay City"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          )}

          {/* Players & Prize */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Max Players</label>
              <input type="number" value={form.max_players} onChange={e => set("max_players", Number(e.target.value))}
                min={2} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Prize Pool</label>
              <input value={form.prize_pool} onChange={e => set("prize_pool", e.target.value)}
                placeholder="e.g. $5,000 or Trophy"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Entry Fee ($)</label>
              <input type="number" value={form.entry_fee} onChange={e => set("entry_fee", Number(e.target.value))}
                min={0} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Registration Deadline</label>
              <input type="datetime-local" value={form.registration_deadline} onChange={e => set("registration_deadline", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Start Date</label>
              <input type="datetime-local" value={form.start_date} onChange={e => set("start_date", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">End Date</label>
              <input type="datetime-local" value={form.end_date} onChange={e => set("end_date", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Stream */}
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Stream Link (YouTube/Twitch/FB)</label>
            <input value={form.stream_link} onChange={e => set("stream_link", e.target.value)}
              placeholder="https://youtube.com/live/..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Facebook Group</label>
              <input value={form.social_facebook} onChange={e => set("social_facebook", e.target.value)}
                placeholder="https://fb.com/groups/..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">Discord Server</label>
              <input value={form.social_discord} onChange={e => set("social_discord", e.target.value)}
                placeholder="https://discord.gg/..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block">YouTube Channel</label>
              <input value={form.social_youtube} onChange={e => set("social_youtube", e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Description & Rules */}
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
              placeholder="Describe your tournament..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 resize-none" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Rules & Format</label>
            <textarea value={form.rules} onChange={e => set("rules", e.target.value)} rows={3}
              placeholder="Tournament rules, format details, code of conduct..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 resize-none" />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Contact Info</label>
            <input value={form.contact_info} onChange={e => set("contact_info", e.target.value)}
              placeholder="Messenger, WhatsApp, email..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
          </div>

          <button onClick={handleSubmit} disabled={saving || !form.title || !form.game}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm disabled:opacity-50 transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #16a34a, #059669)" }}>
            {saving ? "Creating..." : "🏆 Create Tournament"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}