import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Search, X, User, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Admin-only quick account switcher. Lists all created/managed accounts and
// signs in as the picked one instantly (no login prompt) via the impersonation session.
export default function SwitchAccountDropdown({ currentUser, collapsed = false }) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    // include_all:true => list every account (not just managed), so the admin
    // can switch into any account, including manually created / ghost ones.
    base44.functions.invoke("createManagedAccount", { action: "list", include_all: true })
      .then(res => { if (res.data?.success) setAccounts(res.data.accounts || []); })
      .catch(() => {})
      .finally(() => { setLoading(false); setLoaded(true); });
  }, [open, loaded]);

  const switchTo = (account) => {
    const impersonationData = {
      isImpersonating: true,
      isGhostLogin: true,
      isPersistent: true,
      originalUser: { email: currentUser?.email, full_name: currentUser?.full_name },
      targetEmail: account.user_email,
      targetUsername: account.username,
      targetDisplayName: account.display_name || account.username,
      targetAvatar: account.avatar_url,
      targetAccountType: account.account_type,
    };
    localStorage.setItem("impersonation_session", JSON.stringify(impersonationData));
    window.location.href = `/profile?email=${encodeURIComponent(account.user_email)}&ghost_session=1`;
  };

  const filtered = accounts.filter(a =>
    a.username?.toLowerCase().includes(query.toLowerCase()) ||
    a.user_email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/40 text-indigo-200 text-xs font-bold hover:from-indigo-900/60 hover:to-purple-900/60 transition-all ${collapsed ? "justify-center" : ""}`}
        title="Switch Accounts"
      >
        <Repeat className="w-3.5 h-3.5 flex-shrink-0" />
        {!collapsed && <span className="truncate">Switch Accounts</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 mt-2 z-50 bg-gray-950 border border-indigo-700/40 rounded-2xl shadow-2xl shadow-indigo-900/30 overflow-hidden w-72 max-w-[90vw]"
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800">
                <p className="text-white text-xs font-black flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Switch to account</p>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-2 border-b border-gray-800">
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search accounts..."
                    className="flex-1 bg-transparent text-white text-xs outline-none placeholder-gray-600" />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto gamer-sidebar-scroll">
                {loading ? (
                  <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                  <p className="px-4 py-6 text-center text-gray-500 text-xs">No accounts found</p>
                ) : filtered.map(account => (
                  <button key={account.id || account.user_email} onClick={() => switchTo(account)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-900/30 transition-colors text-left border-b border-gray-800/50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {account.avatar_url ? <img src={account.avatar_url} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-bold truncate">{account.username}</p>
                      <p className="text-gray-500 text-[10px] truncate">{account.account_type?.replace("_", " ")}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}