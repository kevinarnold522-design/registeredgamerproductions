import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import CommunityModal from "@/components/community/CommunityModal";
import { TOP_FRANCHISES } from "@/lib/franchises";

function CommunityCard({ franchise, memberCount, isJoined, isModerator, onJoin, onClick }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18;
    setTilt({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden"
      style={{
        transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 0.1s ease-out",
        background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}dd)`,
        border: `2px solid ${franchise.accent}44`,
        boxShadow: `0 0 16px ${franchise.accent}18`,
      }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 32px ${franchise.accent}55` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(circle at 50% 30%, ${franchise.accent}, transparent 70%)` }} />

      <div className="relative p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-13 h-13 rounded-xl flex items-center justify-center text-3xl"
            style={{ background: `${franchise.accent}22`, border: `1px solid ${franchise.accent}55`, width: 52, height: 52 }}>
            {franchise.emoji}
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}44` }}>
            {franchise.genre}
          </span>
        </div>
        <div>
          <h3 className="text-white font-black text-xs leading-tight">{franchise.name}</h3>
          {isModerator && (
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold mt-0.5">
              🛡️ Captain
            </span>
          )}
          <p className="text-white/40 text-[10px] mt-0.5 flex items-center gap-1">
            <Users className="w-2.5 h-2.5" /> {memberCount > 0 ? memberCount.toLocaleString() : "0"}
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onJoin(); }}
          className="w-full py-1.5 rounded-xl text-[10px] font-black transition-all"
          style={isJoined
            ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
            : { background: franchise.accent, color: "#fff" }
          }>
          {isJoined ? "✓ Joined" : "Join"}
        </button>
      </div>
    </motion.div>
  );
}

export default function GamingCommunity() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [memberCounts, setMemberCounts] = useState({});
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [moderatorIds, setModeratorIds] = useState(new Set());
  const [communities, setCommunities] = useState({});
  const admin = isAdmin(user?.email);

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
      base44.entities.CommunityMember.filter({ user_email: user.email }).then(m => {
        setJoinedIds(new Set(m.map(x => x.franchise_id)));
        setModeratorIds(new Set(m.filter(x => x.is_moderator).map(x => x.franchise_id)));
      });
    }
    base44.entities.GamingCommunity.list().then(comms => {
      const counts = {}, map = {};
      comms.forEach(c => {
        counts[c.franchise_id] = c.member_count || 0;
        map[c.franchise_id] = c;
      });
      setMemberCounts(counts);
      setCommunities(map);
    });
  }, [user]);

  // Also check moderator_emails array from communities
  useEffect(() => {
    if (!user?.email || Object.keys(communities).length === 0) return;
    const modSet = new Set(moderatorIds);
    Object.values(communities).forEach(c => {
      if ((c.moderator_emails || []).includes(user.email)) modSet.add(c.franchise_id);
    });
    setModeratorIds(modSet);
  }, [communities, user?.email]);

  const allGenres = ["All", ...Array.from(new Set(TOP_FRANCHISES.map(f => f.genre)))];
  const filtered = TOP_FRANCHISES.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "All" || f.genre === selectedGenre;
    return matchSearch && matchGenre;
  });

  const handleJoinCard = async (franchise) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const already = joinedIds.has(franchise.id);
    let comms = await base44.entities.GamingCommunity.filter({ franchise_id: franchise.id });
    let communityId = comms[0]?.id;
    if (!communityId) {
      const nc = await base44.entities.GamingCommunity.create({
        franchise_id: franchise.id, name: franchise.name,
        color_primary: franchise.color, color_secondary: franchise.accent, genre: franchise.genre,
        moderator_emails: [], sections: [],
      });
      communityId = nc.id;
      setCommunities(prev => ({ ...prev, [franchise.id]: nc }));
    }
    if (already) {
      const existing = await base44.entities.CommunityMember.filter({ franchise_id: franchise.id, user_email: user.email });
      if (existing[0]) await base44.entities.CommunityMember.delete(existing[0].id);
      setJoinedIds(prev => { const n = new Set(prev); n.delete(franchise.id); return n; });
      setMemberCounts(prev => ({ ...prev, [franchise.id]: Math.max(0, (prev[franchise.id] || 0) - 1) }));
    } else {
      await base44.entities.CommunityMember.create({
        community_id: communityId, franchise_id: franchise.id,
        user_email: user.email, username: profile?.username || user.full_name || "Gamer",
        avatar_url: profile?.avatar_url || "", is_moderator: false,
      });
      setJoinedIds(prev => new Set([...prev, franchise.id]));
      setMemberCounts(prev => ({ ...prev, [franchise.id]: (prev[franchise.id] || 0) + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero */}
      <div className="relative pt-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold mb-4">
              <Users className="w-3.5 h-3.5" /> 100+ Gaming Communities
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Gaming Community Hub
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto mb-6">
              Join franchise communities · Post, connect & celebrate gaming culture worldwide
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-md mx-auto relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search any franchise..."
              className="w-full bg-gray-900/80 border border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          {/* Genre filters */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {allGenres.map(g => (
              <button key={g} onClick={() => setSelectedGenre(g)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={selectedGenre === g
                  ? { background: "#7c3aed", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }
                }>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 text-sm">
            <span className="text-white font-bold">{filtered.length}</span> communities
            {selectedGenre !== "All" && <span className="ml-1 text-purple-400">in {selectedGenre}</span>}
            {search && <span className="ml-1 text-purple-400">matching "{search}"</span>}
          </p>
          {!user && (
            <button onClick={() => base44.auth.redirectToLogin()}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              Sign In to Join
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((franchise) => (
            <CommunityCard
              key={franchise.id}
              franchise={franchise}
              memberCount={memberCounts[franchise.id] || 0}
              isJoined={joinedIds.has(franchise.id)}
              isModerator={moderatorIds.has(franchise.id)}
              onJoin={() => handleJoinCard(franchise)}
              onClick={() => setSelectedFranchise(franchise)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-gray-400 font-semibold">No communities found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different search or genre filter</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedFranchise && (
          <CommunityModal
            franchise={selectedFranchise}
            user={user}
            profile={profile}
            onClose={() => setSelectedFranchise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}