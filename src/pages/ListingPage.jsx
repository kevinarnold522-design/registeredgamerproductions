import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, Heart, Share2, MessageCircle, Eye, Star, ArrowLeft, ShoppingCart, Play } from "lucide-react";
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
        const listings = await base44.entities.Listing.filter({ id });
        if (listings[0]) {
          const l = listings[0];
          setListing(l);
          setLikeCount(l.likes || 0);
          // Increment view count
          base44.entities.Listing.update(l.id, { views: (l.views || 0) + 1 }).catch(() => {});
          // Load seller profile
          if (l.seller_email) {
            base44.entities.UserProfile.filter({ user_email: l.seller_email }).then(p => { if (p[0]) setSeller(p[0]); });
          }
          // Check if user liked
          if (user) {
            base44.entities.Favorite.filter({ user_email: user.email, listing_id: l.id }).then(favs => setLiked(favs.length > 0));
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
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
    if (url) window.open(url, "_blank");
  };

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
        return;
      }
    } catch {}
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // last resort
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {/* Back */}
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Media */}
          <div>
            {/* Main image / video */}
            <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 aspect-video flex items-center justify-center mb-3">
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
                <Heart className={`w-4 h-4 ${liked ? "fill-purple-400 text-purple-400" : ""}`} />
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
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col gap-4">
            {/* Category badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-xs font-bold capitalize">{listing.category}</span>
              {listing.digital_subcategory && <span className="px-2.5 py-1 rounded-full bg-orange-900/30 border border-orange-700/30 text-orange-300 text-xs font-bold capitalize">{listing.digital_subcategory}</span>}
              {listing.modding_subcategory && <span className="px-2.5 py-1 rounded-full bg-yellow-900/30 border border-yellow-700/30 text-yellow-300 text-xs font-bold">🔧 {listing.modding_subcategory}</span>}
              {listing.is_premium && <span className="px-2.5 py-1 rounded-full bg-yellow-900/40 border border-yellow-500/40 text-yellow-300 text-xs font-black">⭐ PREMIUM</span>}
            </div>

            <h1 className="text-2xl font-black text-white leading-tight">{listing.title}</h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              {isFree ? (
                <span className="text-3xl font-black text-green-400">FREE</span>
              ) : (
                <span className="text-3xl font-black text-purple-300">₱{listing.price?.toLocaleString()}</span>
              )}
            </div>

            {/* Game info */}
            {(listing.game_name || listing.game_platform) && (
              <div className="flex gap-3">
                {listing.game_name && <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold">🎮 {listing.game_name}</span>}
                {listing.game_platform && <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold">📱 {listing.game_platform}</span>}
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

            {/* Seller */}
            {seller && (
              <a href={`/channel?user=${listing.seller_email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/40 transition-colors">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {seller.avatar_url ? <img src={seller.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{(seller.username || "S")[0]}</div>}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{seller.display_name || seller.username}</p>
                  <p className="text-gray-500 text-xs">@{seller.username} · View Channel</p>
                </div>
              </a>
            )}

            {/* Download / Buy CTA */}
            <div className="flex flex-col gap-3 mt-auto">
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
      </div>
    </div>
  );
}