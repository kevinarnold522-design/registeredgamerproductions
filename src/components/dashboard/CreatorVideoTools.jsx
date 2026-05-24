import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Link, Wand2, Upload, CheckCircle, ExternalLink, Zap, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
            <input value={ytTitle} onChange={e => setYtTitle(e.target.value)} placeholder="Video title" required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            <textarea value={ytDesc} onChange={e => setYtDesc(e.target.value)} placeholder="Description (optional)" rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none" />
            <select value={ytCategory} onChange={e => setYtCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
              {["gameplay","tutorial","review","highlights","mods","esports","vlog","other"].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button type="submit" disabled={posting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
              <Youtube className="w-4 h-4" />
              {posting ? "Sharing..." : "Share Video to Community"}
            </button>
          </form>
        </div>
      )}

      {tab === "script" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-white font-semibold text-sm">AI Video Script Writer</p>
          </div>
          <p className="text-gray-500 text-xs mb-3">Describe your video topic and AI will write a full script — hook, intro, sections, CTA and outro.</p>
          <textarea value={scriptTopic} onChange={e => setScriptTopic(e.target.value)}
            placeholder="e.g. 'Top 10 GTA5 mods for PS2 emulator' or 'How to dominate in WWE2K tournaments'"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 text-sm resize-none mb-3" />
          <button onClick={handleScriptWrite} disabled={scriptLoading || !scriptTopic.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 mb-4">
            <Zap className="w-4 h-4" />
            {scriptLoading ? "Writing script..." : "Write My Script"}
          </button>
          {scriptResult && (
            <div className="bg-gray-800 border border-yellow-700/30 rounded-xl p-4 text-gray-300 text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {scriptResult}
            </div>
          )}
        </div>
      )}

      {tab === "links" && (
        <div>
          <p className="text-gray-400 text-sm mb-4">Use these link shorteners to share your mod download links and start earning from clicks.</p>
          <div className="grid grid-cols-2 gap-3">
            {LINK_SHORTENERS.map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3 hover:border-purple-700/50 transition-colors group">
                <Link className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{l.name}</p>
                  <p className="text-gray-500 text-xs truncate">{l.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 flex-shrink-0" />
              </a>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">💡 Tip: Use shortened links in your mod listings to earn additional revenue from redirects.</p>
        </div>
      )}

      {tab === "cloud" && (
        <div>
          <p className="text-gray-400 text-sm mb-4">Host your mod files on cloud storage and link them to your listings.</p>
          <div className="grid grid-cols-2 gap-3">
            {CLOUD_STORAGE.map(c => (
              <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3 hover:border-blue-700/50 transition-colors group">
                <span className="text-xl flex-shrink-0">{c.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs">Free storage</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 flex-shrink-0" />
              </a>
            ))}
          </div>
          <div className="mt-4 bg-blue-900/20 border border-blue-700/30 rounded-xl p-3">
            <p className="text-blue-300 font-semibold text-xs mb-1">🔗 ShareMods Integration</p>
            <a href="https://www.sharemods.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold">
              <ExternalLink className="w-3.5 h-3.5" /> sharemods.com — Upload & share mods directly
            </a>
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <p className="text-white font-semibold text-sm">AI Video Creation Assistant</p>
          </div>
          <p className="text-gray-500 text-xs mb-3">Get AI-powered advice to enhance your videos — titles, descriptions, thumbnails, SEO, and more.</p>
          <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
            placeholder="e.g. 'Help me write a catchy title for my FIFA 2025 mods showcase video' or 'Give me thumbnail ideas for a GTA5 mod review'"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none mb-3" />
          <button onClick={handleAiEnhance} disabled={aiLoading || !aiPrompt.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 mb-4">
            <Wand2 className="w-4 h-4" />
            {aiLoading ? "AI is thinking..." : "Get AI Suggestions"}
          </button>
          {aiResult && (
            <div className="bg-gray-800 border border-purple-700/30 rounded-xl p-4 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {aiResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
}