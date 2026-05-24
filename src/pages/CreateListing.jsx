import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Plus, ArrowLeft, Gamepad2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, CATEGORIES } from "@/lib/constants";
import AuthNavbar from "@/components/layout/AuthNavbar";

export default function CreateListing() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "games",
    subcategory: "",
    condition: "digital",
    is_premium: false,
    platform: "",
    stock: 1,
    location: "",
    tags: "",
  });

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me) { window.location.href = "/login"; return; }
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      // Load existing listing for edit
      if (editId) {
        const listings = await base44.entities.Listing.filter({ id: editId });
        if (listings.length > 0) {
          const l = listings[0];
          setForm({
            title: l.title || "",
            description: l.description || "",
            price: l.price || "",
            category: l.category || "games",
            subcategory: l.subcategory || "",
            condition: l.condition || "digital",
            is_premium: l.is_premium || false,
            platform: l.platform || "",
            stock: l.stock || 1,
            location: l.location || "",
            tags: (l.tags || []).join(", "),
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
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setImages(prev => [...prev, ...urls]);
    setUploadingImages(false);
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      images,
      seller_email: user.email,
      seller_username: profile?.username || user.full_name,
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
  const canEdit = user && (isAdmin(user.email) || !editId);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

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
            <h3 className="text-white font-bold mb-4">Photos & Images</h3>
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
                <span className="text-xs">Add</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            {uploadingImages && <p className="text-purple-400 text-sm">Uploading images...</p>}
            <p className="text-gray-600 text-xs">Connect your device camera or upload from gallery</p>
          </div>

          {/* Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Listing Details</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="What are you selling?"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} placeholder="Describe your listing..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Price (₱) *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} min={1}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Category</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Main Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value, subcategory: ""})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {selectedCat?.subcategories.length > 0 && (
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Subcategory</label>
                <select value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  <option value="">Select subcategory</option>
                  {selectedCat.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Condition</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  {["new","like_new","good","fair","digital"].map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Platform</label>
                <input value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} placeholder="PC, PS5, Xbox..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="gaming, mod, fps..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={e => setForm({...form, is_premium: e.target.checked})} className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-gray-300 text-sm font-medium">⭐ Mark as Premium listing</span>
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