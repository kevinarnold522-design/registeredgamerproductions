import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { Heart, ShoppingCart, CheckCircle, Grid, Upload } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  const accountColors = {
    regular: "text-blue-400",
    digital_creator: "text-purple-400",
    business: "text-green-400",
  };

  const admin = isAdmin(user?.email);

  return (
    <div className="min-h-screen bg-gray-950">
      {user && <AuthNavbar user={user} profile={profile} />}
      <div className={user ? "pt-16" : ""}>
        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900 via-pink-900 to-gray-900 overflow-hidden">
          {profile?.banner_url && <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-gray-950 flex items-center justify-center text-4xl overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : "🎮"}
              </div>
              {isOwnProfile && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-gray-400" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{profile?.username || user?.full_name}</h1>
                {profile?.is_verified && <span className="text-blue-400 text-lg">✅</span>}
                {admin && isOwnProfile && <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold">⚡ ADMIN</span>}
              </div>
              <p className={`text-sm font-semibold ${accountColors[profile?.account_type] || "text-gray-400"}`}>
                {profile?.account_type === "digital_creator" ? "🎨 Digital Creator" : profile?.account_type === "business" ? "🏢 Business" : "👤 Gamer"}
              </p>
              {profile?.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
              {profile?.location && <p className="text-gray-600 text-xs mt-1">📍 {profile.location}</p>}
            </div>
            {isOwnProfile && (
              <a href="/settings" className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors">
                Edit Profile
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-8 text-center">
            <div><p className="text-white font-black text-xl">{listings.length}</p><p className="text-gray-500 text-xs">Listings</p></div>
            <div><p className="text-white font-black text-xl">{profile?.followers_count || 0}</p><p className="text-gray-500 text-xs">Followers</p></div>
            <div><p className="text-white font-black text-xl">{profile?.following_count || 0}</p><p className="text-gray-500 text-xs">Following</p></div>
            {(profile?.account_type !== "regular") && (
              <div><p className="text-white font-black text-xl">{profile?.total_sales || 0}</p><p className="text-gray-500 text-xs">Sales</p></div>
            )}
          </div>

          {/* Listings grid — TikTok style */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Grid className="w-4 h-4 text-gray-400" />
              <h2 className="text-white font-bold">Listings & Posts</h2>
            </div>
            {listings.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Grid className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No listings yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {listings.map((l, i) => (
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
                        <p className="text-purple-400 text-xs font-black">₱{l.price?.toLocaleString()}</p>
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
    </div>
  );
}