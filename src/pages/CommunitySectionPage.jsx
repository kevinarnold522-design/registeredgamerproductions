import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Hash, Users, Package, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { TOP_FRANCHISES } from "@/lib/franchises";
import { Link } from "react-router-dom";

export default function CommunitySectionPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const franchiseId = params.get("franchise") || "";
  const sectionId = params.get("section") || "";
  const sectionName = params.get("name") || sectionId;

  const franchise = TOP_FRANCHISES.find(f => f.id === franchiseId) || {
    id: franchiseId, name: franchiseId, emoji: "🎮", color: "#1a1a2e", accent: "#7c3aed", genre: "Gaming"
  };

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    }
    loadData();
  }, [franchiseId, sectionId]);

  const loadData = async () => {
    setLoading(true);
    const [comms, postsData, listingsData] = await Promise.all([
      base44.entities.GamingCommunity.filter({ franchise_id: franchiseId }),
      base44.entities.CommunityPost.filter({ franchise_id: franchiseId }),
      base44.entities.Listing.filter({ community_franchise_id: franchiseId, status: "active" }),
    ]);

    const comm = comms[0] || null;
    setCommunity(comm);

    // Filter posts by section_id if set, otherwise show all for this franchise
    const filteredPosts = postsData
      .filter(p => p.status === "active" && (p.section_id === sectionId || p.section_id === sectionName || !p.section_id))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 30);
    setPosts(filteredPosts);
    setListings(listingsData.slice(0, 12));
    setLoading(false);
  };

  const accentColor = franchise.color !== "#1a1a2e" ? franchise.accent : "#7c3aed";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero Banner */}
      <div className="pt-16 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${franchise.color || "#0a0a1a"}, #050510)` }}>
        {community?.cover_url && (
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url(${community.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}, transparent 70%)` }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-8">
          <Link to="/gaming-community"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Communities
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl overflow-hidden flex-shrink-0"
              style={{ background: `${accentColor}22`, border: `2px solid ${accentColor}44` }}>
              {community?.logo_url
                ? <img src={community.logo_url} className="w-full h-full object-cover" alt="" />
                : franchise.emoji
              }
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4" style={{ color: accentColor }} />
                <h1 className="text-2xl font-black text-white">{sectionName}</h1>
              </div>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold" style={{ color: accentColor }}>{franchise.name}</span>
                <span className="text-gray-600 mx-2">·</span>
                <span>{franchise.genre}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4" style={{ color: accentColor }} />
              <h2 className="text-white font-black text-sm uppercase tracking-wider">Community Posts</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-gray-900 animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-gray-900 border border-gray-800">
                <p className="text-4xl mb-3">{franchise.emoji}</p>
                <p className="text-gray-400 font-semibold">No posts yet in this section</p>
                <p className="text-gray-600 text-sm mt-1">Be the first to post! (Tier 1 required)</p>
                <Link to="/gaming-community"
                  className="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-black text-white"
                  style={{ background: `linear-gradient(135deg, #7c3aed, #ec4899)` }}>
                  Go to Community →
                </Link>
              </div>
            ) : (
              posts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-2xl border border-gray-800 p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                      style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}44` }}>
                      {post.author_avatar
                        ? <img src={post.author_avatar} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-sm">{franchise.emoji}</div>
                      }
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{post.author_username || "Gamer"}</p>
                      <p className="text-gray-600 text-[10px]">
                        {new Date(post.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.image_urls?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {post.image_urls.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} className="rounded-xl w-full h-28 object-cover" alt="" />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-gray-600 text-xs">
                    <span>❤️ {post.likes || 0}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar: Listings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4" style={{ color: accentColor }} />
              <h2 className="text-white font-black text-sm uppercase tracking-wider">Community Listings</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-900 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-gray-900 border border-gray-800">
                <Package className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No listings yet</p>
                <Link to={`/create-listing?community=${franchiseId}`}
                  className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-black text-white"
                  style={{ background: accentColor }}>
                  + Add Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map(listing => (
                  <Link
                    key={listing.id}
                    to={`/category?id=${listing.id}`}
                    className="flex gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                      {listing.images?.[0]
                        ? <img src={listing.images[0]} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🎮</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-xs line-clamp-2 group-hover:text-purple-300 transition-colors">{listing.title}</p>
                      <p className="font-black text-xs mt-1" style={{ color: accentColor }}>
                        {listing.is_free ? "FREE" : `₱${listing.price}`}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link to={`/category?franchise=${franchiseId}`}
                  className="block text-center py-2 rounded-xl border border-gray-700 text-gray-500 text-xs hover:text-purple-400 hover:border-purple-700/40 transition-all">
                  View all listings →
                </Link>
              </div>
            )}

            {/* Community Info Card */}
            {community && (
              <div className="mt-4 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <p className="text-gray-400 text-xs font-semibold">Community Info</p>
                </div>
                <p className="text-white font-bold text-sm">{franchise.name}</p>
                {community.description && <p className="text-gray-500 text-xs mt-1">{community.description}</p>}
                <p className="text-gray-600 text-xs mt-2">{community.member_count || 0} members · {franchise.genre}</p>
                <Link to="/gaming-community"
                  className="block text-center mt-3 py-2 rounded-xl text-xs font-black text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)` }}>
                  Open Community
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}