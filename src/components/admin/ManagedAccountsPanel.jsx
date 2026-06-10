import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Shield, LogOut, ExternalLink, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ManagedAccountsPanel() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    display_name: "",
    account_type: "regular",
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createManagedAccount', { action: 'list' });
      if (response.data.success) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      toast.error("Failed to load managed accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.username) {
      toast.error("Email and username are required");
      return;
    }

    setCreating(true);
    try {
      const response = await base44.functions.invoke('createManagedAccount', {
        action: 'create',
        ...formData,
      });

      if (response.data.success) {
        toast.success("Account created successfully!");
        setShowCreateModal(false);
        setFormData({ email: "", username: "", display_name: "", account_type: "regular" });
        loadAccounts();
        
        // Auto-redirect to the new account's channel page
        setTimeout(() => {
          navigate(`/channel?user=${encodeURIComponent(formData.email)}`);
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  const handleImpersonate = async (account) => {
    try {
      const response = await base44.functions.invoke('createManagedAccount', {
        action: 'impersonate',
        target_email: account.user_email,
      });

      if (response.data.success) {
        const impersonationData = {
          isImpersonating: true,
          originalUser: JSON.parse(localStorage.getItem('base44_user') || '{}'),
          targetEmail: account.user_email,
          targetUsername: account.username,
        };
        localStorage.setItem('impersonation_session', JSON.stringify(impersonationData));
        
        toast.success(`Now managing as ${account.username}`);
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to switch to account");
    }
  };

  const handleStopImpersonating = () => {
    localStorage.removeItem('impersonation_session');
    toast.success("Returned to admin account");
    window.location.reload();
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
  const isImpersonating = impersonationData.isImpersonating;

  return (
    <div className="p-6">
      {isImpersonating && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-bold text-sm">Managing as: {impersonationData.targetUsername}</p>
              <p className="text-gray-400 text-xs">All actions will be performed as this account</p>
            </div>
          </div>
          <button
            onClick={handleStopImpersonating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Stop Managing
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Created Accounts
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage shadow accounts controlled by admins</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold transition-all hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Create New Account
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by username or email..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
          />
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900/80">
          <div className="col-span-3 text-gray-500 text-xs font-bold uppercase tracking-wider">Account</div>
          <div className="col-span-2 text-gray-500 text-xs font-bold uppercase tracking-wider">Type</div>
          <div className="col-span-2 text-gray-500 text-xs font-bold uppercase tracking-wider">Listings</div>
          <div className="col-span-2 text-gray-500 text-xs font-bold uppercase tracking-wider">Posts</div>
          <div className="col-span-2 text-gray-500 text-xs font-bold uppercase tracking-wider">Following</div>
          <div className="col-span-1 text-gray-500 text-xs font-bold uppercase tracking-wider text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No managed accounts found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/50 transition-colors">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    {account.avatar_url ? (
                      <img src={account.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" />
                    ) : (
                      <span className="text-white font-bold text-sm">{account.username[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{account.username}</p>
                    <p className="text-gray-500 text-xs truncate">{account.user_email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                    account.account_type === 'business' ? 'bg-green-900/30 text-green-400 border border-green-700/30' :
                    account.account_type === 'digital_creator' ? 'bg-purple-900/30 text-purple-400 border border-purple-700/30' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {account.account_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="col-span-2 text-white text-sm font-semibold">{account.stats?.listings || 0}</div>
                <div className="col-span-2 text-white text-sm font-semibold">{account.stats?.posts || 0}</div>
                <div className="col-span-2 text-white text-sm font-semibold">{account.stats?.following || 0}</div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleImpersonate(account)}
                    className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
                    title="Manage this account"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-950 border border-purple-700/40 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Create Managed Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs font-semibold mb-1 block">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-600"
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold mb-1 block">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-600"
                  placeholder="TestUser"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold mb-1 block">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-600"
                  placeholder="Test User"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold mb-1 block">Account Type</label>
                <select
                  value={formData.account_type}
                  onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-600"
                >
                  <option value="regular">Regular</option>
                  <option value="digital_creator">Digital Creator</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}