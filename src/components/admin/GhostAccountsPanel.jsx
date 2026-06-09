import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Eye, UserX, Shield, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function GhostAccountsPanel() {
  const [ghosts, setGhosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGhost, setNewGhost] = useState({
    email: "",
    username: "",
    display_name: "",
    account_type: "regular",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGhosts();
  }, []);

  const loadGhosts = async () => {
    try {
      const res = await base44.functions.invoke("adminGhostAccounts", { action: "list_ghosts" });
      setGhosts(res.data.ghosts || []);
    } catch (e) {
      toast.error("Failed to load ghost accounts");
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newGhost.email || !newGhost.username) {
      toast.error("Email and username required");
      return;
    }

    setCreating(true);
    try {
      const email = newGhost.email.includes("@") ? newGhost.email : `${newGhost.email}@ghost.gamerproductions.com`;
      const res = await base44.functions.invoke("adminGhostAccounts", {
        action: "create_ghost",
        ghostData: {
          ...newGhost,
          email,
          display_name: newGhost.display_name || newGhost.username,
        },
      });

      if (res.data.success) {
        toast.success("Ghost account created!");
        setNewGhost({ email: "", username: "", display_name: "", account_type: "regular" });
        setShowCreate(false);
        loadGhosts();
      } else {
        toast.error(res.data.error || "Failed to create");
      }
    } catch (e) {
      toast.error(e.message || "Failed to create ghost account");
    }
    setCreating(false);
  };

  const handleImpersonate = async (ghost) => {
    try {
      const res = await base44.functions.invoke("adminGhostAccounts", {
        action: "impersonate",
        targetEmail: ghost.user_email,
      });
      
      if (res.data.success) {
        // Open profile page as ghost
        window.open(`/profile?email=${encodeURIComponent(ghost.user_email)}`, "_blank");
        toast.success(`Now viewing as ${ghost.username}`);
      }
    } catch (e) {
      toast.error("Failed to impersonate");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading ghost accounts...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-bold text-sm">Ghost Accounts</h3>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Ghost
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
                <h3 className="text-white font-bold">Create Ghost Account</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs font-semibold mb-1 block">Username</label>
                  <input value={newGhost.username} onChange={e => setNewGhost(g => ({ ...g, username: e.target.value }))}
                    placeholder="ghost_user_1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold mb-1 block">Email (optional, auto-generated)</label>
                  <input value={newGhost.email} onChange={e => setNewGhost(g => ({ ...g, email: e.target.value }))}
                    placeholder="ghost1@ghost.gamerproductions.com"
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
                <button onClick={handleCreate} disabled={creating || !newGhost.username}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold disabled:opacity-50 transition-colors">
                  {creating ? "Creating..." : "Create"}
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

      {/* Ghost List */}
      <div className="divide-y divide-gray-800">
        {ghosts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No ghost accounts yet. Create one to test features!
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
                <p className="text-gray-600 text-[9px] mt-0.5">{ghost.account_type}</p>
              </div>

              <button onClick={() => handleImpersonate(ghost)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-gray-950/50 border-t border-gray-800">
        <p className="text-gray-500 text-[10px]">
          Ghost accounts are dummy users controlled by admin for testing and demonstration purposes.
        </p>
      </div>
    </div>
  );
}