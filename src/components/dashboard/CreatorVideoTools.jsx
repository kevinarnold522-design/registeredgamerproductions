import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Link, Wand2, CheckCircle, ExternalLink, Zap, Sparkles, Tag, LayoutDashboard, Crop, Save, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";
import Cropper from 'react-easy-crop';

// --- Constants ---
const LINK_SHORTENERS = [
  { name: "Bitly", url: "https://bitly.com", desc: "Most popular link shortener" },
  { name: "TinyURL", url: "https://tinyurl.com", desc: "Simple & fast" },
  { name: "Rebrandly", url: "https://rebrandly.com", desc: "Custom branded links" },
  { name: "T2M", url: "https://t2mio.com", desc: "Analytics + monetization" },
];

const CLOUD_STORAGE = [
  { name: "Google Drive", url: "https://drive.google.com", icon: "🟦" },
  { name: "MediaFire", url: "https://mediafire.com", icon: "🔥" },
  { name: "MEGA", url: "https://mega.nz", icon: "☁️" },
  { name: "Dropbox", url: "https://dropbox.com", icon: "📦" },
];

export default function CreatorVideoTools({ user, profile }) {
  const [tab, setTab] = useState("share");
  
  // Existing States
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytDesc, setYtDesc] = useState("");
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptResult, setScriptResult] = useState("");
  
  // New Feature States
  const [tags, setTags] = useState("");
  const [checklist, setChecklist] = useState({ thumbnail: false, seo: false, pinned: false });
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // --- Functions ---
  const generateTags = async () => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 10 trending gaming YouTube tags for video: "${ytTitle}". Return as comma-separated.`
    });
    setTags(res);
  };

  const tabs = [
    { id: "share", label: "📹 Share" },
    { id: "ai", label: "🤖 AI Assist" },
    { id: "script", label: "📝 Script" },
    { id: "seo", label: "🏷️ SEO" },
    { id: "editor", label: "🎨 Editor" },
    { id: "checklist", label: "✅ Launch" },
    { id: "links", label: "🔗 Links" },
  ];

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 shadow-2xl">
      {/* Studio Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-black text-xl">Creator Studio</h2>
        <RouterLink to="/ai-video-studio" className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <Wand2 size={14} /> AI Studio Pro
        </RouterLink>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} 
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-white text-black" : "bg-gray-800 text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Area */}
      <div className="mt-4 min-h-[300px]">
        {/* SEO Tab */}
        {tab === "seo" && (
          <div className="space-y-4">
            <button onClick={generateTags} className="w-full py-3 bg-indigo-600 rounded-xl text-white font-bold text-sm">Generate Tags</button>
            <textarea value={tags} readOnly className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-indigo-300 text-xs h-32" />
          </div>
        )}

        {/* Editor Tab */}
        {tab === "editor" && (
          <div className="space-y-4">
            <input type="file" onChange={(e) => setImageSrc(URL.createObjectURL(e.target.files[0]))} className="w-full text-xs text-gray-400" />
            {imageSrc && (
              <div className="relative h-64 bg-black rounded-xl overflow-hidden">
                <Cropper image={imageSrc} crop={crop} zoom={zoom} onCropChange={setCrop} onZoomChange={setZoom} />
              </div>
            )}
            <button className="w-full py-3 bg-purple-600 rounded-xl text-white font-bold">Save Crop</button>
          </div>
        )}

        {/* Checklist Tab */}
        {tab === "checklist" && (
          <div className="space-y-3">
            {Object.entries(checklist).map(([key, val]) => (
              <button key={key} onClick={() => setChecklist({...checklist, [key]: !val})} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl border ${val ? "bg-green-900/20 border-green-700" : "bg-gray-800 border-gray-700"}`}>
                <CheckCircle size={16} className={val ? "text-green-400" : "text-gray-600"} />
                <span className="text-gray-300 capitalize text-sm">{key} Finalized</span>
              </button>
            ))}
          </div>
        )}

        {/* Add your original Share, Links, and Cloud logic here... */}
      </div>
    </div>
  );
}
