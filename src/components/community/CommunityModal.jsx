import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Users, Shield, Trash2, Flag, Plus, Camera, Edit2, Check, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

function CaptainBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">
      <Shield className="w-2.5 h-2.5" /> Captain
    </span>
  );
}

export default function CommunityModal({ franchise, user, profile, onClose }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [community, setCommunity] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const [moderators, setModerators] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newModEmail, setNewModEmail] = useState("");
  const [showAddMod, setShowAddMod] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [aiFlag, setAiFlag] = useState({});

  const admin = isAdmin(user?.email);
  const canManage = admin || isModerator;

  useEffect(() => { loadData(); }, [franchise.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [comms, membersData, postsData] = await Promise.all([
        base44.entities.GamingCommunity.filter({ franchise_id: franchise.id }),
        base44.entities.CommunityMember.filter({ franchise_id: franchise.id }),
        base44.entities.CommunityPost.filter({ franchise_id: franchise.id }),
      ]);
      const comm = comms[0] || null;
      setCommunity(comm);
      setEditLogoUrl(comm?.logo_url || "");
      setEditCoverUrl(comm?.cover_url || "");
      setEditDesc(comm?.description || "");
      setModerators(comm?.moderator_emails || []);
      setMembers(membersData);
      setMemberCount(membersData.length);
      const activePosts = postsData.filter(p => p.status !== "removed")
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 50);
      setPosts(activePosts);
      if (user?.email) {
        const myMember = membersData.find(m => m.user_email === user.email);
        setIsJoined(!!myMember);
        setIsModerator(myMember?.is_moderator || (comm?.moderator_emails || []).includes(user.email));
      }
    } catch {}
    setLoading(false);
  };

  const ensureCommunity = async () => {
    if (community?.id) return community;
    const nc = await base44.entities.GamingCommunity.create({
      franchise_id: franchise.id, name: franchise.name,
      color_primary: franchise.color, color_secondary: franchise.accent, genre: franchise.genre,
      moderator_emails: [], sections: [],
    });
    setCommunity(nc);
    return nc;
  };

  const handleJoin = async () => {
    if (!user) return;
    if (isJoined) {
      const existing = members.find(m => m.user_email === user.email);
      if (existing) { await base44.entities.CommunityMember.delete(existing.id); }
      setIsJoined(false); setMemberCount(c => Math.max(0, c - 1));
      setMembers(prev => prev.filter(m => m.user_email !== user.email));
    } else {
      const comm = await ensureCommunity();
      const nm = await base44.entities.CommunityMember.create({
        community_id: comm.id, franchise_id: franchise.id,
        user_email: user.email, username: profile?.username || user.full_name || "Gamer",
        avatar_url: profile?.avatar_url || "", is_moderator: false,
      });
      setIsJoined(true); setMemberCount(c => c + 1);
      setMembers(prev => [...prev, nm]);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user || !isJoined) return;
    setPosting(true);
    const comm = await ensureCommunity();
    // Basic AI spam/flag detection
    const spamWords = ["spam", "scam", "buy now", "click here", "free money", "earn fast"];
    const isSpam = spamWords.some(w => newPost.toLowerCase().includes(w));
    const post = await base44.entities.CommunityPost.create({
      community_id: comm.id, franchise_id: franchise.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: newPost, likes: 0,
      status: isSpam ? "flagged" : "active",
      flagged_reason: isSpam ? "AI: possible spam" : "",
    });
    if (!isSpam) setPosts(prev => [post, ...prev]);
    else alert("⚠️ Your post was flagged for review by our AI system.");
    setNewPost(""); setPosting(false);
  };

  const handleFlagPost = async (post) => {
    await base44.entities.CommunityPost.update(post.id, { status: "pending_review", flagged_by: user.email, flagged_reason: "Flagged by moderator for admin review" });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: "pending_review" } : p));
  };

  const handleRemovePost = async (post) => {
    await base44.entities.CommunityPost.update(post.id, { status: "removed" });
    setPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const handleSaveProfile = async () => {
    const comm = await ensureCommunity();
    const updated = await base44.entities.GamingCommunity.update(comm.id, {
      logo_url: editLogoUrl, cover_url: editCoverUrl, description: editDesc,
    });
    setCommunity(updated);
    setShowEditProfile(false);
  };

  const handleAssignMod = async () => {
    if (!newModEmail.trim() || !admin) return;
    const comm = await ensureCommunity();
    const currentMods = comm.moderator_emails || [];
    if (currentMods.includes(newModEmail)) return;
    const newMods = [...currentMods, newModEmail];
    await base44.entities.GamingCommunity.update(comm.id, { moderator_emails: newMods });
    setCommunity(prev => ({ ...prev, moderator_emails: newMods }));
    setModerators(newMods);
    // Update member record if exists
    const memberRec = members.find(m => m.user_email === newModEmail);
    if (memberRec) await base44.entities.CommunityMember.update(memberRec.id, { is_moderator: true });
    setNewModEmail(""); setShowAddMod(false);
  };

  const handleRemoveMod = async (email) => {
    if (!admin) return;
    const newMods = moderators.filter(m => m !== email);
    await base44.entities.GamingCommunity.update(community.id, { moderator_emails: newMods });
    setModerators(newMods);
    const memberRec = members.find(m => m.user_email === email);
    if (memberRec) await base44.entities.CommunityMember.update(memberRec.id, { is_moderator: false });
  };

  const handleRequestSection = async () => {
    if (!sectionName.trim()) return;
    const comm = await ensureCommunity();
    await base44.entities.SectionRequest.create({
      franchise_id: franchise.id, community_id: comm.id,
      requested_by: user.email, requester_username: profile?.username || user.full_name,
      section_name: sectionName, section_description: sectionDesc, status: "pending",
    });
    setSectionName(""); setSectionDesc(""); setShowSectionForm(false);
    alert("Section request submitted for admin approval!");
  };

  const coverStyle = community?.cover_url
    ? { backgroundImage: `url(${community.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}aa)` };

  const sections = community?.sections || [];

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="w-full sm:max-w-2xl bg-gray-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ border: `2px solid ${franchise.accent}44`, maxHeight: "92vh" }}
        initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover / Header */}
        <div className="relative" style={{ ...coverStyle, minHeight: 120 }}>
          <div className="absolute inset-0 bg-black/50" />
          {/* Edit cover button */}
          {canManage && (
            <button onClick={() => setShowEditProfile(true)}
              className="absolute top-3 right-12 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-xs font-semibold hover:bg-black/80 transition-all">
              <Camera className="w-3.5 h-3.5" /> Edit Cover
            </button>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 rounded-lg p-1.5">
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10 px-5 pb-4 pt-12 flex items-end gap-4">
            {/* Logo */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-2 overflow-hidden"
                style={{ background: `${franchise.accent}22`, borderColor: `${franchise.accent}55` }}>
                {community?.logo_url
                  ? <img src={community.logo_url} className="w-full h-full object-cover" alt="" />
                  : franchise.emoji}
              </div>
              {canManage && (
                <button onClick={() => setShowEditProfile(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-black text-xl leading-tight">{franchise.name}</h2>
              {community?.description && <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{community.description}</p>}
              <p className="text-white/50 text-xs flex items-center gap-2 mt-1">
                <Users className="w-3 h-3" /> {memberCount.toLocaleString()} members
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${franchise.accent}22`, color: franchise.accent }}>{franchise.genre}</span>
                {isModerator && !admin && <CaptainBadge />}
                {admin && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">👑 Admin</span>}
              </p>
            </div>
            {user && (
              <button onClick={handleJoin}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex-shrink-0"
                style={isJoined
                  ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
                  : { background: franchise.accent, color: "#fff" }}>
                {isJoined ? "✓ Joined" : "+ Join"}
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {showEditProfile && (
            <motion.div className="absolute inset-0 z-20 bg-gray-950/98 rounded-3xl p-6 flex flex-col gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-black">Edit Community Profile</h3>
                <button onClick={() => setShowEditProfile(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Logo Image URL</label>
                  <input value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)}
                    placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Cover Photo URL</label>
                  <input value={editCoverUrl} onChange={e => setEditCoverUrl(e.target.value)}
                    placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                  {editCoverUrl && <img src={editCoverUrl} className="mt-2 w-full h-24 object-cover rounded-lg opacity-70" alt="cover preview" />}
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Description</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                    placeholder="Describe this community..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
                </div>
              </div>
              <button onClick={handleSaveProfile}
                className="w-full py-3 rounded-xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                <Check className="w-4 h-4 inline mr-2" /> Save Changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-5 gap-4 bg-gray-950 flex-shrink-0">
          {["feed", "sections", ...(canManage ? ["moderators"] : [])].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs font-bold capitalize border-b-2 transition-all -mb-px ${activeTab === tab ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* FEED TAB */}
        {activeTab === "feed" && (
          <>
            {user && isJoined && (
              <div className="px-5 py-3 border-b border-gray-800 flex gap-3 items-center flex-shrink-0">
                <input value={newPost} onChange={e => setNewPost(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePost()}
                  placeholder={`Post in ${franchise.name}...`}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                <button onClick={handlePost} disabled={!newPost.trim() || posting}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-50"
                  style={{ background: franchise.accent }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            {user && !isJoined && (
              <div className="px-5 py-3 border-b border-gray-800 text-center text-gray-500 text-sm flex-shrink-0">
                Join this community to post
              </div>
            )}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
              ) : posts.filter(p => p.status === "active").length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">{franchise.emoji}</p>
                  <p className="text-gray-400 font-semibold">Be the first to post!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/60">
                  {posts.filter(p => p.status === "active").map(post => {
                    const isMod = moderators.includes(post.author_email);
                    return (
                      <div key={post.id} className="px-5 py-4 flex gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                          {post.author_username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-purple-300 text-xs font-bold">{post.author_username}</p>
                            {isMod && <CaptainBadge />}
                            {isAdmin(post.author_email) && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-black">👑 Admin</span>}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mt-0.5">{post.content}</p>
                          <p className="text-gray-600 text-[10px] mt-1">{new Date(post.created_date).toLocaleDateString()}</p>
                        </div>
                        {canManage && (
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button onClick={() => handleFlagPost(post)} title="Flag for review"
                              className="w-7 h-7 rounded-lg bg-orange-900/40 hover:bg-orange-900/70 flex items-center justify-center">
                              <Flag className="w-3 h-3 text-orange-400" />
                            </button>
                            <button onClick={() => handleRemovePost(post)} title="Remove post"
                              className="w-7 h-7 rounded-lg bg-red-900/40 hover:bg-red-900/70 flex items-center justify-center">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* SECTIONS TAB */}
        {activeTab === "sections" && (
          <div className="overflow-y-auto flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Community Sections</h3>
              {(canManage || isJoined) && user && (
                <button onClick={() => setShowSectionForm(!showSectionForm)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-300 bg-purple-900/30 border border-purple-700/40 hover:bg-purple-900/50">
                  <Plus className="w-3.5 h-3.5" /> Request Section
                </button>
              )}
            </div>
            {showSectionForm && (
              <div className="mb-4 p-4 rounded-xl bg-gray-900 border border-gray-700 space-y-3">
                <input value={sectionName} onChange={e => setSectionName(e.target.value)}
                  placeholder="Section name (e.g. Clips & Highlights)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                <textarea value={sectionDesc} onChange={e => setSectionDesc(e.target.value)} rows={2}
                  placeholder="Describe this section..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
                <p className="text-gray-600 text-xs">⚠️ Section requests require admin approval</p>
                <button onClick={handleRequestSection}
                  className="w-full py-2 rounded-xl text-xs font-black text-white"
                  style={{ background: franchise.accent }}>
                  Submit Request
                </button>
              </div>
            )}
            {sections.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No sections yet. Request one above!</p>
            ) : (
              <div className="space-y-2">
                {sections.map((sec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${franchise.accent}22` }}>#</div>
                    <div>
                      <p className="text-white font-bold text-sm">{sec.name}</p>
                      {sec.description && <p className="text-gray-500 text-xs">{sec.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODERATORS TAB (admin only) */}
        {activeTab === "moderators" && canManage && (
          <div className="overflow-y-auto flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Group Moderators (Captains)</h3>
              {admin && (
                <button onClick={() => setShowAddMod(!showAddMod)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-green-300 bg-green-900/30 border border-green-700/40 hover:bg-green-900/50">
                  <Plus className="w-3.5 h-3.5" /> Assign Moderator
                </button>
              )}
            </div>
            {admin && showAddMod && (
              <div className="mb-4 flex gap-2">
                <input value={newModEmail} onChange={e => setNewModEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500" />
                <button onClick={handleAssignMod}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-green-700 hover:bg-green-600">
                  Assign
                </button>
              </div>
            )}
            {moderators.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No moderators assigned yet.</p>
                {admin && <p className="text-gray-600 text-xs mt-1">Assign a member as Captain/Moderator above.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {moderators.map(email => (
                  <div key={email} className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
                    <div className="w-9 h-9 rounded-full bg-yellow-900/30 border border-yellow-500/40 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{email}</p>
                      <div className="flex items-center gap-1 mt-0.5"><CaptainBadge /></div>
                    </div>
                    {admin && (
                      <button onClick={() => handleRemoveMod(email)}
                        className="w-7 h-7 rounded-lg bg-red-900/40 hover:bg-red-900/70 flex items-center justify-center">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Allow any member to request modership */}
            {!isModerator && !admin && isJoined && (
              <div className="mt-6 p-4 rounded-xl bg-gray-900 border border-gray-800 text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-bold text-sm mb-1">Become a Group Captain?</p>
                <p className="text-gray-500 text-xs mb-3">Request moderator status — admin will review and approve.</p>
                <button onClick={async () => {
                  const comm = await ensureCommunity();
                  await base44.entities.SectionRequest.create({
                    franchise_id: franchise.id, community_id: comm.id,
                    requested_by: user.email, requester_username: profile?.username || user.full_name,
                    section_name: `MOD_REQUEST: ${user.email}`,
                    section_description: `User requests moderator role in ${franchise.name}`,
                    status: "pending",
                  });
                  alert("Moderator request submitted! Admin will review.");
                }}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Request Moderator Role
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}