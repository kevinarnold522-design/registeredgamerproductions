import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, Search, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import CreateTournamentModal from "@/components/tournaments/CreateTournamentModal";
import TournamentCard from "@/components/tournaments/TournamentCard";

const STATUS_FILTERS = ["All", "upcoming", "active", "completed"];

export default function TournamentsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const admin = isAdmin(user?.email);

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    }
    base44.entities.Tournament.list("-created_date", 60).then(t => {
      setTournaments(t);
      setLoading(false);
    });
  }, [user]);

  const filtered = tournaments.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.game?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const canCreate = admin || (user && profile?.account_type !== "regular");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero */}
      <div className="pt-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #052e16, #030712, #052e16)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(74,222,128,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/40 border border-green-700/50 text-green-300 text-xs font-semibold mb-4">
              <Trophy className="w-3.5 h-3.5" /> Gaming Tournaments
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Tournaments Hub
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto mb-6">
              Join, host & compete in gaming tournaments — online or LAN events across all game genres
            </p>
            {canCreate && (
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm shadow-lg hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #16a34a, #059669)", boxShadow: "0 0 20px rgba(22,163,74,0.4)" }}>
                <Plus className="w-4 h-4" /> Create Tournament
              </button>
            )}
            {!user && (
              <button onClick={() => base44.auth.redirectToLogin()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Sign In to Participate
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tournaments or games..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${statusFilter === s ? "bg-green-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl bg-gray-900 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-green-500 opacity-30 mb-4" />
            <p className="text-gray-400 font-semibold text-lg">No tournaments found</p>
            <p className="text-gray-600 text-sm mt-1">
              {canCreate ? "Be the first to create a tournament!" : "Check back later for upcoming events."}
            </p>
            {canCreate && (
              <button onClick={() => setShowCreate(true)}
                className="mt-4 px-6 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #16a34a, #059669)" }}>
                <Plus className="w-4 h-4 inline mr-1" /> Create Tournament
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <TournamentCard
                key={t.id}
                tournament={t}
                user={user}
                profile={profile}
                onUpdate={(updated) => setTournaments(prev => prev.map(x => x.id === updated.id ? updated : x))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateTournamentModal
            user={user}
            profile={profile}
            onClose={() => setShowCreate(false)}
            onCreated={(t) => setTournaments(prev => [t, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}