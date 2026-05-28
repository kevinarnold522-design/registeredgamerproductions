import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Upload, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Free animated emoji avatars (CSS animated via keyframes)
export const FREE_AVATARS = [
  // Animals
  { id: "dog-wag", emoji: "🐕", label: "Happy Dog", category: "Animals", anim: "bounce" },
  { id: "cat-blink", emoji: "😸", label: "Grinning Cat", category: "Animals", anim: "pulse" },
  { id: "fox", emoji: "🦊", label: "Fox", category: "Animals", anim: "sway" },
  { id: "wolf", emoji: "🐺", label: "Wolf", category: "Animals", anim: "howl" },
  { id: "lion", emoji: "🦁", label: "Lion", category: "Animals", anim: "roar" },
  { id: "tiger", emoji: "🐯", label: "Tiger", category: "Animals", anim: "bounce" },
  { id: "panda", emoji: "🐼", label: "Panda", category: "Animals", anim: "pulse" },
  { id: "monkey", emoji: "🐵", label: "Monkey", category: "Animals", anim: "sway" },
  // Basketball
  { id: "baller1", emoji: "🏀", label: "Baller", category: "Basketball", anim: "spin" },
  { id: "baller2", emoji: "⛹️", label: "Player", category: "Basketball", anim: "bounce" },
  { id: "bball-fire", emoji: "🔥", label: "On Fire", category: "Basketball", anim: "pulse" },
  // Cartoons
  { id: "robot", emoji: "🤖", label: "Robot", category: "Cartoons", anim: "sway" },
  { id: "alien", emoji: "👽", label: "Alien", category: "Cartoons", anim: "pulse" },
  { id: "ghost", emoji: "👻", label: "Ghost", category: "Cartoons", anim: "float" },
  { id: "ninja", emoji: "🥷", label: "Ninja", category: "Cartoons", anim: "bounce" },
  { id: "wizard", emoji: "🧙", label: "Wizard", category: "Cartoons", anim: "spin" },
  { id: "dragon", emoji: "🐲", label: "Dragon", category: "Cartoons", anim: "roar" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn", category: "Cartoons", anim: "float" },
  // Standard celebrity faces
  { id: "celeb1", emoji: "🕶️", label: "Cool Cat", category: "Celebrity", anim: "sway" },
  { id: "celeb2", emoji: "🎤", label: "Rockstar", category: "Celebrity", anim: "pulse" },
  { id: "celeb3", emoji: "🏆", label: "Champion", category: "Celebrity", anim: "bounce" },
];

// Premium avatars — locked behind paywall / reward tiers
export const PREMIUM_AVATARS = [
  { id: "messi", emoji: "⚽", label: "Messi 3D", category: "Footballers", price: 2, desc: "Lionel Messi animated 3D head" },
  { id: "ronaldo", emoji: "🦁", label: "Ronaldo 3D", category: "Footballers", price: 2, desc: "Cristiano Ronaldo animated 3D head" },
  { id: "neymar", emoji: "✨", label: "Neymar 3D", category: "Footballers", price: 2, desc: "Neymar Jr animated 3D head" },
  { id: "mbappe", emoji: "⚡", label: "Mbappé 3D", category: "Footballers", price: 2, desc: "Kylian Mbappé animated 3D head" },
  { id: "lebron", emoji: "🏀", label: "LeBron 3D", category: "Athletes", price: 2, desc: "LeBron James animated 3D head" },
  { id: "curry", emoji: "🎯", label: "Curry 3D", category: "Athletes", price: 2, desc: "Stephen Curry animated 3D head" },
  { id: "mayweather", emoji: "🥊", label: "Mayweather 3D", category: "Athletes", price: 2, desc: "Floyd Mayweather animated 3D head" },
  { id: "usain-bolt", emoji: "⚡", label: "Bolt 3D", category: "Athletes", price: 2, desc: "Usain Bolt animated 3D head" },
];

const ANIM_CLASSES = {
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  spin: "animate-spin",
  sway: "animate-[sway_1.5s_ease-in-out_infinite]",
  float: "animate-[float_2s_ease-in-out_infinite]",
  roar: "animate-[roar_0.8s_ease-in-out_infinite]",
  howl: "animate-pulse",
};

const CATEGORIES = ["All", "Animals", "Basketball", "Cartoons", "Celebrity", "Footballers", "Athletes"];

export default function AvatarPickerModal({ user, profile, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState("free");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [unlockedIds, setUnlockedIds] = useState(new Set());
  const [uploadedUrl, setUploadedUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(profile?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const fileRef = React.useRef(null);

  // Check which premium avatars user has unlocked (stored on profile)
  useEffect(() => {
    const unlocked = profile?.gaming_accounts?.unlocked_avatars || [];
    setUnlockedIds(new Set(unlocked));
  }, [profile]);

  const filteredFree = selectedCategory === "All"
    ? FREE_AVATARS
    : FREE_AVATARS.filter(a => a.category === selectedCategory);

  const filteredPremium = selectedCategory === "All" || selectedCategory === "Footballers" || selectedCategory === "Athletes"
    ? PREMIUM_AVATARS.filter(a => selectedCategory === "All" || a.category === selectedCategory)
    : [];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
    setSelected(file_url);
    setUploading(false);
  };

  const handleSelectEmoji = (avatar) => {
    // Store as special emoji avatar URL format
    setSelected(`emoji:${avatar.id}:${avatar.emoji}`);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    let avatarUrl = selected;
    // If emoji format, we use the emoji itself as the identifier (stored in avatar_url)
    if (selected.startsWith("emoji:")) {
      avatarUrl = selected; // stored as "emoji:id:🐕"
    }
    if (profile?.id) {
      await base44.entities.UserProfile.update(profile.id, { avatar_url: avatarUrl });
    }
    onSelect?.(avatarUrl);
    onClose?.();
    setSaving(false);
  };

  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.95)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="w-full max-w-lg bg-gray-950 rounded-3xl overflow-hidden border border-purple-700/40"
        style={{ maxHeight: "88vh", boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1a0a2a, #0a1040)" }}>
          <div>
            <h2 className="text-white font-black text-lg">🎭 Avatar Picker</h2>
            <p className="text-gray-500 text-xs mt-0.5">Choose your animated profile face</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {["free", "premium", "upload"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
              {tab === "free" ? "🆓 Free Animated" : tab === "premium" ? "⭐ Premium 3D" : "📸 Upload"}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1" style={{ maxHeight: "60vh" }}>
          {/* Category filter */}
          {activeTab !== "upload" && (
            <div className="flex gap-1.5 px-4 py-3 overflow-x-auto">
              {CATEGORIES.filter(c => {
                if (activeTab === "free") return !["Footballers", "Athletes"].includes(c);
                if (activeTab === "premium") return c === "All" || ["Footballers", "Athletes"].includes(c);
                return true;
              }).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${selectedCategory === cat ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* FREE avatars */}
          {activeTab === "free" && (
            <div className="px-4 pb-4">
              <p className="text-gray-600 text-xs mb-3">
                Unlock by sharing a 15-min gameplay clip, or select any free animated emoji now.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {filteredFree.map(avatar => {
                  const isSelected = selected === `emoji:${avatar.id}:${avatar.emoji}`;
                  return (
                    <button key={avatar.id} onClick={() => handleSelectEmoji(avatar)}
                      className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${isSelected ? "border-purple-500 bg-purple-900/30" : "border-gray-800 bg-gray-900 hover:border-purple-600/50"}`}>
                      <span className={`text-3xl ${ANIM_CLASSES[avatar.anim] || "animate-pulse"}`}
                        style={{ display: "inline-block" }}>
                        {avatar.emoji}
                      </span>
                      <span className="text-gray-400 text-[9px] font-semibold truncate w-full text-center">{avatar.label}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-500">
                🎮 <strong className="text-purple-400">Gameplay Unlock:</strong> Share a 15-minute gameplay clip to unlock exclusive animal & cartoon 3D faces.
              </div>
            </div>
          )}

          {/* PREMIUM avatars */}
          {activeTab === "premium" && (
            <div className="px-4 pb-4">
              <p className="text-gray-600 text-xs mb-3">
                Exclusive 3D animated footballer & athlete heads. Available via marketplace or premium reward tiers.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(filteredPremium.length ? filteredPremium : PREMIUM_AVATARS).map(avatar => {
                  const isUnlocked = unlockedIds.has(avatar.id);
                  const isSelected = selected === `emoji:${avatar.id}:${avatar.emoji}`;
                  return (
                    <button key={avatar.id}
                      onClick={() => isUnlocked ? handleSelectEmoji(avatar) : null}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isUnlocked ? (isSelected ? "border-purple-500 bg-purple-900/30" : "border-gray-700 bg-gray-900 hover:border-purple-600/50") : "border-gray-800 bg-gray-900/50 cursor-not-allowed opacity-70"}`}>
                      <div className="relative">
                        <span className={`text-4xl ${isUnlocked ? "animate-pulse" : ""}`}
                          style={{ display: "inline-block", filter: isUnlocked ? "none" : "grayscale(1)" }}>
                          {avatar.emoji}
                        </span>
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold">{avatar.label}</p>
                        <p className="text-gray-500 text-[10px]">{avatar.desc}</p>
                        {!isUnlocked && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full bg-yellow-900/40 border border-yellow-600/40 text-yellow-400 text-[9px] font-black">
                            💰 ${avatar.price} or Premium Tier
                          </span>
                        )}
                        {isUnlocked && (
                          <span className="text-green-400 text-[9px] font-black">✓ Unlocked</span>
                        )}
                      </div>
                      {isSelected && isUnlocked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* UPLOAD */}
          {activeTab === "upload" && (
            <div className="px-4 py-6 flex flex-col items-center gap-4">
              {uploadedUrl && !uploadedUrl.startsWith("emoji:") ? (
                <div className="relative">
                  <img src={uploadedUrl} className="w-32 h-32 rounded-full object-cover border-4 border-purple-600" alt="" />
                  <div
                    className={`absolute inset-0 rounded-full border-4 ${selected === uploadedUrl ? "border-purple-500" : "border-transparent"} flex items-center justify-center cursor-pointer`}
                    onClick={() => setSelected(uploadedUrl)}>
                    {selected === uploadedUrl && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center text-4xl">
                  😶
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-purple-700/50 hover:border-purple-500 text-purple-300 text-sm font-bold transition-all">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Profile Photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <p className="text-gray-600 text-xs text-center">
                Upload any image as your profile picture.<br />
                Accepted: JPG, PNG, GIF (animated supported)
              </p>
              {uploadedUrl && !uploadedUrl.startsWith("emoji:") && (
                <button onClick={() => setSelected(uploadedUrl)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selected === uploadedUrl ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-purple-900/40"}`}>
                  {selected === uploadedUrl ? "✓ Selected" : "Use This Photo"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-sm hover:bg-gray-800 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!selected || saving}
            className="flex-1 py-3 rounded-xl font-black text-white text-sm disabled:opacity-50 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            {saving ? "Saving..." : "Set as Avatar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}