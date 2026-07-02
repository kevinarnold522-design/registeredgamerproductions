import React, { useEffect, useState } from "react";
import { Search, Play, Eye, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import ListingImageFrame from "@/components/listings/ListingImageFrame";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import StickySearchBar from "@/components/shared/StickySearchBar";
import Pagination from "@/components/shared/Pagination";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import StorePlatformBadges from "@/components/shared/StorePlatformBadges";
import UniversalVideoPreview from "@/components/shared/UniversalVideoPreview";
import { CATEGORIES, isServiceListing } from "@/lib/constants";
import { Link, useLocation } from "react-router-dom";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";

const PER_PAGE = 10;

export default function SearchPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").replace(/[<>]/g, "").trim();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.email) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          setProfile(profiles[0] || null);
        }
      } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!query) { setListings([]); setLoading(false); return; }
      const all = await base44.entities.Listing.filter({ status: "active" }, "-created_date");
      const q = query.toLowerCase();
      setListings(all.filter(l => {
        if (l.is_approved === false) return false;
        if (["premium_mods", "games", "paid_tools", "content_streaming"].includes(l.category) && isServiceListing(l)) return false;
        const text = `${l.title || ""} ${l.description || ""} ${l.category || ""} ${l.seller_username || ""} ${l.game_name || ""} ${l.tool_target_game || ""} ${(l.tags || []).join(" ")} ${(l.keywords || []).join(" ")} ${(l.subcategories || []).join(" ")}`.toLowerCase();
        return text.includes(q);
      }));
      setLoading(false);
    };
    load();
  }, [query]);

  const totalPages = Math.ceil(listings.length / PER_PAGE);
  const paged = listings.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
      <StickySearchBar />
      <GamerBrandFooter position="top" className="px-0 pt-0 pb-6" />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <p className="text-purple-300 text-xs font-black uppercase tracking-widest flex items-center gap-2"><Search className="w-3 h-3" /> Search Results</p>
          <h1 className="text-3xl font-black mt-2">{query ? `Results for “${query}”` : "Search listings"}</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} matching listing{listings.length === 1 ? "" : "s"}</p>
        </div>

        {loading ? (
          <BrandedLoadingScreen label="Loading Your Experience..." minHeight="22rem" />
        ) : paged.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl text-gray-500">No matching listings found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paged.map(l => {
                const cat = CATEGORIES.find(c => c.id === l.category);
                return (
                  <Link key={l.id} to={`/listing?id=${l.id}`} style={{ "--listing-glow-color": { red: "rgba(239,68,68,.85)", purple: "rgba(168,85,247,.85)", blue: "rgba(59,130,246,.85)", green: "rgba(34,197,94,.85)", gold: "rgba(250,204,21,.9)", multi: "rgba(236,72,153,.9)" }[l.card_glow_color || "purple"] }} className={`rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-purple-500/50 transition-colors listing-glow-frame ${l.card_glow_style === "radiant" ? "listing-glow-radiant" : "listing-glow-lines"} ${l.card_glow_speed === "fast" ? "listing-glow-fast" : ""}`}>
                    <div className="h-36 bg-gray-800 relative overflow-hidden">
                      {(l.preview_video_url || l.video_url || l.youtube_url) ? (
                        <UniversalVideoPreview url={l.preview_video_url || l.video_url || l.youtube_url} poster={l.images?.[0]} className="w-full h-full object-cover" />
                      ) : l.images?.[0] ? (
                        <ListingImageFrame src={l.images[0]} alt={l.title} className="w-full h-full" foregroundClassName="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Play className="w-10 h-10 text-gray-700" /></div>
                      )}
                      {l.ign_rating != null && <div className="absolute top-2 right-2"><IgnRatingBadge rating={l.ign_rating} size="sm" /></div>}
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm font-bold truncate">{l.title}</p>
                      <p className="text-gray-500 text-xs mt-1 capitalize">{cat?.label || l.category}</p>
                      {l.download_host && <div className="mt-2"><DownloadHostBadge host={l.download_host} size="sm" /></div>}
                      {l.store_platforms?.length > 0 && <div className="mt-2"><StorePlatformBadges platforms={l.store_platforms} links={l.store_platform_links} size="sm" /></div>}
                      {l.tool_target_game && <p className="text-blue-300 text-xs mt-2">For: {l.tool_target_game}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-purple-400 font-black text-sm">{!l.price || l.is_free ? "FREE" : `$${Number(l.price).toLocaleString()}`}</p>
                        <span className="theme-glow-action inline-flex items-center gap-1 text-cyan-300 text-[10px] font-bold rounded-lg px-1 py-0.5"><Eye className="w-3 h-3 theme-glow-icon" />{(l.views || 0).toLocaleString()}</span>
                      </div>
                      <p className="theme-glow-action inline-flex items-center gap-1 text-gray-400 text-[10px] mt-1 rounded-lg px-1 py-0.5"><CalendarDays className="w-2.5 h-2.5 theme-glow-icon" /> Posted Date: {l.created_date ? new Date(l.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </main>
    </div>
  );
}
