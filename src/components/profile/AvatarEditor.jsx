import React, { useState, useRef } from "react";
import { Camera, Trash2, Upload, Smile, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import AvatarPickerModal from "@/components/community/AvatarPickerModal";
import MultiAvatarDisplay from "@/components/shared/MultiAvatarDisplay";

/**
 * AvatarEditor — supports multiple profile pictures with slide transition.
 * Stored as profile.avatar_urls (array) + profile.avatar_url (current/primary).
 */
export default function AvatarEditor({ profile, onUpdated, user }) {
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const fileRef = useRef(null);

  // Merge avatar_url into avatar_urls array
  const allAvatars = (() => {
    const arr = profile?.avatar_urls || [];
    const primary = profile?.avatar_url;
    if (primary && !arr.includes(primary)) return [primary, ...arr];
    return arr.length > 0 ? arr : primary ? [primary] : [];
  })();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setShowMenu(false);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // Add to avatar_urls array
    const newUrls = [file_url, ...allAvatars.filter(u => u !== file_url)].slice(0, 6);
    await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url, avatar_urls: newUrls });
    onUpdated({ ...profile, avatar_url: file_url, avatar_urls: newUrls });
    setUploading(false);
    e.target.value = "";
  };

  const handleRemoveOne = async (url) => {
    const newUrls = allAvatars.filter(u => u !== url);
    const newPrimary = newUrls[0] || "";
    await base44.entities.UserProfile.update(profile.id, { avatar_url: newPrimary, avatar_urls: newUrls });
    onUpdated({ ...profile, avatar_url: newPrimary, avatar_urls: newUrls });
  };

  const handleSetPrimary = async (url) => {
    const newUrls = [url, ...allAvatars.filter(u => u !== url)];
    await base44.entities.UserProfile.update(profile.id, { avatar_url: url, avatar_urls: newUrls });
    onUpdated({ ...profile, avatar_url: url, avatar_urls: newUrls });
    setShowGallery(false);
  };

  return (
    <div className="relative inline-block">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* Avatar with multi-transition */}
      <div
        className="relative w-20 h-20 cursor-pointer"
        onClick={() => !showGallery && setShowMenu(s => !s)}
      >
        <MultiAvatarDisplay images={allAvatars} size={80} rounded="rounded-2xl" interval={3000} showDots={allAvatars.length > 1} />

        {/* Camera overlay */}
        <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera className="w-5 h-5 text-white" />
          }
        </div>

        {/* Count badge */}
        {allAvatars.length > 1 && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-600 border-2 border-gray-950 flex items-center justify-center text-[9px] text-white font-black">
            {allAvatars.length}
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden w-56">
            <button onClick={() => { setShowMenu(false); setShowAvatarPicker(true); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-white text-sm hover:bg-gray-800 transition-colors">
              <Smile className="w-4 h-4 text-purple-400" /> 🎭 Animated Avatars
            </button>
            <button onClick={() => { setShowMenu(false); fileRef.current?.click(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-white text-sm hover:bg-gray-800 transition-colors">
              <Upload className="w-4 h-4 text-blue-400" /> Upload Photo
              <span className="ml-auto text-gray-600 text-xs">+add</span>
            </button>
            {allAvatars.length > 1 && (
              <button onClick={() => { setShowMenu(false); setShowGallery(true); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-white text-sm hover:bg-gray-800 transition-colors">
                <ChevronLeft className="w-4 h-4 text-cyan-400" /><ChevronRight className="w-4 h-4 text-cyan-400" /> Manage Photos ({allAvatars.length})
              </button>
            )}
            {allAvatars.length > 0 && (
              <button onClick={() => { setShowMenu(false); handleRemoveOne(allAvatars[0]); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 text-sm hover:bg-gray-800 transition-colors">
                <Trash2 className="w-4 h-4" /> Remove Current
              </button>
            )}
          </div>
        </>
      )}

      {/* Gallery management modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.9)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowGallery(false)}>
            <motion.div className="bg-gray-950 border border-purple-700/40 rounded-2xl p-5 w-full max-w-sm"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-sm">Manage Profile Photos</h3>
                <button onClick={() => setShowGallery(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <p className="text-gray-500 text-xs mb-3">Tap to set as primary · up to 6 photos. They transition automatically on your profile.</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {allAvatars.map((url, i) => (
                  <div key={url} className="relative group">
                    <img src={url} className={`w-full aspect-square object-cover rounded-xl cursor-pointer border-2 transition-all ${i === 0 ? "border-purple-500" : "border-gray-700 hover:border-purple-400"}`}
                      onClick={() => handleSetPrimary(url)} alt="" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[8px] bg-purple-600 text-white font-black px-1 rounded">★ Primary</span>
                    )}
                    <button onClick={() => handleRemoveOne(url)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {allAvatars.length < 6 && (
                  <button onClick={() => { setShowGallery(false); fileRef.current?.click(); }}
                    className="aspect-square rounded-xl border-2 border-dashed border-purple-700/50 hover:border-purple-500 bg-purple-950/20 flex flex-col items-center justify-center gap-1 transition-all">
                    <Plus className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 text-[9px] font-bold">Add</span>
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-[10px] text-center">Photos auto-transition every 3 seconds on your public profile</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Avatar Picker */}
      <AnimatePresence>
        {showAvatarPicker && (
          <AvatarPickerModal user={user} profile={profile} onClose={() => setShowAvatarPicker(false)}
            onSelect={(url) => {
              const newUrls = [url, ...allAvatars.filter(u => u !== url)].slice(0, 6);
              onUpdated({ ...profile, avatar_url: url, avatar_urls: newUrls });
              base44.entities.UserProfile.update(profile.id, { avatar_url: url, avatar_urls: newUrls });
            }} />
        )}
      </AnimatePresence>
    </div>
  );
}