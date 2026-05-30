import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Link, Wand2, Upload, CheckCircle, ExternalLink, Zap, Star, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link as RouterLink } from "react-router-dom";

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

function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function CreatorVideoTools({ user, profile }) {
  const [tab, setTab] = useState("share");
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytDesc, setYtDesc] = useState("");
  const [ytCategory, setYtCategory] = useState("gameplay");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptResult, setScriptResult] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);

  const handleShareVideo = async (e) => {
    e.preventDefault();
    const ytId = getYouTubeId(ytUrl);
    setPosting(true);
    await base44.entities.VideoPost.create({
      creator_email: user.email,
      creator_username: profile?.username || user.full_name,
      creator_avatar: profile?.avatar_url,
      title: ytTitle,
      description: ytDesc,
      youtube_url: ytUrl,
      youtube_video_id: ytId || "",
      thumbnail_url: ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : "",
      category: ytCategory,
      status: "active",
      is_approved: true,
    });
    setPosted(true);
    setPosting(false);
    setYtUrl(""); setYtTitle(""); setYtDesc("");
    setTimeout(() => setPosted(false), 3000);
  };

  const handleScriptWrite = async () => {
    if (!scriptTopic.trim()) return;
    setScriptLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a complete YouTube gaming video script for the topic: "${scriptTopic}". 
Include:
- A catchy hook (first 15 seconds to grab attention)
- Intro with channel intro line
- Main content sections with talking points
- Engagement prompt (ask viewers to like/subscribe)
- Outro CTA
Format it clearly with section headers. Keep it natural and conversational for a gaming audience.`,
    });
    setScriptResult(res);
    setScriptLoading(false);
  };

  const handleAiEnhance = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a gaming content creation expert. Help this creator: "${aiPrompt}". Give practical, specific advice for gaming YouTube videos — title ideas, thumbnail tips, description SEO, and engagement strategies. Keep it concise and actionable.`,
    });
    setAiResult(res);
    setAiLoading(false);
  };

  const tabs = [
    { id: "share", label: "📹 Share YouTube Video" },
    { id: "ai", label: "🤖 AI Assistant" },
    { id: "script", label: "📝 AI Script Writer" },
    { id: "links", label: "🔗 Link Shorteners" },
    { id: "cloud", label: "☁️ Cloud Storage" },
  ];

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      {/* AI Studio Highlight */}
      <RouterLink to="/ai-video-studio"
        className="flex items-center gap-3 p-4 mb-5 bg-gradient-to-r from-purple-900/50 to-pink-900/40 border border-purple-600/50 rounded-2xl hover:border-purple-500 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-black text-sm flex items-center gap-2">
            ✨ Open AI Video Studio
            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/30 border border-pink-500/40 text-pink-300 text-[9px] font-black">NEW</span>
          </p>
          <p className="text-purple-300 text-xs">AI video creation • enhance • script • music • copyright scan</p>
        </div>
        <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-pink-400 transition-colors" />
      </RouterLink>

      <div className="flex items-center gap-2 mb-5">
        <Youtube className="w-5 h-5 text-red-400" />
        <h3 className="text-white font-bold text-lg">Creator Video Tools</h3>
        {profile?.is_monetized && (
          <span className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold">
            🎮 Gaming Checkmark
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-purple-600/20 border border-purple-500/50 text-purple-300" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "share" && (
        <div>
          {posted && (
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-xl p-3 mb-4 text-green-400 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> Video shared to the community!
            </div>
          )}
          <form onSubmit={handleShareVideo} className="space-y-3">
            <input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="Paste your YouTube video URL" required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
