import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Share2, Search, Send, Shield, Plus, Camera, X, Check, Upload, Link2, SlidersHorizontal, Eye, Download, Gamepad2 } from "lucide-react";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import TieredMembershipModal from "@/components/community/TieredMembershipModal";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { TOP_FRANCHISES } from "@/lib/franchises";
import { Link, useParams } from "react-router-dom";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import MultiAvatarDisplay from "@/components/shared/MultiAvatarDisplay";
import GroupChat from "@/components/community/GroupChat";
import AnimatedController from "@/components/shared/AnimatedController";

export default function CommunityLandingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isTier1, setIsTier1] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [listingFilter, setListingFilter] = useState({ priceMin: "", priceMax: "", isFree: false, isPremium: false });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editLogoUrls, setEditLogoUrls] = useState([]);
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editCoverUrls, setEditCoverUrls] = useState([]);
  const [activeCoverIdx, setActiveCoverIdx] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoRef = React.useRef(null);
  const coverRef = React.useRef(null);

  const routeParams = useParams();
  const params = new URLSearchParams(window.location.search);
  const franchiseId = routeParams.id || params.get("id") || params.get("franchise") || "";

  const franchise = TOP_FRANCHISES.find(f => f.id === franchiseId) || {
    id: franchiseId, name: franchiseId, emoji: "🎮", color: "#1a1a2e", accent: "#7c3aed", genre: "Gaming"
  };

  const admin = isAdmin(user?.email);
  const isAccountMod = profile?.moderator_type === "account_moderator";
  const canManage = admin || isModerator;
  const canDelete = admin || isAccountMod;

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    }
    loadData();
  }, [franchiseId, user?.email]);

  const loadData = async () => {
    setLoading(true);
    const [comms, membersData, postsData, listingsData] = await Promise.all([
      base44.entities.GamingCommunity.filter({ franchise_id: franchiseId }),
      base44.entities.CommunityMember.filter({ franchise_id: franchiseId }),
      base44.entities.CommunityPost.filter({ franchise_id: franchiseId }),
      base44.entities.Listing.filter({ community_franchise_id: franchiseId, status: "active" }),
    ]);
    const comm = comms[0] || null;
    setCommunity(comm);
    setEditLogoUrl(comm?.logo_url || "");
    setEditLogoUrls(comm?.logo_urls || []);
    setEditCoverUrl(comm?.cover_url || "");
    setEditCoverUrls(comm?.cover_urls || (comm?.cover_url ? [comm.cover_url] : []));
    setEditDesc(comm?.description || "");
    setMembers(membersData);
    const active = postsData.filter(p => p.status === "active")
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setPosts(active);
    setListings(listingsData.slice(0, 8));
    if (user?.email) {
      const myMember = membersData.find(m => m.user_email === user.email);
      setIsJoined(!!myMember);
      setIsModerator(myMember?.is_moderator || (comm?.moderator_emails || []).includes(user.email));
      const [subs] = await Promise.all([
        base44.entities.Tier1Subscription.filter({ user_email: user.email, status: "active" }),
      ]);
      setIsTier1(admin || subs.length > 0);
    }
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
    if (!user) { base44.auth.redirectToLogin(); return; }
    const comm = await ensureCommunity();
    if (isJoined) {
      const existing = members.find(m => m.user_email === user.email);
      if (existing) await base44.entities.CommunityMember.delete(existing.id);
      setIsJoined(false);
      setMembers(prev => prev.filter(m => m.user_email !== user.email));
    } else {
      const nm = await base44.entities.CommunityMember.create({
        community_id: comm.id, franchise_id: franchise.id,
        user_email: user.email, username: profile?.username || user.full_name || "Gamer",
        avatar_url: profile?.avatar_url || "", is_moderator: false,
      });
      setIsJoined(true);
      setMembers(prev => [...prev, nm]);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    // Free posting for all joined members
    if (!isJoined && !admin && !isModerator) return;
    setPosting(true);
    const comm = await ensureCommunity();
    const post = await base44.entities.CommunityPost.create({
      community_id: comm.id, franchise_id: franchise.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: newPost, likes: 0, status: "active",
    });
    setPosts(prev => [post, ...prev]);
    setNewPost("");
    setPosting(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditLogoUrl(file_url);
    setEditLogoUrls(prev => prev.includes(file_url) ? prev : [...prev, file_url]);
    setUploadingLogo(false);
  };
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditCoverUrl(file_url);
    setEditCoverUrls(prev => prev.includes(file_url) ? prev : [...prev, file_url]);
    setUploadingCover(false);
  };
  const handleSaveProfile = async () => {
    const comm = await ensureCommunity();
    const covers = editCoverUrls.filter(Boolean);
    const updated = await base44.entities.GamingCommunity.update(comm.id, {
      logo_url: editLogoUrl,
      logo_urls: editLogoUrls.filter(Boolean),
      cover_url: covers[0] || editCoverUrl,
      cover_urls: covers,
      description: editDesc,
    });
    setCommunity(updated); setShowEditProfile(false);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out the ${franchise.name} community on GAMER.Productions! 🎮`;
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const filteredPosts = posts
    .filter(p => !search || p.content.toLowerCase().includes(search.toLowerCase()) || p.author_username?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (sortOrder === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      if (sortOrder === "popular") return (b.likes || 0) - (a.likes || 0);
      return 0;
    });

  // Cover images for hero crossfade
  const coverImages = community?.cover_urls?.length > 0 ? community.cover_urls : (community?.cover_url ? [community.cover_url] : []);

  // Auto-transition cover
  useEffect(() => {
    if (coverImages.length <= 1) return;
    const t = setInterval(() => setActiveCoverIdx(i => (i + 1) % coverImages.length), 5000);
    return () => clearInterval(t);
  }, [coverImages.length]);

  const coverStyle = coverImages.length > 0
    ? { backgroundImage: `url(${coverImages[activeCoverIdx]})`, backgroundSize: "cover", backgroundPosition: "center", transition: "background-image 1s ease" }
    : { background: `linear-gradient(135deg, ${franchise.color}, #0a0a1a)` };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero Cover */}
      <div className="pt-16 relative overflow-hidden" style={{ ...coverStyle, minHeight: 260 }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-8">
          <Link to="/gaming-community" className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Communities
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4"
                style={{ borderColor: `${franchise.accent}66`, background: `${franchise.accent}22` }}>
                {(community?.logo_urls?.length > 0 || community?.logo_url) ? (
                  <MultiAvatarDisplay
                    images={community?.logo_urls?.length > 0 ? community.logo_urls : [community.logo_url]}
                    size={88}
                    rounded="rounded-2xl"
                    interval={3200}
                    showDots={(community?.logo_urls?.length || 0) > 1}
                    fallback={<span className="text-5xl">{franchise.emoji}</span>}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl flex items-center justify-center text-5xl">{franchise.emoji}</div>
                )}
              </div>
              {canManage && (
                <button onClick={() => setShowEditProfile(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 border-2 border-gray-950 flex items-center justify-center hover:bg-purple-500 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl sm:text-4xl font-black text-white">{franchise.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}44` }}>{franchise.genre}</span>
              </div>
              {community?.description && <p className="text-gray-300 text-sm mb-2">{community.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {members.length.toLocaleString()} members</span>
                <span className="flex items-center gap-1">📝 {posts.length} posts</span>
                {isModerator && <span className="flex items-center gap-1 text-yellow-400 font-bold"><Shield className="w-3.5 h-3.5" /> Captain</span>}
                {admin && <span className="text-yellow-400 font-bold">👑 Admin</span>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              {user && (
                <button onClick={handleJoin}
                  className="px-5 py-2.5 rounded-xl font-black text-sm transition-all"
                  style={isJoined
                    ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
                    : { background: franchise.accent, color: "#fff" }}>
                  {isJoined ? "✓ Joined" : "+ Join Community"}
                </button>
              )}
              {!user && (
                <button onClick={() => base44.auth.redirectToLogin()}
                  className="px-5 py-2.5 rounded-xl font-black text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Sign In to Join
                </button>
              )}
              <div className="flex gap-1">
                <button onClick={() => handleShare("facebook")} className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black hover:bg-blue-700 transition-colors" title="Share on Facebook">f</button>
                <button onClick={() => handleShare("whatsapp")} className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors" title="Share on WhatsApp">
                  <Share2 className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => handleShare("telegram")} className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center hover:bg-sky-600 transition-colors" title="Share on Telegram">
                  <span className="text-white text-xs font-black">✈</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiered Membership Modal */}
      <AnimatePresence>
        {showMembershipModal && (
          <TieredMembershipModal
            user={user} profile={profile}
            onClose={() => setShowMembershipModal(false)}
            onSuccess={() => { setIsTier1(true); setShowMembershipModal(false); }}
          />
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.9)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-950 border border-purple-700/40 rounded-3xl p-6 w-full max-w-md"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black">Edit Community Profile</h3>
                <button onClick={() => setShowEditProfile(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Logo Gallery <span className="text-gray-600">(up to 6 — auto-slide)</span></label>
                  {/* Gallery thumbnails */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editLogoUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className={`w-12 h-12 rounded-xl object-cover border-2 transition-all ${url === editLogoUrl ? "border-purple-500" : "border-gray-700"}`} alt="" />
                        <button onClick={() => { setEditLogoUrls(prev => prev.filter((_, idx) => idx !== i)); if (editLogoUrl === url) setEditLogoUrl(editLogoUrls.find((u, idx) => idx !== i) || ""); }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        {url !== editLogoUrl && <button onClick={() => setEditLogoUrl(url)} className="absolute inset-0 rounded-xl bg-black/50 text-white text-[8px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Primary</button>}
                      </div>
                    ))}
                    {editLogoUrls.length < 6 && (
                      <button onClick={() => logoRef.current?.click()}
                        className="w-12 h-12 rounded-xl border-2 border-dashed border-purple-700/60 bg-purple-900/20 text-purple-300 text-xs font-bold flex items-center justify-center hover:bg-purple-900/40 transition-all">
                        {uploadingLogo ? "…" : <Upload className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  {/* URL paste for logo */}
                  <div className="flex gap-2 mt-1">
                    <input value={logoUrlInput} onChange={e => setLogoUrlInput(e.target.value)}
                      placeholder="Or paste image URL"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                    <button onClick={() => { if (logoUrlInput.trim()) { setEditLogoUrl(logoUrlInput.trim()); setEditLogoUrls(prev => [...prev, logoUrlInput.trim()]); setLogoUrlInput(""); } }}
                      className="px-3 py-1.5 rounded-xl bg-blue-700/60 border border-blue-600/50 text-blue-300 text-xs font-bold flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Add URL
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Cover Photos <span className="text-gray-600">(up to 5 — auto-slide)</span></label>
                  {/* Cover gallery thumbnails */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editCoverUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className="w-16 h-10 rounded-lg object-cover border-2 border-gray-700" alt="" />
                        <button onClick={() => setEditCoverUrls(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                    {editCoverUrls.length < 5 && (
                      <button onClick={() => coverRef.current?.click()}
                        className="w-16 h-10 rounded-lg border-2 border-dashed border-blue-700/60 bg-blue-900/20 text-blue-300 text-xs font-bold flex items-center justify-center hover:bg-blue-900/40 transition-all">
                        {uploadingCover ? "…" : <Upload className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  {/* URL paste for cover */}
                  <div className="flex gap-2">
                    <input value={coverUrlInput} onChange={e => setCoverUrlInput(e.target.value)}
                      placeholder="Or paste cover image URL"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                    <button onClick={() => { if (coverUrlInput.trim()) { setEditCoverUrls(prev => [...prev, coverUrlInput.trim()]); setEditCoverUrl(coverUrlInput.trim()); setCoverUrlInput(""); } }}
                      className="px-3 py-1.5 rounded-xl bg-blue-700/60 border border-blue-600/50 text-blue-300 text-xs font-bold flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Add URL
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block font-semibold">Description</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
                </div>
                <button onClick={handleSaveProfile}
                  className="w-full py-3 rounded-xl font-black text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  <Check className="w-4 h-4 inline mr-2" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Feed */}
          <div className="lg:col-span-2">
            {/* Post input — free for all joined members */}
            {user && (admin || isModerator || isJoined) && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-5">
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-sm">{franchise.emoji}</div>}
                  </div>
                  <input value={newPost} onChange={e => setNewPost(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePost()}
                    placeholder={`Post in ${franchise.name} community...`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                  <button onClick={handlePost} disabled={!newPost.trim() || posting}
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                    style={{ background: franchise.accent }}>
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Search & Sort */}
            <div className="flex gap-3 mb-3 flex-wrap">
              <div className="flex-1 relative min-w-[140px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              </div>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-gray-400 text-sm focus:outline-none focus:border-purple-500">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Liked</option>
              </select>
              <button onClick={() => setShowAdvFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${showAdvFilter ? "border-purple-500/60 bg-purple-900/20 text-purple-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filter
              </button>
            </div>
            {/* Advanced listing filters */}
            <AnimatePresence>
              {showAdvFilter && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4">
                  <div className="bg-gray-900 border border-purple-700/30 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input type="number" value={listingFilter.priceMin} onChange={e => setListingFilter(f => ({ ...f, priceMin: e.target.value }))}
                      placeholder="Min ₱" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                    <input type="number" value={listingFilter.priceMax} onChange={e => setListingFilter(f => ({ ...f, priceMax: e.target.value }))}
                      placeholder="Max ₱" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={listingFilter.isFree} onChange={e => setListingFilter(f => ({ ...f, isFree: e.target.checked }))} className="accent-green-500 w-3.5 h-3.5 rounded" />
                      <span className="text-green-400 text-xs font-semibold">Free Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={listingFilter.isPremium} onChange={e => setListingFilter(f => ({ ...f, isPremium: e.target.checked }))} className="accent-yellow-500 w-3.5 h-3.5 rounded" />
                      <span className="text-yellow-400 text-xs font-semibold">Premium Only</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts */}
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-gray-900 animate-pulse" />)}</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-gray-900 border border-gray-800">
                <p className="text-4xl mb-3">{franchise.emoji}</p>
                <p className="text-gray-400 font-semibold">No posts yet</p>
                <p className="text-gray-600 text-sm mt-1">Be the first to post in this community!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    user={user}
                    profile={profile}
                    isTier1={isTier1}
                    canManage={canManage}
                    canDelete={canDelete}
                    accentColor={franchise.accent}
                    onFlag={async (p) => {
                      await base44.entities.CommunityPost.update(p.id, { status: "pending_review" });
                      setPosts(prev => prev.filter(x => x.id !== p.id));
                    }}
                    onRemove={async (p) => {
                      await base44.entities.CommunityPost.update(p.id, { status: "removed" });
                      setPosts(prev => prev.filter(x => x.id !== p.id));
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Community Info */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <h3 className="text-white font-black text-sm mb-3">About Community</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Members</span><span className="text-white font-bold">{members.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Posts</span><span className="text-white font-bold">{posts.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Genre</span><span className="text-white font-bold">{franchise.genre}</span>
                </div>
              </div>
              {canManage && (
                <button onClick={() => setShowEditProfile(true)}
                  className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-900/20 border border-purple-700/30 hover:bg-purple-900/40 transition-all flex items-center justify-center gap-2">
                  <Camera className="w-3.5 h-3.5" /> Edit Community Profile
                </button>
              )}
              {!isTier1 && user && (
                <button onClick={() => setShowMembershipModal(true)}
                  className="mt-2 w-full py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  <Shield className="w-3 h-3" /> Get Verified — from $0.99/mo
                </button>
              )}
            </div>

            {/* Share */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <h3 className="text-white font-black text-sm mb-3">Share Community</h3>
              <div className="flex gap-2">
                <button onClick={() => handleShare("facebook")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button onClick={() => handleShare("whatsapp")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors">
                  WhatsApp
                </button>
                <button onClick={() => handleShare("telegram")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors">
                  Telegram
                </button>
              </div>
            </div>

            {/* Listings */}
            {listings.length > 0 && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                <h3 className="text-white font-black text-sm mb-3">📦 Community Listings</h3>
                <div className="space-y-3">
                  {listings.map(l => (
                    <div key={l.id}>
                      <Link to={`/listing?id=${l.id}`}
                        onClick={async (e) => {
                          // Increment view count on click
                          try {
                            const fresh = await base44.entities.Listing.get(l.id);
                            const newViews = (fresh.views || 0) + 1;
                            await base44.entities.Listing.update(l.id, { views: newViews });
                          } catch {}
                        }}
                        className="flex gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors group">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          {l.images?.[0] ? <img src={l.images[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center">🎮</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-purple-300 transition-colors">{l.title}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="font-black text-xs" style={{ color: franchise.accent }}>{l.is_free || !l.price ? "FREE" : `₱${l.price}`}</p>
                            <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                              <Eye className="w-2.5 h-2.5" />{(l.views || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="px-2 pb-1">
                        <ListingEngagementBar listing={l} user={user} profile={profile} compact />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
              <h3 className="text-white font-black text-sm mb-3">Members ({members.length})</h3>
              <div className="flex flex-wrap gap-2">
                {members.slice(0, 12).map(m => (
                  <div key={m.id} className="relative" title={m.username}>
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2"
                      style={{ borderColor: m.is_moderator ? "#f59e0b" : `${franchise.accent}44` }}>
                      {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">{(m.username || "G")[0].toUpperCase()}</div>}
                    </div>
                    {m.is_moderator && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center text-[8px]">🛡</div>}
                  </div>
                ))}
                {members.length > 12 && <div className="w-9 h-9 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-xs text-gray-500">+{members.length - 12}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Group Chat — floating for every community */}
      <GroupChat
        franchiseId={franchise.id}
        communityId={community?.id}
        user={user}
        profile={profile}
        accentColor={franchise.accent}
      />
    </div>
  );
}