import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Plus, ArrowLeft, Play, Youtube, Link, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, CATEGORIES } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";

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
    category: defaultCat,
    subcategory: "",
    condition: "digital",
    is_premium: false,
    platform: "",
    stock: 1,
    location: "",
    tags: "",
    youtube_url: "",
    video_url: "",
    game_name: "",
    game_platform: "",
    paypal_email: "",
    external_link: "",
    download_url: "",
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
            category: l.category || defaultCat,
            subcategory: l.subcategory || "",
            condition: l.condition || "digital",
            is_premium: l.is_premium || false,
            platform: l.platform || "",
            stock: l.stock || 1,
            location: l.location || "",
            tags: (l.tags || []).join(", "),
            youtube_url: l.youtube_url || "",
            video_url: l.video_url || "",
            game_name: l.game_name || "",
            game_platform: l.game_platform || "",
            external_link: l.external_link || "",
          download_url: l.download_url || "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ytId = extractYouTubeId(form.youtube_url);
    const priceVal = parseFloat(form.price) || 0;
    const data = {
      ...form,
      price: priceVal,
      is_free: priceVal === 0,
      stock: parseInt(form.stock) || 1,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      images,
      youtube_video_id: ytId || undefined,
      seller_email: user.email,
      seller_username: profile?.username || user.full_name,
      seller_paypal_email: form.paypal_email || undefined,
      external_link: form.external_link || undefined,
    };
    if (editId) {
      await base44.entities.Listing.update(editId, data);
    } else {
      await base44.entities.Listing.create(data);
    }
    setSaving(false);
    window.location.href = "/dashboard?tab=listings";
  };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);
  const ytId = extractYouTubeId(form.youtube_url);

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
                  {/* Commission notice */}
                  <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                    <p className="text-blue-300 font-bold text-xs mb-1">💳 Payment & Commission Info</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      A <strong className="text-white">10% platform commission</strong> is automatically deducted from each sale and transferred to GAMER Productions' PayPal (<span className="text-blue-300">kevinjersey2019@gmail.com</span>). You receive <strong className="text-green-400">90%</strong> of the sale price. Payments are processed via PayPal.
                    </p>
                    {form.price && parseFloat(form.price) > 0 && (
                      <div className="mt-2 flex gap-3 text-xs">
                        <span className="text-white font-bold">List: ₱{parseFloat(form.price).toLocaleString()}</span>
                        <span className="text-red-400">Platform fee: ₱{(parseFloat(form.price) * 0.1).toFixed(2)}</span>
                        <span className="text-green-400 font-bold">You earn: ₱{(parseFloat(form.price) * 0.9).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Your PayPal Email (to receive payments)</label>
                    <input value={form.paypal_email || ""} onChange={e => setForm({ ...form, paypal_email: e.target.value })} placeholder="your@paypal.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} min={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          {/* Category */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Category</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Main Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subcategory: "" })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {selectedCat?.subcategories?.length > 0 && (
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Subcategory</label>
                <select value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  <option value="">Select subcategory</option>
                  {selectedCat.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Condition</label>
                <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  {["new","like_new","good","fair","digital"].map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-gray-300 text-sm font-medium">Mark as Premium listing</span>
            </label>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Saving..." : editId ? "Update Listing" : "Publish Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}