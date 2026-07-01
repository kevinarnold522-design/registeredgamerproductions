import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Pencil, Plus, X, Check, GripVertical, Link2, Upload, ArrowLeft, EyeOff, Eye, SlidersHorizontal, Filter, CheckSquare, Square, Newspaper, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import { TOP_FRANCHISES } from "@/lib/franchises";
import RecommendModal from "@/components/shared/RecommendModal";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import AnimatedController from "@/components/shared/AnimatedController";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import GroupChat from "@/components/community/GroupChat";
import PostComposer from "@/components/community/PostComposer";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import NewsfeedPagination from "@/components/community/NewsfeedPagination";
import { formatListingPrice } from "@/lib/currency";
import CommunityTagAd from "@/components/ads/CommunityTagAd";
import ListingImageFrame from "@/components/listings/ListingImageFrame";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import { useNavigate } from "react-router-dom";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_FEED_FILTERS = { priceMin: "", priceMax: "", isFree: false, isPremium: false, sortBy: "newest", contentType: "all", search: "" };

// Newsfeed for a community franchise
function CommunityNewsfeed({ franchise, community, user, profile }) {
  const asArray = (value) => Array.isArray(value) ? value : [];
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [feedFilters, setFeedFilters] = useState(DEFAULT_FEED_FILTERS);
  const [listingsPage, setListingsPage] = useState(1);
  const LISTINGS_PER_PAGE = 12;
  const admin = isAdmin(user?.email);

  useEffect(() => {
    const load = async () => {
      try {
        const allPosts = asArray(await base44.entities.CommunityPost.filter({ franchise_id: franchise.id }));
        let allListings = asArray(await base44.entities.Listing.filter({ community_franchise_id: franchise.id }, "-created_date", 120));
        if (allListings.length === 0) {
          allListings = await base44.entities.Listing.list("-created_date", 120);
        }
        const safeListings = asArray(allListings);
        setPosts(allPosts.filter(p => p?.status === "active").sort((a, b) => new Date(b?.created_date || 0) - new Date(a?.created_date || 0)).slice(0, 50));
        setListings(safeListings.filter(l => l?.status === "active"));
      } catch { setPosts([]); setListings([]); }
      setLoading(false);
    };
    if (franchise?.id) {
      load();
      return;
    }
    setPosts([]);
    setListings([]);
    setLoading(false);
  }, [franchise.id]);

  const handlePostCreated = (post) => setPosts(prev => [post, ...prev]);
  const handlePostUpdate = (postId, updates) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));

  const filteredListings = listings.filter(l => {
    if (feedFilters.isFree && !(l.price === 0 || l.is_free)) return false;
    if (feedFilters.isPremium && !l.is_premium) return false;
    if (feedFilters.priceMin !== "" && (l.price || 0) < parseFloat(feedFilters.priceMin)) return false;
    if (feedFilters.priceMax !== "" && (l.price || 0) > parseFloat(feedFilters.priceMax)) return false;
    if (feedFilters.search && !l.title?.toLowerCase().includes(feedFilters.search.toLowerCase())) return false;
    return true;
  });

  const filteredPosts = posts.filter(p => {
    const normalizedSearch = feedFilters.search.toLowerCase();
    if (feedFilters.search && !String(p?.content || "").toLowerCase().includes(normalizedSearch) && !String(p?.author_username || "").toLowerCase().includes(normalizedSearch)) return false;
    return true;
  });

  const sortFn = (a, b) => {
    if (feedFilters.sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
    if (feedFilters.sortBy === "popular") return (b.views || b.likes || 0) - (a.views || a.likes || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  };
  const sortedListings = (feedFilters.contentType === "posts" ? [] : [...filteredListings]).sort(sortFn);
  const sortedPosts = (feedFilters.contentType === "listings" ? [] : [...filteredPosts]).sort(sortFn);
  const totalItems = sortedListings.length + sortedPosts.length;
  const listingsTotalPages = Math.ceil(sortedListings.length / LISTINGS_PER_PAGE) || 1;
  const pagedListings = sortedListings.slice((listingsPage - 1) * LISTINGS_PER_PAGE, listingsPage * LISTINGS_PER_PAGE);

  useEffect(() => { setListingsPage(1); }, [feedFilters.contentType, feedFilters.sortBy, feedFilters.search, feedFilters.isFree, feedFilters.isPremium, feedFilters.priceMin, feedFilters.priceMax]);

  return (
    <motion.div key={franchise.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="h-[800px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${franchise.color}cc, ${franchise.color}88)` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-black">{franchise.name} Feed</p>
            <p className="text-white/40 text-[10px]">Posts + listings &middot; {totalItems} items</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${showFilters ? "bg-purple-600/30 text-purple-300" : "bg-white/10 text-white/60 hover:text-white"}`}>
              <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>
            <a href={`/community/${franchise.id}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: `${franchise.accent}30`, color: franchise.accent, border: `1px solid ${franchise.accent}44` }}>
              Full Page &rarr;
            </a>
          </div>
        </div>
        {/* Advanced filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2">
              <div className="bg-black/30 rounded-xl p-3 space-y-2">
                {/* Search in feed */}
                <div className="relative col-span-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input value={feedFilters.search} onChange={e => setFeedFilters(f => ({ ...f, search: e.target.value }))}
                    placeholder="Search posts and listings..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-[10px] focus:outline-none focus:border-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                    placeholder="Min Price" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none" />
                  <input type="number" value={feedFilters.priceMax} onChange={e => setFeedFilters(f => ({ ...f, priceMax: e.target.value }))}
                    placeholder="Max Price" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none" />
                  <label className="flex items-center gap-1.5 cursor-pointer col-span-1">
                    <input type="checkbox" checked={feedFilters.isFree} onChange={e => setFeedFilters(f => ({ ...f, isFree: e.target.checked }))} className="accent-green-500 w-3 h-3 rounded" />
                    <span className="text-green-400 text-[10px] font-semibold">Free Only</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer col-span-1">
                    <input type="checkbox" checked={feedFilters.isPremium} onChange={e => setFeedFilters(f => ({ ...f, isPremium: e.target.checked }))} className="accent-yellow-500 w-3 h-3 rounded" />
                    <span className="text-yellow-400 text-[10px] font-semibold">Premium Only</span>
                  </label>
                </div>
              </div>
              {(feedFilters.isFree || feedFilters.isPremium || feedFilters.priceMin || feedFilters.priceMax || feedFilters.sortBy !== "newest" || feedFilters.contentType !== "all" || feedFilters.search) && (
                <button onClick={() => setFeedFilters(DEFAULT_FEED_FILTERS)} className="mt-1.5 text-[9px] text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                  <X className="w-2.5 h-2.5" /> Reset filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Post Composer */}
      <div className="px-2 py-2 border-b border-gray-800 flex-shrink-0">
        <PostComposer
          user={user}
          profile={profile}
          franchise={franchise}
          community={community}
          isJoined={true}
          admin={admin}
          isModerator={false}
          onPostCreated={handlePostCreated}
          accentColor={franchise.accent}
        />
      </div>
      {/* Feed: listings grid (4-up) + posts */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {loading ? (
          <BrandedLoadingScreen label="Loading Your Experience..." minHeight="18rem" />
        ) : totalItems === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">{franchise.emoji}</p>
            <p className="text-gray-600 text-sm">No posts yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Numbered pagination — on top of the newsfeed */}
            {listingsTotalPages > 1 && (
              <NewsfeedPagination page={listingsPage} totalPages={listingsTotalPages} onChange={setListingsPage} />
            )}
            {!user && (
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-center mb-2">
                <p className="text-gray-400 text-sm mb-3 font-semibold">Join now to post and chat!</p>
                <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="px-6 py-2.5 rounded-xl font-black text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Listings — 4 across, 12 per page */}
            {pagedListings.length > 0 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                  {pagedListings.map((item) => (
                    <a key={item.id} href={`/listing?id=${item.id}`}
                      onClick={async () => {
                        try {
                          const fresh = await base44.entities.Listing.get(item.id);
                          await base44.entities.Listing.update(item.id, { views: (fresh.views || 0) + 1 });
                        } catch {}
                      }}
                      className="flex flex-col rounded-xl border border-gray-800 hover:border-purple-600/40 hover:bg-gray-800/30 transition-colors group bg-gray-900/60 overflow-hidden">
                      <div className="aspect-square bg-gray-800 overflow-hidden">
                        {item.images?.[0] ? <ListingImageFrame src={item.images[0]} alt="" className="w-full h-full" foregroundClassName="w-full h-full object-contain p-2" /> : <div className="w-full h-full flex items-center justify-center text-xl">🎮</div>}
                      </div>
                      <div className="p-2 flex-1 flex flex-col">
                        <p className="text-white text-[11px] font-bold line-clamp-2 group-hover:text-purple-300 transition-colors leading-tight">{item.title}</p>
                        <p className="text-gray-500 text-[8px] inline-flex items-center gap-1 mt-1"><CalendarDays className="w-2.5 h-2.5 theme-glow-icon" /> {item.created_date ? new Date(item.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}</p>
                        {item.download_host && <div className="mt-1"><DownloadHostBadge host={item.download_host} size="sm" /></div>}
                        <p className="font-black text-[11px] mt-0.5" style={{ color: franchise.accent }}>{item.is_free || !item.price ? "FREE" : formatListingPrice(item.price, item.currency)}</p>
                        <div className="mt-1.5">
                          <ListingEngagementBar listing={item} user={user} profile={profile} compact />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                {listingsTotalPages > 1 && (
                  <div className="mt-3">
                    <NewsfeedPagination page={listingsPage} totalPages={listingsTotalPages} onChange={setListingsPage} />
                  </div>
                )}
              </div>
            )}

            {/* Posts */}
            {sortedPosts.length > 0 && (
              <div className="space-y-2">
                {sortedPosts.map((item) => (
                  <CommunityPostCard
                    key={item.id}
                    post={item}
                    user={user}
                    profile={profile}
                    isTier1={true}
                    canManage={admin}
                    canDelete={admin}
                    accentColor={franchise.accent}
                    onUpdate={handlePostUpdate}
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
          </>
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
    const { file_url } = await uploadFileToR2(file, "community-logos");
    setEditLogo(file_url);
    setUploading(false);
  };

  const handleCoverFileUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await uploadFileToR2(file, "community-covers");
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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

      {canAdmin && !editMode && (
        <button
          onClick={handlePencilClick}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-black/60 hover:bg-purple-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          title="Edit profile picture">
          <Pencil className="w-3.5 h-3.5 text-white" />
        </button>
      )}

      {editMode && (
        <div className="absolute inset-0 z-20 bg-black/95 rounded-2xl flex flex-col gap-2 p-3 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <p className="text-white text-xs font-bold text-center">Edit Community Images</p>
          <div>
            <p className="text-gray-400 text-[9px] font-bold mb-1">Logo</p>
            {editLogo && <img src={editLogo} className="w-10 h-10 rounded-lg object-cover mb-1" alt="" />}
            <div className="flex gap-1">
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-purple-700 text-white text-[9px] font-bold">
                <Upload className="w-2.5 h-2.5" />{uploading ? "..." : "Logo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onClick={e => e.stopPropagation()}
                placeholder="URL" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-[9px] focus:outline-none focus:border-purple-500" />
              <button onClick={handleUrlPaste} className="px-1.5 py-1 rounded-lg bg-blue-700 text-white text-[9px]"><Link2 className="w-2.5 h-2.5" /></button>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-[9px] font-bold mb-1">Cover Photos (multi — auto-slide)</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {editCoverUrls.map((url, i) => (
                <div key={i} className="relative group/img">
                  <img src={url} className="w-10 h-10 rounded-lg object-cover border border-gray-700" alt="" />
                  <button onClick={() => setEditCoverUrls(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">x</button>
                </div>
              ))}
              {editCoverUrls.length < 5 && (
                <button onClick={() => coverFileRef.current?.click()}
                  className="w-10 h-10 rounded-lg border-2 border-dashed border-blue-700/60 bg-blue-900/20 text-blue-300 text-[9px] flex items-center justify-center hover:bg-blue-900/40 transition-all">
                  {uploadingCover ? "..." : <Upload className="w-3 h-3" />}
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
      <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style={{ border: `1px solid ${franchise.accent}55`, background: `${franchise.accent}22` }}>
        {franchise.emoji}
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
              Account Mod
            </span>
          )}
          {isModerator && community?.moderator_type !== "account_moderator" && (
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold mt-1">
              Captain
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
          {isJoined ? "Joined" : "+ Join"}
        </button>
        <a href={`/community/${franchise.id}`} onClick={e => e.stopPropagation()}
          className="px-2 py-1.5 rounded-xl text-[9px] font-bold text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:border-white/30">
          &rarr;
        </a>
        {isActive && <span className="absolute -top-1 -right-1 text-[8px] bg-purple-600 text-white font-black px-1.5 py-0.5 rounded-full">OPEN</span>}
      </div>
    </motion.div>
  );
}

export default function GamingCommunity() {
  const asArray = (value) => Array.isArray(value) ? value : [];
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
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
    if (isMobile) return;
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    document.body.style.userSelect = "none";
  }, [isMobile, sidebarWidth]);

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
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => {
        const profiles = asArray(p);
        setProfile(profiles[0] || null);
      }).catch(() => setProfile(null));
      base44.entities.CommunityMember.filter({ user_email: user.email }).then(m => {
        const memberships = asArray(m);
        setJoinedIds(new Set(memberships.map(x => x?.franchise_id).filter(Boolean)));
        setModeratorIds(new Set(memberships.filter(x => x?.is_moderator).map(x => x?.franchise_id).filter(Boolean)));
      }).catch(() => {
        setJoinedIds(new Set());
        setModeratorIds(new Set());
      });
    } else {
      setProfile(null);
      setJoinedIds(new Set());
      setModeratorIds(new Set());
    }
    base44.entities.GamingCommunity.list().then(comms => {
      const safeCommunities = asArray(comms);
      const counts = {}, map = {};
      safeCommunities.forEach(c => {
        counts[c.franchise_id] = c.member_count || 0;
        map[c.franchise_id] = c;
      });
      setMemberCounts(counts);
      setCommunities(map);
    }).catch(() => {
      setMemberCounts({});
      setCommunities({});
    });
  }, [user]);

  useEffect(() => {
    if (!user?.email || Object.keys(communities).length === 0) return;
    const modSet = new Set(moderatorIds);
    Object.values(communities).forEach(c => {
      if (asArray(c?.moderator_emails).includes(user.email)) modSet.add(c.franchise_id);
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

  useEffect(() => {
    base44.entities.GamingCommunity.list().then(comms => {
      const safeCommunities = asArray(comms);
      const knownIds = new Set(TOP_FRANCHISES.map(f => f.id));
      const extra = safeCommunities.filter(c => !knownIds.has(c?.franchise_id));
      const newFranchises = extra.map(c => ({
        id: c.franchise_id, name: c.name, emoji: "🎮",
        color: c.color_primary || "#1a1a2e", accent: c.color_secondary || "#7c3aed",
        genre: c.genre || "Gaming",
      }));
      setExtraFranchises(newFranchises);
    }).catch(() => setExtraFranchises([]));
  }, []);

  const allFranchises = [...TOP_FRANCHISES, ...extraFranchises];
  const allGenres = ["All", ...Array.from(new Set(allFranchises.map(f => f.genre)))];

  const [visibleCommunities, setVisibleCommunities] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gc_visible_ids") || "null");
      return saved ? new Set(saved) : null;
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

  const [autoOpened, setAutoOpened] = React.useState(false);
  React.useEffect(() => {
    if (!autoOpened && filtered.length > 0) {
      setActiveFranchise(filtered[0]);
      setAutoOpened(true);
    }
  }, [filtered.length]);

  React.useEffect(() => {
    if (filtered.length === 0) {
      setActiveFranchise(null);
      return;
    }
    if (!activeFranchise || !filtered.some(item => item.id === activeFranchise.id)) {
      setActiveFranchise(filtered[0]);
    }
  }, [filtered, activeFranchise]);

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

  const getModeratorGroupCount = () => {
    if (!user?.email || admin) return 0;
    return Array.from(moderatorIds).filter(id =>
      (communities[id]?.moderator_emails || []).includes(user.email)
    ).length;
  };

  const canAdminCard = (franchiseId) => {
    if (admin) return true;
    if (!isModerator(franchiseId)) return false;
    return getModeratorGroupCount() <= 3;
  };

  const handleCardClick = (franchise) => {
    if (isMobile) {
      setActiveFranchise(franchise);
      return;
    }
    navigate(`/community/${franchise.id}`);
  };

  const handleSelectFranchise = (franchise) => {
    if (isMobile) {
      setActiveFranchise(franchise);
      return;
    }
    navigate(`/community/${franchise.id}`);
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
      <CommunityTagAd adFree={admin || profile?.no_ads} />
      <AnimatedController />
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      <div className="pt-6 px-4 max-w-7xl mx-auto">
        <GamerBrandFooter position="top" className="px-0 pt-0 pb-6" />
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-2">
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
            <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Gaming Community Hub
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto mb-6">
              Join franchise communities &middot; Post, connect &amp; celebrate gaming culture worldwide
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
            <a href="/gaming-newsfeed"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-purple-600/50 bg-purple-900/30 text-purple-200 hover:bg-purple-900/50 transition-all">
              <Newspaper className="w-3.5 h-3.5" /> Newsfeed
            </a>
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
                  <p className="text-white font-bold text-sm">Select Communities to Display</p>
                  <div className="flex gap-2">
                    <button onClick={selectAllCommunities} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> Select All
                    </button>
                    <button onClick={() => {
                      setVisibleCommunities(new Set());
                      localStorage.setItem("gc_visible_ids", JSON.stringify([]));
                    }} className="text-xs text-gray-500 hover:text-red-400 font-semibold transition-colors flex items-center gap-1">
                      <Square className="w-3 h-3" /> Unselect All
                    </button>
                  </div>
                </div>
                {/* Search within filter panel */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    placeholder="Search communities in list..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                  {allFranchises.filter(f => !filterSearch || f.name.toLowerCase().includes(filterSearch.toLowerCase())).map(f => (
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

        {/* Split layout */}
        <div className={isMobile ? "flex flex-col gap-4" : "flex gap-0"}>
          <div
            className={`flex-shrink-0 flex flex-col gap-3 pr-1 ${isMobile ? "w-full overflow-visible" : "overflow-y-auto"}`}
            style={isMobile ? undefined : { width: sidebarWidth, maxHeight: 800 }}
          >
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🎮</p>
                <p className="text-gray-400 font-semibold">No communities found</p>
              </div>
            )}
            {showHiddenPanel && hiddenIds.size > 0 && (
              <div className="mb-2 p-2 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-[10px] font-bold mb-1.5">Hidden — click to unhide:</p>
                <div className="flex flex-wrap gap-1">
                  {[...hiddenIds].map(id => {
                    const f = allFranchises.find(x => x.id === id);
                    return f ? (
                      <button key={id} onClick={() => toggleHide(id)}
                        className="px-2 py-1 rounded-lg bg-gray-700 text-white text-[10px] font-semibold hover:bg-purple-700 transition-colors">
                        {f.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {filtered.filter(f => !hiddenIds.has(f.id)).map((franchise) => (
              <div key={franchise.id} className="relative group/hide">
                {user && admin && (
                  <button
                    onClick={e => { e.stopPropagation(); toggleHide(franchise.id); }}
                    className="absolute top-1 left-1 z-20 w-5 h-5 rounded bg-black/60 text-gray-500 hover:text-red-400 hover:bg-black/80 transition-all opacity-0 group-hover/hide:opacity-100 flex items-center justify-center"
                    title="Hide this community">
                    <EyeOff className="w-3 h-3" />
                  </button>
                )}
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
            className={`flex-shrink-0 w-3 items-center justify-center cursor-col-resize group mx-1 ${isMobile ? "hidden" : "flex"}`}
            title="Drag to resize">
            <div className="w-1 h-16 rounded-full bg-gray-700 group-hover:bg-purple-500 transition-colors">
              <GripVertical className="w-3 h-3 text-gray-500 group-hover:text-purple-300 -ml-1" />
            </div>
          </div>

          {/* RIGHT: newsfeed */}
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
                  <button onClick={() => { if (filtered[0]) navigate(`/community/${filtered[0].id}`); }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-purple-300 border border-purple-700/40 hover:bg-purple-900/20 transition-all">
                    Or browse full community &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRecommend && (
        <RecommendModal
          type="game"
          parentCategory="gaming"
          user={user}
          profile={profile}
          onClose={() => setShowRecommend(false)}
        />
      )}

      {activeFranchise && (
        <GroupChat
          franchiseId={activeFranchise.id}
          communityId={communities[activeFranchise.id]?.id}
          user={user}
          profile={profile}
          accentColor={activeFranchise.accent}
        />
      )}
    </div>
  );
}
