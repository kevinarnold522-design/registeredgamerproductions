import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Shield, LogOut, ExternalLink, X, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ManagedAccountsPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
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
    // Get current admin user
    base44.auth.me().then(user => {
      if (user) setCurrentUser(user);
    }).catch(() => {});
  }, []);

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
        
        // Auto-impersonate and redirect to the new account's channel page
        setTimeout(async () => {
          try {
            // Perform impersonation
            const impResponse = await base44.functions.invoke('createManagedAccount', {
              action: 'impersonate',
              target_email: formData.email,
            });
            
            if (impResponse.data.success) {
              const impersonationData = {
                isImpersonating: true,
                originalUser: JSON.parse(localStorage.getItem('base44_user') || '{}'),
                targetEmail: formData.email,
                targetUsername: formData.username,
              };
              localStorage.setItem('impersonation_session', JSON.stringify(impersonationData));
              
              // Redirect to channel page with new account flag
              window.location.href = `/channel?email=${encodeURIComponent(formData.email)}&new_account=1`;
            }
          } catch (error) {
            // If impersonation fails, still redirect to channel
            window.location.href = `/channel?email=${encodeURIComponent(formData.email)}&new_account=1`;
          }
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  const handleLoginAsGhost = async (account) => {
    try {
      const response = await base44.functions.invoke('loginAsGhost', {
        target_email: account.user_email,
      });

      if (response.data.success) {
        // Store ghost session data - frontend only, no backend token
        const impersonationData = {
          isImpersonating: true,
          isGhostLogin: true,
          isPersistent: true,
          originalUser: { email: currentUser?.email, full_name: currentUser?.full_name },
          targetEmail: account.user_email,
          targetUsername: account.username,
          targetDisplayName: response.data.display_name,
          targetAvatar: response.data.avatar_url,
          targetAccountType: response.data.account_type,
        };
        localStorage.setItem('impersonation_session', JSON.stringify(impersonationData));
        
        toast.success(`Logged in as ${response.data.username}`);
        
        // Redirect to ghost account's profile page with proper URL params
        setTimeout(() => {
          window.location.href = response.data.redirect_url;
        }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to login as ghost account");
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
    window.location.href = '/admin/created-accounts';
  };

  const handleEditGhostAccount = async (account) => {
    // Navigate to profile edit page with ghost account email
    window.location.href = `/dashboard?tab=profile&edit_ghost=${encodeURIComponent(account.user_email)}`;
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
  const isImpersonating = impersonationData.isImpersonating;

  return (
    <div className="p-3 sm:p-6">
      {isImpersonating && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-pink-900/50 to-purple-900/50 border border-pink-700/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-pink-400" />
            <div>
              <p className="text-white font-bold text-sm">Managing as: {impersonationData.targetUsername}</p>
              <p className="text-gray-400 text-xs">Ghost session - all data isolated to this account</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const ghostEmail = impersonationData.targetEmail;
                window.location.href = `/dashboard?tab=profile&edit_ghost=${encodeURIComponent(ghostEmail)}`;
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Edit Account
            </button>
            <button
              onClick={handleStopImpersonating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white font-black text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Created Accounts
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
            Total: {accounts.length} managed account{accounts.length !== 1 ? 's' : ''}
            <span className="px-2 py-0.5 rounded-full bg-green-900/40 border border-green-700/50 text-green-400 text-[10px] font-bold">
              Live Users
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold transition-all hover:opacity-90 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Account
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/40">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-bold text-sm">These Are Live User Accounts</p>
            <p className="text-gray-400 text-xs mt-1">
              All managed accounts are fully functional user accounts with authentication. They can post, comment, follow, and are counted in total user statistics.
              Admins can "login as" these accounts to manage their activity directly.
            </p>
          </div>
        </div>
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
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900/80">
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
              <div key={account.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 items-center hover:bg-gray-800/50 transition-colors">
                <div className="md:col-span-3 flex items-center gap-3">
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
                <div className="md:col-span-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                    account.account_type === 'business' ? 'bg-green-900/30 text-green-400 border border-green-700/30' :
                    account.account_type === 'digital_creator' ? 'bg-purple-900/30 text-purple-400 border border-purple-700/30' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {account.account_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="md:col-span-2 text-white text-sm font-semibold"><span className="md:hidden text-gray-500 text-xs mr-1">Listings:</span>{account.stats?.listings || 0}</div>
                <div className="md:col-span-2 text-white text-sm font-semibold"><span className="md:hidden text-gray-500 text-xs mr-1">Posts:</span>{account.stats?.posts || 0}</div>
                <div className="md:col-span-2 text-white text-sm font-semibold"><span className="md:hidden text-gray-500 text-xs mr-1">Following:</span>{account.stats?.following || 0}</div>
                <div className="md:col-span-1 flex items-center justify-start md:justify-end gap-2">
                  <button
                    onClick={() => handleLoginAsGhost(account)}
                    className="flex-1 md:flex-none h-9 md:w-8 md:h-8 rounded-lg bg-green-600 hover:bg-green-500 flex items-center justify-center gap-2 transition-colors text-white text-xs font-bold"
                    title="Login as this account"
                  >
                    <Shield className="w-3.5 h-3.5 text-white" /><span className="md:hidden">Login as</span>
                  </button>
                  <button
                    onClick={() => handleEditGhostAccount(account)}
                    className="flex-1 md:flex-none h-9 md:w-8 md:h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors text-white text-xs font-bold"
                    title="Edit account details"
                  >
                    <Users className="w-3.5 h-3.5 text-white" /><span className="md:hidden">Edit</span>
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