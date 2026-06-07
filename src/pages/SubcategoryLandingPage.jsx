import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Check, Upload, Plus, Trash2, ArrowLeft, Share2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";

// Storage key for cards in a subcategory landing page
const getStorageKey = (parentCat, subId) => `subcat_landing_${parentCat}_${subId}`;
const getCardsKey = (parentCat, subId) => `subcat_landing_cards_${parentCat}_${subId}`;

function CardEditOverlay({ card, onClose, onSave }) {
  const [name, setName] = useState(card.name || "");
  const [logoUrl, setLogoUrl] = useState(card.logo || "");
  const [coverUrl, setCoverUrl] = useState(card.cover || "");
  const [uploading, setUploading] = useState(null);
  const logoRef = useRef(null);
  const coverRef = useRef(null);

  const handleUpload = async (file, type) => {
    if (!file) return;
    setUploading(type);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === "logo") setLogoUrl(file_url);
    else setCoverUrl(file_url);
    setUploading(null);
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/95 rounded-2xl p-4 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <p className="text-white text-xs font-black">Edit Card</p>
        <button onClick={onClose}><X className="w-3.5 h-3.5 text-gray-400" /></button>
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Card Name</p>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500" />
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Profile Picture</p>
        <div className="flex gap-1.5 mb-1">
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
            placeholder="Paste URL..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-[10px] focus:outline-none focus:border-purple-500" />
          <button onClick={() => logoRef.current?.click()}
            className="px-2 py-1.5 rounded-lg bg-purple-700 text-white text-[10px] flex items-center gap-1 whitespace-nowrap">
            {uploading === "logo" ? "..." : <><Upload className="w-3 h-3" /> Upload</>}
          </button>
          <input ref={logoRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => handleUpload(e.target.files[0], "logo")} />
        </div>
        {logoUrl && <img src={logoUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />}
      </div>
      <div>
        <p className="text-gray-500 text-[10px] mb-1">Cover Image</p>
        <div className="flex gap-1.5 mb-1">
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
            placeholder="Paste URL..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-[10px] focus:outline-none focus:border-blue-500" />
          <button onClick={() => coverRef.current?.click()}
            className="px-2 py-1.5 rounded-lg bg-blue-700 text-white text-[10px] flex items-center gap-1 whitespace-nowrap">
            {uploading === "cover" ? "..." : <><Upload className="w-3 h-3" /> Upload</>}
          </button>
          <input ref={coverRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => handleUpload(e.target.files[0], "cover")} />
        </div>
        {coverUrl && <img src={coverUrl} className="w-full h-12 rounded-lg object-cover opacity-70" alt="" />}
      </div>
      <button onClick={() => onSave({ name, logo: logoUrl, cover: coverUrl })}
        className="w-full py-1.5 rounded-lg bg-green-700 text-white text-xs font-black flex items-center justify-center gap-1">
        <Check className="w-3 h-3" /> Save
      </button>
    </div>
  );
}

