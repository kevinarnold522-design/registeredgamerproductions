import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, Mail, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NATIONS = [
  "Philippines","United States","United Kingdom","Australia","Canada","India","Japan","South Korea",
  "Brazil","Mexico","Germany","France","Spain","Italy","Netherlands","Indonesia","Malaysia",
  "Singapore","Thailand","Vietnam","Nigeria","South Africa","United Arab Emirates","Saudi Arabia","Other"
];

export default function EditProfileModal({ profile, user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: profile?.username || "",
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.username.trim()) { setError("Username is required"); return; }
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        username: form.username.trim(),
        display_name: form.display_name.trim() || form.username.trim(),
        bio: form.bio.trim(),
        location: form.location,
      });
      onSaved?.({ ...profile, ...form });
      onClose();
    } catch (e) {
      setError(e.message || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-black text-xl">Edit Profile</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                  placeholder="yourusername"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Display Name (First + Last) */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Display Name (First &amp; Last)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Email — read-only display */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-gray-600 text-[10px] mt-1">Email is managed by your login provider</p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell the world about yourself..."
                rows={3}
                maxLength={200}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />
              <p className="text-gray-600 text-[10px] text-right">{form.bio.length}/200</p>
            </div>

            {/* Nation */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">
                <Globe className="w-3 h-3 inline mr-1" />Nation
              </label>
              <select
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Select your nation...</option>
                {NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}