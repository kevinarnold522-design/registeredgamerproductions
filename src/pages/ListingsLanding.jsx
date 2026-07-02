import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { Eye, Plus, Package, Pencil, Trash2, Trophy, Download } from "lucide-react";
import { formatListingPrice } from "@/lib/currency";
import { isAdmin } from "@/lib/constants";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import { invokeAdminFn } from "@/lib/invokeAdminFn";
import { Link } from "react-router-dom";
import { getPublisherRankMap } from "@/lib/publisherRank";
import { listingScore } from "@/lib/leaderboardScore";
import LandingSearchHeader from "@/components/shared/LandingSearchHeader";
import { getActiveListings } from "@/lib/homeDataCache";
import { getPublicSiteUrl } from "@/lib/publicSiteUrl";
import ListingImageFrame from "@/components/listings/ListingImageFrame";

export default function ListingsLanding({ mode = "mine" }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [rankMap, setRankMap] = useState({});

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me().catch(() => null);
      const ghostSession = (() => {
        try { return JSON.parse(localStorage.getItem("impersonation_session") || "{}"); } catch { return {}; }
      })();
      const ghostEmail = ghostSession.isImpersonating && ghostSession.targetEmail ? ghostSession.targetEmail : null;
      const activeUser = ghostEmail && me ? { ...me, email: ghostEmail, isGhostAccount: true } : me;
      setUser(activeUser || null);

      if (activeUser?.email) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: activeUser.email });
        setProfile(profiles[0] || null);
      } else {
        setProfile(null);
      }

      if (mode !== "all" && !activeUser?.email) {
        setItems([]);
        setLoading(false);
        return;
      }

      const rows = mode === "all"
        ? await getActiveListings()
        : await base44.entities.Listing.filter({ seller_email: activeUser.email }, "-created_date");
      setItems(mode === "all" ? rows.filter(x => x.is_approved !== false) : rows);
      setLoading(false);
    };
    load();
  }, [mode]);

  useEffect(() => {
    getPublisherRankMap().then((map) => setRankMap(map || {})).catch(() => setRankMap({}));
  }, []);

  const adminUser = user && isAdmin(user.email);
  const filtered = items.filter(l => !q || `${l.title || ""} ${l.description || ""} ${l.category || ""}`.toLowerCase().includes(q.toLowerCase()));

  const deleteListing = async (listing) => {
    const isOwner = user && (user.email === listing.seller_email || user.email === listing.created_by || user.id === listing.created_by_id);
    const canDelete = adminUser || isOwner;
    if (!canDelete) return;
    if (!window.confirm("Are you sure you want to permanently delete this listing and its files?")) return;
    await invokeAdminFn("deleteListingPermanent", { listing_id: listing.id });
    setItems(prev => prev.filter(item => item.id !== listing.id));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-gray-950/70 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
      <GamerBrandFooter position="top" className="px-0 pt-0 pb-2" />
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12">
        <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-black via-gray-950 to-gray-900 p-3 shadow-[0_0_32px_rgba(245,158,11,0.10)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Listings</p>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{mode === "all" ? "All Listings" : "My Listings"}</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Compact landing view with leaderboard stats.</p>
          </div>
        </div>

        <LandingSearchHeader
          searchValue={q}
          onSearchChange={(e) => setQ(e.target.value)}
          searchPlaceholder="Search listings..."
          rightSlot={
            <Link to="/create-listing" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3 text-sm font-black text-black">
              <Plus className="w-4 h-4" /> Post
            </Link>
          }
        />

        {loading ? (
          <BrandedLoadingScreen label="Loading Listings..." minHeight="18rem" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {filtered.map(l => {
              const isOwner = user && (user.email === l.seller_email || user.email === l.created_by || user.id === l.created_by_id);
              const canManage = adminUser || isOwner;
              const sellerRank = rankMap?.[l.seller_email] || null;
              const pts = listingScore(l, 0);
              return (
                <div key={l.id} className="w-full min-w-0 rounded-2xl bg-gray-900/92 border border-gray-800 overflow-hidden hover:border-amber-500/40 transition-all">
                  <a href={getPublicSiteUrl(`/listing?id=${l.id}`)} className="block">
                    <div className="aspect-square bg-gray-800 relative flex items-center justify-center">
                      {l.images?.[0] ? (
                        <ListingImageFrame
                          src={l.images[0]}
                          alt={l.title || "Listing"}
                          fallbackCategory={l.category || "Listing"}
                          className="w-full h-full"
                          foregroundClassName="w-full h-full object-contain p-2"
                          backgroundClassName="w-full h-full object-cover scale-110 blur-xl opacity-30"
                        />
                      ) : <Package className="w-10 h-10 text-gray-600" />}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm truncate">{l.title}</p>
                      <p className="text-gray-500 text-[11px] truncate">by @{l.seller_username || l.seller_email?.split("@")[0] || "gamer"}</p>
                      {l.download_host && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-300">
                          <Download className="h-3 w-3" /> Download
                        </div>
                      )}
                      <p className="text-purple-300 text-xs font-black">{!l.price || l.is_free ? "FREE" : formatListingPrice(l.price, l.currency)}</p>
                      <div className="mt-2 rounded-xl border border-purple-700/30 bg-[linear-gradient(180deg,rgba(32,14,56,0.94),rgba(11,8,25,0.96))] p-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { rank: "01", label: "Score", value: pts, tone: "from-purple-600/45 via-fuchsia-500/25 to-pink-500/15", accent: "bg-gradient-to-r from-purple-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent", valueClassName: "bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(217,70,239,0.35)]", isPoints: true },
                            { rank: "02", label: "Seller rank", value: sellerRank ? `#${sellerRank}` : "--", tone: "from-amber-500/30 to-orange-500/10", accent: "text-amber-300", icon: "trophy" },
                            { rank: "03", label: "Views", value: l.views || 0, tone: "from-cyan-500/30 to-sky-500/10", accent: "text-cyan-300", icon: "eye" },
                            { rank: "04", label: "Downloads", value: l.downloads || 0, tone: "from-pink-500/30 to-fuchsia-500/10", accent: "text-fuchsia-300", icon: "download" },
                          ].map((metric) => (
                            <div key={metric.label} className={`flex min-h-[66px] flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-r ${metric.tone} px-2 py-1.5 text-center ${metric.isPoints ? "shadow-[0_0_18px_rgba(217,70,239,0.14)]" : ""}`}>
                              <div className="mb-1 flex items-center justify-center gap-1">
                                {metric.icon === "trophy" && <Trophy className={`h-2.5 w-2.5 ${metric.accent}`} />}
                                {metric.icon === "eye" && <Eye className={`h-2.5 w-2.5 ${metric.accent}`} />}
                                {metric.icon === "download" && <Download className={`h-2.5 w-2.5 ${metric.accent}`} />}
                                <p className={`text-[8px] font-black ${metric.isPoints ? "text-fuchsia-100/75" : metric.accent}`}>{metric.rank}</p>
                              </div>
                              <p className={`text-[8px] uppercase tracking-[0.14em] font-black ${metric.isPoints ? "text-fuchsia-100/75" : "text-gray-400"}`}>{metric.isPoints ? "PTS" : metric.label}</p>
                              {metric.isPoints ? (
                                <div className="text-center">
                                  <p className={`text-base font-black leading-none ${metric.valueClassName || "text-white"}`}>{metric.value}</p>
                                  <p className="text-[8px] uppercase text-fuchsia-100/75 mt-0.5">Score</p>
                                  <p className="text-[8px] uppercase text-gray-300/60">pts</p>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <p className={`text-sm font-black leading-none ${metric.valueClassName || "text-white"}`}>{metric.value}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </a>
                  {canManage && (
                    <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                      <Link to={`/create-listing?edit=${l.id}`} className="inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-bold hover:bg-purple-900/50">
                        <Pencil className="w-3 h-3" /> Edit
                      </Link>
                      <button onClick={() => deleteListing(l)} className="inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-red-950/40 border border-red-700/50 text-red-300 text-xs font-bold hover:bg-red-900/60">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
