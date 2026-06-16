import React, { useEffect, useState } from "react";
import { ArrowLeft, Newspaper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";

export default function GamingNewsfeed() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    const load = async () => {
      const [posts, listings] = await Promise.all([
        base44.entities.CommunityPost.list("-created_date", 120),
        base44.entities.Listing.filter({ status: "active" }, "-created_date", 120),
      ]);
      const activePosts = posts.filter(p => p.status === "active");
      const communityListings = listings.filter(l => l.is_approved !== false && (l.community_franchise_id || l.category === "games" || l.category === "modding" || l.category === "premium_mods" || l.modding_subcategory));
      const merged = [
        ...activePosts.map(item => ({ type: "post", item, date: item.created_date })),
        ...communityListings.map(item => ({ type: "listing", item, date: item.created_date })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(merged);
      setLoading(false);
    };
    load();
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href="/gaming-community" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5"><ArrowLeft className="w-4 h-4" /> Back to communities</a>
        <div className="rounded-3xl border border-purple-700/40 bg-gradient-to-br from-purple-950/40 to-gray-900 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-purple-300" />
            <div>
              <h1 className="text-3xl font-black">Gaming Community Newsfeed</h1>
              <p className="text-gray-500 text-sm">Overall posts and listings from all gaming community subcategories.</p>
            </div>
          </div>
        </div>
        {loading ? <div className="py-16 text-center text-gray-500">Loading newsfeed...</div> : (
          <div className="space-y-3">
            {items.map(({ type, item }) => type === "post" ? (
              <CommunityPostCard key={`p-${item.id}`} post={item} user={user} profile={profile} isTier1 canManage={false} canDelete={false} accentColor="#a855f7" />
            ) : (
              <a key={`l-${item.id}`} href={`/listing?id=${item.id}`} className="flex gap-3 rounded-2xl border border-gray-800 bg-gray-900/70 p-3 hover:border-purple-600/40 transition-colors">
                <div className="w-20 h-20 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{item.description}</p>
                  <p className="text-purple-300 text-sm font-black mt-1">{item.is_free || !item.price ? "FREE" : `₱${item.price?.toLocaleString()}`}</p>
                  <div className="mt-2"><ListingEngagementBar listing={item} user={user} profile={profile} compact /></div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}