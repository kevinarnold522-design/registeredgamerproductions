import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { Grid, Upload, Radio, Film, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";
import FollowerRankBadge from "@/components/shared/FollowerRankBadge";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";
import HonorBadge from "@/components/shared/HonorBadge";
import LiveStreamStudio from "@/components/streaming/LiveStreamStudio";
import AvatarEditor from "@/components/profile/AvatarEditor";
import MultiAvatarDisplay from "@/components/shared/MultiAvatarDisplay";
import GamingAccountsPanel from "@/components/profile/GamingAccountsPanel";
import SocialLinksPanel from "@/components/profile/SocialLinksPanel";
import ListingSortControl, { sortListings } from "@/components/profile/ListingSortControl";
import ReelCreator from "@/components/shared/ReelCreator";
import AccountTypeTransitionModal from "@/components/account/AccountTypeTransitionModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showReelCreator, setShowReelCreator] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  const params = new URLSearchParams(window.location.search);
  const targetEmail = params.get("email");

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const emailToLoad = targetEmail || me?.email;
      if (!emailToLoad) { setLoading(false); return; }
      setIsOwnProfile(!targetEmail || targetEmail === me?.email);
      const [profiles, listingsData] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: emailToLoad }),
        base44.entities.Listing.filter({ seller_email: emailToLoad }),
      ]);
      if (profiles.length > 0) setProfile(profiles[0]);
      setListings(listingsData.filter(l => l.status === "active"));
      setLoading(false);
    };
    init();
  }, [targetEmail]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
    setProfile({ ...profile, avatar_url: file_url });
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.UserProfile.update(profile.id, { banner_url: file_url });
    setProfile({ ...profile, banner_url: file_url });
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  const accountColors = {
    regular: "text-blue-400",
    digital_creator: "text-purple-400",
    business: "text-green-400",
  };

  const admin = isAdmin(user?.email);
  const followers = profile?.followers_count || 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {user && <AuthNavbar user={user} profile={profile} />}
      
      <AnimatePresence>
        {showStudio && (
          <LiveStreamStudio user={user} profile={profile} onClose={() => setShowStudio(false)} />
        )}
        {showReelCreator && (
          <ReelCreator user={user} profile={profile} onClose={() => setShowReelCreator(false)} onPosted={() => {}} />
        )}
      </AnimatePresence>

      <div className={user ? "pt-16" : ""}>
        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900 via-pink-900 to-gray-900 overflow-hidden">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-pink-900/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
          {isOwnProfile && (
            <label className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-gray-900/80 border border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors backdrop-blur-sm">
              <Upload className="w-4 h-4 text-gray-300" />
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </label>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
            <div className="border-4 border-gray-950 rounded-2xl">
              {isOwnProfile && profile ? (
                <AvatarEditor profile={profile} onUpdated={setProfile} />
              ) : (
                <MultiAvatarDisplay
                  images={profile?.avatar_urls?.length > 0 ? profile.avatar_urls : profile?.avatar_url ? [profile.avatar_url] : []}
                  size={80}
                  rounded="rounded-2xl"
                  showDots={(profile?.avatar_urls?.length || 0) > 1}
                  fallback={<span className="text-4xl">🎮</span>}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{profile?.business_name || profile?.username || user?.full_name}</h1>
                {profile?.is_verified && <VerifiedCheckmark size="md" showLabel={true} />}
                {admin && isOwnProfile && <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold">⚡ ADMIN</span>}
                <FollowerRankBadge followers={followers} size="md" />
                {profile?.honor_badge && <HonorBadge label={profile.honor_badge_label || "Founding Member"} size="sm" />}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {profile?.business_name && (
                  <p className="text-gray-400 text-xs">@{profile?.username}</p>
                )}
                <p className={`text-sm font-semibold ${accountColors[profile?.account_type] || "text-gray-400"}`}>
                  {profile?.account_type === "digital_creator" ? "🎨 Digital Creator" : profile?.account_type === "business" ? "🏢 Business" : "👤 Gamer"}
                </p>
                {isOwnProfile && profile?.account_type === "regular" && (
                  <button onClick={() => setShowTransition(true)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold transition-all hover:opacity-90">
                    <Sparkles className="w-3 h-3" /> Upgrade
                  </button>
                )}
                {isOwnProfile && profile?.account_type === "digital_creator" && (
                  <button onClick={() => setShowTransition(true)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-bold transition-all hover:opacity-90">
                    <Store className="w-3 h-3" /> Upgrade
                  </button>
                )}
              </div>
              {profile?.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
              {profile?.location && <p className="text-gray-600 text-xs mt-1">📍 {profile.location}</p>}
              {(profile?.favorite_sports_team || profile?.favorite_game || profile?.favorite_hobby) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile?.favorite_sports_team && (
                    <span className="px-2 py-1 rounded-lg bg-blue-900/30 border border-blue-700/30 text-blue-300 text-xs font-semibold">
                      ⚽ {profile.favorite_sports_team}
                    </span>
                  )}
                  {profile?.favorite_game && (
                    <span className="px-2 py-1 rounded-lg bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-semibold">
                      🎮 {profile.favorite_game}
                    </span>
                  )}
                  {profile?.favorite_hobby && (
                    <span className="px-2 py-1 rounded-lg bg-pink-900/30 border border-pink-700/30 text-pink-300 text-xs font-semibold">
                      🎨 {profile.favorite_hobby}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {isOwnProfile && (
                <motion.button
                  onClick={() => setShowStudio(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(90deg, #dc2626, #be123c)", boxShadow: "0 0 15px rgba(220,38,38,0.4)" }}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <Radio className="w-4 h-4" /> Go Live
                </motion.button>
              )}
              {isOwnProfile && (
                <motion.button
                  onClick={() => setShowReelCreator(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)", boxShadow: "0 0 15px rgba(124,58,237,0.4)" }}
                >
                  <Film className="w-4 h-4" /> Create Reel
                </motion.button>
              )}
              {isOwnProfile && (
                <Link to="/dashboard?tab=profile" className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors text-center">
                  Edit Profile
                </Link>
              )}
            </div>
            {/* Admin social links */}
            {admin && isOwnProfile && (
              <div className="flex flex-col gap-1.5 ml-2">
                <a href="https://www.facebook.com/share/1HEwVHqjHc/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                  style={{ background: "#1877f2", boxShadow: "0 0 10px rgba(24,119,242,0.4)" }}>
                  <span className="font-black">f</span> Facebook
                </a>
                <a href="https://youtube.com/@registeredgamerproductions?si=Ypv_k-lHs-UBRDAe" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                  style={{ background: "#ff0000", boxShadow: "0 0 10px rgba(255,0,0,0.4)" }}>
                  <span className="font-black">▶</span> YouTube
                </a>
              </div>
            )}
          </div>

          {/* Rank progress banner */}
          {(() => {
            const rankInfo = [
              { min: 0, next: 1000, label: "Supreme Digital Creator 💎", color: "#00d4ff" },
              { min: 1000, next: 10000, label: "Gaming Guru 🌟", color: "#a855f7" },
              { min: 10000, next: 100000, label: "Gaming God/Goddess ⚡👑", color: "#ffd700" },
            ];
            const current = rankInfo.slice().reverse().find(r => followers >= r.min) || rankInfo[0];
            if (followers >= 100000) return null;
            const progress = Math.min(((followers - current.min) / (current.next - current.min)) * 100, 100);
            return (
              <div className="mb-6 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-xs font-bold">Next rank: <span style={{ color: current.color }}>{current.label}</span></p>
                  <p className="text-gray-400 text-xs">{followers.toLocaleString()} / {current.next.toLocaleString()} followers</p>
                </div>
                <div className="h-2 rounded-full bg-gray-800">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: current.color, boxShadow: `0 0 8px ${current.color}` }} />
                </div>
              </div>
            );
          })()}

          {/* Stats */}
          <div className="flex gap-6 mb-8 text-center">
            <div><p className="text-white font-black text-xl">{listings.length}</p><p className="text-gray-500 text-xs">Listings</p></div>
            <div><p className="text-white font-black text-xl">{followers.toLocaleString()}</p><p className="text-gray-500 text-xs">Followers</p></div>
            <div><p className="text-white font-black text-xl">{profile?.following_count || 0}</p><p className="text-gray-500 text-xs">Following</p></div>
            {(profile?.account_type !== "regular") && (
              <div><p className="text-white font-black text-xl">{profile?.total_sales || 0}</p><p className="text-gray-500 text-xs">Sales</p></div>
            )}
          </div>

          {/* Gaming Accounts */}
          <GamingAccountsPanel profile={profile} isOwnProfile={isOwnProfile} onUpdated={setProfile} />

          {/* Social Links */}
          {profile && <SocialLinksPanel profile={profile} isOwnProfile={isOwnProfile} onUpdated={setProfile} />}

          {/* Listings grid */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-gray-400" />
                <h2 className="text-white font-bold">Listings & Posts</h2>
              </div>
              {listings.length > 0 && (
                <ListingSortControl value={sortOrder} onChange={setSortOrder} />
              )}
            </div>
            {listings.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Grid className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No listings yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sortListings(listings, sortOrder).map((l, i) => (
                  <motion.a
                    key={l.id}
                    href={`/listing?id=${l.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-colors"
                  >
                    {l.images?.[0] ? (
                      <img src={l.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🎮</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold truncate">{l.title}</p>
                        <p className="text-purple-400 text-xs font-black">{l.price === 0 ? "FREE" : `₱${l.price?.toLocaleString()}`}</p>
                      </div>
                    </div>
                    {l.is_premium && <span className="absolute top-1.5 right-1.5 text-xs bg-yellow-500/90 text-black font-bold px-1.5 py-0.5 rounded-md">⭐</span>}
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transition Modal */}
      {showTransition && (
        <AccountTypeTransitionModal
          currentType={profile?.account_type || "regular"}
          user={user}
          onClose={() => setShowTransition(false)}
          onSuccess={() => {
            setShowTransition(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}