import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Eye, UserX, Shield, Sparkles, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createManagedAccountProfile, listManagedAccounts, startManagedAccountSession } from "@/lib/managedAccounts";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import { toast } from "sonner";
import { isAdmin } from "@/lib/constants";

export default function GhostAccountsPanel() {
  const [ghosts, setGhosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGhost, setNewGhost] = useState({
    email: "",
    username: "",
    display_name: "",
    account_type: "regular",
    avatar_url: "",
  });
  const [creating, setCreating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    base44.auth.me().then((user) => {
      if (user) setCurrentUser(user);
    }).catch(() => {});
    loadGhosts();
  }, []);

  const loadGhosts = async () => {
    try {
      const rows = await listManagedAccounts();
      setGhosts(rows);
    } catch (e) {
      toast.error("Failed to load managed accounts");
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newGhost.username) {
      toast.error("Username required");
      return;
    }

    setCreating(true);
    try {
      await createManagedAccountProfile(currentUser, newGhost);
      toast.success("Account created! Redirecting to community page...");
      setNewGhost({ email: "", username: "", display_name: "", account_type: "regular", avatar_url: "" });
      setShowCreate(false);
      loadGhosts();

      setTimeout(() => {
        window.location.href = "/gaming-community";
      }, 1500);
    } catch (e) {
      toast.error(e.message || "Failed to create account");
    }
    setCreating(false);
  };

  const handleImpersonate = async (ghost) => {
    try {
      startManagedAccountSession({ currentUser, account: ghost });
      toast.success(`Now managing as ${ghost.username}`);

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e) {
      toast.error(e?.message || "Failed to switch account");
    }
  };

  const handleStopImpersonating = async () => {
    localStorage.removeItem("impersonation_session");
    toast.success("Stopped managing account");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  // Check if currently impersonating
  const [impersonating, setImpersonating] = useState(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("impersonation_session");
      if (stored) {
        setImpersonating(JSON.parse(stored));
      }
    } catch {}
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading accounts...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-bold text-sm">Managed Accounts</h3>
        </div>
        {impersonating && (
          <button onClick={handleStopImpersonating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors">
            <UserX className="w-3.5 h-3.5" /> Stop Managing
          </button>
        )}
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Account
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-950 border border-purple-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold">Create Managed Account</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {newGhost.avatar_url
                      ? <img src={newGhost.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <span className="text-white font-black text-xl">{newGhost.username?.[0]?.toUpperCase() || "?"}</span>}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold text-center hover:border-purple-500 transition-colors">
                      {uploadingAvatar ? "Uploading..." : newGhost.avatar_url ? "Change Profile Picture" : "Upload Profile Picture"}
                    </div>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingAvatar(true);
                        try {
                          const { file_url } = await uploadFileToR2(file, "ghost-avatars");
                          setNewGhost(g => ({ ...g, avatar_url: file_url }));
                        } catch (err) {
                          toast.error("Image upload failed");
                        } finally {
                          setUploadingAvatar(false);
                          e.target.value = "";
                        }
                      }} />
                  </label>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold mb-1 block">Username *</label>
                  <input value={newGhost.username} onChange={e => setNewGhost(g => ({ ...g, username: e.target.value }))}
                    placeholder="shadow_user_1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold mb-1 block">Email (auto-generated if empty)</label>
                  <input value={newGhost.email} onChange={e => setNewGhost(g => ({ ...g, email: e.target.value }))}
                    placeholder="shadow1@gamerproductions.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold mb-1 block">Display Name</label>
                  <input value={newGhost.display_name} onChange={e => setNewGhost(g => ({ ...g, display_name: e.target.value }))}
                    placeholder={newGhost.username}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold mb-1 block">Account Type</label>
                  <select value={newGhost.account_type} onChange={e => setNewGhost(g => ({ ...g, account_type: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                    <option value="regular">Regular</option>
                    <option value="digital_creator">Digital Creator</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleCreate} disabled={creating || uploadingAvatar || !newGhost.username}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold disabled:opacity-50 transition-colors">
                  {creating ? "Creating..." : "Create & Redirect"}
                </button>
                <button onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account List */}
      <div className="divide-y divide-gray-800">
        {ghosts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No managed accounts yet. Create one to test features!
          </div>
        ) : (
          ghosts.map((ghost, i) => (
            <div key={ghost.id || i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {ghost.username?.[0]?.toUpperCase() || "?"}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{ghost.username}</p>
                <p className="text-gray-500 text-[10px] truncate">{ghost.user_email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 font-semibold">
                    {ghost.account_type}
                  </span>
                  {ghost.stats && (
                    <span className="text-[9px] text-gray-600">
                      {ghost.stats.listings} listings · {ghost.stats.posts} posts
                    </span>
                  )}
                </div>
              </div>

              <a href={`/profile?email=${encodeURIComponent(ghost.user_email)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Profile
              </a>
              <button onClick={() => handleImpersonate(ghost)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold transition-colors border border-purple-700/40">
                <Eye className="w-3.5 h-3.5" /> Manage As
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-gray-950/50 border-t border-gray-800">
        <p className="text-gray-500 text-[10px]">
          Managed accounts are real user accounts controlled by admins for testing and community management.
          They appear in total user counts and can post, follow, and interact like regular users.
        </p>
      </div>
    </div>
  );
}