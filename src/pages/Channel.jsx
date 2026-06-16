import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube, Instagram, Twitter, Facebook, Globe, Play,
  Users, Eye, Heart, Edit2, Check, Plus, ExternalLink, Upload, Wand2,
  MessageCircle, Share2, Image as ImageIcon, X, Send, Gamepad2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PostCard from "@/components/channel/PostCard";
import ChannelThemePicker, { THEMES } from "@/components/channel/ChannelThemePicker";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import { isAdmin } from "@/lib/constants";
import EditProfileModal from "@/components/profile/EditProfileModal";
import UserPointsBadge from "@/components/profile/UserPointsBadge";

const CONTENT_SUBCATEGORIES = [
  "gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "livestream", "other"
];

const SOCIAL_PLATFORMS = [
  { key: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "text-red-400 border-red-700/40 bg-red-900/10", placeholder: "https://youtube.com/@yourchannel" },
  { key: "twitch", label: "Twitch", icon: <span className="text-xs font-black">📺</span>, color: "text-purple-400 border-purple-700/40 bg-purple-900/10", placeholder: "https://twitch.tv/yourchannel" },
  { key: "steam", label: "Steam", icon: <span className="text-xs font-black">🎮</span>, color: "text-blue-300 border-blue-600/40 bg-blue-900/10", placeholder: "https://steamcommunity.com/id/yourprofile" },
  { key: "playstation", label: "PlayStation", icon: <span className="text-xs font-black">🕹️</span>, color: "text-blue-400 border-blue-600/40 bg-blue-900/10", placeholder: "https://psnprofiles.com/yourid" },
  { key: "xbox", label: "Xbox", icon: <span className="text-xs font-black">🟢</span>, color: "text-green-400 border-green-600/40 bg-green-900/10", placeholder: "https://account.xbox.com/en-us/profile?gamerTag=yourTag" },
  { key: "epicgames", label: "Epic Games", icon: <span className="text-xs font-black">⚫</span>, color: "text-gray-300 border-gray-600/40 bg-gray-800/50", placeholder: "https://store.epicgames.com/en-US/u/yourid" },
  { key: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "text-pink-400 border-pink-700/40 bg-pink-900/10", placeholder: "https://instagram.com/yourhandle" },
  { key: "twitter", label: "X / Twitter", icon: <Twitter className="w-4 h-4" />, color: "text-blue-400 border-blue-700/40 bg-blue-900/10", placeholder: "https://x.com/yourhandle" },
  { key: "facebook", label: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "text-blue-500 border-blue-600/40 bg-blue-900/10", placeholder: "https://facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", icon: <span className="text-xs font-black">TT</span>, color: "text-white border-gray-600/40 bg-gray-800/50", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "whatsapp", label: "WhatsApp", icon: <span className="text-xs font-black">💬</span>, color: "text-green-400 border-green-600/40 bg-green-900/10", placeholder: "+639XXXXXXXXX or https://wa.me/..." },
  { key: "telegram", label: "Telegram", icon: <span className="text-xs font-black">✈️</span>, color: "text-sky-400 border-sky-600/40 bg-sky-900/10", placeholder: "@yourusername or https://t.me/..." },
  { key: "website", label: "Website", icon: <Globe className="w-4 h-4" />, color: "text-green-400 border-green-700/40 bg-green-900/10", placeholder: "https://yourwebsite.com" },
];

