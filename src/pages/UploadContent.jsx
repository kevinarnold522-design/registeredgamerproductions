import React, { useState, useRef } from "react";
import { Upload, ArrowLeft, Youtube, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFileToR2 } from "@/lib/uploadToR2";
import { TOP_FRANCHISES } from "@/lib/franchises";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { Link, useNavigate } from "react-router-dom";

export default function UploadContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [crossPosting, setCrossPosting] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_url: "",
    youtube_url: "",
    category: "content_streaming",
    tags: "",
    cross_post_modding: false,
    cross_post_gaming: [],
  });

  const fileRef = useRef(null);

  React.useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me) { base44.auth.redirectToLogin("/upload-content"); return; }
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      setLoading(false);
    };
    init();
  }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await uploadFileToR2(file, "content-videos");
    setForm(f => ({ ...f, video_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Create video post
    const videoPost = await base44.entities.VideoPost.create({
      creator_email: user.email,
      creator_username: profile?.username || user.full_name,
      creator_avatar: profile?.avatar_url || "",
      content_type: "video",
      video_url: form.video_url,
      youtube_url: form.youtube_url,
      title: form.title,
      description: form.description,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: "active",
    });

    // Cross-post to Modding Community if selected
    if (form.cross_post_modding && videoPost) {
      base44.entities.CommunityPost.create({
        community_id: "modding",
        franchise_id: "modding_content",
        author_email: user.email,
        author_username: profile?.username || user.full_name || "Gamer",
        author_avatar: profile?.avatar_url || "",
        content: `🎬 New video: **${form.title}** — ${form.description?.slice(0, 100) || ""}\n👉 Check it out!`,
        status: "active",
        section_id: "content",
      }).catch(() => {});
    }

    // Cross-post to selected Gaming Communities
    if (form.cross_post_gaming.length > 0 && videoPost) {
      form.cross_post_gaming.forEach(franchiseId => {
        base44.entities.GamingCommunity.filter({ franchise_id: franchiseId }).then(comms => {
          const communityId = comms[0]?.id || franchiseId;
          base44.entities.CommunityPost.create({
            community_id: communityId,
            franchise_id: franchiseId,
            author_email: user.email,
            author_username: profile?.username || user.full_name || "Gamer",
            author_avatar: profile?.avatar_url || "",
            content: `🎬 New video: **${form.title}** — ${form.description?.slice(0, 100) || ""}\n👉 Watch now!`,
            status: "active",
            section_id: "content",
          }).catch(() => {});
        });
      });
    }

    setUploading(false);
    navigate("/channel");
  };

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
          <Link to="/channel" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-white">Upload Content</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" /> Upload Video from Device
            </h3>
            {form.video_url ? (
              <div className="flex items-center gap-3">
                <video src={form.video_url} controls className="w-full max-w-md rounded-xl" />
                <button type="button" onClick={() => setForm(f => ({ ...f, video_url: "" }))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 w-full rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 text-gray-500 hover:text-purple-400 text-sm transition-colors justify-center">
                <Upload className="w-4 h-4" /> Connect Device & Upload Video
              </button>
            )}
            <input ref={fileRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            {uploading && <p className="text-purple-400 text-sm animate-pulse mt-2">Uploading...</p>}
          </div>

          {/* YouTube URL */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-400" /> YouTube URL (Optional)
            </h3>
            <input value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
          </div>

          {/* Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Content Details</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Video title..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                placeholder="Describe your content..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="gaming, gameplay, tutorial..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          {/* Cross-Posting Options */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl border border-cyan-700/50 p-6">
            <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" /> Cross-Post to Communities
            </h3>
            <p className="text-gray-400 text-sm mb-4">Share your content to multiple communities for more visibility</p>
            
            {/* Modding Community */}
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={form.cross_post_modding} onChange={e => setForm(f => ({ ...f, cross_post_modding: e.target.checked }))} className="w-4 h-4 rounded accent-orange-600" />
              <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <span className="text-lg">🔧</span> Cross-post to Modding Community
              </span>
            </label>

            {/* Gaming Communities - Multi-select */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Gaming Communities (Select Multiple)</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {TOP_FRANCHISES.map(f => (
                  <label key={f.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                    <input type="checkbox" checked={form.cross_post_gaming.includes(f.id)} 
                      onChange={e => {
                        if (e.target.checked) {
                          setForm(f => ({ ...f, cross_post_gaming: [...f.cross_post_gaming, f.id] }));
                        } else {
                          setForm(f => ({ ...f, cross_post_gaming: f.cross_post_gaming.filter(id => id !== f.id) }));
                        }
                      }} 
                      className="w-3 h-3 rounded accent-purple-600" />
                    <span className="text-white text-xs font-semibold">{f.emoji} {f.name}</span>
                  </label>
                ))}
              </div>
              {form.cross_post_gaming.length > 0 && (
                <p className="text-cyan-400 text-xs mt-2">✓ Will be shared to {form.cross_post_gaming.length} gaming communities</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={uploading || !form.title || !form.video_url}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {uploading ? "Uploading & Cross-Posting..." : "🚀 Upload Content"}
          </button>
        </form>
      </div>
    </div>
  );
}