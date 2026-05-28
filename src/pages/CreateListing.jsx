import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Plus, ArrowLeft, Play, Youtube, Link, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, CATEGORIES } from "@/lib/constants";

const DIGITAL_SUBCATEGORIES = [
  { id: "mods", label: "Mods / Modifications" },
  { id: "skins", label: "Skins / Textures" },
  { id: "maps", label: "Custom Maps" },
  { id: "cheats", label: "Cheats / Trainers" },
  { id: "tools", label: "Tools / Utilities" },
  { id: "guides", label: "Guides / Tutorials" },
  { id: "other", label: "Other Digital" },
];

const PHYSICAL_SUBCATEGORIES = [
  { id: "consoles", label: "Gaming Consoles" },
  { id: "controllers", label: "Controllers" },
  { id: "accessories", label: "Accessories" },
  { id: "merchandise", label: "Merchandise" },
  { id: "collectibles", label: "Collectibles" },
  { id: "cables", label: "Cables / Adapters" },
  { id: "other", label: "Other Physical" },
];
import AuthNavbar from "@/components/layout/AuthNavbar";
import { TOP_FRANCHISES } from "@/lib/franchises";

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

export default function CreateListing() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);
  const videoFileRef = useRef(null);
  const downloadFileRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  const defaultCat = params.get("cat") || "games";

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    product_type: "",
    category: defaultCat,
    subcategories: [],
    digital_subcategory: "",
    physical_subcategory: "",
    condition: "",
    is_premium: false,
    platform: "",
    stock: 1,
    location: "",
    tags: "",
    keywords: "",
    youtube_url: "",
    video_url: "",
    game_name: "",
    game_platform: "",
    paypal_email: "",
    external_link: "",
    download_url: "",
    card_animation: "fade",
    kofi_url: "",
    buymeacoffee_url: "",
    patreon_url: "",
    community_franchise_id: "",
  });

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me) { base44.auth.redirectToLogin("/create-listing"); return; }
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      if (editId) {
        const listings = await base44.entities.Listing.filter({ id: editId });
        if (listings.length > 0) {
          const l = listings[0];
          setForm({
            title: l.title || "",
            description: l.description || "",
            price: l.price || "",
            product_type: l.product_type || "",
            category: l.category || defaultCat,
            subcategories: l.subcategories || [],
            digital_subcategory: l.digital_subcategory || "",
            physical_subcategory: l.physical_subcategory || "",
            condition: l.condition || "digital",
            is_premium: l.is_premium || false,
            platform: l.platform || "",
            stock: l.stock || 1,
            location: l.location || "",
            tags: (l.tags || []).join(", "),
            keywords: (l.keywords || []).join(", "),
            youtube_url: l.youtube_url || "",
            video_url: l.video_url || "",
            game_name: l.game_name || "",
            game_platform: l.game_platform || "",
            external_link: l.external_link || "",
            download_url: l.download_url || "",
            kofi_url: l.kofi_url || "",
            buymeacoffee_url: l.buymeacoffee_url || "",
            patreon_url: l.patreon_url || "",
            community_franchise_id: l.community_franchise_id || "",
          });
          setImages(l.images || []);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingImages(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImages(prev => [...prev, file_url]);
    }
    setUploadingImages(false);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImages(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, video_url: file_url }));
    setUploadingImages(false);
  };

  const handleDownloadFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImages(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, download_url: file_url }));
    setUploadingImages(false);
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));

  const [moderationResult, setModerationResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModerationResult(null);

    // Run AI content moderation first
    const modRes = await base44.functions.invoke("moderateListing", {
      title: form.title,
      description: form.description,
      category: form.category,
    });
    const mod = modRes?.data;

    const ytId = extractYouTubeId(form.youtube_url);
    const priceVal = parseFloat(form.price) || 0;
    const data = {
      ...form,
      price: priceVal,
      is_free: priceVal === 0,
      stock: parseInt(form.stock) || 1,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      keywords: form.keywords.split(",").map(t => t.trim()).filter(Boolean),
      images,
      youtube_video_id: ytId || undefined,
      seller_email: user.email,
      seller_username: profile?.username || user.full_name,
      seller_paypal_email: form.paypal_email || undefined,
      external_link: form.external_link || undefined,
      subcategories: Array.isArray(form.subcategories) ? form.subcategories : (form.subcategory ? [form.subcategory] : []),
      subcategory: undefined,
      is_approved: mod?.is_approved !== false, // false only if clearly flagged
      status: mod?.requiresReview ? "pending" : "active",
    };
    if (editId) {
      await base44.entities.Listing.update(editId, data);
    } else {
      await base44.entities.Listing.create(data);
    }
    setSaving(false);
    if (mod?.requiresReview) {
      setModerationResult(mod);
    } else {
      window.location.href = "/dashboard?tab=listings";
    }
  };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);
  const ytId = extractYouTubeId(form.youtube_url);
  const isDigital = form.product_type === "digital";
  const isPhysical = form.product_type === "physical";

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-24 max-w-3xl mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <a href="/dashboard?tab=listings" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-black text-white">{editId ? "Edit Listing" : "Create New Listing"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" /> Photos & Images
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors text-gray-500 hover:text-purple-400">
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add Photo</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            {uploadingImages && <p className="text-purple-400 text-sm animate-pulse">Uploading...</p>}
          </div>

          {/* Video / YouTube */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-red-400" /> Video Content
            </h3>

            {/* YouTube URL */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Youtube className="w-3 h-3 text-red-400" /> YouTube URL (optional)
              </label>
              <input value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
              {ytId && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-video">
                  <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                  <p className="text-green-400 text-xs mt-1">YouTube video detected!</p>
                </div>
              )}
            </div>

            {/* Upload video file */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Upload Video File (optional)</label>
              {form.video_url ? (
                <div className="flex items-center gap-3">
                  <video src={form.video_url} controls className="w-48 rounded-xl" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, video_url: "" }))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => videoFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-700 hover:border-blue-500 text-gray-500 hover:text-blue-400 text-sm transition-colors">
                  <Upload className="w-4 h-4" /> Upload Video
                </button>
              )}
              <input ref={videoFileRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            </div>
          </div>

          {/* Download File / External Link */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-green-400" /> Download / Access Options
            </h3>
            <p className="text-gray-500 text-xs">Choose one or both: upload a file from your device, or paste an external link. When buyers click "Download", they'll be routed there.</p>

            {/* Upload file from device */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Upload className="w-3 h-3 text-purple-400" /> Upload File from Device
              </label>
              {form.download_url ? (
                <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/40 rounded-xl p-3">
                  <span className="text-green-400 text-sm">✅ File uploaded</span>
                  <a href={form.download_url} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs underline">Preview</a>
                  <button type="button" onClick={() => setForm(f => ({ ...f, download_url: "" }))} className="ml-auto text-red-400 text-xs hover:text-red-300">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => downloadFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 w-full rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 text-gray-500 hover:text-purple-400 text-sm transition-colors justify-center">
                  <Upload className="w-4 h-4" /> Click to connect & upload from your device
                </button>
              )}
              <input ref={downloadFileRef} type="file" onChange={handleDownloadFileUpload} className="hidden" />
            </div>

            {/* External link */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">External Link (Google Drive, Mega, etc.)</label>
              <input
                value={form.external_link}
                onChange={e => setForm({ ...form, external_link: e.target.value })}
                placeholder="https://drive.google.com/... or any external link"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
              />
              {form.external_link && (
                <a href={form.external_link} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs underline flex items-center gap-1 mt-1">
                  <ExternalLink className="w-3 h-3" /> Preview link
                </a>
              )}
            </div>
          </div>

          {/* Product Type Selection */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-700/50 p-6">
            <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">📦</span> Product Type
            </h3>
            <p className="text-gray-400 text-sm mb-4">Select whether you're selling a digital download or physical item</p>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setForm({ ...form, product_type: "digital", condition: "digital" })}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.product_type === "digital" ? "bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-500/20" : "bg-gray-800 border-gray-700 hover:border-purple-500/50"}`}>
                <span className="text-4xl">💻</span>
                <span className="text-white font-bold text-sm">Digital Product</span>
                <span className="text-gray-400 text-xs text-center">Mods, skins, maps, tools, guides</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, product_type: "physical", condition: "new" })}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.product_type === "physical" ? "bg-pink-900/40 border-pink-500 shadow-lg shadow-pink-500/20" : "bg-gray-800 border-gray-700 hover:border-pink-500/50"}`}>
                <span className="text-4xl">🎮</span>
                <span className="text-white font-bold text-sm">Physical Product</span>
                <span className="text-gray-400 text-xs text-center">Consoles, controllers, merch</span>
              </button>
            </div>
            {form.product_type && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-green-400 text-xs font-semibold">✓ Selected: {form.product_type === "digital" ? "Digital Download" : "Physical Item"}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Listing Details</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="What are you selling?"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>

            {/* Game info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Game Name</label>
                <input value={form.game_name} onChange={e => setForm({ ...form, game_name: e.target.value })} placeholder="e.g. GTA 5, FIFA 25..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Game Platform</label>
                <input value={form.game_platform} onChange={e => setForm({ ...form, game_platform: e.target.value })} placeholder="PC, Android, PS5..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5}
                placeholder="Describe your listing in detail — include game version, what's included, installation steps if needed..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none" />
            </div>

            {/* Free / Paid Toggle */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Pricing</label>
              <div className="flex gap-3 mb-3">
                <button type="button" onClick={() => setForm({ ...form, price: "0" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.price === "0" || form.price === 0 ? "bg-green-900/40 border-2 border-green-500/70 text-green-400" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
                  🆓 FREE
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, price: f.price === "0" || f.price === 0 ? "" : f.price }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.price !== "0" && form.price !== 0 && form.price !== "" ? "bg-purple-900/40 border-2 border-purple-500/70 text-purple-400" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
                  💰 SET PRICE
                </button>
              </div>
              {(form.price !== "0" && form.price !== 0) && (
                <div className="space-y-3">
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="1" placeholder="Enter price in ₱"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />

                </div>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} min={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          {/* Category & Subcategories */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Category & Placement</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Main Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            {/* Product-type specific subcategory */}
            {form.product_type === "digital" && (
              <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                <label className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                  💻 Digital Product Subcategory
                </label>
                <select value={form.digital_subcategory} onChange={e => setForm({ ...form, digital_subcategory: e.target.value })}
                  className="w-full bg-gray-800 border border-purple-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  <option value="">Select digital subcategory</option>
                  {DIGITAL_SUBCATEGORIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                {form.digital_subcategory && (
                  <p className="text-purple-400 text-xs mt-2">This will be auto-categorized under Digital → {DIGITAL_SUBCATEGORIES.find(s => s.id === form.digital_subcategory)?.label}</p>
                )}
              </div>
            )}

            {form.product_type === "physical" && (
              <div className="bg-pink-900/20 border border-pink-700/40 rounded-xl p-4">
                <label className="text-pink-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                  🎮 Physical Product Subcategory
                </label>
                <select value={form.physical_subcategory} onChange={e => setForm({ ...form, physical_subcategory: e.target.value })}
                  className="w-full bg-gray-800 border border-pink-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 text-sm">
                  <option value="">Select physical subcategory</option>
                  {PHYSICAL_SUBCATEGORIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                {form.physical_subcategory && (
                  <p className="text-pink-400 text-xs mt-2">This will be auto-categorized under Physical → {PHYSICAL_SUBCATEGORIES.find(s => s.id === form.physical_subcategory)?.label}</p>
                )}
              </div>
            )}

            {/* Community Group — digital products only */}
            {form.product_type === "digital" && (
              <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-xl p-4">
                <label className="text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                  🎮 Auto-post to Gaming Community (optional)
                </label>
                <p className="text-gray-500 text-xs mb-2">Select a community and your listing will automatically appear in that group's feed.</p>
                <select value={form.community_franchise_id} onChange={e => setForm({ ...form, community_franchise_id: e.target.value })}
                  className="w-full bg-gray-800 border border-cyan-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm">
                  <option value="">— Don't post to a community —</option>
                  {TOP_FRANCHISES.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name} ({f.genre})</option>)}
                </select>
                {form.community_franchise_id && (
                  <p className="text-cyan-400 text-xs mt-2">✓ Listing will be shared with the {TOP_FRANCHISES.find(f => f.id === form.community_franchise_id)?.name} community</p>
                )}
              </div>
            )}

            {/* Additional subcategories (multi-select) */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Additional Subcategories (Optional)</label>
              <p className="text-gray-500 text-xs mb-3">Show your listing in multiple subcategories for more visibility</p>
              {selectedCat?.subcategories?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCat.subcategories.map(s => {
                    const isSelected = form.subcategories.includes(s);
                    const atMax = form.subcategories.length >= 3 && !isSelected;
                    return (
                      <button key={s} type="button"
                        disabled={atMax}
                        onClick={() => {
                          if (isSelected) {
                            setForm(f => ({ ...f, subcategories: f.subcategories.filter(x => x !== s) }));
                          } else if (!atMax) {
                            setForm(f => ({ ...f, subcategories: [...f.subcategories, s] }));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected ? "bg-purple-600 text-white" : atMax ? "bg-gray-800/40 text-gray-600 cursor-not-allowed" : "bg-gray-800 text-gray-400 hover:bg-purple-900/30"}`}>
                        {s} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-xs italic">No subcategories available for this category</p>
              )}
              <div className="flex items-center justify-between mt-2">
                {form.subcategories.length > 0 && (
                  <p className="text-green-400 text-xs">✓ {form.subcategories.length}/3 subcategories selected</p>
                )}
                {form.subcategories.length >= 3 && (
                  <p className="text-yellow-400 text-xs">Maximum 3 subcategories reached</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Condition</label>
                <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  {form.product_type === "physical" ? (
                    <>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </>
                  ) : (
                    <option value="digital">Digital Download</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Platform</label>
                <input value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} placeholder="PC, PS5, Android..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="gaming, mod, fps..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">🔍 SEO Keywords (comma separated)</label>
              <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="buy gta mod, ps5 controller cheap, gaming skin..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              <p className="text-gray-600 text-xs mt-1">Keywords help buyers discover your listing via search engines</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-gray-300 text-sm font-medium">Mark as Premium listing</span>
            </label>
          </div>

          {/* Support / Donation Links */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="text-lg">☕</span> Support & Donation Links
            </h3>
            <p className="text-gray-500 text-xs">Let your fans support you directly via Ko-fi, Buy Me a Coffee, or Patreon</p>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <span className="text-orange-400">☕</span> Ko-fi URL
              </label>
              <input value={form.kofi_url} onChange={e => setForm({ ...form, kofi_url: e.target.value })}
                placeholder="https://ko-fi.com/yourname"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <span className="text-yellow-400">☕</span> Buy Me a Coffee URL
              </label>
              <input value={form.buymeacoffee_url} onChange={e => setForm({ ...form, buymeacoffee_url: e.target.value })}
                placeholder="https://buymeacoffee.com/yourname"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <span className="text-red-400">🎖️</span> Patreon URL
              </label>
              <input value={form.patreon_url} onChange={e => setForm({ ...form, patreon_url: e.target.value })}
                placeholder="https://patreon.com/yourname"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
            </div>
          </div>

          {/* Card Animation Style */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="text-lg">✨</span> Card Animation Style
            </h3>
            <p className="text-gray-500 text-xs">Choose how your listing card animates when viewers see it</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "fade", label: "Fade In", desc: "Smooth opacity fade", emoji: "🌅" },
                { id: "slide_up", label: "Slide Up", desc: "Slides from below", emoji: "⬆️" },
                { id: "slide_left", label: "Slide Left", desc: "Glides from right", emoji: "◀️" },
                { id: "zoom", label: "Zoom In", desc: "Scales into view", emoji: "🔍" },
                { id: "flip", label: "Flip Card", desc: "3D card flip reveal", emoji: "🃏" },
                { id: "bounce", label: "Bounce", desc: "Bouncy entrance", emoji: "🎾" },
                { id: "glow", label: "Glow Pulse", desc: "Purple glow pulse", emoji: "💜" },
                { id: "rotate", label: "Rotate In", desc: "Spins into place", emoji: "🌀" },
                { id: "none", label: "No Animation", desc: "Static, instant", emoji: "⬛" },
              ].map(anim => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, card_animation: anim.id }))}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all text-left ${form.card_animation === anim.id ? "bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-500/20" : "bg-gray-800 border-gray-700 hover:border-purple-500/50"}`}
                >
                  <span className="text-2xl">{anim.emoji}</span>
                  <span className="text-white text-xs font-bold">{anim.label}</span>
                  <span className="text-gray-500 text-[10px]">{anim.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Moderation result banner */}
          {moderationResult && (
            <div className="bg-yellow-900/30 border-2 border-yellow-500/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-300 font-black text-base">Listing Submitted for Admin Review</p>
                  <p className="text-yellow-200 text-sm mt-1">Your listing was flagged by our AI content system and is pending admin approval before it goes live.</p>
                  {moderationResult.aiAnalysis?.reason && (
                    <p className="text-yellow-400 text-xs mt-2">Reason: {moderationResult.aiAnalysis.reason}</p>
                  )}
                  {moderationResult.flaggedKeywords?.length > 0 && (
                    <p className="text-yellow-500 text-xs mt-1">Flagged terms: {moderationResult.flaggedKeywords.join(", ")}</p>
                  )}
                </div>
              </div>
              <a href="/dashboard?tab=listings" className="block w-full text-center py-3 rounded-xl bg-yellow-600/30 border border-yellow-600/50 text-yellow-300 font-bold text-sm hover:bg-yellow-600/50 transition-colors">
                Go to My Listings →
              </a>
            </div>
          )}

          {!moderationResult && (
            <button type="submit" disabled={saving}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Checking content & saving..." : editId ? "Update Listing" : "Publish Listing"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}