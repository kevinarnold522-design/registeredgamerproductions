import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Users, Shield, Plus, Camera, Check, Lock, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import { isAdmin, MODERATOR_TYPES } from "@/lib/constants";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import CommunityPostCard from "./CommunityPostCard";
import TieredMembershipModal from "./TieredMembershipModal";
import ModeratorRequestModal from "./ModeratorRequestModal";
import { formatListingPrice } from "@/lib/currency";

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
  const [isTier1, setIsTier1] = useState(false);
  const [showTier1Modal, setShowTier1Modal] = useState(false);
  const [showModRequest, setShowModRequest] = useState(false);
  const [communityListings, setCommunityListings] = useState([]);
  const [modGroupCount, setModGroupCount] = useState(0);
  const logoFileRef = useRef(null);
  const coverFileRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const admin = isAdmin(user?.email);
  // Account Moderator = platform-wide, near-admin, no ads — can manage but deletion needs admin approval
  const isAccountMod = profile?.moderator_type === "account_moderator";
  // Group Moderator = captain of their own group, Captain badge, NO delete
  const isGroupMod = isModerator && !isAccountMod;
  const canManage = admin || isAccountMod || isModerator;
  // Only admin can directly delete; account_mod can request deletion
  const canDelete = admin || isAccountMod;

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
        // Check Tier 1 + count how many groups this user moderates
        const [subs, allModGroups] = await Promise.all([
          base44.entities.Tier1Subscription.filter({ user_email: user.email, status: "active" }),
          base44.entities.CommunityMember.filter({ user_email: user.email, is_moderator: true }),
        ]);
        setIsTier1(admin || subs.length > 0);
        setModGroupCount(allModGroups.length);
      }
      // Load listings for this community
      try {
      const listings = await base44.entities.Listing.filter({ community_franchise_id: franchise.id, status: "active" });
      setCommunityListings(listings.slice(0, 10));
      } catch (e) {}
    } catch (e) {}
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await uploadFileToR2(file, "community-logos");
    setEditLogoUrl(file_url);
    setUploadingLogo(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await uploadFileToR2(file, "community-covers");
    setEditCoverUrl(file_url);
    setUploadingCover(false);
  };

  const [postYoutubeUrl, setPostYoutubeUrl] = useState("");

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    // All joined users can post freely — posting is free for everyone
    if (!isJoined && !admin && !isModerator) return;
    setPosting(true);
    const comm = await ensureCommunity();
    const spamWords = ["spam", "scam", "buy now", "click here", "free money", "earn fast"];
    const isSpam = spamWords.some(w => newPost.toLowerCase().includes(w));
    const postContent = postYoutubeUrl ? `${newPost}\n📺 ${postYoutubeUrl}` : newPost;
    const post = await base44.entities.CommunityPost.create({
      community_id: comm.id, franchise_id: franchise.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: postContent, likes: 0,
      status: isSpam ? "flagged" : "active",
      flagged_reason: isSpam ? "AI: possible spam" : "",
    });
    if (!isSpam) setPosts(prev => [post, ...prev]);
    else alert("⚠️ Your post was flagged for review by our AI system.");
    setNewPost(""); setPostYoutubeUrl(""); setPosting(false);
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
    // Check how many groups this user already moderates (max 3)
    const existingModGroups = await base44.entities.CommunityMember.filter({ user_email: newModEmail, is_moderator: true });
    if (existingModGroups.length >= 3) {
      alert(`This user is already moderating ${existingModGroups.length} groups (max 3). They must step down from another group first.`);
      return;
    }
    const newMods = [...currentMods, newModEmail];
    await base44.entities.GamingCommunity.update(comm.id, { moderator_emails: newMods });
    setCommunity(prev => ({ ...prev, moderator_emails: newMods }));
    setModerators(newMods);
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
    if (canManage) {
      // Admin/mod: add directly to sections array
      const newSection = { id: Date.now().toString(), name: sectionName, description: sectionDesc };
      const updatedSections = [...(comm.sections || []), newSection];
      const updated = await base44.entities.GamingCommunity.update(comm.id, { sections: updatedSections });
      setCommunity(updated);
    } else {
      await base44.entities.SectionRequest.create({
        franchise_id: franchise.id, community_id: comm.id,
        requested_by: user.email, requester_username: profile?.username || user.full_name,
        section_name: sectionName, section_description: sectionDesc, status: "pending",
      });
      alert("Section request submitted for admin approval!");
    }
    setSectionName(""); setSectionDesc(""); setShowSectionForm(false);
  };

  const coverStyle = community?.cover_url
    ? { backgroundImage: `url(${community.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}aa)` };

  const sections = community?.sections || [];

  return (
    <>
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
        style={{ background: "rgba(0,0,0,0.92)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}>
        <motion.div
          className="w-full sm:max-w-2xl bg-gray-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col relative"
          style={{ border: `2px solid ${franchise.accent}44`, maxHeight: "92vh" }}
          initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Cover / Header */}
          <div className="relative" style={{ ...coverStyle, minHeight: 120 }}>
            <div className="absolute inset-0 bg-black/50" />
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
                <p className="text-white/50 text-xs flex items-center gap-2 mt-1 flex-wrap">
                  <Users className="w-3 h-3" /> {memberCount.toLocaleString()} members
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${franchise.accent}22`, color: franchise.accent }}>{franchise.genre}</span>
                  {isAccountMod && !admin && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 border border-blue-500/50 text-blue-400">🛡️ Account Mod</span>
                  )}
                  {isGroupMod && !admin && <CaptainBadge />}
                  {admin && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">👑 Admin</span>}
                  {isTier1 && !admin && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 border border-purple-500/50 text-purple-300">✓ Verified Partner</span>}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {user && (
                  <button onClick={handleJoin}
                    className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                    style={isJoined
                      ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
                      : { background: franchise.accent, color: "#fff" }}>
                    {isJoined ? "✓ Joined" : "+ Join"}
                  </button>
                )}
                {!isTier1 && user && (
                  <button onClick={() => setShowTier1Modal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all flex items-center gap-1"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    <Shield className="w-3 h-3" /> Get Verified — $0.99/mo
                  </button>
                )}
              </div>
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
                  {/* Logo Upload */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Group Logo</label>
                    <div className="flex items-center gap-3">
                      {editLogoUrl
                        ? <img src={editLogoUrl} className="w-14 h-14 rounded-xl object-cover border border-gray-700" alt="logo" />
                        : <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl">{franchise.emoji}</div>
                      }
                      <div className="flex-1">
                        <button type="button" onClick={() => logoFileRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-purple-700/60 bg-purple-900/20 text-purple-300 text-xs font-bold hover:bg-purple-900/40 transition-all">
                          <Upload className="w-3.5 h-3.5" /> {uploadingLogo ? "Uploading..." : editLogoUrl ? "Replace Logo" : "Upload from Device"}
                        </button>
                      </div>
                    </div>
                    <input ref={logoFileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                  {/* Cover Upload */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Cover Photo</label>
                    <button type="button" onClick={() => coverFileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-blue-700/60 bg-blue-900/20 text-blue-300 text-xs font-bold hover:bg-blue-900/40 transition-all">
                      <Upload className="w-3.5 h-3.5" /> {uploadingCover ? "Uploading..." : editCoverUrl ? "Replace Cover" : "Upload Cover from Device"}
                    </button>
                    {editCoverUrl && <img src={editCoverUrl} className="mt-2 w-full h-24 object-cover rounded-lg opacity-70" alt="cover preview" />}
                    <input ref={coverFileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block font-semibold">Description</label>
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
              {/* Post input — free for all joined users */}
              {user && (admin || isModerator || isJoined) && (
                <div className="px-5 py-3 border-b border-gray-800 flex-shrink-0 space-y-2">
                  <div className="flex gap-3 items-center">
                    <input value={newPost} onChange={e => setNewPost(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePost()}
                      placeholder={`Post in ${franchise.name}...`}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                    <button onClick={handlePost} disabled={!newPost.trim() || posting}
                      className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                      style={{ background: franchise.accent }}>
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <input value={postYoutubeUrl} onChange={e => setPostYoutubeUrl(e.target.value)}
                    placeholder="📺 YouTube link (optional)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-red-500" />
                </div>
              )}
              {user && !admin && !isModerator && !isJoined && (
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
                    {!isJoined && user && (
                      <p className="text-gray-500 text-xs mt-2">Join this community to post</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/60">
                    {posts.filter(p => p.status === "active").map(post => (
                      <CommunityPostCard
                        key={post.id}
                        post={post}
                        user={user}
                        profile={profile}
                        isTier1={isTier1}
                        canManage={canManage}
                        canDelete={canDelete}
                        accentColor={franchise.accent}
                        onFlag={handleFlagPost}
                        onRemove={handleRemovePost}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Community Listings pinned below feed */}
          {activeTab === "feed" && communityListings.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-800 flex-shrink-0">
              <p className="text-gray-500 text-xs font-semibold uppercase mb-2">📦 Community Listings</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {communityListings.map(l => (
                  <a key={l.id} href={`/category?id=${l.id}`}
                    className="flex-shrink-0 w-36 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-purple-600/50 transition-all">
                    {l.images?.[0]
                      ? <img src={l.images[0]} className="w-full h-20 object-cover" alt="" />
                      : <div className="w-full h-20 bg-gray-800 flex items-center justify-center text-2xl">🎮</div>
                    }
                    <div className="p-2">
                      <p className="text-white text-xs font-bold line-clamp-1">{l.title}</p>
                      <p className="text-purple-400 text-xs font-black mt-0.5">{l.is_free ? "FREE" : formatListingPrice(l.price, l.currency)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* SECTIONS TAB */}
          {activeTab === "sections" && (
            <div className="overflow-y-auto flex-1 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-white font-bold text-sm">Community Sections</h3>
                <div className="flex gap-2">
                  {/* Purple button — admin/mod: add subcategory directly */}
                  {canManage && (
                    <button onClick={() => setShowSectionForm(!showSectionForm)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black text-white"
                      style={{ background: "#7c3aed" }}>
                      <Plus className="w-3.5 h-3.5" /> Add Subcategory
                    </button>
                  )}
                  {/* Blue button — normal listing */}
                  <a href="/create-listing"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black text-white"
                    style={{ background: "#2563eb" }}>
                    <Send className="w-3.5 h-3.5" /> Post
                  </a>
                  {/* Tier 1: request section */}
                  {isTier1 && !canManage && isJoined && user && (
                    <button onClick={() => setShowSectionForm(!showSectionForm)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-300 bg-purple-900/30 border border-purple-700/40 hover:bg-purple-900/50">
                      <Plus className="w-3.5 h-3.5" /> Request Section
                    </button>
                  )}
                </div>
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
                    <a
                      key={i}
                      href={`/community-section?franchise=${franchise.id}&section=${encodeURIComponent(sec.id || sec.name)}&name=${encodeURIComponent(sec.name)}`}
                      className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-3 hover:border-purple-600/50 hover:bg-gray-900/80 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: `${franchise.accent}22`, color: franchise.accent }}>#</div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">{sec.name}</p>
                        {sec.description && <p className="text-gray-500 text-xs">{sec.description}</p>}
                      </div>
                      <span className="text-gray-600 text-xs group-hover:text-purple-400 transition-colors">View →</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODERATORS TAB */}
          {activeTab === "moderators" && canManage && (
            <div className="overflow-y-auto flex-1 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">
                {isAccountMod && !admin ? "Account Moderators" : "Group Moderators (Captains)"}
              </h3>
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
              {!isModerator && !admin && isJoined && user && (
                <div className="mt-6 p-4 rounded-xl bg-gray-900 border border-yellow-700/30 text-center">
                  <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm mb-1">Become a Group Captain?</p>
                  <p className="text-gray-500 text-xs mb-3">Apply for moderator status. You'll need to answer an interview question and take a pledge. Admin will review.</p>
                  <button onClick={() => setShowModRequest(true)}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #ca8a04, #7c3aed)" }}>
                    Apply as Group Captain 🛡️
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Tiered Membership Modal */}
      <AnimatePresence>
        {showTier1Modal && (
          <TieredMembershipModal
            user={user}
            profile={profile}
            onClose={() => setShowTier1Modal(false)}
            onSuccess={() => { setIsTier1(true); setShowTier1Modal(false); }}
          />
        )}
      </AnimatePresence>

      {/* Moderator application modal */}
      <AnimatePresence>
        {showModRequest && (
          <ModeratorRequestModal
            franchise={franchise}
            community={community}
            user={user}
            profile={profile}
            onClose={() => setShowModRequest(false)}
            onSubmitted={() => setShowModRequest(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}