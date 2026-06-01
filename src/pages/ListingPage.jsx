import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Heart, Share2, Eye, ArrowLeft, Play, Pencil, Star, Send, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";

export default function ListingPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const commentsRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          if (profiles[0]) setProfile(profiles[0]);
        }
      } catch {}
      setAuthLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const load = async () => {
      try {
        const l = await base44.entities.Listing.get(id);
        if (l) {
          setListing(l);
          setLikeCount(l.likes || 0);
          base44.entities.Listing.update(l.id, { views: (l.views || 0) + 1 }).catch(() => {});
          if (l.seller_email) {
            base44.entities.UserProfile.filter({ user_email: l.seller_email }).then(p => { if (p[0]) setSeller(p[0]); });
          }
          if (user) {
            base44.entities.Favorite.filter({ user_email: user.email, listing_id: l.id }).then(favs => setLiked(favs.length > 0));
          }
          base44.entities.PostComment.filter({ post_id: l.id }).then(c => {
            setComments(c.filter(x => x.status !== "removed").sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
          });
          base44.entities.PostRating.filter({ post_id: l.id }).then(ratings => {
            if (ratings.length > 0) {
              const avg = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
              setAvgRating(Math.round(avg * 10) / 10);
              setRatingCount(ratings.length);
              if (user) {
                const myRating = ratings.find(r => r.user_email === user.email);
                if (myRating) setUserRating(myRating.rating);
              }
            }
          });
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (!liked) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
    }
    if (liked) {
      const favs = await base44.entities.Favorite.filter({ user_email: user.email, listing_id: listing.id });
      if (favs[0]) await base44.entities.Favorite.delete(favs[0].id);
      setLiked(false);
      setLikeCount(c => c - 1);
      await base44.entities.Listing.update(listing.id, { likes: likeCount - 1 });
    } else {
      await base44.entities.Favorite.create({ user_email: user.email, listing_id: listing.id, listing_title: listing.title });
      setLiked(true);
      setLikeCount(c => c + 1);
      await base44.entities.Listing.update(listing.id, { likes: likeCount + 1 });
    }
  };

  const handleDownload = () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    const url = listing.external_link || listing.download_url;
    if (url) {
      // Increment download count
      base44.entities.Listing.update(listing.id, { views: (listing.views || 0) + 1 }).catch(() => {});
      window.open(url, "_blank");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: listing.title, url }); return; }
    } catch {}
    try { await navigator.clipboard.writeText(url); } catch {
      const el = document.createElement("textarea"); el.value = url;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = async (rating) => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    const existing = await base44.entities.PostRating.filter({ post_id: listing.id, user_email: user.email });
    if (existing[0]) {
      await base44.entities.PostRating.update(existing[0].id, { rating });
    } else {
      await base44.entities.PostRating.create({ post_id: listing.id, user_email: user.email, rating });
    }
    setUserRating(rating);
    const allRatings = await base44.entities.PostRating.filter({ post_id: listing.id });
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
    setAvgRating(Math.round(avg * 10) / 10);
    setRatingCount(allRatings.length);
  };

  const handleComment = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const c = await base44.entities.PostComment.create({
      post_id: listing.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      content: newComment,
      status: "active",
    });
    setComments(prev => [...prev, c]);
    setNewComment("");
    setSubmittingComment(false);
  };

  const isOwner = user && listing && user.email === listing.seller_email;

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <p className="text-2xl font-black">Listing not found</p>
      <a href="/" className="text-purple-400 hover:underline">← Back to Home</a>
    </div>
  );

  const ytId = listing.youtube_video_id || (listing.youtube_url || "").match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
  const isFree = !listing.price || listing.price === 0 || listing.is_free;
  const hasDownload = listing.external_link || listing.download_url;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {authLoaded && user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      <div className="pt-20 max-w-5xl mx-auto px-4 pb-16">
        {/* Back + Edit */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {isOwner && (
            <a href={`/create-listing?edit=${listing.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-300 text-sm font-bold hover:bg-purple-900/60 transition-all">
              <Pencil className="w-4 h-4" /> Edit Listing
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Media */}
          <div>
            {/* Main image / video */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 aspect-video flex items-center justify-center mb-3">
              {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={listing.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : listing.video_url ? (
                <video src={listing.video_url} controls className="w-full h-full object-contain" />
              ) : listing.images?.[imgIdx] ? (
                <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Play className="w-16 h-16" />
                  <p className="text-sm">No media</p>
                </div>
              )}

              {/* Heart burst animation overlay */}
              <AnimatePresence>
                {heartAnim && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Heart className="w-24 h-24 text-purple-400 fill-purple-400" style={{ filter: "drop-shadow(0 0 20px rgba(168,85,247,0.9))" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Image thumbnails */}
            {listing.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 object-cover rounded-xl cursor-pointer flex-shrink-0 border-2 transition-all ${imgIdx === i ? "border-purple-500" : "border-gray-700 hover:border-gray-500"}`} />
                ))}
              </div>
            )}

            {/* Social actions */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold text-sm ${liked ? "bg-purple-900/40 border-purple-500 text-purple-300" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-500/50"}`}>
                <Heart className={`w-4 h-4 transition-all ${liked ? "fill-purple-400 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : ""}`} />
                {likeCount}
              </button>
              <button onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold ${copied ? "border-green-500 bg-green-900/30 text-green-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-blue-500/50 hover:text-blue-300"}`}>
                <Share2 className="w-4 h-4" /> {copied ? "Copied!" : "Share"}
              </button>
              <div className="flex items-center gap-1.5 text-gray-600 text-sm ml-auto">
                <Eye className="w-4 h-4" /> {(listing.views || 0).toLocaleString()} views
              </div>
            </div>

            {/* Rating */}
            <div className="mt-4 p-4 bg-gray-900 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-sm">Rate this listing</p>
                {avgRating > 0 && (
                  <span className="text-yellow-400 text-sm font-black">⭐ {avgRating} <span className="text-gray-500 font-normal">({ratingCount})</span></span>
                )}
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => handleRate(s)}
                    className="w-8 h-8 transition-transform hover:scale-125">
                    <Star className={`w-6 h-6 ${s <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`} />
                  </button>
                ))}
              </div>
              {userRating > 0 && <p className="text-green-400 text-xs mt-1">You rated this {userRating}/5 ⭐</p>}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col gap-4">
            {/* Category badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-xs font-bold capitalize">{listing.category}</span>
              {listing.digital_subcategory && <span className="px-2.5 py-1 rounded-full bg-orange-900/30 border border-orange-700/30 text-orange-300 text-xs font-bold capitalize">{listing.digital_subcategory}</span>}
              {listing.modding_subcategory && <span className="px-2.5 py-1 rounded-full bg-yellow-900/30 border border-yellow-700/30 text-yellow-300 text-xs font-bold">🔧 {listing.modding_subcategory}</span>}
              {listing.community_franchise_id && <span className="px-2.5 py-1 rounded-full bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-xs font-bold">🎮 {listing.community_franchise_id}</span>}
              {listing.is_premium && <span className="px-2.5 py-1 rounded-full bg-yellow-900/40 border border-yellow-500/40 text-yellow-300 text-xs font-black">⭐ PREMIUM</span>}
            </div>

            <h1 className="text-2xl font-black text-white leading-tight">{listing.title}</h1>

            {/* Price + Download count */}
            <div className="flex items-center gap-4">
              {isFree ? (
                <span className="text-3xl font-black text-green-400">FREE</span>
              ) : (
                <span className="text-3xl font-black text-purple-300">₱{listing.price?.toLocaleString()}</span>
              )}
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> {(listing.views || 0).toLocaleString()} downloads
              </span>
            </div>

            {/* Game info */}
            {(listing.game_name || listing.game_platform || listing.platforms?.length > 0) && (
              <div className="flex gap-2 flex-wrap">
                {listing.game_name && <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold">🎮 {listing.game_name}</span>}
                {(listing.platforms || []).map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-semibold">{p}</span>
                ))}
                {!listing.platforms?.length && listing.game_platform && <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold">📱 {listing.game_platform}</span>}
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.description || "No description provided."}</p>
            </div>

            {/* Tags */}
            {listing.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {listing.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs"># {tag}</span>
                ))}
              </div>
            )}

            {/* Appears in communities */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Also appears in:</p>
              <div className="flex flex-wrap gap-2">
                <a href={`/category?cat=${listing.category}`} className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs hover:bg-purple-900/50 transition-colors capitalize">
                  {listing.category}
                </a>
                {listing.community_franchise_id && (
                  <a href={`/community/${listing.community_franchise_id}`} className="px-2 py-1 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-xs hover:bg-cyan-900/50 transition-colors">
                    🎮 {listing.community_franchise_id} Community
                  </a>
                )}
                {listing.modding_subcategory && (
                  <a href={`/category?cat=modding`} className="px-2 py-1 rounded-lg bg-yellow-900/30 border border-yellow-700/30 text-yellow-300 text-xs hover:bg-yellow-900/50 transition-colors">
                    🔧 Modding › {listing.modding_subcategory}
                  </a>
                )}
              </div>
            </div>

            {/* Seller */}
            {seller && (
              <a href={`/channel?user=${listing.seller_email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/40 transition-colors">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {seller.avatar_url
                    ? <img src={seller.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-white font-bold">{(seller.username || "S")[0]}</div>}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{seller.display_name || seller.username}</p>
                  <p className="text-gray-500 text-xs">@{seller.username} · View Channel</p>
                </div>
              </a>
            )}

            {/* Download host badge */}
            {listing.download_host && (() => {
              const hosts = {
                mediafire: { label: "Mediafire", color: "#1E90FF" },
                modsfire: { label: "Modsfire", color: "#FF4500" },
                mega: { label: "Mega", color: "#D9272D" },
                sharemods: { label: "Sharemods", color: "#22C55E" },
              };
              const h = hosts[listing.download_host];
              if (!h) return null;
              return (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: `${h.color}55`, background: `${h.color}15` }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: h.color }} />
                  <span className="text-xs font-bold" style={{ color: h.color }}>Hosted on {h.label}</span>
                </div>
              );
            })()}

            {/* Download / Buy CTA */}
            <div className="flex flex-col gap-3">
              {hasDownload && (
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  <Download className="w-5 h-5" />
                  {isFree ? "Download Free" : `Buy for ₱${listing.price?.toLocaleString()}`}
                </motion.button>
              )}
              {listing.external_link && (
                <a href={listing.external_link} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-gray-300 text-sm flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 transition-colors">
                  <ExternalLink className="w-4 h-4" /> Open External Link
                </a>
              )}
              {/* Support links */}
              <div className="flex gap-2 flex-wrap">
                {listing.kofi_url && <a href={listing.kofi_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-orange-900/30 border border-orange-700/40 text-orange-300 text-xs font-bold hover:opacity-80">☕ Ko-fi</a>}
                {listing.buymeacoffee_url && <a href={listing.buymeacoffee_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-yellow-900/30 border border-yellow-700/40 text-yellow-300 text-xs font-bold hover:opacity-80">☕ BuyMeACoffee</a>}
                {listing.patreon_url && <a href={listing.patreon_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-bold hover:opacity-80">🎖️ Patreon</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div ref={commentsRef} className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-black text-white">Comments</h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 text-xs font-bold">{comments.length}</span>
          </div>

          {/* Comment input */}
          {user ? (
            <div className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{(profile?.username || "G")[0]}</div>}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
                <button onClick={handleComment} disabled={!newComment.trim() || submittingComment}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
              <p className="text-gray-400 text-sm mb-2">Sign in to leave a comment</p>
              <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors">
                Sign In
              </button>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No comments yet. Be the first!</p>
              </div>
            ) : comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">
                  {(c.author_username || "G")[0]}
                </div>
                <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-xs">{c.author_username}</span>
                    <span className="text-gray-600 text-[10px]">{new Date(c.created_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}