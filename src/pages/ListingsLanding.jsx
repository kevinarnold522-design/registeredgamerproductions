import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { ArrowLeft, Plus, Search, Package, Pencil, Trash2, Trophy, Download } from "lucide-react";
import { formatListingPrice } from "@/lib/currency";
import { isAdmin } from "@/lib/constants";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import { invokeAdminFn } from "@/lib/invokeAdminFn";
import { Link, useNavigate } from "react-router-dom";
import { getPublisherRankMap } from "@/lib/publisherRank";
import { listingScore } from "@/lib/leaderboardScore";

export default function ListingsLanding({ mode = "mine" }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [rankMap, setRankMap] = useState({});

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      const ghostSession = (() => {
        try { return JSON.parse(localStorage.getItem("impersonation_session") || "{}"); } catch { return {}; }
      })();
      const ghostEmail = ghostSession.isImpersonating && ghostSession.targetEmail ? ghostSession.targetEmail : null;
      const activeUser = ghostEmail ? { ...me, email: ghostEmail, isGhostAccount: true } : me;
      setUser(activeUser);
      if (!activeUser?.email) {
        setProfile(null);
        setItems([]);
        setLoading(false);
        return;
      }
      const profiles = await base44.entities.UserProfile.filter({ user_email: activeUser.email });
      setProfile(profiles[0] || null);
      const rows = mode === "all"
        ? await base44.entities.Listing.filter({ status: "active" }, "-created_date", 200)
        : await base44.entities.Listing.filter({ seller_email: activeUser.email }, "-created_date", 200);
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
      <AuthNavbar user={user} profile={profile} />
      <GamerBrandFooter position="top" className="px-0 pt-0 pb-2" />
      <main className="mx-auto w-full max-w-7xl px-4 pt-10 pb-12">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-purple-700/30 bg-gray-950/78 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Listings</p>
            <h1 className="text-2xl font-black sm:text-3xl">{mode === "all" ? "All Listings" : "My Listings"}</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Compact landing view with leaderboard stats.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-400/45 bg-gradient-to-r from-purple-600/80 via-fuchsia-600/80 to-pink-500/80 px-4 py-2 text-sm font-black text-white shadow-[0_0_18px_rgba(217,70,239,0.34)] transition-all hover:brightness-110 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex w-full items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 sm:w-auto">
              <Search className="w-4 h-4 text-gray-500" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search listings..." className="w-full bg-transparent outline-none text-sm text-white sm:w-36" />
            </div>
            <Link to="/create-listing" className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-700 text-white text-sm font-bold sm:w-auto"><Plus className="w-4 h-4" /> Post</Link>
          </div>
        </div>

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
                <div key={l.id} className="w-full min-w-0 rounded-2xl bg-gray-900/92 border border-gray-800 overflow-hidden hover:border-purple-500/50 transition-all">
                  <Link to={`/listing?id=${l.id}`} className="block">
                    <div className="aspect-square bg-gray-800 relative flex items-center justify-center">
                      {l.images?.[0] ? (
                        <>
                          <img src={l.images[0]} className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30" alt="" aria-hidden="true" />
                          <img src={l.images[0]} className="relative w-full h-full object-contain p-2" alt={l.title || "Listing"} />
                        </>
                      ) : <Package className="w-10 h-10 text-gray-600" />}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm truncate">{l.title}</p>
                      <p className="text-gray-500 text-[11px] truncate">by @{l.seller_username || l.seller_email?.split("@")[0] || "gamer"}</p>
                      {l.download_host && <div className="mt-1"><DownloadHostBadge host={l.download_host} size="sm" /></div>}
                      <p className="text-purple-300 text-xs font-black">{!l.price || l.is_free ? "FREE" : formatListingPrice(l.price, l.currency)}</p>
                      <div className="mt-2 rounded-xl border border-purple-700/30 bg-[linear-gradient(180deg,rgba(32,14,56,0.94),rgba(11,8,25,0.96))] p-2">
                        <div className="mb-1 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-300" />
                          <p className="text-[9px] uppercase tracking-[0.2em] text-purple-300 font-black">Performance</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { rank: "PTS", label: "Listing pts", value: pts, tone: "from-purple-600/45 via-fuchsia-500/25 to-pink-500/15", accent: "bg-gradient-to-r from-purple-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent", valueClassName: "bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(217,70,239,0.35)]", isPoints: true },
                            { rank: "02", label: "Seller rank", value: sellerRank ? `#${sellerRank}` : "--", tone: "from-amber-500/30 to-orange-500/10", accent: "text-amber-300" },
                            { rank: "03", label: "Views", value: l.views || 0, tone: "from-cyan-500/30 to-sky-500/10", accent: "text-cyan-300" },
                            { rank: "04", label: "Downloads", value: l.downloads || 0, tone: "from-pink-500/30 to-fuchsia-500/10", accent: "text-fuchsia-300" },
                          ].map((metric) => (
                            <div key={metric.label} className={`flex min-h-[72px] flex-col justify-between rounded-xl border border-white/10 bg-gradient-to-r ${metric.tone} px-2.5 py-2 ${metric.isPoints ? "shadow-[0_0_18px_rgba(217,70,239,0.14)]" : ""}`}>
                              <div className="mb-1 flex items-center justify-between gap-2">
                                {metric.isPoints ? (
                                  <p className="text-[8px] font-black uppercase tracking-[0.24em] text-fuchsia-100/75">PTS</p>
                                ) : (
                                  <p className={`text-[9px] font-black ${metric.accent}`}>{metric.rank}</p>
                                )}
                                <p className={`text-[8px] uppercase tracking-[0.16em] font-black ${metric.isPoints ? "text-fuchsia-100/75" : "text-gray-400"}`}>{metric.isPoints ? "Score" : metric.label}</p>
                              </div>
                              {metric.isPoints ? (
                                <div className="text-right">
                                  <p className={`text-lg font-black leading-none ${metric.valueClassName || "text-white"}`}>{metric.value}</p>
                                  <p className="text-[8px] uppercase text-gray-300/60">pts</p>
                                </div>
                              ) : (
                                <div className="flex items-end gap-1">
                                  <p className={`text-base font-black leading-none ${metric.valueClassName || "text-white"}`}>{metric.value}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
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
