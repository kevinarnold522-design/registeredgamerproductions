import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { ArrowLeft, Search } from "lucide-react";
import { isAdmin } from "@/lib/constants";
import BanUserButton from "@/components/admin/BanUserButton";

export default function UsersLanding() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const admin = isAdmin(user?.email);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const myProfiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      setProfile(myProfiles[0] || null);
      const rows = await base44.entities.UserProfile.list("-created_date", 200);
      setUsers(rows);
      setLoading(false);
    };
    load();
  }, []);

  const handleBanChange = (id, isBanned) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_banned: isBanned } : u));
  };

  const filtered = users.filter(u => !q || `${u.username || ""} ${u.display_name || ""} ${u.user_email || ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AuthNavbar user={user} profile={profile} />
      <main className="pt-20 max-w-6xl mx-auto px-4 pb-12">
        <button onClick={() => history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Admin</p>
            <h1 className="text-3xl font-black">Users</h1>
            <p className="text-gray-500 text-sm">Manage all registered accounts. Ban or unban users.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users..." className="bg-transparent outline-none text-sm text-white" />
          </div>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(u => (
              <div key={u.id} className={`p-4 rounded-2xl bg-gray-900 border transition-all flex flex-col gap-3 ${u.is_banned ? "border-red-700/50" : "border-gray-800 hover:border-purple-500/50"}`}>
                <a href={`/profile?email=${encodeURIComponent(u.user_email)}`} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/50 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : "🎮"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black truncate">{u.display_name || u.username || "Gamer"}</p>
                    <p className="text-gray-500 text-xs truncate">{u.user_email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-purple-900/30 text-purple-300 text-[10px] font-bold capitalize">{(u.account_type || "regular").replace("_", " ")}</span>
                      {u.is_banned && <span className="inline-block px-2 py-0.5 rounded-lg bg-red-900/40 text-red-300 text-[10px] font-bold">BANNED</span>}
                    </div>
                  </div>
                </a>
                {admin && u.user_email !== user?.email && (
                  <div className="flex justify-end">
                    <BanUserButton profile={u} onChange={(banned) => handleBanChange(u.id, banned)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}