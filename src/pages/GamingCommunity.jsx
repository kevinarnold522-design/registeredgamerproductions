import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Pencil, Plus, X, Check, Send, GripVertical, Link2, Upload, ArrowLeft, EyeOff, Eye, SlidersHorizontal, Download, Filter, CheckSquare, Square, Gamepad2, Image, Video, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin, MODERATOR_TYPES } from "@/lib/constants";
import { TOP_FRANCHISES } from "@/lib/franchises";
import MultiAvatarDisplay from "@/components/shared/MultiAvatarDisplay";
import RecommendModal from "@/components/shared/RecommendModal";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import AnimatedController from "@/components/shared/AnimatedController";

const DEFAULT_FEED_FILTERS = { priceMin: "", priceMax: "", isFree: false, isPremium: false, sortBy: "newest", contentType: "all" };

// Newsfeed for a community franchise
function CommunityNewsfeed({ franchise, community, user, profile }) {
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [postVideos, setPostVideos] = useState([]);
  const [crossPostModding, setCrossPostModding] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [feedFilters, setFeedFilters] = useState(DEFAULT_FEED_FILTERS);

  useEffect(() => {
    const load = async () => {
      try {
        // Load posts for this franchise
        const allPosts = await base44.entities.CommunityPost.filter({ franchise_id: franchise.id });
        // Load listings: first try franchise-linked, then fallback to recent active listings
        let allListings = await base44.entities.Listing.filter({ community_franchise_id: franchise.id }, "-created_date", 20);
        if (allListings.length === 0) {
          // Fallback: show recent listings matching franchise name or any active listings
          allListings = await base44.entities.Listing.list("-created_date", 20);
        }
        setPosts(allPosts.filter(p => p.status === "active").sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 50));
        setListings(allListings.filter(l => l.status === "active").slice(0, 20));
      } catch { setPosts([]); setListings([]); }
      setLoading(false);
    };
    load();
  }, [franchise.id]);

  const handlePost = async () => {
    if ((!newPost.trim() && !postDescription.trim()) || !user) return;
    setPosting(true);
    const post = await base44.entities.CommunityPost.create({
      community_id: community?.id || franchise.id,
      franchise_id: franchise.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: newPost,
      description: postDescription,
      image_urls: postImages,
      video_urls: postVideos,
      likes: 0,
      status: "active",
    });
    setPosts(prev => [post, ...prev]);
    // Cross-post to modding community if selected
    if (crossPostModding) {
      base44.entities.CommunityPost.create({
        community_id: "modding",
        franchise_id: "modding",
        author_email: user.email,
        author_username: profile?.username || user.full_name || "Gamer",
        author_avatar: profile?.avatar_url || "",
        content: newPost,
        description: postDescription,
        image_urls: postImages,
        video_urls: postVideos,
        likes: 0,
        status: "active",
        section_id: franchise.id,
      }).catch(() => {});
    }
    setNewPost("");
    setPostDescription("");
    setPostImages([]);
    setPostVideos([]);
    setPosting(false);
  };

  const handlePostImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPostImages(prev => [...prev, file_url]);
  };

  const handlePostVideoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPostVideos(prev => [...prev, file_url]);
  };

  // Filtered listings
  const filteredListings = listings.filter(l => {
    if (feedFilters.isFree && !(l.price === 0 || l.is_free)) return false;
    if (feedFilters.isPremium && !l.is_premium) return false;
    if (feedFilters.priceMin !== "" && (l.price || 0) < parseFloat(feedFilters.priceMin)) return false;
    if (feedFilters.priceMax !== "" && (l.price || 0) > parseFloat(feedFilters.priceMax)) return false;
    return true;
  });

  // Merge posts + listings by date inside the feed
  const allMerged = [
    ...(feedFilters.contentType !== "listings" ? posts.map(p => ({ type: "post", item: p, date: p.created_date })) : []),
    ...(feedFilters.contentType !== "posts" ? filteredListings.map(l => ({ type: "listing", item: l, date: l.created_date })) : []),
  ];
  const merged = allMerged.sort((a, b) => {
    if (feedFilters.sortBy === "newest") return new Date(b.date) - new Date(a.date);
    if (feedFilters.sortBy === "oldest") return new Date(a.date) - new Date(b.date);
    if (feedFilters.sortBy === "popular") {
      const aScore = a.type === "listing" ? (a.item.views || 0) : (a.item.likes || 0);
      const bScore = b.type === "listing" ? (b.item.views || 0) : (b.item.likes || 0);
      return bScore - aScore;
    }
    return 0;
  });

  return (
    <motion.div key={franchise.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="h-[800px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${franchise.color}cc, ${franchise.color}88)` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-black">{franchise.name} Feed</p>
            <p className="text-white/40 text-[10px]">Posts & listings · {merged.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${showFilters ? "bg-purple-600/30 text-purple-300" : "bg-white/10 text-white/60 hover:text-white"}`}>
              <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>
            <a href={`/community/${franchise.id}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: `${franchise.accent}30`, color: franchise.accent, border: `1px solid ${franchise.accent}44` }}>
              Full Page →
            </a>
          </div>
        </div>
        {/* Advanced filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2">
              <div className="bg-black/30 rounded-xl p-3 grid grid-cols-2 gap-2">
                <select value={feedFilters.contentType} onChange={e => setFeedFilters(f => ({ ...f, contentType: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none">
                  <option value="all">All Content</option>
                  <option value="posts">Posts Only</option>
                  <option value="listings">Listings Only</option>
                </select>
                <select value={feedFilters.sortBy} onChange={e => setFeedFilters(f => ({ ...f, sortBy: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
                <input type="number" value={feedFilters.priceMin} onChange={e => setFeedFilters(f => ({ ...f, priceMin: e.target.value }))}
                  placeholder="Min ₱" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none" />
                <input type="number" value={feedFilters.priceMax} onChange={e => setFeedFilters(f => ({ ...f, priceMax: e.target.value }))}
                  placeholder="Max ₱" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none" />
                <label className="flex items-center gap-1.5 cursor-pointer col-span-1">
                  <input type="checkbox" checked={feedFilters.isFree} onChange={e => setFeedFilters(f => ({ ...f, isFree: e.target.checked }))} className="accent-green-500 w-3 h-3 rounded" />
                  <span className="text-green-400 text-[10px] font-semibold">Free Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer col-span-1">
                  <input type="checkbox" checked={feedFilters.isPremium} onChange={e => setFeedFilters(f => ({ ...f, isPremium: e.target.checked }))} className="accent-yellow-500 w-3 h-3 rounded" />
                  <span className="text-yellow-400 text-[10px] font-semibold">Premium Only</span>
                </label>
              </div>
              {(feedFilters.isFree || feedFilters.isPremium || feedFilters.priceMin || feedFilters.priceMax || feedFilters.sortBy !== "newest" || feedFilters.contentType !== "all") && (
                <button onClick={() => setFeedFilters(DEFAULT_FEED_FILTERS)} className="mt-1.5 text-[9px] text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                  <X className="w-2.5 h-2.5" /> Reset filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Post input */}
      {user ? (
        <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex gap-2 mb-2">
            <input value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder={`What's on your mind in ${franchise.name}?`}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>
          <textarea value={postDescription} onChange={e => setPostDescription(e.target.value)}
            placeholder="Add description (optional)..."
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 mb-2 resize-none" />
          
          {/* Media previews */}
          {(postImages.length > 0 || postVideos.length > 0) && (
            <div className="flex gap-2 flex-wrap mb-2">
              {postImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-700" alt="" />
                  <button onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px]">×</button>
                </div>
              ))}
              {postVideos.map((url, i) => (
                <div key={i} className="relative group">
                  <video src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-700" muted />
                  <button onClick={() => setPostVideos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px]">×</button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <label className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-purple-400 cursor-pointer text-[10px]">
              <Image className="w-3.5 h-3.5" /> Images
              <input type="file" accept="image/*" onChange={handlePostImageUpload} className="hidden" multiple />
            </label>
            <label className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-purple-400 cursor-pointer text-[10px]">
              <Video className="w-3.5 h-3.5" /> Videos
              <input type="file" accept="video/*" onChange={handlePostVideoUpload} className="hidden" multiple />
            </label>
            <button onClick={handlePost} disabled={(!newPost.trim() && !postDescription.trim()) || posting}
              className="ml-auto px-3 py-1.5 rounded-xl font-bold text-[10px] text-white flex items-center gap-1 disabled:opacity-50"
              style={{ background: franchise.accent }}>
              <Send className="w-3.5 h-3.5" /> Post
            </button>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={crossPostModding} onChange={e => setCrossPostModding(e.target.checked)}
              className="w-3 h-3 rounded accent-orange-500" />
            <span className="text-[9px] text-orange-400 font-semibold">Also post in Modding Community 🔧</span>
          </label>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0 text-center">
          <p className="text-gray-400 text-xs font-semibold mb-2">🎮 Sign in to start posting!</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            Sign In / Register
          </button>
        </div>
      )}
      {/* Feed: posts + listings mixed */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-600 text-sm">Loading...</div>
        ) : merged.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">{franchise.emoji}</p>
            <p className="text-gray-600 text-sm">No posts yet. Be the first!</p>
          </div>
        ) : !user ? (
          <>
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl mx-4 mt-4 text-center">
              <p className="text-gray-400 text-sm mb-3 font-semibold">🎮 Become a member to start posting and join the group chat!</p>
              <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="px-6 py-2.5 rounded-xl font-black text-sm text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Sign In / Register
              </button>
            </div>
            {merged.map(({ type, item }) => (
              type === "listing" ? (
                <a key={item.id} href={`/listing?id=${item.id}`}
                  onClick={async (e) => {
                    try {
                      const fresh = await base44.entities.Listing.get(item.id);
                      const newViews = (fresh.views || 0) + 1;
                      await base44.entities.Listing.update(item.id, { views: newViews });
                    } catch {}
                  }}
                  className="flex gap-3 px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                    {item.images?.[0]
                      ? <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-purple-300 transition-colors">{item.title}</p>
                    <p className="text-gray-500 text-[9px]">📦 by @{item.seller_username}</p>
                    <p className="font-black text-xs mt-0.5" style={{ color: franchise.accent }}>{item.is_free || !item.price ? "FREE" : `₱${item.price}`}</p>
                    <div className="mt-1.5">
                      <ListingEngagementBar listing={item} user={user} profile={profile} compact />
                    </div>
                  </div>
                </a>
              ) : (
                <div key={item.id} className="px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                      {item.author_avatar
                        ? <img src={item.author_avatar} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">{(item.author_username || "G")[0]}</div>}
                    </div>
                    <p className="text-gray-400 text-[10px] font-bold">{item.author_username}</p>
                    <p className="text-gray-700 text-[9px]">{new Date(item.created_date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{item.content}</p>
                  {item.description && (
                    <p className="text-gray-400 text-xs mt-1.5 leading-relaxed bg-gray-800/40 rounded-lg p-2 border border-gray-700/50">{item.description}</p>
                  )}
                  {item.image_urls?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {item.image_urls.map((url, i) => (
                        <img key={i} src={url} className="w-32 h-24 object-cover rounded-xl border border-gray-700" alt="" />
                      ))}
                    </div>
                  )}
                  {item.video_urls?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {item.video_urls.map((url, i) => (
                        <video key={i} src={url} controls className="w-64 h-36 object-cover rounded-xl border border-gray-700 bg-black" />
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </>
        ) : (
          merged.map(({ type, item }) => (
            type === "listing" ? (
              <a key={item.id} href={`/listing?id=${item.id}`}
              onClick={async (e) => {
                // Increment view count on click
                try {
                  const fresh = await base44.entities.Listing.get(item.id);
                  const newViews = (fresh.views || 0) + 1;
                  await base44.entities.Listing.update(item.id, { views: newViews });
                } catch {}
              }}
              className="flex gap-3 px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                {item.images?.[0]
                  ? <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-purple-300 transition-colors">{item.title}</p>
                <p className="text-gray-500 text-[9px]">📦 by @{item.seller_username}</p>
                <p className="font-black text-xs mt-0.5" style={{ color: franchise.accent }}>{item.is_free || !item.price ? "FREE" : `₱${item.price}`}</p>
                <div className="mt-1.5">
                  <ListingEngagementBar listing={item} user={user} profile={profile} compact />
                </div>
              </div>
            </a>
          ) : (
            <div key={item.id} className="px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                  {item.author_avatar
                    ? <img src={item.author_avatar} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">{(item.author_username || "G")[0]}</div>}
                </div>
                <p className="text-gray-400 text-[10px] font-bold">{item.author_username}</p>
                <p className="text-gray-700 text-[9px]">{new Date(item.created_date).toLocaleDateString()}</p>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">{item.content}</p>
              {item.description && (
                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed bg-gray-800/40 rounded-lg p-2 border border-gray-700/50">{item.description}</p>
              )}
              {item.image_urls?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {item.image_urls.map((url, i) => (
                    <img key={i} src={url} className="w-32 h-24 object-cover rounded-xl border border-gray-700" alt="" />
                  ))}
                </div>
              )}
              {item.video_urls?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {item.video_urls.map((url, i) => (
                    <video key={i} src={url} controls className="w-64 h-36 object-cover rounded-xl border border-gray-700 bg-black" />
                  ))}
                </div>
              )}
            </div>
          )))
        )}
      </div>
    </motion.div>
  );
}

function CommunityCard({ franchise, memberCount, isJoined, isModerator, canAdmin, community, onJoin, onClick, onSaveProfile, isActive, onSelect }) {
  const cardRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editLogo, setEditLogo] = useState(community?.logo_url || "");
  const [editCoverUrls, setEditCoverUrls] = useState(community?.cover_urls || (community?.cover_url ? [community.cover_url] : []));
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [activeCoverIdx, setActiveCoverIdx] = useState(0);
  const fileRef = useRef(null);
  const coverFileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Auto-transition cover photos
  useEffect(() => {
    const covers = community?.cover_urls?.length > 0 ? community.cover_urls : (community?.cover_url ? [community.cover_url] : []);
    if (covers.length <= 1) return;
    const t = setInterval(() => setActiveCoverIdx(i => (i + 1) % covers.length), 4000);
    return () => clearInterval(t);
  }, [community?.cover_urls, community?.cover_url]);

  const handlePencilClick = (e) => {
    e.stopPropagation();
    setEditMode(true);
  };

  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditLogo(file_url);
    setUploading(false);
  };

  const handleCoverFileUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditCoverUrls(prev => [...prev, file_url]);
    setUploadingCover(false);
  };

  const handleUrlPaste = (e) => {
    e.stopPropagation();
    if (urlInput.trim()) { setEditLogo(urlInput.trim()); setUrlInput(""); }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    const covers = editCoverUrls.filter(Boolean);
    await onSaveProfile?.(franchise.id, {
      logo_url: editLogo,
      cover_url: covers[0] || "",
      cover_urls: covers,
    }, community);
    setEditMode(false);
  };

  const logoSrc = community?.logo_url || editLogo || null;
  const coverImages = community?.cover_urls?.length > 0 ? community.cover_urls : (community?.cover_url ? [community.cover_url] : []);

  return (
    <motion.div
      ref={cardRef}
      onClick={editMode ? undefined : () => onSelect ? onSelect(franchise) : onClick?.()}
      className="relative cursor-pointer rounded-2xl overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}dd)`,
        border: isActive ? `2px solid ${franchise.accent}` : `2px solid ${franchise.accent}44`,
        boxShadow: isActive ? `0 0 24px ${franchise.accent}66` : `0 0 16px ${franchise.accent}18`,
        minHeight: 120,
      }}
      whileHover={{ scale: 1.02, boxShadow: `0 0 32px ${franchise.accent}55` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Cover/gradient bg — multi-image with crossfade */}
      {coverImages.length > 0 ? (
        <div className="absolute inset-0">
          {coverImages.map((src, idx) => (
            <div key={src} className="absolute inset-0 transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center",
                opacity: idx === activeCoverIdx ? 0.35 : 0,
              }} />
          ))}
        </div>
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
        <div className="absolute inset-0 z-20 bg-black/95 rounded-2xl flex flex-col gap-2 p-3 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <p className="text-white text-xs font-bold text-center">Edit Community Images</p>

          {/* Logo */}
          <div>
            <p className="text-gray-400 text-[9px] font-bold mb-1">Logo</p>
            {editLogo && <img src={editLogo} className="w-10 h-10 rounded-lg object-cover mb-1" alt="" />}
            <div className="flex gap-1">
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-purple-700 text-white text-[9px] font-bold">
                <Upload className="w-2.5 h-2.5" />{uploading ? "…" : "Logo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onClick={e => e.stopPropagation()}
                placeholder="URL" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[9px] focus:outline-none focus:border-purple-500" />
              <button onClick={handleUrlPaste} className="px-1.5 py-1 rounded-lg bg-blue-700 text-white text-[9px]"><Link2 className="w-2.5 h-2.5" /></button>
            </div>
          </div>

          {/* Cover photos */}
          <div>
            <p className="text-gray-400 text-[9px] font-bold mb-1">Cover Photos (multi — auto-slide)</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {editCoverUrls.map((url, i) => (
                <div key={i} className="relative group/img">
                  <img src={url} className="w-10 h-10 rounded-lg object-cover border border-gray-700" alt="" />
                  <button onClick={() => setEditCoverUrls(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">×</button>
                </div>
              ))}
              {editCoverUrls.length < 5 && (
                <button onClick={() => coverFileRef.current?.click()}
                  className="w-10 h-10 rounded-lg border-2 border-dashed border-blue-700/60 bg-blue-900/20 text-blue-300 text-[9px] flex items-center justify-center hover:bg-blue-900/40 transition-all">
                  {uploadingCover ? "…" : <Upload className="w-3 h-3" />}
                </button>
              )}
            </div>
            <input ref={coverFileRef} type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
            <div className="flex gap-1">
              <input value={coverUrlInput} onChange={e => setCoverUrlInput(e.target.value)} onClick={e => e.stopPropagation()}
                placeholder="Paste cover URL"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[9px] focus:outline-none focus:border-blue-500" />
              <button onClick={() => { if (coverUrlInput.trim()) { setEditCoverUrls(prev => [...prev, coverUrlInput.trim()]); setCoverUrlInput(""); } }}
                className="px-1.5 py-1 rounded-lg bg-blue-700 text-white text-[9px]"><Link2 className="w-2.5 h-2.5" /></button>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave}
              className="flex-1 px-3 py-1 rounded-lg bg-green-700 text-white text-[10px] font-bold flex items-center justify-center gap-1">
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
        {/* Logo — multi-image slide */}
        <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ border: `1px solid ${franchise.accent}55` }}>
          {(community?.logo_urls?.length > 0 || logoSrc) ? (
            <MultiAvatarDisplay
              images={community?.logo_urls?.length > 0 ? community.logo_urls : [logoSrc]}
              size={56}
              rounded="rounded-xl"
              interval={3500}
              showDots={(community?.logo_urls?.length || 0) > 1}
              fallback={<span className="text-3xl">{franchise.emoji}</span>}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ background: `${franchise.accent}22` }}>
              {franchise.emoji}
            </div>
          )}
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

          {isModerator && community?.moderator_type === "account_moderator" && (
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold mt-1">
              🛡️ Account Mod
            </span>
          )}
          {isModerator && community?.moderator_type !== "account_moderator" && (
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

      <div className="relative px-3 pb-3 flex gap-1.5">
        <button
          onClick={e => { e.stopPropagation(); onJoin(); }}
          className="flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all"
          style={isJoined
            ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
            : { background: franchise.accent, color: "#fff" }
          }>
          {isJoined ? "✓ Joined" : "+ Join"}
        </button>
        <a href={`/community/${franchise.id}`} onClick={e => e.stopPropagation()}
          className="px-2 py-1.5 rounded-xl text-[9px] font-bold text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:border-white/30">
          →
        </a>
        {isActive && <span className="absolute -top-1 -right-1 text-[8px] bg-purple-600 text-white font-black px-1.5 py-0.5 rounded-full">OPEN</span>}
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
  const [activeFranchise, setActiveFranchise] = useState(null);
  const [showRecommend, setShowRecommend] = useState(false);
  const [hiddenIds, setHiddenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("gc_hidden_ids") || "[]")); } catch { return new Set(); }
  });
  const [showHiddenPanel, setShowHiddenPanel] = useState(false);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(272);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
  const admin = isAdmin(user?.email);

  const onDragStart = useCallback((e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    document.body.style.userSelect = "none";
  }, [sidebarWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      setSidebarWidth(Math.max(180, Math.min(400, startW.current + delta)));
    };
    const onUp = () => { dragging.current = false; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

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

  // Per-community visibility (checkmark filter)
  const [visibleCommunities, setVisibleCommunities] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gc_visible_ids") || "null");
      return saved ? new Set(saved) : null; // null = all visible (default)
    } catch { return null; }
  });
  const toggleCommunityVisible = (id) => {
    setVisibleCommunities(prev => {
      const allIds = new Set(allFranchises.map(f => f.id));
      const base = prev || allIds;
      const n = new Set(base);
      if (n.has(id)) n.delete(id); else n.add(id);
      localStorage.setItem("gc_visible_ids", JSON.stringify([...n]));
      return n;
    });
  };
  const selectAllCommunities = () => { setVisibleCommunities(null); localStorage.removeItem("gc_visible_ids"); };
  const isVisible = (id) => !visibleCommunities || visibleCommunities.has(id);

  const filtered = allFranchises.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "All" || f.genre === selectedGenre;
    const matchVisible = isVisible(f.id);
    return matchSearch && matchGenre && matchVisible;
  });

  // Auto-open first franchise on load
  const [autoOpened, setAutoOpened] = React.useState(false);
  React.useEffect(() => {
    if (!autoOpened && filtered.length > 0) {
      setActiveFranchise(filtered[0]);
      setAutoOpened(true);
    }
  }, [filtered.length]);

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

  const handleSelectFranchise = (franchise) => {
    window.location.href = `/community/${franchise.id}`;
  };

  const toggleHide = (id) => {
    setHiddenIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      localStorage.setItem("gc_hidden_ids", JSON.stringify([...n]));
      return n;
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnimatedController />
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Back button */}
      <div className="pt-6 px-4 max-w-7xl mx-auto">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden"
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
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowGroupFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showGroupFilter ? "border-cyan-500/60 bg-cyan-900/20 text-cyan-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"}`}>
              <Filter className="w-3.5 h-3.5" /> Filter Groups {visibleCommunities && <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1" />}
            </button>
            {hiddenIds.size > 0 && (
              <button onClick={() => setShowHiddenPanel(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-700 text-gray-400 hover:text-white transition-all">
                <Eye className="w-3.5 h-3.5" /> Show Hidden ({hiddenIds.size})
              </button>
            )}
            {/* Recommend Game — bar style with glow */}
            <button onClick={() => setShowRecommend(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #ec4899, #7c3aed)",
                backgroundSize: "200% 200%",
                boxShadow: "0 0 18px rgba(124,58,237,0.6), 0 0 36px rgba(236,72,153,0.3)",
                border: "1px solid rgba(167,85,247,0.5)",
                animation: "fire-shift 2.5s ease infinite",
              }}>
              <span className="text-base">🎮</span> Recommend a Game
            </button>
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

        {/* Community Group Filter Panel */}
        <AnimatePresence>
          {showGroupFilter && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5">
              <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold text-sm">📂 Select Communities to Display</p>
                  <div className="flex gap-2">
                    <button onClick={selectAllCommunities} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Show All</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                  {allFranchises.map(f => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer group/lbl">
                      <button type="button" onClick={() => toggleCommunityVisible(f.id)} className="flex-shrink-0">
                        {isVisible(f.id)
                          ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                          : <Square className="w-4 h-4 text-gray-600 group-hover/lbl:text-gray-400" />}
                      </button>
                      <span className={`text-xs font-semibold transition-colors truncate ${isVisible(f.id) ? "text-white" : "text-gray-600 group-hover/lbl:text-gray-400"}`}>
                        {f.emoji} {f.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split layout: left card list + right newsfeed with drag-resize */}
        <div className="flex gap-0">
          {/* LEFT: scrollable community cards */}
          <div className="flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-1" style={{ width: sidebarWidth, maxHeight: 800 }}>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🎮</p>
                <p className="text-gray-400 font-semibold">No communities found</p>
              </div>
            )}
            {/* Hidden panel */}
            {showHiddenPanel && hiddenIds.size > 0 && (
              <div className="mb-2 p-2 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-[10px] font-bold mb-1.5">Hidden Communities — click to unhide:</p>
                <div className="flex flex-wrap gap-1">
                  {[...hiddenIds].map(id => {
                    const f = allFranchises.find(x => x.id === id);
                    return f ? (
                      <button key={id} onClick={() => toggleHide(id)}
                        className="px-2 py-1 rounded-lg bg-gray-700 text-white text-[10px] font-semibold hover:bg-purple-700 transition-colors">
                        {f.name} 👁
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {filtered.filter(f => !hiddenIds.has(f.id)).map((franchise) => (
              <div key={franchise.id} className="relative group/hide">
                <button
                  onClick={e => { e.stopPropagation(); toggleHide(franchise.id); }}
                  className="absolute top-1 left-1 z-20 w-5 h-5 rounded bg-black/60 text-gray-500 hover:text-red-400 hover:bg-black/80 transition-all opacity-0 group-hover/hide:opacity-100 flex items-center justify-center"
                  title="Hide this community">
                  <EyeOff className="w-3 h-3" />
                </button>
                <CommunityCard
                  franchise={franchise}
                  memberCount={memberCounts[franchise.id] || 0}
                  isJoined={joinedIds.has(franchise.id)}
                  isModerator={isModerator(franchise.id)}
                  canAdmin={canAdminCard(franchise.id)}
                  community={communities[franchise.id] || null}
                  onJoin={() => handleJoinCard(franchise)}
                  onClick={() => handleCardClick(franchise)}
                  onSaveProfile={handleSaveProfile}
                  isActive={activeFranchise?.id === franchise.id}
                  onSelect={handleSelectFranchise}
                />
              </div>
            ))}
          </div>

          {/* Drag handle */}
          <div onMouseDown={onDragStart}
            className="flex-shrink-0 w-3 flex items-center justify-center cursor-col-resize group mx-1"
            title="Drag to resize">
            <div className="w-1 h-16 rounded-full bg-gray-700 group-hover:bg-purple-500 transition-colors">
              <GripVertical className="w-3 h-3 text-gray-500 group-hover:text-purple-300 -ml-1" />
            </div>
          </div>
          {/* RIGHT: newsfeed panel */}
          <div className="flex-1 min-w-0">
            {activeFranchise ? (
              <CommunityNewsfeed
                franchise={activeFranchise}
                community={communities[activeFranchise.id]}
                user={user}
                profile={profile}
              />
            ) : (
              <div className="h-[800px] bg-gray-900/40 rounded-2xl border border-gray-800/50 border-dashed flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl mb-3">👈</p>
                  <p className="text-gray-500 text-sm font-semibold">Select a community</p>
                  <p className="text-gray-600 text-xs mt-1">to open its newsfeed</p>
                  <button onClick={() => { if (filtered[0]) window.location.href = `/community/${filtered[0].id}`; }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-purple-300 border border-purple-700/40 hover:bg-purple-900/20 transition-all">
                    Or browse full community →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommend Modal */}
      {showRecommend && (
        <RecommendModal
          type="game"
          parentCategory="gaming"
          user={user}
          profile={profile}
          onClose={() => setShowRecommend(false)}
        />
      )}
    </div>
  );
}