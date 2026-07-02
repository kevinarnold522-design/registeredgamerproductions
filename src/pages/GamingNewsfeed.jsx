import React, { useEffect, useState } from "react";
import { Newspaper, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { listingMatchesCategory } from "@/lib/categoryMatching";
import { useAuth } from "@/lib/AuthContext";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import NewsfeedPagination from "@/components/community/NewsfeedPagination";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";
import ListerAvatarBadge from "@/components/shared/ListerAvatarBadge";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import LandingSearchHeader from "@/components/shared/LandingSearchHeader";
import { getActiveListings } from "@/lib/homeDataCache";
import ListingImageFrame from "@/components/listings/ListingImageFrame";
import { shouldHideFromGeneralFeeds } from "@/lib/communityFeedFilters";

export default function GamingNewsfeed() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PER_PAGE = 15;

  useEffect(() => {
    if (user?.email) base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    const load = async () => {
      const [posts, listings] = await Promise.all([
        base44.entities.CommunityPost.list("-created_date", 120),
        getActiveListings(),
      ]);
      const activePosts = posts.filter((p) => p.status === "active" && !shouldHideFromGeneralFeeds(p));
      const communityListings = listings.filter((listing) =>
        listing.is_approved !== false &&
        (listing.community_franchise_id ||
          listingMatchesCategory(listing, "games") ||
          listingMatchesCategory(listing, "modding") ||
          listing.modding_subcategory)
      );
      const merged = [
        ...activePosts.map(item => ({ type: "post", item, date: item.created_date })),
        ...communityListings.map(item => ({ type: "listing", item, date: item.created_date })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(merged);
      setLoading(false);
    };
    load();
  }, [user?.email]);

  const filteredItems = items.filter(({ type, item }) => {
    if (!search) return true;
    const haystack = [
      item?.title,
      item?.description,
      item?.content,
      item?.community_title,
      item?.game_name,
      item?.category,
      type,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
      <GamerBrandFooter position="top" className="px-0 pt-0 pb-6" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LandingSearchHeader
          className="mb-5"
          searchValue={search}
          onSearchChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          searchPlaceholder="Search posts, listings, games..."
        />
        <div className="rounded-3xl border border-amber-500/50 bg-gradient-to-br from-black via-gray-950 to-gray-900 p-6 mb-6 shadow-[0_0_32px_rgba(245,158,11,0.18)]">
          <div className="flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-amber-400" />
            <div>
              <h1 className="text-3xl font-black text-amber-400">Gaming Community Newsfeed</h1>
              <p className="text-gray-500 text-sm">Overall posts and listings from all gaming community subcategories.</p>
            </div>
          </div>
        </div>
        {loading ? <BrandedLoadingScreen label="Loading Your Experience..." minHeight="20rem" /> : (
          <>
          {/* Numbered pagination — on top of the newsfeed */}
          {totalPages > 1 && (
            <NewsfeedPagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
          <div className="space-y-3">
            {filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(({ type, item }) => type === "post" ? (
              <CommunityPostCard key={`p-${item.id}`} post={item} user={user} profile={profile} isTier1 canManage={false} canDelete={false} accentColor="#a855f7" />
            ) : (
              <a key={`l-${item.id}`} href={`/listing?id=${item.id}`} className="flex gap-3 rounded-2xl border border-gray-800 bg-gray-900/70 p-3 hover:border-purple-600/40 transition-colors">
                <div className="relative w-20 h-20 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <ListingImageFrame
                      src={item.images[0]}
                      alt={item.title || "Listing"}
                      fallbackCategory={item.category || "Listing"}
                      className="w-full h-full"
                      foregroundClassName="w-full h-full object-contain p-1.5"
                      backgroundClassName="w-full h-full object-cover scale-110 blur-lg opacity-35"
                    />
                  ) : <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>}
                  <ListerAvatarBadge listing={item} size="w-5 h-5" className="absolute bottom-1 right-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-black via-zinc-950 to-amber-950/80 text-amber-200 text-[9px] font-black uppercase tracking-wide mb-1 shadow-[0_0_14px_rgba(234,179,8,0.25)]"><Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> Featured</span>
                  <p className="text-white font-bold text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{item.description}</p>
                  {item.download_host && <div className="mt-2"><DownloadHostBadge host={item.download_host} size="sm" /></div>}
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
