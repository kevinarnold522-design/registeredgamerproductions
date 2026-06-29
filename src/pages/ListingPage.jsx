import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Heart, Share2, Eye, ArrowLeft, Play, Pencil, Star, X, Lightbulb, Wrench, Gamepad2, Trash2, Sparkles, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { isAdmin } from "@/lib/constants";
import { invokeAdminFn } from "@/lib/invokeAdminFn";
import DownloadAdUnlock from "@/components/ads/DownloadAdUnlock";
import ScheduledAdOverlay from "@/components/ads/ScheduledAdOverlay";
import ListingPageAd from "@/components/ads/ListingPageAd";
import ListingVignetteAd from "@/components/ads/ListingVignetteAd";
import SimilarListings from "@/components/shared/SimilarListings";
import StickySearchBar from "@/components/shared/StickySearchBar";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import StorePlatformBadges from "@/components/shared/StorePlatformBadges";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import BrandLogo from "@/components/shared/BrandLogo";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import { CATEGORIES } from "@/lib/constants";
import { getListingGlowClass, getListingGlowStyle } from "@/lib/listingGlow";
import { formatListingPrice } from "@/lib/currency";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import { formatCount } from "@/lib/formatCounts";
import { buildProfileTheme } from "@/components/channel/ChannelThemePicker";
import ListingCommentsBlock from "@/components/listings/ListingCommentsBlock";
import ListingPageEditor from "@/components/listings/ListingPageEditor";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import BuyUnlockModal from "@/components/payments/BuyUnlockModal";
import RepostButton from "@/components/shared/RepostButton";
import ListingReportButton from "@/components/shared/ListingReportButton";
import { useDwellTracker } from "@/components/listings/useDwellTracker";
import { getListingYouTubeId } from "@/lib/youtube";
import { useLocation, useNavigate } from "react-router-dom";

// Average stay (seconds) -> "1m 20s" / "45s"
function formatStay(listing) {
  const total = listing?.total_dwell_seconds || 0;
  const sessions = listing?.view_sessions || 0;
  if (!sessions || !total) return null;
  const avg = Math.round(total / sessions);
  if (avg >= 60) return `${Math.floor(avg / 60)}m ${avg % 60}s`;
  return `${avg}s`;
}

