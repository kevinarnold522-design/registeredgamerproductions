import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Pencil, Plus, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import { TOP_FRANCHISES } from "@/lib/franchises";

function CommunityCard({ franchise, memberCount, isJoined, isModerator, canAdmin, community, onJoin, onClick, onSaveProfile }) {
  const cardRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editLogo, setEditLogo] = useState(community?.logo_url || "");
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handlePencilClick = (e) => {
    e.stopPropagation();
    setEditMode(true);
  };

  const handleFileUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditLogo(file_url);
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    await onSaveProfile?.(franchise.id, { logo_url: editLogo }, community);
    setEditMode(false);
  };

  const logoSrc = community?.logo_url || editLogo || null;

  return (
    <motion.div
      ref={cardRef}
      onClick={editMode ? undefined : onClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}dd)`,
        border: `2px solid ${franchise.accent}44`,
        boxShadow: `0 0 16px ${franchise.accent}18`,
        minHeight: 160,
      }}
      whileHover={{ scale: 1.02, boxShadow: `0 0 32px ${franchise.accent}55` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Cover/gradient bg */}
      {community?.cover_url ? (
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${community.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ) : (
        <div className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 50% 30%, ${franchise.accent}, transparent 70%)` }} />
      )}

      {/* Pencil icon — admin/mod only */}
      {canAdmin && !editMode && (
        <button
          onClick={handlePencilClick}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-black/60 hover:bg-purple-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          title="Edit profile picture">
          <Pencil className="w-3.5 h-3.5 text-white" />
        </button>
      )}

      {/* Inline edit overlay */}
      {editMode && (
        <div className="absolute inset-0 z-20 bg-black/90 rounded-2xl flex flex-col items-center justify-center gap-2 p-3" onClick={e => e.stopPropagation()}>
          <p className="text-white text-xs font-bold">Edit Profile Picture</p>
          {editLogo && <img src={editLogo} className="w-14 h-14 rounded-xl object-cover" alt="" />}
          <button onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-[10px] font-bold">
            {uploading ? "Uploading..." : "📸 Upload"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="px-3 py-1 rounded-lg bg-green-700 text-white text-[10px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Save
            </button>
            <button onClick={e => { e.stopPropagation(); setEditMode(false); }}
              className="px-3 py-1 rounded-lg bg-gray-700 text-white text-[10px] font-bold">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="relative p-4 flex gap-3 items-start">
        {/* Logo */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden"
          style={{ background: `${franchise.accent}22`, border: `1px solid ${franchise.accent}55` }}>
          {logoSrc
            ? <img src={logoSrc} className="w-full h-full object-cover" alt="" />
            : <span>{franchise.emoji}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="text-white font-black text-sm leading-tight truncate">{franchise.name}</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold mt-0.5 inline-block"
                style={{ background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}44` }}>
                {franchise.genre}
              </span>
            </div>
          </div>

          {isModerator && (
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold mt-1">
              🛡️ Captain
            </span>
          )}
          <p className="text-white/40 text-[10px] mt-1 flex items-center gap-1">
            <Users className="w-2.5 h-2.5" /> {memberCount > 0 ? memberCount.toLocaleString() : "0"} members
          </p>
          {community?.description && (
            <p className="text-white/30 text-[10px] mt-0.5 line-clamp-2 leading-tight">{community.description}</p>
          )}
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <button
          onClick={e => { e.stopPropagation(); onJoin(); }}
          className="w-full py-1.5 rounded-xl text-[10px] font-black transition-all"
          style={isJoined
            ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
            : { background: franchise.accent, color: "#fff" }
          }>
          {isJoined ? "✓ Joined" : "+ Join"}
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
  const [memberCounts, setMemberCounts] = useState({});
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [moderatorIds, setModeratorIds] = useState(new Set());
  const [communities, setCommunities] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🎮");
  const [newCatGenre, setNewCatGenre] = useState("Gaming");
  const [extraFranchises, setExtraFranchises] = useState([]);
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

  const handleSaveProfile = async (franchiseId, data, existingCommunity) => {
    if (existingCommunity?.id) {
      const updated = await base44.entities.GamingCommunity.update(existingCommunity.id, data);
      setCommunities(prev => ({ ...prev, [franchiseId]: updated }));
    } else {
      const franchise = [...TOP_FRANCHISES, ...extraFranchises].find(f => f.id === franchiseId);
      const nc = await base44.entities.GamingCommunity.create({
        franchise_id: franchiseId, name: franchise?.name || franchiseId,
        color_primary: franchise?.color || "#1a1a2e", color_secondary: franchise?.accent || "#7c3aed",
        genre: franchise?.genre || "Gaming", moderator_emails: [], sections: [], ...data,
      });
      setCommunities(prev => ({ ...prev, [franchiseId]: nc }));
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const id = newCatName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newFranchise = { id, name: newCatName, emoji: newCatEmoji, color: "#1a1a2e", accent: "#7c3aed", genre: newCatGenre };
    // Save as GamingCommunity record so it persists
    const nc = await base44.entities.GamingCommunity.create({
      franchise_id: id, name: newCatName, genre: newCatGenre,
      color_primary: "#1a1a2e", color_secondary: "#7c3aed",
      moderator_emails: [], sections: [],
    });
    setExtraFranchises(prev => [...prev, newFranchise]);
    setCommunities(prev => ({ ...prev, [id]: nc }));
    setNewCatName(""); setNewCatEmoji("🎮"); setNewCatGenre("Gaming");
    setShowAddCategory(false);
  };

  // Load extra communities that were admin-created (not in TOP_FRANCHISES)
  useEffect(() => {
    base44.entities.GamingCommunity.list().then(comms => {
      const knownIds = new Set(TOP_FRANCHISES.map(f => f.id));
      const extra = comms.filter(c => !knownIds.has(c.franchise_id));
      const newFranchises = extra.map(c => ({
        id: c.franchise_id, name: c.name, emoji: "🎮",
        color: c.color_primary || "#1a1a2e", accent: c.color_secondary || "#7c3aed",
        genre: c.genre || "Gaming",
      }));
      setExtraFranchises(newFranchises);
    });
  }, []);

  const allFranchises = [...TOP_FRANCHISES, ...extraFranchises];
  const allGenres = ["All", ...Array.from(new Set(allFranchises.map(f => f.genre)))];
  const filtered = allFranchises.filter(f => {
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

  const isModerator = (franchiseId) => {
    return moderatorIds.has(franchiseId) || (communities[franchiseId]?.moderator_emails || []).includes(user?.email);
  };

  // Moderators can only manage up to 3 groups
  const getModeratorGroupCount = () => {
    if (!user?.email || admin) return 0;
    return Array.from(moderatorIds).filter(id => 
      (communities[id]?.moderator_emails || []).includes(user.email)
    ).length;
  };

  const canAdminCard = (franchiseId) => {
    if (admin) return true;
    if (!isModerator(franchiseId)) return false;
    // Mods can only manage their own groups (max 3)
    return getModeratorGroupCount() <= 3;
  };

  const handleCardClick = (franchise) => {
    window.location.href = `/community/${franchise.id}`;
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
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="text-gray-500 text-sm">
            <span className="text-white font-bold">{filtered.length}</span> communities
            {selectedGenre !== "All" && <span className="ml-1 text-purple-400">in {selectedGenre}</span>}
            {search && <span className="ml-1 text-purple-400">matching "{search}"</span>}
          </p>
          <div className="flex gap-2">
            {admin && (
              <button onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white"
                style={{ background: "#7c3aed" }}>
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
            {!user && (
              <button onClick={() => base44.auth.redirectToLogin()}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Sign In to Join
              </button>
            )}
          </div>
        </div>

        {/* Admin Add Category Form */}
        <AnimatePresence>
          {showAddCategory && admin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 rounded-2xl bg-gray-900 border border-purple-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-sm">Add New Gaming Category</h3>
                <button onClick={() => setShowAddCategory(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Tekken 8)"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                <input value={newCatEmoji} onChange={e => setNewCatEmoji(e.target.value)}
                  placeholder="Emoji (e.g. 🥋)"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                <input value={newCatGenre} onChange={e => setNewCatGenre(e.target.value)}
                  placeholder="Genre (e.g. Fighting)"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              </div>
              <button onClick={handleAddCategory}
                className="mt-3 px-5 py-2.5 rounded-xl font-black text-white text-sm"
                style={{ background: "#7c3aed" }}>
                <Plus className="w-4 h-4 inline mr-1" /> Create Category
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((franchise) => (
            <CommunityCard
              key={franchise.id}
              franchise={franchise}
              memberCount={memberCounts[franchise.id] || 0}
              isJoined={joinedIds.has(franchise.id)}
              isModerator={isModerator(franchise.id)}
              canAdmin={canAdminCard(franchise.id)}
              community={communities[franchise.id] || null}
              onJoin={() => handleJoinCard(franchise)}
              onClick={() => handleCardClick(franchise)}
              onSaveProfile={handleSaveProfile}
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


    </div>
  );
}