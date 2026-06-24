import React, { useEffect, useState } from "react";
import { ArrowLeft, Newspaper, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import GamerSocialsBar from "@/components/shared/GamerSocialsBar";
import NewsfeedPagination from "@/components/community/NewsfeedPagination";

export default function GamingNewsfeed() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

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
      {/* Official socials — pinned to the very top */}
      <div className="w-full px-4 py-2.5 border-b border-purple-900/30 bg-gray-950/80 backdrop-blur-sm">
        <GamerSocialsBar />
      </div>
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
          <>
          {/* Numbered pagination — on top of the newsfeed */}
          {Math.ceil(items.length / PER_PAGE) > 1 && (
            <NewsfeedPagination page={page} totalPages={Math.ceil(items.length / PER_PAGE)} onChange={setPage} />
          )}
          <div className="space-y-3">
            {items.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(({ type, item }) => type === "post" ? (
              <CommunityPostCard key={`p-${item.id}`} post={item} user={user} profile={profile} isTier1 canManage={false} canDelete={false} accentColor="#a855f7" />
            ) : (
              <a key={`l-${item.id}`} href={`/listing?id=${item.id}`} className="flex gap-3 rounded-2xl border border-gray-800 bg-gray-900/70 p-3 hover:border-purple-600/40 transition-colors">
                <div className="relative w-20 h-20 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>}
                  <img src="https://media.base44.com/images/public/6a126acdde36b8358b1010f3/db7734e8e_2c492ba5e_86DEEF8D-A166-44B9-8CC9-D721135C9BB9.png" alt="" className="absolute bottom-1 right-1 w-5 h-5 rounded-full ring-1 ring-purple-400/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-black text-[9px] font-black uppercase tracking-wide mb-1"><Star className="w-2.5 h-2.5 fill-black" /> Featured</span>
                  <p className="text-white font-bold text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{item.description}</p>
                  <p className="text-purple-300 text-sm font-black mt-1">{item.is_free || !item.price ? "FREE" : `$${item.price?.toLocaleString()}`}</p>
                  <div className="mt-2"><ListingEngagementBar listing={item} user={user} profile={profile} compact /></div>
                </div>
              </a>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}