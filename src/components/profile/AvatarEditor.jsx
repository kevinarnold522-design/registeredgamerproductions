import React, { useState, useRef } from "react";
import { Camera, Trash2, Upload, X, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AvatarEditor({ profile, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setShowMenu(false);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      onUpdated({ ...profile, avatar_url: file_url });
    } catch (err) {
      console.error("Avatar upload failed", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleRemove = async () => {
    setShowMenu(false);
    setUploading(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { avatar_url: "" });
      onUpdated({ ...profile, avatar_url: "" });
    } catch {}
    setUploading(false);
  };

  return (
    <div className="relative inline-block">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* Avatar */}
      <div
        className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center cursor-pointer border-2 border-gray-700 hover:border-purple-500 transition-colors"
        onClick={() => setShowMenu(s => !s)}
      >
        {uploading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{profile?.username?.[0]?.toUpperCase() || "🎮"}</span>
        )}
        {/* Camera overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden w-44">
            <button
              onClick={() => { setShowMenu(false); fileRef.current?.click(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-white text-sm hover:bg-gray-800 transition-colors"
            >
              <Upload className="w-4 h-4 text-purple-400" /> Upload Photo
            </button>
            {profile?.avatar_url && (
              <button
                onClick={handleRemove}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 text-sm hover:bg-gray-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remove Photo
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}