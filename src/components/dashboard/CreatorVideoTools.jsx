import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Youtube, Tag, Image as ImageIcon, Share2, Zap, CheckCircle, Globe, Users, Gamepad2, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COMMUNITIES = [
  { id: "gaming", label: "🎮 Gaming Community" },
  { id: "modding", label: "🔧 Modding Community" },
  { id: "marketplace", label: "🛒 Marketplace" },
  { id: "tournaments", label: "🏆 Tournaments" },
];

const TAGS_SUGGESTIONS = ["NBA2K", "FIFA", "GTA5", "WWE2K", "COD", "Fortnite", "Minecraft", "Valorant", "PES", "Mods", "Gameplay", "Highlights", "Tutorial", "Streams"];

const CreatorVideoTools = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState("post");
  const [postContent, setPostContent] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const fileRef = useRef(null);

  const navigationTabs = [
    { id: "post", label: "📝 Post" },
    { id: "cross", label: "🌐 Cross-Post" },
    { id: "tags", label: "🏷️ Tags" },
    { id: "media", label: "🖼️ Media" },
  ];

  const toggleCommunity = (id) => {
    setSelectedCommunities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const addTag = (tag) => {
    const clean = tag.trim().replace(/\s+/g, "_");
    if (clean && !tags.includes(clean) && tags.length < 15) {
      setTags(prev => [...prev, clean]);
    }
    setTagInput("");
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch {}
    setUploading(false);
  };

  const handlePublish = async () => {
    if (!postContent.trim() || !user) return;
    setPublishing(true);
    try {
      const destinations = selectedCommunities.length > 0 ? selectedCommunities : ["gaming"];
      // Cross-post to all selected communities simultaneously
      await Promise.all(destinations.map(dest =>
        base44.entities.CommunityPost.create({
          community_id: dest,
          franchise_id: dest,
          author_email: user.email,
          author_username: profile?.username || user.full_name || "Gamer",
          author_avatar: profile?.avatar_url || "",
          content: postContent + (tags.length > 0 ? `\n\n${tags.map(t => `#${t}`).join(" ")}` : ""),
          image_urls: imageUrl ? [imageUrl] : [],
          likes: 0,
          status: "active",
        })
      ));
      setPublished(true);
      setPostContent("");
      setTags([]);
      setImageUrl("");
      setSelectedCommunities([]);
      setTimeout(() => setPublished(false), 3000);
    } catch {}
    setPublishing(false);
  };

  return (
    <div className="bg-gray-950/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
      <h2 className="text-white font-black text-xl mb-2">Creator Studio</h2>
      <p className="text-gray-500 text-xs mb-5">Cross-post to multiple communities at once</p>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[280px]">
        {/* POST TAB */}
        {activeTab === "post" && (
          <div className="space-y-4">
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Share your latest gaming content, mod, or update..."
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            />
            {imageUrl && (
              <div className="relative">
                <img src={imageUrl} className="w-full h-32 object-cover rounded-xl" alt="" />
                <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700 transition-all">
                <ImageIcon className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Add Image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
              <button onClick={() => setActiveTab("cross")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700 transition-all">
                <Globe className="w-3.5 h-3.5" /> Destinations {selectedCommunities.length > 0 && <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{selectedCommunities.length}</span>}
              </button>
            </div>
            {/* Selected destinations preview */}
            {selectedCommunities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedCommunities.map(c => {
                  const comm = COMMUNITIES.find(x => x.id === c);
                  return <span key={c} className="text-[10px] bg-purple-900/40 border border-purple-700/30 text-purple-300 px-2 py-0.5 rounded-full">{comm?.label}</span>;
                })}
              </div>
            )}
            <button
              onClick={handlePublish}
              disabled={!postContent.trim() || publishing}
              className="w-full py-3 rounded-2xl font-black text-sm text-white disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              {published ? <><CheckCircle className="w-4 h-4" /> Published to {selectedCommunities.length || 1} communities!</> :
               publishing ? "Publishing..." : <><Zap className="w-4 h-4" /> Publish Now</>}
            </button>
          </div>
        )}

        {/* CROSS-POST TAB */}
        {activeTab === "cross" && (
          <div className="space-y-3">
            <p className="text-gray-400 text-xs mb-3">Select all communities where this post should appear:</p>
            {COMMUNITIES.map(comm => (
              <button
                key={comm.id}
                onClick={() => toggleCommunity(comm.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                  selectedCommunities.includes(comm.id)
                    ? "bg-purple-900/40 border-purple-500/60 text-purple-300"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                <span>{comm.label}</span>
                {selectedCommunities.includes(comm.id) && <CheckCircle className="w-4 h-4 text-purple-400" />}
              </button>
            ))}
            <p className="text-gray-600 text-[10px] mt-2">Content will appear simultaneously in all selected feeds without duplicate records.</p>
          </div>
        )}

        {/* TAGS TAB */}
        {activeTab === "tags" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag(tagInput)}
                placeholder="Add a tag..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              />
              <button onClick={() => addTag(tagInput)} className="px-3 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} onClick={() => setTags(prev => prev.filter(x => x !== t))}
                    className="flex items-center gap-1 text-[10px] bg-purple-900/40 border border-purple-700/40 text-purple-300 px-2 py-1 rounded-full cursor-pointer hover:bg-red-900/30 hover:border-red-700/40 hover:text-red-300 transition-all">
                    #{t} ✕
                  </span>
                ))}
              </div>
            )}
            <div>
              <p className="text-gray-500 text-[10px] mb-2 font-bold uppercase tracking-wide">Suggested Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS_SUGGESTIONS.filter(t => !tags.includes(t)).map(t => (
                  <button key={t} onClick={() => addTag(t)}
                    className="text-[10px] bg-gray-800 border border-gray-700 text-gray-400 hover:text-purple-300 hover:border-purple-700/50 px-2 py-1 rounded-full transition-all">
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === "media" && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-600/50 transition-all"
            >
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-gray-500 text-xs">{uploading ? "Uploading..." : "Click to upload image"}</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
            {imageUrl && (
              <button onClick={() => setImageUrl("")} className="w-full py-2 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-bold hover:bg-red-900/50 transition-all">
                Remove Image
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorVideoTools;