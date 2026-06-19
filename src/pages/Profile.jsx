import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { Eye, Grid, Upload, Radio, Film, Sparkles, Store, LogOut, Shield, Users, X, Gamepad2, UserRound, Building2, Palette, MapPin, Trophy, Star, Zap, Gem, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FollowerRankBadge from "@/components/shared/FollowerRankBadge";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";
import HonorBadge from "@/components/shared/HonorBadge";
import LiveStreamStudio from "@/components/streaming/LiveStreamStudio";
import AvatarEditor from "@/components/profile/AvatarEditor";
import MultiAvatarDisplay from "@/components/shared/MultiAvatarDisplay";
import GamingAccountsPanel from "@/components/profile/GamingAccountsPanel";
import SocialLinksPanel from "@/components/profile/SocialLinksPanel";
import ListingSortControl, { sortListings } from "@/components/profile/ListingSortControl";
import StandardListingCard from "@/components/listings/StandardListingCard";
import UserPointsBadge from "@/components/profile/UserPointsBadge";
import LoginHistoryPanel from "@/components/profile/LoginHistoryPanel";
import ReelCreator from "@/components/shared/ReelCreator";
import AccountTypeTransitionModal from "@/components/account/AccountTypeTransitionModal";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { getListingGlowClass, getListingGlowStyle } from "@/lib/listingGlow";

const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" }, { name: "Albania", flag: "🇦🇱" }, { name: "Algeria", flag: "🇩🇿" },
  { name: "Andorra", flag: "🇦🇩" }, { name: "Angola", flag: "🇦🇴" }, { name: "Antigua and Barbuda", flag: "🇦🇬" },
  { name: "Argentina", flag: "🇦🇷" }, { name: "Armenia", flag: "🇦🇲" }, { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" }, { name: "Azerbaijan", flag: "🇦🇿" }, { name: "Bahamas", flag: "🇧🇸" },
  { name: "Bahrain", flag: "🇧🇭" }, { name: "Bangladesh", flag: "🇧🇩" }, { name: "Barbados", flag: "🇧🇧" },
  { name: "Belarus", flag: "🇧🇾" }, { name: "Belgium", flag: "🇧🇪" }, { name: "Belize", flag: "🇧🇿" },
  { name: "Benin", flag: "🇧🇯" }, { name: "Bhutan", flag: "🇧🇹" }, { name: "Bolivia", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦" }, { name: "Botswana", flag: "🇧🇼" }, { name: "Brazil", flag: "🇧🇷" },
  { name: "Brunei", flag: "🇧🇳" }, { name: "Bulgaria", flag: "🇧🇬" }, { name: "Burkina Faso", flag: "🇧🇫" },
  { name: "Burundi", flag: "🇧🇮" }, { name: "Cambodia", flag: "🇰🇭" }, { name: "Cameroon", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" }, { name: "Cape Verde", flag: "🇨🇻" }, { name: "Central African Republic", flag: "🇨🇫" },
  { name: "Chad", flag: "🇹🇩" }, { name: "Chile", flag: "🇨🇱" }, { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" }, { name: "Comoros", flag: "🇰🇲" }, { name: "Congo", flag: "🇨🇬" },
  { name: "Costa Rica", flag: "🇨🇷" }, { name: "Croatia", flag: "🇭🇷" }, { name: "Cuba", flag: "🇨🇺" },
  { name: "Cyprus", flag: "🇨🇾" }, { name: "Czech Republic", flag: "🇨🇿" }, { name: "Denmark", flag: "🇩🇰" },
  { name: "Djibouti", flag: "🇩🇯" }, { name: "Dominica", flag: "🇩🇲" }, { name: "Dominican Republic", flag: "🇩🇴" },
  { name: "East Timor", flag: "🇹🇱" }, { name: "Ecuador", flag: "🇪🇨" }, { name: "Egypt", flag: "🇪🇬" },
  { name: "El Salvador", flag: "🇸🇻" }, { name: "Equatorial Guinea", flag: "🇬🇶" }, { name: "Eritrea", flag: "🇪🇷" },
  { name: "Estonia", flag: "🇪🇪" }, { name: "Ethiopia", flag: "🇪🇹" }, { name: "Fiji", flag: "🇫🇯" },
  { name: "Finland", flag: "🇫🇮" }, { name: "France", flag: "🇫🇷" }, { name: "Gabon", flag: "🇬🇦" },
  { name: "Gambia", flag: "🇬🇲" }, { name: "Georgia", flag: "🇬🇪" }, { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" }, { name: "Greece", flag: "🇬🇷" }, { name: "Grenada", flag: "🇬🇩" },
  { name: "Guatemala", flag: "🇬🇹" }, { name: "Guinea", flag: "🇬🇳" }, { name: "Guinea-Bissau", flag: "🇬🇼" },
  { name: "Guyana", flag: "🇬🇾" }, { name: "Haiti", flag: "🇭🇹" }, { name: "Honduras", flag: "🇭🇳" },
  { name: "Hungary", flag: "🇭🇺" }, { name: "Iceland", flag: "🇮🇸" }, { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" }, { name: "Iran", flag: "🇮🇷" }, { name: "Iraq", flag: "🇮🇶" },
  { name: "Ireland", flag: "🇮🇪" }, { name: "Israel", flag: "🇮🇱" }, { name: "Italy", flag: "🇮🇹" },
  { name: "Ivory Coast", flag: "🇨🇮" }, { name: "Jamaica", flag: "🇯🇲" }, { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" }, { name: "Kazakhstan", flag: "🇰🇿" }, { name: "Kenya", flag: "🇰🇪" },
  { name: "Kiribati", flag: "🇰🇮" }, { name: "Kuwait", flag: "🇰🇼" }, { name: "Kyrgyzstan", flag: "🇰🇬" },
  { name: "Laos", flag: "🇱🇦" }, { name: "Latvia", flag: "🇱🇻" }, { name: "Lebanon", flag: "🇱🇧" },
  { name: "Lesotho", flag: "🇱🇸" }, { name: "Liberia", flag: "🇱🇷" }, { name: "Libya", flag: "🇱🇾" },
  { name: "Liechtenstein", flag: "🇱🇮" }, { name: "Lithuania", flag: "🇱🇹" }, { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Macedonia", flag: "🇲🇰" }, { name: "Madagascar", flag: "🇲🇬" }, { name: "Malawi", flag: "🇲🇼" },
  { name: "Malaysia", flag: "🇲🇾" }, { name: "Maldives", flag: "🇲🇻" }, { name: "Mali", flag: "🇲🇱" },
  { name: "Malta", flag: "🇲🇹" }, { name: "Marshall Islands", flag: "🇲🇭" }, { name: "Mauritania", flag: "🇲🇷" },
  { name: "Mauritius", flag: "🇲🇺" }, { name: "Mexico", flag: "🇲🇽" }, { name: "Micronesia", flag: "🇫🇲" },
  { name: "Moldova", flag: "🇲🇩" }, { name: "Monaco", flag: "🇲🇨" }, { name: "Mongolia", flag: "🇲🇳" },
  { name: "Montenegro", flag: "🇲🇪" }, { name: "Morocco", flag: "🇲🇦" }, { name: "Mozambique", flag: "🇲🇿" },
  { name: "Myanmar", flag: "🇲🇲" }, { name: "Namibia", flag: "🇳🇦" }, { name: "Nauru", flag: "🇳🇷" },
  { name: "Nepal", flag: "🇳🇵" }, { name: "Netherlands", flag: "🇳🇱" }, { name: "New Zealand", flag: "🇳🇿" },
  { name: "Nicaragua", flag: "🇳🇮" }, { name: "Niger", flag: "🇳🇪" }, { name: "Nigeria", flag: "🇳🇬" },
  { name: "North Korea", flag: "🇰🇵" }, { name: "Norway", flag: "🇳🇴" }, { name: "Oman", flag: "🇴🇲" },
  { name: "Pakistan", flag: "🇵🇰" }, { name: "Palau", flag: "🇵🇼" }, { name: "Palestine", flag: "🇵🇸" },
  { name: "Panama", flag: "🇵🇦" }, { name: "Papua New Guinea", flag: "🇵🇬" }, { name: "Paraguay", flag: "🇵🇾" },
  { name: "Peru", flag: "🇵🇪" }, { name: "Philippines", flag: "🇵🇭" }, { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" }, { name: "Qatar", flag: "🇶🇦" }, { name: "Romania", flag: "🇷🇴" },
  { name: "Russia", flag: "🇷🇺" }, { name: "Rwanda", flag: "🇷🇼" }, { name: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { name: "Saint Lucia", flag: "🇱🇨" }, { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
  { name: "Samoa", flag: "🇼🇸" }, { name: "San Marino", flag: "🇸🇲" }, { name: "Sao Tome and Principe", flag: "🇸🇹" },
  { name: "Saudi Arabia", flag: "🇸🇦" }, { name: "Senegal", flag: "🇸🇳" }, { name: "Serbia", flag: "🇷🇸" },
  { name: "Seychelles", flag: "🇸🇨" }, { name: "Sierra Leone", flag: "🇸🇱" }, { name: "Singapore", flag: "🇸🇬" },
  { name: "Slovakia", flag: "🇸🇰" }, { name: "Slovenia", flag: "🇸🇮" }, { name: "Solomon Islands", flag: "🇸🇧" },
  { name: "Somalia", flag: "🇸🇴" }, { name: "South Africa", flag: "🇿🇦" }, { name: "South Korea", flag: "🇰🇷" },
  { name: "South Sudan", flag: "🇸🇸" }, { name: "Spain", flag: "🇪🇸" }, { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Sudan", flag: "🇸🇩" }, { name: "Suriname", flag: "🇸🇷" }, { name: "Swaziland", flag: "🇸🇿" },
  { name: "Sweden", flag: "🇸🇪" }, { name: "Switzerland", flag: "🇨🇭" }, { name: "Syria", flag: "🇸🇾" },
  { name: "Taiwan", flag: "🇹🇼" }, { name: "Tajikistan", flag: "🇹🇯" }, { name: "Tanzania", flag: "🇹🇿" },
  { name: "Thailand", flag: "🇹🇭" }, { name: "Togo", flag: "🇹🇬" }, { name: "Tonga", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", flag: "🇹🇹" }, { name: "Tunisia", flag: "🇹🇳" }, { name: "Turkey", flag: "🇹🇷" },
  { name: "Turkmenistan", flag: "🇹🇲" }, { name: "Tuvalu", flag: "🇹🇻" }, { name: "Uganda", flag: "🇺🇬" },
  { name: "Ukraine", flag: "🇺🇦" }, { name: "United Arab Emirates", flag: "🇦🇪" }, { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" }, { name: "Uruguay", flag: "🇺🇾" }, { name: "Uzbekistan", flag: "🇺🇿" },
  { name: "Vanuatu", flag: "🇻🇺" }, { name: "Vatican City", flag: "🇻🇦" }, { name: "Venezuela", flag: "🇻🇪" },
  { name: "Vietnam", flag: "🇻🇳" }, { name: "Yemen", flag: "🇾🇪" }, { name: "Zambia", flag: "🇿🇲" },
  { name: "Zimbabwe", flag: "🇿🇼" }
];

export default function Profile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showReelCreator, setShowReelCreator] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const targetEmail = params.get("email");

  useEffect(() => {
    const init = async () => {
      // Check for persistent ghost session FIRST - this overrides everything
      const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
      const isGhostLogin = impersonationData.isImpersonating && impersonationData.isGhostLogin && impersonationData.isPersistent;
      
      if (isGhostLogin) {
        // GHOST SESSION: Use ghost account data ONLY, completely isolated from admin
        const ghostEmail = impersonationData.targetEmail;
        
        // Fetch ghost account's profile and listings
        const [profiles, listingsData] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: ghostEmail }),
          base44.entities.Listing.filter({ seller_email: ghostEmail }),
        ]);
        
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setUser({
            email: ghostEmail,
            full_name: profiles[0].username || impersonationData.targetUsername,
            isGhostAccount: true,
            ghostData: impersonationData,
          });
        }
        setListings(listingsData);
        setIsOwnProfile(true); // Ghost account can edit their own profile
        setLoading(false);
        return;
      }
      
      // Normal flow (not ghost session) — current user comes from Supabase auth
      const me = authUser;
      let emailToLoad;
      let isOwnProfileValue;
      
      if (targetEmail) {
        emailToLoad = targetEmail;
        isOwnProfileValue = false;
        setUser(me);
      } else {
        emailToLoad = me?.email;
        isOwnProfileValue = true;
        setUser(me);
      }
      
      if (!emailToLoad) { setLoading(false); return; }
      
      setIsOwnProfile(isOwnProfileValue);
      
      const [profiles, listingsData] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: emailToLoad }),
        base44.entities.Listing.filter({ seller_email: emailToLoad }),
      ]);
      if (profiles.length > 0) setProfile(profiles[0]);
      setListings(listingsData.filter(l => l.status === "active"));
      setLoading(false);
    };
    init();
  }, [targetEmail, authUser]);

  const uploadToR2 = async (file, folder) => {
    const { file_url } = await uploadFileToR2(file, folder);
    return file_url;
  };

  // Invoke a backend function with the current Supabase login token attached.
  const invokeAuthed = async (fn, payload) => {
    let headers = {};
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
    return base44.functions.invoke(fn, payload, { headers });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const file_url = await uploadToR2(file, "profile-avatars");
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      setProfile({ ...profile, avatar_url: file_url });
      toast.success("Avatar updated");
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const file_url = await uploadToR2(file, "profile-banners");
      const res = await invokeAuthed("updateProfileMedia", { profile_id: profile.id, field: "banner_url", value: file_url });
      setProfile(res.data.profile);
      e.target.value = "";
      toast.success("Cover photo updated");
    } catch (error) {
      toast.error("Failed to upload cover photo");
    }
  };

  const handleRemoveBanner = async () => {
    if (!profile?.id) return;
    const res = await invokeAuthed("updateProfileMedia", { profile_id: profile.id, field: "banner_url", value: "" });
    setProfile(res.data.profile);
    toast.success("Cover photo removed");
  };

  const handleThemeChange = async (themeColor) => {
    if (!profile?.id) return;
    await base44.entities.UserProfile.update(profile.id, { profile_theme_color: themeColor });
    setProfile({ ...profile, profile_theme_color: themeColor });
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  const accountColors = {
    regular: "text-blue-400",
    digital_creator: "text-purple-400",
    business: "text-green-400",
  };

  // Check if in ghost session
  const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
  const isGhostLogin = impersonationData.isImpersonating && impersonationData.isGhostLogin && impersonationData.isPersistent;
  
  const admin = !isGhostLogin && isAdmin(user?.email);
  const followers = profile?.followers_count || 0;
  
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${profile?.profile_theme_color || "#030712"}, #030712 55%, #050510)` }}>
      {user && <AuthNavbar user={user} profile={profile} />}
      
      <AnimatePresence>
        {showStudio && (
          <LiveStreamStudio user={user} profile={profile} onClose={() => setShowStudio(false)} />
        )}
        {showReelCreator && (
          <ReelCreator user={user} profile={profile} onClose={() => setShowReelCreator(false)} onPosted={() => {}} />
        )}
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            user={user}
            onClose={() => setShowEditModal(false)}
            onSaved={(updatedProfile) => {
              setProfile(updatedProfile);
              setShowEditModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className={user ? "pt-16" : ""}>
        {/* Banner */}
        <div className="relative h-48 md:h-64 overflow-hidden" style={{ background: `linear-gradient(90deg, ${profile?.profile_theme_color || "#581c87"}, #831843, #111827)` }}>
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="Profile cover" className="absolute inset-0 w-full h-full object-cover object-center" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-pink-900/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
          {isOwnProfile && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-900/80 border border-gray-700 backdrop-blur-sm">
                {["#581c87", "#0f172a", "#7f1d1d", "#064e3b", "#78350f", "#1e3a8a"].map(c => (
                  <button key={c} onClick={() => handleThemeChange(c)} className="w-6 h-6 rounded-lg border border-white/20" style={{ background: c }} title="Set profile theme" />
                ))}
              </div>
              {profile?.banner_url && (
                <button onClick={handleRemoveBanner} className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700 flex items-center justify-center hover:bg-red-900 transition-colors backdrop-blur-sm" title="Remove cover photo">
                  <X className="w-4 h-4 text-red-200" />
                </button>
              )}
              <label className="w-10 h-10 rounded-xl bg-gray-900/80 border border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors backdrop-blur-sm" title="Upload cover photo">
                <Upload className="w-4 h-4 text-gray-300" />
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              </label>
            </div>
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
                  fallback={<Gamepad2 className="w-10 h-10 text-gray-500" />}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{profile?.business_name || profile?.username || user?.full_name}</h1>
                {profile?.is_verified && <VerifiedCheckmark size="md" showLabel={true} />}
                {isGhostLogin && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('impersonation_session');
                      toast.success("Returned to admin account");
                      navigate('/admin/created-accounts', { replace: true });
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-3 h-3" /> Stop Managing
                  </button>
                )}
                {admin && isOwnProfile && !isGhostLogin && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold"><Zap className="w-3 h-3" /> ADMIN</span>}
                <FollowerRankBadge followers={followers} size="md" />
                {profile?.honor_badge && <HonorBadge label={profile.honor_badge_label || "Founding Member"} size="sm" />}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {profile?.business_name && (
                  <p className="text-gray-400 text-xs">@{profile?.username}</p>
                )}
                <p className={`inline-flex items-center px-3 py-1 rounded-xl border text-xs font-black capitalize ${profile?.account_type === "business" ? "bg-green-900/20 border-green-700/40 text-green-300" : profile?.account_type === "digital_creator" ? "bg-purple-900/20 border-purple-700/40 text-purple-300" : "bg-blue-900/20 border-blue-700/40 text-blue-300"}`}>
                  {profile?.account_type === "digital_creator" ? <><Palette className="w-3 h-3 mr-1" /> Digital Creator</> : profile?.account_type === "business" ? <><Building2 className="w-3 h-3 mr-1" /> Business</> : <><UserRound className="w-3 h-3 mr-1" /> Gamer</>}
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
              {(profile?.user_email || user?.email) && <UserPointsBadge userEmail={profile?.user_email || user?.email} />}
              {profile?.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
              {profile?.location && (
                <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{profile.location}</span>
                </p>
              )}
              {(profile?.favorite_sports_team || profile?.favorite_game || profile?.favorite_hobby) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
                  {profile?.favorite_sports_team && (
                    <div className="px-3 py-2 rounded-xl bg-blue-900/30 border border-blue-700/30 text-blue-300 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-blue-200 font-black uppercase tracking-wide text-[10px]"><Trophy className="w-3 h-3" /> Favorite Team</span>
                      <p className="mt-1 text-blue-100">{profile.favorite_sports_team}</p>
                    </div>
                  )}
                  {profile?.favorite_game && (
                    <div className="px-3 py-2 rounded-xl bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-purple-200 font-black uppercase tracking-wide text-[10px]"><Gamepad2 className="w-3 h-3" /> Favorite Game</span>
                      <p className="mt-1 text-purple-100">{profile.favorite_game}</p>
                    </div>
                  )}
                  {profile?.favorite_hobby && (
                    <div className="px-3 py-2 rounded-xl bg-pink-900/30 border border-pink-700/30 text-pink-300 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-pink-200 font-black uppercase tracking-wide text-[10px]"><Palette className="w-3 h-3" /> Hobby</span>
                      <p className="mt-1 text-pink-100">{profile.favorite_hobby}</p>
                    </div>
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
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  Edit Profile
                </button>
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
                  <span className="font-black">YT</span> YouTube
                </a>
              </div>
            )}
          </div>

          {/* Rank progress banner */}
          {(() => {
            const rankInfo = [
              { min: 0, next: 1000, label: "Supreme Digital Creator", color: "#00d4ff" },
              { min: 1000, next: 10000, label: "Gaming Guru", color: "#a855f7" },
              { min: 10000, next: 100000, label: "Gaming God/Goddess", color: "#ffd700" },
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
          <div className="flex gap-6 mb-8 text-center flex-wrap">
            <div><p className="text-white font-black text-xl">{listings.length}</p><p className="text-gray-500 text-xs">Listings</p></div>
            <div><p className="text-white font-black text-xl">{listings.reduce((sum, l) => sum + (Number(l.views) || 0), 0).toLocaleString()}</p><p className="text-gray-500 text-xs">Views</p></div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {sortListings(listings, sortOrder).map((l) => (
                  <StandardListingCard key={l.id} listing={l} user={user} profile={profile} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Login History */}
        {isOwnProfile && user && (
          <div className="mt-6">
            <LoginHistoryPanel userEmail={user.email} />
          </div>
        )}
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