import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Search, Check, X, Gamepad2, Wrench, RefreshCw, Eye, Link2, Image, FileText, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { TOP_FRANCHISES } from "@/lib/franchises";

const MODDING_SUBS = [
  "WWE2K","Football Life","GTA 5","GTA SA","GTA 4","FIFA","NBA2K","PES","PPSSPP/PSP","PS2","Android","PC"
];

// Map modding subcategory → gaming franchise id
const MODDING_TO_FRANCHISE_MAP = {
  "WWE2K":        "wwe2k",
  "Football Life":"pes-football-life",
  "GTA 5":        "gta",
  "GTA SA":       "gta",
  "GTA 4":        "gta",
  "FIFA":         "fifa",
  "NBA2K":        "nba2k",
  "PES":          "pes-football-life",
  "PPSSPP/PSP":   null,
  "PS2":          null,
  "Android":      null,
  "PC":           null,
};

export default function RoutingDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("listings");
  const [saving, setSaving] = useState({});
  const [communities, setCommunities] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me || !isAdmin(me.email)) { window.location.href = "/"; return; }
      setUser(me);
      const [profiles, listingsData, postsData, commsData] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: me.email }),
        base44.entities.Listing.list("-created_date", 100),
        base44.entities.CommunityPost.list("-created_date", 100),
        base44.entities.GamingCommunity.list(),
      ]);
      setProfile(profiles[0] || null);
      setListings(listingsData);
      setPosts(postsData.filter(p => p.status === "active"));
      setCommunities(commsData);
      setLoading(false);
    };
    init();
  }, []);

  const allFranchises = TOP_FRANCHISES;

  const updateListingRouting = async (listingId, field, value) => {
    setSaving(s => ({ ...s, [listingId]: true }));
    await base44.entities.Listing.update(listingId, { [field]: value });
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, [field]: value } : l));
    setSaving(s => ({ ...s, [listingId]: false }));
  };

  const updatePostRouting = async (postId, field, value) => {
    setSaving(s => ({ ...s, [postId]: true }));
    await base44.entities.CommunityPost.update(postId, { [field]: value });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, [field]: value } : p));
    setSaving(s => ({ ...s, [postId]: false }));
  };

  // Sync a modding subcategory's assets WITH the linked gaming community
  const syncModdingToGaming = async (moddingSub) => {
    const franchiseId = MODDING_TO_FRANCHISE_MAP[moddingSub];
    if (!franchiseId) return;

    setSyncStatus(s => ({ ...s, [moddingSub]: "syncing" }));

    // Find or create gaming community
    let comm = communities.find(c => c.franchise_id === franchiseId);
    if (!comm) {
      comm = await base44.entities.GamingCommunity.create({
        franchise_id: franchiseId,
        name: TOP_FRANCHISES.find(f => f.id === franchiseId)?.name || moddingSub,
        color_primary: "#1a1a2e",
        color_secondary: "#7c3aed",
        moderator_emails: [],
        sections: [],
      });
      setCommunities(prev => [...prev, comm]);
    }

    // Sync listings: tag all modding listings with this franchise
    const moddingListings = listings.filter(l => l.modding_subcategory === moddingSub);
    await Promise.all(moddingListings.map(l =>
      base44.entities.Listing.update(l.id, { community_franchise_id: franchiseId })
    ));
    setListings(prev => prev.map(l =>
      l.modding_subcategory === moddingSub ? { ...l, community_franchise_id: franchiseId } : l
    ));

    // Sync posts: tag all modding posts with this franchise
    const moddingPosts = posts.filter(p =>
      p.franchise_id?.startsWith("modding_") && p.section_id === moddingSub
    );
    await Promise.all(moddingPosts.map(p =>
      base44.entities.CommunityPost.update(p.id, {
        franchise_id: franchiseId,
        community_id: comm.id,
      })
    ));
    setPosts(prev => prev.map(p =>
      (p.franchise_id?.startsWith("modding_") && p.section_id === moddingSub)
        ? { ...p, franchise_id: franchiseId, community_id: comm.id }
        : p
    ));

    setSyncStatus(s => ({ ...s, [moddingSub]: "done" }));
    setTimeout(() => setSyncStatus(s => ({ ...s, [moddingSub]: null })), 3000);
  };

  // Copy profile/cover pics from one community to another
  const syncCommunityMedia = async (fromFranchiseId, toFranchiseId) => {
    const fromComm = communities.find(c => c.franchise_id === fromFranchiseId);
    const toComm = communities.find(c => c.franchise_id === toFranchiseId);
    if (!fromComm || !toComm) return;
    const updates = {};
    if (fromComm.logo_url) updates.logo_url = fromComm.logo_url;
    if (fromComm.logo_urls?.length) updates.logo_urls = fromComm.logo_urls;
    if (fromComm.cover_url) updates.cover_url = fromComm.cover_url;
    if (fromComm.cover_urls?.length) updates.cover_urls = fromComm.cover_urls;
    await base44.entities.GamingCommunity.update(toComm.id, updates);
    setCommunities(prev => prev.map(c => c.id === toComm.id ? { ...c, ...updates } : c));
  };

  const crossPostToModding = async (post, moddingSub) => {
    setSaving(s => ({ ...s, [post.id + "_cross"]: true }));
    await base44.entities.CommunityPost.create({
      community_id: "modding",
      franchise_id: "modding_" + moddingSub.toLowerCase().replace(/\s+/g, "_"),
      author_email: post.author_email,
      author_username: post.author_username,
      author_avatar: post.author_avatar || "",
      content: `[Routed from ${post.franchise_id}] ${post.content}`,
      likes: 0,
      status: "active",
      section_id: moddingSub,
    });
    setSaving(s => ({ ...s, [post.id + "_cross"]: false }));
  };

  const filtered = tab === "listings"
    ? listings.filter(l => l.title?.toLowerCase().includes(search.toLowerCase()) || l.seller_username?.toLowerCase().includes(search.toLowerCase()))
    : posts.filter(p => p.content?.toLowerCase().includes(search.toLowerCase()) || p.author_username?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Routing Dashboard</h1>
              <p className="text-gray-500 text-sm">Control where listings & posts appear across Gaming & Modding communities</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "listings", label: "Listings", icon: <Gamepad2 className="w-4 h-4" />, count: listings.length },
            { id: "posts", label: "Posts", icon: <Wrench className="w-4 h-4" />, count: posts.length },
            { id: "sync", label: "Community Sync", icon: <Link2 className="w-4 h-4" /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${tab === t.id ? "bg-purple-600 text-white" : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-purple-500/50"}`}>
              {t.icon}
              {t.label} {t.count !== undefined && `(${t.count})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
        </div>

        {/* Table */}
        <div className="space-y-3">
          {filtered.slice(0, 50).map(item => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {tab === "listings" && item.images?.[0] && (
                      <img src={item.images[0]} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                    )}
                    <p className="text-white font-bold text-sm line-clamp-1">
                      {tab === "listings" ? item.title : item.content?.slice(0, 60) + (item.content?.length > 60 ? "..." : "")}
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {tab === "listings"
                      ? `By @${item.seller_username} · ₱${item.price || "FREE"} · ${item.category}`
                      : `By @${item.author_username} · ${new Date(item.created_date).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Gaming Community routing */}
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3 text-purple-400" /> Gaming Community
                  </p>
                  <select
                    value={tab === "listings" ? (item.community_franchise_id || "") : (item.franchise_id || "")}
                    onChange={e => tab === "listings"
                      ? updateListingRouting(item.id, "community_franchise_id", e.target.value)
                      : updatePostRouting(item.id, "franchise_id", e.target.value)
                    }
                    className="bg-gray-800 border border-purple-700/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                    <option value="">— Not assigned —</option>
                    {allFranchises.map(f => (
                      <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Modding Community routing */}
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-orange-400" /> Modding Subcategory
                  </p>
                  <select
                    value={tab === "listings" ? (item.modding_subcategory || "") : ""}
                    onChange={e => {
                      if (tab === "listings") {
                        updateListingRouting(item.id, "modding_subcategory", e.target.value);
                      } else {
                        // Cross-post this post to modding community
                        if (e.target.value) crossPostToModding(item, e.target.value);
                      }
                    }}
                    className="bg-gray-800 border border-orange-700/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500">
                    <option value="">— Not a mod item —</option>
                    {MODDING_SUBS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {saving[item.id] ? (
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-green-500 opacity-50" />
                  )}
                  {tab === "listings" && (
                    <a href={`/listing?id=${item.id}`} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-purple-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Current routing summary */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(tab === "listings" ? item.community_franchise_id : item.franchise_id) && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-[10px] font-bold">
                    🎮 {allFranchises.find(f => f.id === (tab === "listings" ? item.community_franchise_id : item.franchise_id))?.name || (tab === "listings" ? item.community_franchise_id : item.franchise_id)}
                  </span>
                )}
                {tab === "listings" && item.modding_subcategory && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-300 text-[10px] font-bold">
                    🔧 {item.modding_subcategory}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {tab !== "sync" && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No {tab} found</p>
          </div>
        )}

        {/* ── COMMUNITY SYNC TAB ── */}
        {tab === "sync" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-white font-black">Modding ↔ Gaming Community Interlink</h2>
              </div>
              <p className="text-gray-500 text-sm mb-6">Sync modding subcategories with gaming franchise communities — shared listings, posts, profile pictures & cover images are all linked automatically.</p>

              <div className="grid gap-4">
                {MODDING_SUBS.map(sub => {
                  const franchiseId = MODDING_TO_FRANCHISE_MAP[sub];
                  const franchise = franchiseId ? TOP_FRANCHISES.find(f => f.id === franchiseId) : null;
                  const gamingComm = franchiseId ? communities.find(c => c.franchise_id === franchiseId) : null;
                  const moddingListingCount = listings.filter(l => l.modding_subcategory === sub).length;
                  const moddingPostCount = posts.filter(p => p.section_id === sub).length;
                  const linkedListingCount = listings.filter(l => l.modding_subcategory === sub && l.community_franchise_id === franchiseId).length;
                  const status = syncStatus[sub];

                  return (
                    <div key={sub} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Modding side */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-300 text-xs font-black">🔧 Modding</span>
                            <span className="text-white font-bold">{sub}</span>
                          </div>
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {moddingListingCount} listings</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {moddingPostCount} posts</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="flex-1 h-px bg-gray-700 md:w-8" />
                          <Link2 className="w-4 h-4 flex-shrink-0" />
                          <div className="flex-1 h-px bg-gray-700 md:w-8" />
                        </div>

                        {/* Gaming community side */}
                        <div className="flex-1 min-w-0">
                          {franchise ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/40 text-purple-300 text-xs font-black">🎮 Gaming</span>
                                <span className="text-white font-bold">{franchise.emoji} {franchise.name}</span>
                              </div>
                              {gamingComm ? (
                                <div className="flex items-center gap-3">
                                  {gamingComm.logo_url && <img src={gamingComm.logo_url} className="w-8 h-8 rounded-lg object-cover border border-gray-600" alt="" />}
                                  {gamingComm.cover_url && <img src={gamingComm.cover_url} className="w-16 h-8 rounded-lg object-cover border border-gray-600" alt="" />}
                                  <span className="text-xs text-green-400 font-semibold">✓ Community exists</span>
                                  <span className="text-xs text-gray-500">{linkedListingCount}/{moddingListingCount} linked</span>
                                </div>
                              ) : (
                                <p className="text-gray-600 text-xs italic">Community not created yet — sync will create it</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm italic">No gaming franchise mapped</p>
                          )}
                        </div>

                        {/* Sync button */}
                        <div className="flex-shrink-0">
                          {franchise ? (
                            <button
                              onClick={() => syncModdingToGaming(sub)}
                              disabled={status === "syncing"}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                                status === "done"
                                  ? "bg-green-900/40 border border-green-600/40 text-green-300"
                                  : status === "syncing"
                                  ? "bg-gray-800 border border-gray-600 text-gray-400"
                                  : "bg-cyan-900/40 border border-cyan-600/40 text-cyan-300 hover:bg-cyan-900/60"
                              }`}
                            >
                              {status === "syncing" ? <RefreshCw className="w-4 h-4 animate-spin" /> : status === "done" ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                              {status === "syncing" ? "Syncing..." : status === "done" ? "Synced!" : "Sync Now"}
                            </button>
                          ) : (
                            <span className="text-gray-700 text-xs">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Media Sync between communities */}
            <div className="bg-gray-900 border border-purple-700/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Image className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-black">Community Media Mirror</h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">Copy profile picture & cover image from one gaming community to another.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[["gta","wwe2k"],["fifa","pes-football-life"],["nba2k","wwe2k"]].map(([a, b]) => {
                  const ca = communities.find(c => c.franchise_id === a);
                  const cb = communities.find(c => c.franchise_id === b);
                  const fa = TOP_FRANCHISES.find(f => f.id === a);
                  const fb = TOP_FRANCHISES.find(f => f.id === b);
                  if (!fa || !fb) return null;
                  return (
                    <div key={a + b} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {ca?.logo_url && <img src={ca.logo_url} className="w-8 h-8 rounded-lg object-cover" alt="" />}
                        <span className="text-white text-xs font-bold truncate">{fa.emoji} {fa.name}</span>
                      </div>
                      <button
                        onClick={() => syncCommunityMedia(a, b)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-600/40 text-purple-300 text-xs font-bold hover:bg-purple-600/50 transition-colors"
                      >
                        → Mirror
                      </button>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-white text-xs font-bold truncate">{fb.emoji} {fb.name}</span>
                        {cb?.logo_url && <img src={cb.logo_url} className="w-8 h-8 rounded-lg object-cover" alt="" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}