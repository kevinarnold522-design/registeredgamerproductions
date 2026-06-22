import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Twitch, Users, ArrowRight, CheckCircle, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function YoutubeConnectHighlight({ profile, user, onUpdate }) {
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("yt_connect_dismissed") === "1"
  );

  if (dismissed || profile?.youtube_url) return null;

  const handleSave = async () => {
    if (!youtubeUrl.trim()) return;
    setSaving(true);
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { youtube_url: youtubeUrl });
      if (onUpdate) onUpdate();
    }
    setSaved(true);
    setSaving(false);
  };

  const dismiss = () => {
    localStorage.setItem("yt_connect_dismissed", "1");
    setDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-red-900/30 to-purple-900/30 border border-red-600/40 rounded-2xl p-5 mb-5"
    >
      <button onClick={dismiss} className="absolute top-3 right-3 text-gray-600 hover:text-white">
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <Twitch className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-black text-sm mb-1">
            Connect YouTube & Twitch — Migrate Your Subscribers!
          </h3>
          <p className="text-gray-400 text-xs mb-3 leading-relaxed">
            Link your YouTube or Twitch channel and <strong className="text-white">automatically convert your subscribers into GAMER Productions followers</strong>. Your audience follows you here instantly!
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { icon: "📺", text: "YouTube subscribers → Followers" },
              { icon: "🎮", text: "Twitch followers → Followers" },
              { icon: "👥", text: "Grow your community instantly" },
              { icon: "💰", text: "More followers = more earnings" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {!saved ? (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/c/yourchannel"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 focus:border-red-500 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none"
              />
              <button
                onClick={handleSave}
                disabled={saving || !youtubeUrl.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {saving ? "Saving..." : <><ArrowRight className="w-3 h-3" /> Connect</>}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
              <CheckCircle className="w-4 h-4" />
              YouTube connected! Subscribers syncing as followers.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}