export default function Channel() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialLinks, setSocialLinks] = useState({});
  const [savingSocial, setSavingSocial] = useState(false);
  const [savedSocial, setSavedSocial] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoSubcategory, setVideoSubcategory] = useState("gameplay");
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const fileInputRef = React.useRef(null);
  
  // Posts state
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postTags, setPostTags] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [uploadingPost, setUploadingPost] = useState(false);
  const postFileInputRef = React.useRef(null);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [channelTheme, setChannelTheme] = useState(() => localStorage.getItem("channel_theme") || "default");
  const setupMode = new URLSearchParams(window.location.search).get("setup") === "1";
  const [showEditProfile, setShowEditProfile] = useState(setupMode);

  // Check if viewing someone else's channel via ?email=
  const urlParams = new URLSearchParams(window.location.search);
  const viewEmail = urlParams.get("email");
  const isNewAccount = urlParams.get("new_account") === "1";
  const [targetEmail, setTargetEmail] = useState(null);
  const [showNewAccountBanner, setShowNewAccountBanner] = useState(isNewAccount);

  // Auto-hide banner after 5 seconds
  React.useEffect(() => {
    if (showNewAccountBanner) {
      const timer = setTimeout(() => setShowNewAccountBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNewAccountBanner]);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const email = viewEmail || me?.email;
      setTargetEmail(email);
      if (email) {
        const [profiles, myVideos, myPosts] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: email }),
          base44.entities.VideoPost.filter({ creator_email: email }),
          base44.entities.ChannelPost.filter({ creator_email: email }),
        ]);
        const p = profiles[0] || null;
        setProfile(p);
        setSocialLinks(p?.social_links || {});
        setVideos(myVideos.filter(v => v.status === "active"));
        setPosts(myPosts.filter(post => post.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      }
      setLoading(false);
    };
    init();
  }, []);

  const ghostSession = (() => {
    try { return JSON.parse(localStorage.getItem("impersonation_session") || "{}"); } catch { return {}; }
  })();
  const isGhostOwner = ghostSession.isImpersonating && ghostSession.isGhostLogin && ghostSession.targetEmail === targetEmail;
  const isOwner = !viewEmail || (user && viewEmail === user.email) || isGhostOwner;
  const currentThemeObj = THEMES.find(t => t.id === channelTheme) || THEMES[0];
  const handleThemeChange = (themeId) => {
    setChannelTheme(themeId);
    localStorage.setItem("channel_theme", themeId);
  };

  const saveSocialLinks = async () => {
    if (!profile?.id) return;
    setSavingSocial(true);
    await base44.entities.UserProfile.update(profile.id, { social_links: socialLinks });
    setProfile(prev => ({ ...prev, social_links: socialLinks }));
    setSavingSocial(false);
    setSavedSocial(true);
    setEditingSocial(false);
    setTimeout(() => setSavedSocial(false), 3000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const displayName = profile?.display_name || profile?.username || user?.full_name || "Gamer";
  const connectedSocials = SOCIAL_PLATFORMS.filter(p => profile?.social_links?.[p.key]);
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

  return (
    <div className="min-h-screen text-white" style={{ background: currentThemeObj.bg, minHeight: "100vh" }}>
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16">

        {/* New Account Banner */}
        <AnimatePresence>
          {showNewAccountBanner && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-900/50 border border-green-400/50 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-sm">✨ New Ghost Account Created!</p>
                <p className="text-[10px] text-green-100">You're now managing as {profile?.username || "this user"}</p>
              </div>
              <button onClick={() => setShowNewAccountBanner(false)} className="ml-2 text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900/60 to-pink-900/40 overflow-hidden">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(139,92,246,0.3), rgba(236,72,153,0.15), #030712)" }} />
          )}
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          {/* Cover photo upload button */}
          {isOwner && (
            <label className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/80 border border-gray-700 text-gray-200 text-xs font-semibold cursor-pointer hover:bg-gray-800 transition-colors backdrop-blur-sm">
              <Upload className="w-4 h-4" /> Change Cover
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files[0];
                if (!file || !profile?.id) return;
                const { file_url } = await uploadFileToR2(file, "channel-covers");
                const updated = await base44.entities.UserProfile.update(profile.id, { banner_url: file_url });
                setProfile(updated);
              }} />
            </label>
          )}
        </div>

        {/* Profile Row */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-4 border-gray-950 bg-gray-800 overflow-hidden shadow-xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                )}
              </div>
              {isOwner && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 border-2 border-gray-950 flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file || !profile?.id) return;
                    const { file_url } = await uploadFileToR2(file, "channel-avatars");
                    await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
                    setProfile(prev => ({ ...prev, avatar_url: file_url }));
                  }} />
                </label>
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap" style={{ lineHeight: 1 }}>
                <h1 className="text-2xl font-black text-white leading-none">{displayName}</h1>
                {(profile?.is_verified || isAdmin(user?.email)) && (
                  <span className="inline-flex items-center" style={{ marginTop: 1 }}>
                    <GamerCheckmark
                      isVerified={profile?.is_verified}
                      userEmail={user?.email}
                      size="md"
                      showTooltip={true}
                      showLabel={false}
                    />
                  </span>
                )}
                {profile?.gaming_checkmark && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-600/40 text-purple-300 text-xs font-bold">
                    🎮 Gaming
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-gray-400 text-sm">@{profile?.username}</p>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${profile?.is_active !== false ? "bg-green-900/40 border border-green-700/40 text-green-400" : "bg-red-900/40 border border-red-700/40 text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile?.is_active !== false ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {profile?.is_active !== false ? "Active" : "Offline"}
                </span>
              </div>
              {profile?.bio && <p className="text-gray-400 text-sm mt-1 max-w-xl">{profile.bio}</p>}
              {/* Points & Leaderboard rank */}
              <UserPointsBadge userEmail={profile?.user_email || user?.email} />
              {/* YouTube Channel Info */}
              {profile?.youtube_url && (
                <div className="flex items-center gap-3 mt-2">
                  <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-900/20 border border-red-700/40 text-red-300 text-xs font-bold hover:bg-red-900/30 transition-colors">
                    <Youtube className="w-3.5 h-3.5" />
                    {profile.youtube_subscribers > 0 ? `${profile.youtube_subscribers.toLocaleString()} subscribers` : "YouTube Channel"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {/* Admin official social links */}
              {isAdmin(profile?.user_email) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <a href="https://www.facebook.com/share/1HEwVHqjHc/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold hover:opacity-80"
                    style={{ background: "#1877f2" }}>
                    <span className="font-black">f</span> Facebook
                  </a>
                  <a href="https://youtube.com/@registeredgamerproductions?si=Ypv_k-lHs-UBRDAe" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold hover:opacity-80"
                    style={{ background: "#ff0000" }}>
                    <span className="font-black">▶</span> YouTube
                  </a>
                </div>
              )}
              {/* Support Links: Ko-fi, Buy Me a Coffee, Patreon */}
              {(profile?.kofi_url || profile?.buymeacoffee_url || profile?.patreon_url) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {profile.kofi_url && (
                    <a href={profile.kofi_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-900/20 border border-orange-700/40 text-orange-300 text-xs font-bold hover:bg-orange-900/40 transition-colors">
                      ☕ Ko-fi <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {profile.buymeacoffee_url && (
                    <a href={profile.buymeacoffee_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-900/20 border border-yellow-700/40 text-yellow-300 text-xs font-bold hover:bg-yellow-900/40 transition-colors">
                      ☕ Buy Me a Coffee <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {profile.patreon_url && (
                    <a href={profile.patreon_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-900/20 border border-red-600/40 text-red-300 text-xs font-bold hover:bg-red-900/40 transition-colors">
                      🎖️ Patreon <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <ChannelThemePicker currentTheme={channelTheme} onSelect={handleThemeChange} />
                <button onClick={() => setShowEditProfile(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-6 flex-wrap">
            {[
              { label: "Videos", value: videos.length },
              { label: "Total Views", value: totalViews.toLocaleString() },
              { label: "Registered", value: profile?.followers_count || 0 },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">Social Media</p>
              {isOwner && !editingSocial && (
                <button onClick={() => setEditingSocial(true)}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Connect Socials
                </button>
              )}
              {isOwner && editingSocial && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingSocial(false)} className="text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                  <button onClick={saveSocialLinks} disabled={savingSocial}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">
                    <Check className="w-3 h-3" /> {savingSocial ? "Saving..." : savedSocial ? "Saved!" : "Save"}
                  </button>
                </div>
              )}
            </div>

            {editingSocial ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key} className={`flex items-center gap-3 p-3 rounded-xl border ${platform.color}`}>
                    <div className="flex-shrink-0">{platform.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold mb-1">{platform.label}</p>
                      <input
                        value={socialLinks[platform.key] || ""}
                        onChange={e => setSocialLinks(prev => ({ ...prev, [platform.key]: e.target.value }))}
                        placeholder={platform.placeholder}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : connectedSocials.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {connectedSocials.map((platform) => (
                  <a key={platform.key} href={profile.social_links[platform.key]} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${platform.color} hover:opacity-80 transition-opacity`}>
                    {platform.icon}
                    {platform.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">{isOwner ? "No social accounts connected yet — click \"Connect Socials\" to add them." : "No social accounts connected."}</p>
            )}
          </div>

          {/* Posts Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">Posts ({posts.length})</h2>
              {isOwner && (
                <button onClick={() => setShowPostModal(true)} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Create Post
                </button>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">No posts yet</p>
                {isOwner && (
                  <button onClick={() => setShowPostModal(true)} className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                    Create First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    profile={profile}
                    onLike={async () => {
                      // Toggle like
                      const existingLike = await base44.entities.PostLike.filter({ post_id: post.id, user_email: user.email });
                      if (existingLike.length > 0) {
                        await base44.entities.PostLike.delete(existingLike[0].id);
                        await base44.entities.ChannelPost.update(post.id, { likes: (post.likes || 0) - 1 });
                      } else {
                        await base44.entities.PostLike.create({ post_id: post.id, user_email: user.email });
                        await base44.entities.ChannelPost.update(post.id, { likes: (post.likes || 0) + 1 });
                      }
                      // Refresh posts
                      const updated = await base44.entities.ChannelPost.filter({ creator_email: targetEmail });
                      setPosts(updated.filter(p => p.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
                    }}
                    onComment={async (content) => {
                      await base44.entities.ChannelPostComment.create({
                        post_id: post.id,
                        author_email: user.email,
                        author_username: profile?.username || user.full_name,
                        author_avatar: profile?.avatar_url || "",
                        content,
                      });
                      await base44.entities.ChannelPost.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
                      // Refresh
                      const updated = await base44.entities.ChannelPost.filter({ creator_email: targetEmail });
                      setPosts(updated.filter(p => p.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
                    }}
                    onShare={async () => {
                      await base44.entities.ChannelPost.update(post.id, { shares_count: (post.shares_count || 0) + 1 });
                      // Copy link
                      navigator.clipboard.writeText(window.location.href);
                      const updated = await base44.entities.ChannelPost.filter({ creator_email: targetEmail });
                      setPosts(updated.filter(p => p.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">Videos ({videos.length})</h2>
              {isOwner && (
                <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Upload Video
                </button>
              )}
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
                <Play className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold mb-1">No videos yet</p>
                {isOwner && (
                  <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                    <Upload className="w-4 h-4" /> Upload Your First Video
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((v, i) => (
                  <motion.a key={v.id}
                    href={v.youtube_url || `https://youtube.com/watch?v=${v.youtube_video_id}`}
                    target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-purple-700/50 transition-colors">
                    <div className="relative aspect-video bg-gray-800 overflow-hidden">
                      {v.thumbnail_url ? (
                        <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-10 h-10 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-white font-bold text-sm line-clamp-2 leading-snug">{v.title}</p>
                      <div className="flex items-center gap-3 mt-2 text-gray-500 text-xs">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{v.likes || 0}</span>
                        {v.is_monetized && <span className="text-green-400 font-semibold">💰 Monetized</span>}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup banner for new Google sign-ins */}
      {setupMode && !showEditProfile && profile && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", maxWidth: "90vw" }}>
          <span className="text-xl">👋</span>
          <div>
            <p className="text-white font-black text-sm">Welcome! No profile found — let's set yours up</p>
            <p className="text-white/70 text-xs">You signed in with Google. Complete your profile to get started.</p>
          </div>
          <button onClick={() => setShowEditProfile(true)} className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-colors">
            Set Up Now →
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && profile && (
        <EditProfileModal
          profile={profile}
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSaved={(updated) => setProfile(updated)}
        />
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowUploadModal(false)}>
          <div className="bg-gray-900 border border-purple-700/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">Upload Video</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-600 hover:text-white"><Upload className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 mb-4">
              <a href="/studio" onClick={() => setShowUploadModal(false)}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/40 border border-purple-600/40 rounded-2xl hover:border-purple-500 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    🎬 Create in Studio
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/30 border border-pink-500/40 text-pink-300 text-[9px] font-black">NEW</span>
                  </p>
                  <p className="text-purple-300 text-xs mt-0.5">Edit & create videos with AI tools</p>
                </div>
              </a>

              <button type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-700/50 rounded-2xl hover:border-blue-600/40 transition-colors group w-full text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Upload Video from Device</p>
                  <p className="text-gray-500 text-xs">Select and publish a video file</p>
                </div>
              </button>
            </div>

            <div className="mt-4">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Select Subcategory</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_SUBCATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setVideoSubcategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${videoSubcategory === cat ? "bg-blue-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-gray-500 text-xs text-center mt-3">After selecting a video, you'll be able to publish it</p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setSelectedVideoFile(file);
                setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
              }}
              className="hidden"
            />
            
            {/* Show publish option after video selected */}
            {selectedVideoFile && (
              <div className="mt-4 space-y-3">
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3">
                  <p className="text-blue-300 text-xs font-bold mb-2">Selected: {selectedVideoFile.name}</p>
                  <input
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    placeholder="Video title..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!videoTitle.trim()) return;
                        setUploadingVideo(true);
                        try {
                          const { file_url } = await uploadFileToR2(selectedVideoFile, "channel-videos");
                          await base44.entities.VideoPost.create({
                            creator_email: user.email,
                            creator_username: profile?.username || user.full_name,
                            creator_avatar: profile?.avatar_url || "",
                            title: videoTitle.trim(),
                            description: "",
                            youtube_url: "",
                            youtube_video_id: "",
                            video_url: file_url,
                            image_urls: [],
                            game_tag: "",
                            category: videoSubcategory,
                            status: "active",
                            is_approved: true,
                          });
                          const videos = await base44.entities.VideoPost.filter({ creator_email: user.email });
                          setVideos(videos.filter(v => v.status === "active"));
                          setShowUploadModal(false);
                          setSelectedVideoFile(null);
                          setVideoTitle("");
                          window.location.reload();
                        } catch (error) {
                          console.error("Upload failed:", error);
                        } finally {
                          setUploadingVideo(false);
                        }
                      }}
                      disabled={uploadingVideo || !videoTitle.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {uploadingVideo ? "Publishing..." : "Publish Video"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideoFile(null);
                        setVideoTitle("");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowPostModal(false)}>
          <div className="bg-gray-900 border border-purple-700/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">Create Post</h2>
              <button onClick={() => setShowPostModal(false)} className="text-gray-600 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Add Photos</label>
                {postImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {postImages.map((img, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => setPostImages(postImages.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => postFileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 text-gray-400 hover:text-purple-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  {postImages.length === 0 ? "Select Photos from Device" : "Add More Photos"}
                </button>
                <input
                  ref={postFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    setUploadingPost(true);
                    for (const file of files) {
                      const { file_url } = await uploadFileToR2(file, "channel-post-images");
                      setPostImages(prev => [...prev, file_url]);
                    }
                    setUploadingPost(false);
                  }}
                  className="hidden"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Caption</label>
                <textarea
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
                <input
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="gaming, fps, multiplayer..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (postImages.length === 0 && !postCaption.trim()) return;
                    setUploadingPost(true);
                    try {
                      await base44.entities.ChannelPost.create({
                        creator_email: user.email,
                        creator_username: profile?.username || user.full_name,
                        creator_avatar: profile?.avatar_url || "",
                        content_type: postImages.length > 0 ? "image" : "text",
                        image_urls: postImages,
                        caption: postCaption.trim(),
                        tags: postTags.split(",").map(t => t.trim()).filter(Boolean),
                        likes: 0,
                        comments_count: 0,
                        shares_count: 0,
                        status: "active",
                        is_approved: true,
                      });
                      const updated = await base44.entities.ChannelPost.filter({ creator_email: targetEmail });
                      setPosts(updated.filter(p => p.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
                      setShowPostModal(false);
                      setPostCaption("");
                      setPostTags("");
                      setPostImages([]);
                    } catch (error) {
                      console.error("Post creation failed:", error);
                    } finally {
                      setUploadingPost(false);
                    }
                  }}
                  disabled={uploadingPost || (postImages.length === 0 && !postCaption.trim())}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {uploadingPost ? "Posting..." : "Publish Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}