function GlowDownloadButton({ isFree, price, currency, onClick, theme, purchased }) {
  return (
    <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2 relative overflow-hidden"
    style={{ background: theme?.cta || "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: theme?.border }}
    >
      {/* Rocket glow animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 60%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Rocket trail glow */}
      <motion.div
        className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{ x: ["-100%", "400%"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
      />
      <motion.div
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.9) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
        animate={{ x: ["-100%", "400%"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5, delay: 0.2 }}
      />
      <Download className="w-5 h-5 relative z-10" />
      <span className="relative z-10">
        {isFree || purchased ? "Download" : `Buy for ${formatListingPrice(price, currency)}`}
      </span>
    </motion.button>
  );
}

// AdOverlay replaced by DownloadAdGate component

export default function ListingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
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
  const [commentKey, setCommentKey] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendText, setRecommendText] = useState("");
  const [recommendSent, setRecommendSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageLayout, setPageLayout] = useState(null);
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [tier1Active, setTier1Active] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Track average stay / dwell time -> contributes to watchtime hours
  useDwellTracker(listing);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        const ghostSession = (() => {
          try { return JSON.parse(localStorage.getItem("impersonation_session") || "{}"); } catch { return {}; }
        })();
        const ghostEmail = ghostSession.isImpersonating && ghostSession.targetEmail ? ghostSession.targetEmail : null;
        const activeUser = ghostEmail ? { ...me, email: ghostEmail, isGhostAccount: true } : me;
        setUser(activeUser);
        if (activeUser) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: activeUser.email });
          if (profiles[0]) setProfile(profiles[0]);
          base44.entities.Tier1Subscription.filter({ user_email: activeUser.email, status: "active" }).then(rows => setTier1Active(rows.length > 0)).catch(() => {});
        }
      } catch {}
      setAuthLoaded(true);
    };
    base44.entities.SiteSettings.list().then(s => { if (s[0]) setSiteSettings(s[0]); }).catch(() => {});
    init();
  }, []);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const load = async () => {
      try {
        // Primary lookup; fall back to a filter query if get() returns null
        // (prevents a false "Listing not found" 404 when the direct id route misses).
        let l = await base44.entities.Listing.get(id).catch(() => null);
        if (!l) {
          const rows = await base44.entities.Listing.filter({ id }).catch(() => []);
          l = rows?.[0] || null;
        }
        if (l) {
          // Increment view count and update local state with the new value
          const newViews = (l.views || 0) + 1;
          base44.entities.Listing.update(l.id, { views: newViews })
            .then(() => setListing(prev => prev ? { ...prev, views: newViews } : prev))
            .catch(() => {});
          setListing({ ...l, views: newViews });
          setLikeCount(l.likes || 0);
          if (l.seller_email) {
            base44.entities.UserProfile.filter({ user_email: l.seller_email }).then(p => { if (p[0]) setSeller(p[0]); });
          }
          base44.entities.PostComment.filter({ post_id: l.id }).then(c => {
            setComments(c.filter(x => x.status !== "removed").sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
          });
          base44.entities.ListingPageLayout.filter({ listing_id: l.id }).then(rows => setPageLayout(rows[0] || null)).catch(() => {});
          base44.entities.PostRating.filter({ post_id: l.id }).then(ratings => {
            if (ratings.length > 0) {
              const avg = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
              setAvgRating(Math.round(avg * 10) / 10);
              setRatingCount(ratings.length);
            }
          });
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!listing?.id || !user?.email) return;
    base44.entities.Favorite.filter({ user_email: user.email, listing_id: listing.id })
      .then((favs) => setLiked(favs.length > 0))
      .catch(() => {});
    base44.entities.Order.filter({ buyer_email: user.email, listing_id: listing.id, payment_status: "paid" })
      .then((orders) => setPurchased(orders.length > 0))
      .catch(() => {});
    base44.entities.PostRating.filter({ post_id: listing.id }).then((ratings) => {
      const myRating = ratings.find((rating) => rating.user_email === user.email);
      setUserRating(myRating?.rating || 0);
    }).catch(() => {});
  }, [listing?.id, user?.email]);

  useEffect(() => {
    if (!listing?.id) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = base44.entities.Listing.subscribe((event) => {
        if (event?.data?.id !== listing.id) return;
        if (event.type === "update") {
          setListing((prev) => prev ? { ...prev, ...event.data } : prev);
          if (typeof event.data.likes === "number") setLikeCount(event.data.likes);
        }
      });
    } catch {}
    return () => {
      try { unsubscribe(); } catch {}
    };
  }, [listing?.id]);

  const handleLike = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (!liked) { setHeartAnim(true); setTimeout(() => setHeartAnim(false), 900); }
    if (liked) {
      const favs = await base44.entities.Favorite.filter({ user_email: user.email, listing_id: listing.id });
      if (favs[0]) await base44.entities.Favorite.delete(favs[0].id);
      setLiked(false); setLikeCount(c => c - 1);
      await base44.entities.Listing.update(listing.id, { likes: likeCount - 1 });
    } else {
      await base44.entities.Favorite.create({ user_email: user.email, listing_id: listing.id, listing_title: listing.title });
      setLiked(true); setLikeCount(c => c + 1);
      await base44.entities.Listing.update(listing.id, { likes: likeCount + 1 });
    }
  };

  const autoJoinCommunity = async (franchiseId) => {
    if (!user || !franchiseId) return;
    try {
      const existing = await base44.entities.CommunityMember.filter({ franchise_id: franchiseId, user_email: user.email });
      if (existing.length > 0) return;
      let comms = await base44.entities.GamingCommunity.filter({ franchise_id: franchiseId });
      let communityId = comms[0]?.id;
      if (!communityId) {
        const nc = await base44.entities.GamingCommunity.create({
          franchise_id: franchiseId, name: franchiseId,
          color_primary: "#1a1a2e", color_secondary: "#7c3aed",
          moderator_emails: [], sections: [],
        });
        communityId = nc.id;
      }
      await base44.entities.CommunityMember.create({
        community_id: communityId, franchise_id: franchiseId,
        user_email: user.email, username: profile?.username || user.full_name || "Gamer",
        avatar_url: profile?.avatar_url || "", is_moderator: false,
      });
    } catch {}
  };

  const autoFollowSeller = async () => {
    if (!user || !listing?.seller_email || listing.seller_email === user.email) return;
    try {
      const existing = await base44.entities.Follow.filter({ follower_email: user.email, following_email: listing.seller_email });
      if (existing.length === 0) {
        base44.entities.Follow.create({
          follower_email: user.email,
          following_email: listing.seller_email,
          follower_username: profile?.username || user.full_name || "Gamer",
          following_username: listing.seller_username || "",
          source: "manual",
        }).catch(() => {});
      }
    } catch {}
  };

  const handleDownload = () => {
    const url = listing.download_url || listing.external_link;
    const donationUrl = listing.kofi_url || listing.buymeacoffee_url || listing.patreon_url || "";
    const isPaid = !isFree && Number(listing.price) > 0;
    const isPaidMod = isPaid && (listing.category === "premium_mods" || listing.category === "modding" || listing.is_premium === true);
    const isOwnerOrAdmin = user && (isAdmin(user.email) || user.email === listing.seller_email);

    // Paid mods route buyers to the seller's Ko-fi / BuyMeACoffee / Patreon link
    // instead of the attached download file. The attached file is never served
    // for paid mods unless the viewer is the owner/admin.
    if (isPaidMod && !isOwnerOrAdmin) {
      if (!donationUrl) {
        alert("This paid mod has no purchase link set yet. Please contact the seller.");
        return;
      }
      if (user) {
        if (listing.community_franchise_id) autoJoinCommunity(listing.community_franchise_id);
        autoJoinCommunity("modding");
        autoFollowSeller();
      }
      base44.entities.Listing.get(listing.id).then(fresh => {
        const newDownloads = (fresh.downloads || 0) + 1;
        base44.entities.Listing.update(listing.id, { downloads: newDownloads });
        setListing(prev => prev ? { ...prev, downloads: newDownloads } : prev);
      }).catch(() => {});
      window.open(donationUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!url) return;

    // Paid (non-mod) listings still gate on purchase before unlocking the file.
    if (isPaid && !purchased && !isOwnerOrAdmin) {
      if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
      setShowBuyModal(true);
      return;
    }

    // Auto-join community + auto-follow seller on download for signed-in users
    if (user) {
      if (listing.community_franchise_id) autoJoinCommunity(listing.community_franchise_id);
      autoJoinCommunity("modding");
      autoFollowSeller();
    }

    // Direct route to the download/external link — no ad gate, no "Continue" step.
    base44.entities.Listing.get(listing.id).then(fresh => {
      const newDownloads = (fresh.downloads || 0) + 1;
      base44.entities.Listing.update(listing.id, { downloads: newDownloads });
      setListing(prev => prev ? { ...prev, downloads: newDownloads } : prev);
    }).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Legacy ad-gate completion handler — kept for backwards compatibility with any
  // overlay that might still call it, but the download flow now bypasses ads.
  const handleAdDone = () => {
    setShowAdOverlay(false);
    if (pendingDownloadUrl) {
      window.open(pendingDownloadUrl, "_blank", "noopener,noreferrer");
      setPendingDownloadUrl(null);
    }
  };

  const handlePaid = () => {
    setPurchased(true);
    setShowBuyModal(false);
    const url = listing.download_url || listing.external_link;
    if (url) {
      base44.entities.Listing.get(listing.id).then(fresh => {
        const newDownloads = (fresh.downloads || 0) + 1;
        base44.entities.Listing.update(listing.id, { downloads: newDownloads });
        setListing(prev => prev ? { ...prev, downloads: newDownloads } : prev);
      }).catch(() => {});
      autoFollowSeller();
      window.open(url, "_blank");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const newShares = (Number(listing.shares) || 0) + 1;
    await base44.entities.Listing.update(listing.id, { shares: newShares });
    setListing(prev => prev ? { ...prev, shares: newShares } : prev);
    try { if (navigator.share) { await navigator.share({ title: listing.title, url }); return; } } catch {}
    try { await navigator.clipboard.writeText(url); } catch {
      const el = document.createElement("textarea"); el.value = url;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = async (rating) => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    const existing = await base44.entities.PostRating.filter({ post_id: listing.id, user_email: user.email });
    if (existing[0]) { await base44.entities.PostRating.update(existing[0].id, { rating }); }
    else { await base44.entities.PostRating.create({ post_id: listing.id, user_email: user.email, rating }); }
    setUserRating(rating);
    const allRatings = await base44.entities.PostRating.filter({ post_id: listing.id });
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
    setAvgRating(Math.round(avg * 10) / 10); setRatingCount(allRatings.length);
  };

  const refreshComments = async () => {
    if (!listing) return;
    const c = await base44.entities.PostComment.filter({ post_id: listing.id });
    setComments(c.filter(x => x.status !== "removed").sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    setCommentKey(k => k + 1);
  };

  const handleRecommend = async () => {
    if (!recommendText.trim()) return;
    await base44.entities.SubcategoryRequest.create({
      seller_email: user?.email || "anonymous",
      seller_username: profile?.username || "User",
      parent_category: listing?.community_franchise_id || listing?.category || "general",
      subcategory_name: recommendText,
      description: `Recommended from listing: ${listing?.title}`,
      status: "pending",
    });
    setRecommendSent(true);
    setTimeout(() => { setShowRecommendModal(false); setRecommendSent(false); setRecommendText(""); }, 2000);
  };

  const handleDeleteListing = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (!canEdit) return;
    await invokeAdminFn("deleteListingPermanent", { listing_id: listing.id });
    window.location.href = adminUser ? "/all-listings" : "/my-listings";
  };

  const adminUser = user && isAdmin(user.email);
  const isOwner = user && listing && (
    user.email === listing.seller_email ||
    user.email === listing.created_by ||
    user.id === listing.created_by_id ||
    user.id === listing.created_by
  );
  const canEdit = adminUser || isOwner;
  const canPageEdit = canEdit && (adminUser || tier1Active || profile?.page_editor_enabled);

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

  const ytId = getListingYouTubeId(listing);
  const ytEmbedUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : "";
  const isFree = !listing.price || listing.price === 0 || listing.is_free;
  const isPaidMod = !isFree && (listing.category === "premium_mods" || listing.category === "modding" || listing.is_premium === true);
  // Paid mods can be unlocked via a donation link even when no file is attached.
  const hasDonationUrl = !!(listing.kofi_url || listing.buymeacoffee_url || listing.patreon_url);
  const hasDownload = !!listing.download_url || !!listing.external_link || (isPaidMod && hasDonationUrl);
  const sellerTheme = buildProfileTheme(seller || {}, seller?.profile_theme_style || "default");
  const listingTheme = listing.listing_theme_color || sellerTheme.background || "#030712";
  const glowStyle = { ...getListingGlowStyle(listing), boxShadow: `${sellerTheme.border}, ${getListingGlowStyle(listing).boxShadow || "none"}` };
  const glowClass = getListingGlowClass(listing);
  // Comments render directly below the "Rate this listing" block
  const commentsBlock = <div id="comments"><ListingCommentsBlock comments={comments} commentKey={commentKey} user={user} profile={profile} listing={listing} onRefresh={refreshComments} /></div>;

  return (
    <div className="min-h-screen text-white" style={{ background: seller ? sellerTheme.bg : `linear-gradient(135deg, ${listingTheme}, #2a0a2e 55%, #3a0d36)`, backgroundImage: seller ? sellerTheme.grid : undefined, backgroundSize: "42px 42px" }}>
      {authLoaded && user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      <StickySearchBar />

      {/* Download ad gate intentionally disabled — clicking Download now routes
          straight to the listing's download/external link. */}
      {/* {showAdOverlay && <DownloadAdUnlock onComplete={handleAdDone} />} */}
      <ScheduledAdOverlay listing={listing} />
      <ListingPageAd adFree={user && (isAdmin(user.email) || profile?.no_ads === true || profile?.moderator_type === "account_moderator")} />
      {/* Vignette ad — listing landing pages only */}
      <ListingVignetteAd adFree={user && (isAdmin(user.email) || profile?.no_ads === true || profile?.moderator_type === "account_moderator")} />

      <div className="pt-20 max-w-7xl mx-auto w-full overflow-x-hidden px-4 pb-16">
        {/* Back + Edit */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {canEdit && (
              <a href={`/create-listing?edit=${listing.id}`}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-300 text-sm font-bold hover:bg-purple-900/60 transition-all sm:w-auto">
                <Pencil className="w-4 h-4" /> Edit Listing
              </a>
            )}
            {canEdit && (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all bg-red-950/50 border-red-700/50 text-red-300 hover:bg-red-900/60 sm:w-auto">
                <Trash2 className="w-4 h-4" /> Delete Listing
              </button>
            )}
            {canPageEdit && (
              <button onClick={() => setShowPageEditor(true)}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-sm font-bold hover:bg-cyan-900/50 transition-all sm:w-auto">
                <Pencil className="w-4 h-4" /> Page Editor
              </button>
            )}
            <button onClick={() => setShowRecommendModal(true)}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-sm font-bold hover:bg-cyan-900/50 transition-all sm:w-auto">
            <Lightbulb className="w-4 h-4" /> Recommend Subcategory
            </button>
          </div>
        </div>

        {/* SELLER — top */}
        {seller && (
          <a href={`/channel?email=${encodeURIComponent(listing.seller_email)}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/40 transition-colors mb-5">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {seller.avatar_url
                ? <img src={seller.avatar_url} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-white font-bold">{(seller.username || "S")[0]}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{seller.display_name || seller.username}</p>
              <p className="text-gray-500 text-xs">@{seller.username} · View Channel</p>
            </div>
            <span className="flex-shrink-0 text-purple-400 text-xs font-bold">View Channel →</span>
          </a>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Media */}
          <div>
            <div className={`relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 aspect-video flex items-center justify-center mb-3 ${glowClass}`} style={glowStyle}>
              {ytId ? (
                <UniversalVideoPreview url={ytEmbedUrl} className="w-full h-full" />
              ) : listing.video_url ? (
                <video src={listing.video_url} controls className="w-full h-full object-contain" />
              ) : listing.preview_video_url ? (
                <UniversalVideoPreview url={listing.preview_video_url} className="w-full h-full object-contain" />
              ) : listing.images?.[imgIdx] ? (
                <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Play className="w-16 h-16" /><p className="text-sm">No media</p>
                </div>
              )}
              <AnimatePresence>
                {heartAnim && (
                  <motion.div initial={{ scale: 0, opacity: 1, rotate: -8 }} animate={{ scale: 3.2, opacity: 0, rotate: 8 }} exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <Heart className="w-28 h-28 text-pink-400 fill-pink-500" style={{ filter: "drop-shadow(0 0 26px rgba(236,72,153,0.95)) drop-shadow(0 0 42px rgba(124,58,237,0.9))" }} />
                      <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-cyan-300" style={{ filter: "drop-shadow(0 0 18px rgba(103,232,249,0.9))" }} />
                      <Sparkles className="absolute -bottom-3 -left-5 w-8 h-8 text-purple-200" style={{ filter: "drop-shadow(0 0 18px rgba(216,180,254,0.9))" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {listing.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 object-cover rounded-xl cursor-pointer flex-shrink-0 border-2 transition-all ${imgIdx === i ? "border-purple-500" : "border-gray-700 hover:border-gray-500"}`} />
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold text-sm ${liked ? "bg-purple-900/40 border-purple-500 text-purple-300" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-500/50"}`}>
                <Heart className={`w-4 h-4 transition-all ${liked ? "fill-purple-400 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : ""}`} />
                {formatCount(likeCount)}
              </button>
              <button onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold ${copied ? "border-green-500 bg-green-900/30 text-green-300" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-blue-500/50 hover:text-blue-300"}`}>
                <Share2 className="w-4 h-4" /> {copied ? "Copied!" : `Share ${formatCount(listing.shares || 0)}`}
              </button>
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-700 bg-gray-900">
                <RepostButton item={listing} type="listing" user={user} profile={profile} />
              </div>
              <ListingReportButton listingId={listing.id} position="static" />
              <div className="theme-glow-action flex w-full items-center gap-1.5 text-purple-300 text-sm rounded-lg px-1.5 py-0.5 sm:ml-auto sm:w-auto">
                <Eye className="w-4 h-4 theme-glow-icon" /> {formatCount(listing.views || 0)}
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-900 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-sm">Rate this listing</p>
                {avgRating > 0
                  ? <span className="text-yellow-400 text-sm font-black">⭐ {avgRating} <span className="text-gray-500 font-normal">({ratingCount})</span></span>
                  : <span className="text-gray-500 text-xs italic">⭐ Be the first!</span>}
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => handleRate(s)} className="w-8 h-8 transition-transform hover:scale-125">
                    <Star className={`w-6 h-6 ${s <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`} />
                  </button>
                ))}
              </div>
              {userRating > 0 && <p className="text-green-400 text-xs mt-1">You rated {userRating}/5 ⭐</p>}
            </div>

            {/* Comments render directly below "Rate this listing" */}
            <div className="mt-4">{commentsBlock}</div>
          </div>

          {/* RIGHT: Details */}
          <div className={`flex flex-col gap-4 rounded-2xl p-3 ${glowClass}`} style={glowStyle}>
            {/* Clickable Category > Subcategory breadcrumbs */}
            <nav className="flex items-center gap-1.5 flex-wrap text-xs">
              {(() => {
                const cat = CATEGORIES.find(c => c.id === listing.category);
                const sub = listing.modding_subcategory || listing.subcategories?.[0] || listing.digital_subcategory;
                return (
                  <>
                    <a href={`/category?cat=${encodeURIComponent(listing.category)}`}
                      className="text-purple-300 font-bold hover:text-purple-200 hover:underline cursor-pointer capitalize">
                      {cat?.label || listing.category}
                    </a>
                    {sub && (
                      <>
                        <span className="text-gray-600">›</span>
                        <a href={`/category?cat=${encodeURIComponent(listing.category)}&sub=${encodeURIComponent(sub)}`}
                          className="text-cyan-300 font-bold hover:text-cyan-200 hover:underline cursor-pointer capitalize">
                          {sub}
                        </a>
                      </>
                    )}
                  </>
                );
              })()}
            </nav>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-xs font-bold capitalize">{listing.category}</span>
              {listing.ign_rating != null && <IgnRatingBadge rating={listing.ign_rating} size="md" />}
              {listing.digital_subcategory && <span className="px-2.5 py-1 rounded-full bg-orange-900/30 border border-orange-700/30 text-orange-300 text-xs font-bold capitalize">{listing.digital_subcategory}</span>}
              {listing.modding_subcategory && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-900/30 border border-yellow-700/30 text-yellow-300 text-xs font-bold"><Wrench className="w-3 h-3" /> {listing.modding_subcategory}</span>}
              {listing.community_franchise_id && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-xs font-bold"><Gamepad2 className="w-3 h-3" /> {listing.community_franchise_id}</span>}
              {listing.is_premium && <span className="px-2.5 py-1 rounded-full bg-yellow-900/40 border border-yellow-500/40 text-yellow-300 text-xs font-black">PREMIUM</span>}
            </div>

            <h1 className="text-2xl font-black text-white leading-tight sm:text-3xl">{listing.title}</h1>

            <div className="flex flex-wrap items-center gap-3">
              {!isFree && <span className="text-3xl font-black text-purple-300">{formatListingPrice(listing.price, listing.currency)}</span>}
              <span className="theme-glow-action text-purple-300 text-sm flex items-center gap-1 rounded-lg px-1.5 py-0.5">
                <Eye className="w-3.5 h-3.5 theme-glow-icon" /> {formatCount(listing.views || 0)} views
              </span>
              <span className="theme-glow-action text-purple-300 text-sm flex items-center gap-1 rounded-lg px-1.5 py-0.5">
                <Download className="w-3.5 h-3.5 theme-glow-icon" /> {formatCount(listing.downloads || 0)} downloads
              </span>
              <span className="theme-glow-action text-purple-300 text-sm flex items-center gap-1 rounded-lg px-1.5 py-0.5">
                <Share2 className="w-3.5 h-3.5 theme-glow-icon" /> {formatCount(listing.shares || 0)} shares
              </span>
              {formatStay(listing) && (
                <span className="theme-glow-action text-cyan-300 text-sm flex items-center gap-1 rounded-lg px-1.5 py-0.5" title="Average time visitors stay on this listing">
                  <Clock className="w-3.5 h-3.5 theme-glow-icon" /> {formatStay(listing)} avg stay
                </span>
              )}
            </div>

            {(listing.game_name || listing.game_platform || listing.platforms?.length > 0 || listing.tool_target_game) && (
              <div className="flex gap-2 flex-wrap">
                {listing.game_name && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"><Gamepad2 className="w-3 h-3" /> {listing.game_name}</span>}
                {listing.game_platform && <span className="px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/30 text-blue-300 text-xs font-semibold">Platform: {listing.game_platform}</span>}
                {listing.tool_target_game && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/30 text-blue-300 text-xs font-semibold"><Wrench className="w-3 h-3" /> For: {listing.tool_target_game}</span>}
                {(listing.platforms || []).map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-semibold">{p}</span>
                ))}
              </div>
            )}

            {listing.store_platforms?.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Available on</p>
                <StorePlatformBadges platforms={listing.store_platforms} links={listing.store_platform_links} size="md" />
              </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.description || "No description provided."}</p>
            </div>

            {listing.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {listing.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs"># {tag}</span>
                ))}
              </div>
            )}

            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Also appears in:</p>
              <div className="flex flex-wrap gap-2">
                <a href={`/category?cat=${listing.category}`} className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs hover:bg-purple-900/50 transition-colors capitalize">{listing.category}</a>
                {listing.community_franchise_id && (
                  <a href={`/community/${listing.community_franchise_id}`} className="px-2 py-1 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-xs hover:bg-cyan-900/50 transition-colors">
                    {listing.community_franchise_id} Community
                  </a>
                )}
                {listing.modding_subcategory && (
                  <a href={`/category?cat=modding`} className="px-2 py-1 rounded-lg bg-yellow-900/30 border border-yellow-700/30 text-yellow-300 text-xs hover:bg-yellow-900/50 transition-colors">
                    Modding › {listing.modding_subcategory}
                  </a>
                )}
              </div>
            </div>

            {listing.download_host && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Hosted on</span>
                <DownloadHostBadge host={listing.download_host} size="md" />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {hasDownload && <GlowDownloadButton isFree={isFree} price={listing.price} currency={listing.currency} onClick={handleDownload} theme={sellerTheme} purchased={purchased} />}
              {/* Support / donation links — only for PAID listings (paid mods), never free ones */}
              {!isFree && (
              <div className="flex gap-2 flex-wrap">
                {listing.kofi_url && <a href={listing.kofi_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-900/30 border border-orange-700/40 text-orange-300 text-xs font-bold hover:opacity-80"><BrandLogo brand="kofi" label="Ko-fi" className="w-4 h-4" /> Ko-fi</a>}
                {listing.buymeacoffee_url && <a href={listing.buymeacoffee_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-900/30 border border-yellow-700/40 text-yellow-300 text-xs font-bold hover:opacity-80"><BrandLogo brand="buymeacoffee" label="Buy Me a Coffee" className="w-4 h-4" /> BuyMeACoffee</a>}
                {listing.patreon_url && <a href={listing.patreon_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-bold hover:opacity-80"><BrandLogo brand="patreon" label="Patreon" className="w-4 h-4" /> Patreon</a>}
              </div>
              )}
            </div>

            {(
              <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-4">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Gamepad2 className="w-3.5 h-3.5" /> Gamer.Productions</p>
                <div className="flex flex-wrap gap-2">
                  <a href={siteSettings?.youtube_url || OFFICIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/30 text-red-300 text-xs font-bold hover:opacity-80">▶ YouTube</a>
                  <a href={siteSettings?.facebook_url || OFFICIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/30 text-blue-300 text-xs font-bold hover:opacity-80">f Facebook</a>
                  <a href={siteSettings?.tiktok_url || OFFICIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs font-bold hover:opacity-80"><BrandLogo brand="tiktok" label="TikTok" className="w-3.5 h-3.5" /> TikTok</a>
                  <a href={siteSettings?.discord_url || OFFICIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-900/30 border border-indigo-700/30 text-indigo-300 text-xs font-bold hover:opacity-80"><BrandLogo brand="discord" label="Discord" className="w-3.5 h-3.5" /> Discord</a>
                  <a href={siteSettings?.instagram_url || OFFICIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-900/30 border border-pink-700/30 text-pink-300 text-xs font-bold hover:opacity-80"><BrandLogo brand="instagram" label="Instagram" className="w-3.5 h-3.5" /> Instagram</a>
                  {siteSettings?.twitter_url && <a href={siteSettings.twitter_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-900/30 border border-sky-700/30 text-sky-300 text-xs font-bold hover:opacity-80"><BrandLogo brand="x" label="X" className="w-3.5 h-3.5" /> Twitter/X</a>}
                </div>
              </div>
            )}

            <SimilarListings listing={listing} compact />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPageEditor && (
          <ListingPageEditor
            listing={listing}
            layout={pageLayout}
            user={user}
            onClose={() => setShowPageEditor(false)}
            onSaved={setPageLayout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            label={listing.title || "this listing"}
            isAdmin={true}
            isAccountMod={false}
            onDelete={handleDeleteListing}
            onClose={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Recommend Modal */}
      <AnimatePresence>
        {showRecommendModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowRecommendModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-950 border border-cyan-700/40 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black flex items-center gap-2"><Lightbulb className="w-4 h-4 text-cyan-300" /> Recommend Subcategory</h3>
                <button onClick={() => setShowRecommendModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              {recommendSent ? (
                <div className="text-center py-6"><p className="text-green-400 font-black text-lg">Sent!</p><p className="text-gray-400 text-sm mt-1">Admin will review your recommendation.</p></div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-4">Suggest a new subcategory for Gaming or Modding community related to this listing.</p>
                  <input value={recommendText} onChange={e => setRecommendText(e.target.value)}
                    placeholder="e.g. NBA 2K Mobile Mods"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 mb-4" />
                  <button onClick={handleRecommend} disabled={!recommendText.trim()}
                    className="w-full py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #0891b2, #7c3aed)" }}>
                    Submit Recommendation
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBuyModal && (
          <BuyUnlockModal
            listing={listing}
            user={user}
            onClose={() => setShowBuyModal(false)}
            onPaid={handlePaid}
          />
        )}
      </AnimatePresence>

      <GamerBrandFooter />
    </div>
  );
}