function LandingCard({ card, canAdmin, onEdit, onDelete, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <motion.div
      className="relative rounded-2xl cursor-pointer group"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {canAdmin && !editing && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.stopPropagation(); setEditing(true); }}
            className="w-6 h-6 rounded-lg bg-black/70 hover:bg-purple-700 flex items-center justify-center">
            <Pencil className="w-3 h-3 text-white" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete?.(); }}
            className="w-6 h-6 rounded-lg bg-black/70 hover:bg-red-700 flex items-center justify-center">
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {editing && (
        <CardEditOverlay
          card={card}
          onClose={() => setEditing(false)}
          onSave={updated => { onEdit?.(updated); setEditing(false); }}
        />
      )}

      <div
        onClick={editing ? undefined : onClick}
        className="relative h-56 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950 to-gray-900 p-4 flex flex-col justify-between overflow-hidden"
        style={{ boxShadow: hovered ? "0 0 24px 4px rgba(139,92,246,0.4)" : "none", transition: "box-shadow 0.3s" }}
      >
        {card.cover && (
          <div className="absolute inset-0 opacity-25 rounded-2xl"
            style={{ backgroundImage: `url(${card.cover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="relative flex items-start gap-3">
          {card.logo
            ? <img src={card.logo} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="" />
            : <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-xl flex-shrink-0">🎮</div>
          }
          <div>
            <p className="text-white font-black text-sm leading-tight">{card.name}</p>
            <p className="text-purple-300/60 text-[10px] mt-0.5">Click to explore</p>
          </div>
        </div>
        <div className="relative flex items-center justify-between">
          <span className="text-purple-300/40 text-xs font-bold" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>Explore →</span>
          <button
            onClick={e => {
              e.stopPropagation();
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent(`Check out ${card.name} on GAMER.PRODUCTIONS 🎮`);
              window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
            }}
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
            className="w-6 h-6 rounded-lg bg-green-700/60 flex items-center justify-center"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AddCardModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [cover, setCover] = useState("");
  const [uploading, setUploading] = useState(null);
  const logoRef = useRef(null);
  const coverRef = useRef(null);

  const handleUpload = async (file, type) => {
    if (!file) return;
    setUploading(type);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === "logo") setLogo(file_url);
    else setCover(file_url);
    setUploading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.9)" }}>
      <div className="bg-gray-950 border border-purple-700/40 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black">Add Category Card</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Card Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gameplay Clips"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Profile Picture</label>
            <div className="flex gap-2 mb-1">
              <input value={logo} onChange={e => setLogo(e.target.value)} placeholder="Paste URL or upload..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <button onClick={() => logoRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-purple-700 text-white text-xs flex items-center gap-1">
                {uploading === "logo" ? "..." : <><Upload className="w-3 h-3" /> Upload</>}
              </button>
              <input ref={logoRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => handleUpload(e.target.files[0], "logo")} />
            </div>
            {logo && <img src={logo} className="w-12 h-12 rounded-xl object-cover" alt="" />}
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold mb-1 block">Cover Image</label>
            <div className="flex gap-2 mb-1">
              <input value={cover} onChange={e => setCover(e.target.value)} placeholder="Paste URL or upload..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              <button onClick={() => coverRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-blue-700 text-white text-xs flex items-center gap-1">
                {uploading === "cover" ? "..." : <><Upload className="w-3 h-3" /> Upload</>}
              </button>
              <input ref={coverRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => handleUpload(e.target.files[0], "cover")} />
            </div>
            {cover && <img src={cover} className="w-full h-12 rounded-lg object-cover opacity-70" alt="" />}
          </div>
          <button
            onClick={() => { if (!name.trim()) return; onAdd({ id: Date.now().toString(), name, logo, cover }); onClose(); }}
            className="w-full py-2.5 rounded-xl font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            <Plus className="w-4 h-4 inline mr-1" /> Add Card
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubcategoryLandingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat") || "";
  const sub = params.get("sub") || "";
  const deep = params.get("deep") || "";
  const [cards, setCards] = useState([]);
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recommendText, setRecommendText] = useState("");
  const [recommendSent, setRecommendSent] = useState(false);
  const admin = isAdmin(user?.email);

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
    }
    const key = getCardsKey(cat, sub);
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      setCards(saved);
    } catch { setCards([]); }
    
    // Load posts and listings for this subcategory
    const loadData = async () => {
      setLoading(true);
      try {
        // Load posts for this subcategory (section_id matches sub)
        const postsData = await base44.entities.CommunityPost.filter({ 
          franchise_id: cat === "modding" ? `modding_${sub.toLowerCase().replace(/\s+/g, "_")}` : sub,
          section_id: sub 
        });
        setPosts(postsData.filter(p => p.status === "active").slice(0, 20));
        
        // Load listings for this subcategory
        const listingsData = cat === "modding" 
          ? await base44.entities.Listing.filter({ modding_subcategory: sub, status: "active" })
          : await base44.entities.Listing.filter({ community_franchise_id: sub, status: "active" });
        setListings(listingsData.slice(0, 12));
      } catch {}
      setLoading(false);
    };
    loadData();
  }, [user, cat, sub]);

  const saveCards = (updated) => {
    const key = getCardsKey(cat, sub);
    localStorage.setItem(key, JSON.stringify(updated));
    setCards(updated);
  };

  const handleAdd = (card) => saveCards([...cards, card]);
  const handleEdit = (id, data) => saveCards(cards.map(c => c.id === id ? { ...c, ...data } : c));
  const handleDelete = (id) => saveCards(cards.filter(c => c.id !== id));

  const handleCardClick = (card) => {
    window.location.href = `/sub-landing?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}&deep=${encodeURIComponent(card.id)}`;
  };

  const handleRecommend = async () => {
    if (!recommendText.trim()) return;
    await base44.entities.SubcategoryRequest.create({
      seller_email: user?.email || "anonymous",
      seller_username: profile?.username || "User",
      parent_category: `${cat}/${sub}`,
      subcategory_name: recommendText,
      description: `Recommended from ${sub} landing page`,
      status: "pending",
    });
    setRecommendSent(true);
    setTimeout(() => { setShowRecommend(false); setRecommendSent(false); setRecommendText(""); }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      <div className="pt-20 px-4 max-w-7xl mx-auto pb-16">
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-purple-300 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-1">{cat} · {sub}</p>
            <h1 className="text-3xl font-black text-white">{decodeURIComponent(sub)}</h1>
            <p className="text-gray-500 text-sm mt-1">Explore cards in this subcategory{admin ? " · Hover cards to edit" : ""}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowRecommend(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-cyan-300 border border-cyan-700/40 bg-cyan-900/20 hover:bg-cyan-900/40 transition-all">
              💡 Recommend Subcategory
            </button>
            {user && (
              <button onClick={() => window.location.href = `/create-listing?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg, #059669, #0d9488)" }}>
                <Plus className="w-4 h-4" /> Add Listing
              </button>
            )}
            {admin && (
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                <Plus className="w-4 h-4" /> Add Category Card
              </button>
            )}
          </div>
        </div>

        {cards.length === 0 && !admin && (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-gray-400 font-semibold">No cards yet</p>
            <p className="text-gray-600 text-sm mt-1">Admin will add cards here soon</p>
          </div>
        )}

        {cards.length === 0 && admin && (
          <div className="text-center py-24 border-2 border-dashed border-purple-700/30 rounded-3xl">
            <p className="text-4xl mb-3">➕</p>
            <p className="text-gray-400 font-semibold">No cards yet — add the first one</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              <Plus className="w-4 h-4 inline mr-1" /> Add Card
            </button>
          </div>
        )}

        {/* Newsfeed Section - shows posts and listings for this subcategory */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">📰 {decodeURIComponent(sub)} Feed</span>
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 && listings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-4xl mb-3">🎮</p>
              <p className="text-gray-400 font-semibold">No posts or listings yet</p>
              <p className="text-gray-600 text-sm mt-1">Be the first to contribute!</p>
              {user && (
                <a href={`/create-listing?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4" /> Add Listing
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Posts Feed */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Posts</h3>
                {posts.length === 0 ? (
                  <div className="text-center py-8 rounded-xl bg-gray-900 border border-gray-800">
                    <p className="text-gray-500 text-sm">No posts yet</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.2)" }}>
                          {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-sm">🎮</div>}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{post.author_username || "Gamer"}</p>
                          <p className="text-gray-600 text-[10px]">{new Date(post.created_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      {post.image_urls?.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {post.image_urls.slice(0, 4).map((img, i) => <img key={i} src={img} className="rounded-xl w-full h-28 object-cover" alt="" />)}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Listings Sidebar */}
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Listings</h3>
                {listings.length === 0 ? (
                  <div className="text-center py-8 rounded-xl bg-gray-900 border border-gray-800">
                    <p className="text-gray-500 text-sm">No listings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listings.map(listing => (
                      <a key={listing.id} href={`/listing?id=${listing.id}`}
                        className="flex gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-600/50 transition-all group">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                          {listing.images?.[0] ? <img src={listing.images[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl">🎮</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-xs line-clamp-2 group-hover:text-purple-300 transition-colors">{listing.title}</p>
                          <p className="font-black text-xs mt-1" style={{ color: "#a855f7" }}>{listing.is_free || !listing.price ? "FREE" : `₱${listing.price}`}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cards.map(card => (
            <LandingCard
              key={card.id}
              card={card}
              canAdmin={admin}
              onEdit={data => handleEdit(card.id, data)}
              onDelete={() => handleDelete(card.id)}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
        {showRecommend && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowRecommend(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-950 border border-cyan-700/40 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black">💡 Recommend Subcategory</h3>
                <button onClick={() => setShowRecommend(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              {recommendSent ? (
                <div className="text-center py-6">
                  <p className="text-green-400 font-black text-lg">✅ Sent!</p>
                  <p className="text-gray-400 text-sm mt-1">Admin will review your suggestion.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-4">Suggest a new subcategory to add under <span className="text-white font-bold">{sub}</span>.</p>
                  <input value={recommendText} onChange={e => setRecommendText(e.target.value)}
                    placeholder="e.g. PS3 ISOs, FIFA 24 Kits..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 mb-4" />
                  <button onClick={handleRecommend} disabled={!recommendText.trim()}
                    className="w-full py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #0891b2, #7c3aed)" }}>
                    Submit Recommendation
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}