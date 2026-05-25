import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Sparkles, Upload, Image, Music, Shield, Film, Zap,
  ChevronRight, CheckCircle, AlertTriangle, X, Play, Download,
  Mic, Palette, Type, Star, RefreshCw, Copy, Video
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const AI_STUDIO_TABS = [
  { id: "create", label: "✨ AI Create Video", desc: "Generate a video from images + text" },
  { id: "enhance", label: "🎨 Enhance Existing", desc: "AI enhance & edit your video" },
  { id: "upload", label: "📤 Upload & Scan", desc: "Upload video with copyright check" },
  { id: "music", label: "🎵 Music Advisor", desc: "AI picks royalty-free music" },
  { id: "script", label: "📝 Script Writer", desc: "Full video script with AI" },
  { id: "thumbnail", label: "🖼️ Thumbnail AI", desc: "Generate thumbnail ideas" },
  { id: "titles", label: "💡 Title & SEO", desc: "Viral titles & descriptions" },
];

const MUSIC_MOODS = ["Epic", "Chill", "Hype", "Sad", "Funny", "Action", "Ambient", "Horror"];
const VIDEO_STYLES = ["Cinematic", "Vlog", "Gaming Montage", "Tutorial", "Documentary", "Anime-style", "Retro", "Neon"];
const GAMING_GENRES = ["FPS", "RPG", "Sports", "Racing", "Horror", "Battle Royale", "MOBA", "Simulation"];

export default function AIVideoStudio({ user, profile, onVideoCreated, onClose }) {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-gray-950 to-pink-950 border-b border-purple-700/30 px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-2xl">AI Video Studio</h1>
                <p className="text-purple-300 text-xs font-semibold">Powered by GAMER Productions AI</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-lg">
              Create, enhance, and publish professional gaming videos using advanced AI. 
              Upload images + describe your vision — AI does the rest.
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-6 relative">
          {AI_STUDIO_TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40"
                  : "bg-gray-900/80 border border-gray-700/50 text-gray-400 hover:text-white hover:border-purple-600/40"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}>
            {activeTab === "create" && <AICreateVideoTab user={user} profile={profile} onVideoCreated={onVideoCreated} />}
            {activeTab === "enhance" && <AIEnhanceTab user={user} profile={profile} />}
            {activeTab === "upload" && <UploadScanTab user={user} profile={profile} onVideoCreated={onVideoCreated} />}
            {activeTab === "music" && <MusicAdvisorTab />}
            {activeTab === "script" && <ScriptWriterTab profile={profile} />}
            {activeTab === "thumbnail" && <ThumbnailAITab profile={profile} />}
            {activeTab === "titles" && <TitleSEOTab profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── TAB: AI CREATE VIDEO ─────────────────────────────────────────────────────
function AICreateVideoTab({ user, profile, onVideoCreated }) {
  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Gaming Montage");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("60");
  const [mood, setMood] = useState("Hype");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [musicRecs, setMusicRecs] = useState(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    const hasImages = images.length > 0;
    const fullPrompt = `You are an expert gaming video producer and AI creative director.

A gaming content creator wants to create a professional gaming video with these details:
- Style: ${style}
- Genre: ${genre || "Gaming general"}
- Mood: ${mood}
- Duration: ~${duration} seconds
- Creator's vision: "${prompt}"
- Number of images/screenshots provided: ${images.length}

Generate a comprehensive, detailed VIDEO PRODUCTION PLAN with:

## 🎬 VIDEO CONCEPT
A compelling 3-sentence concept that expands their idea into a full video vision.

## 🎞️ SCENE BREAKDOWN (8-10 scenes)
For each scene give: timestamp range, what to show, camera movement, transition type.

## 🎨 VISUAL STYLE GUIDE
- Color grading & filters to use
- Text overlays style (font, position, animations)
- Intro/outro style
- Effects & transitions

## 📱 EDITING WORKFLOW (Step by step)
- Which free/paid editing tools to use (DaVinci Resolve, CapCut, Vegas Pro, etc.)
- Exact editing steps with timestamps
- Sound design tips

## 🎵 MUSIC & SOUND
- 5 specific royalty-free track recommendations with BPM and mood
- Sound effects to add and when
- Voiceover timing if needed

## 📊 THUMBNAIL STRATEGY
- Main thumbnail concept
- Text overlay suggestions  
- Color psychology for max clicks

## 🚀 UPLOAD STRATEGY
- Best upload time for gaming content
- Tags to use (list 20 relevant tags)
- Description template with timestamps
- Community post ideas to boost views

## ⚡ AI ENHANCEMENTS
- Specific AI tools to enhance each scene (RunwayML, Pika, CapCut AI, etc.)
- Upscaling recommendations
- Auto-subtitle tools

Make it extremely detailed and actionable for a gaming creator.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      file_urls: hasImages ? images : undefined,
    });

    // Also get music recommendations
    const musicRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Give me 8 specific royalty-free music tracks perfect for a ${style} ${genre} gaming video with ${mood} mood.
For each track provide: Track name, Artist, Where to find it (YouTube Audio Library, Free Music Archive, Pixabay, etc.), BPM, and why it fits.
Format as a clean numbered list.`,
    });

    setResult(res);
    setMusicRecs(musicRes);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <p className="text-white font-bold text-sm">AI Video Creation Studio</p>
          <span className="px-2 py-0.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[10px] font-bold">BETA</span>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          Upload 3-10 screenshots or gameplay captures + describe your vision. 
          AI will generate a complete production plan, scene breakdown, editing guide, music picks, and upload strategy.
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-3 block flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-400" />
          Upload Screenshots / Gameplay Captures (Optional but recommended)
        </label>
        <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-purple-700/40 rounded-2xl cursor-pointer hover:border-purple-500 transition-colors bg-purple-950/20">
          <Upload className="w-8 h-8 text-purple-400" />
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Drop images here or click to upload</p>
            <p className="text-gray-500 text-xs mt-1">PNG, JPG, WebP — screenshots, gameplay, thumbnails</p>
          </div>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        {uploading && <p className="text-purple-400 text-xs mt-2 text-center animate-pulse">Uploading images...</p>}
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-20 h-16 object-cover rounded-xl border border-purple-700/30" />
                <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            ))}
            <p className="text-gray-500 text-xs self-center">{images.length} image{images.length > 1 ? "s" : ""} ready</p>
          </div>
        )}
      </div>

      {/* Video Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Video Style</label>
          <select value={style} onChange={e => setStyle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-600 text-xs">
            {VIDEO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Game Genre</label>
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-600 text-xs">
            <option value="">Any Genre</option>
            {GAMING_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Mood</label>
          <select value={mood} onChange={e => setMood(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-600 text-xs">
            {MUSIC_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Duration (sec)</label>
          <select value={duration} onChange={e => setDuration(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-600 text-xs">
            <option value="30">30s Short</option>
            <option value="60">60s Reel</option>
            <option value="180">3 min</option>
            <option value="600">10 min</option>
            <option value="1200">20 min Full</option>
          </select>
        </div>
      </div>

      {/* Main Prompt */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-pink-400" />
          Describe Your Video Vision *
        </label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder={`Be specific! Examples:
• "Epic GTA 5 mod showcase showing my custom cars and character skins, energetic vibe with fast cuts"
• "Tutorial on how to install FIFA 25 mods step by step, professional and clear"  
• "Highlights of my best WWE 2K25 moments with cinematic slow-motion effects"
• "Relaxing Minecraft build timelapse with chill commentary"`}
          rows={5}
          className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 text-sm resize-none leading-relaxed" />
        <p className="text-gray-600 text-xs mt-1.5">The more detail you give, the better the AI output.</p>
      </div>

      <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40">
        {loading ? (
          <><RefreshCw className="w-4 h-4 animate-spin" /> AI is creating your video plan...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate Full AI Video Production Plan</>
        )}
      </button>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-white font-bold text-sm">Your AI Video Production Plan is Ready!</p>
          </div>
          <div className="bg-gray-900 border border-purple-700/30 rounded-2xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {result}
          </div>
          {musicRecs && (
            <div className="bg-gray-900 border border-green-700/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-green-400" />
                <p className="text-white font-bold text-sm">🎵 Royalty-Free Music Recommendations</p>
              </div>
              <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {musicRecs}
              </div>
            </div>
          )}
          <button onClick={() => {
            navigator.clipboard.writeText(result);
          }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white text-xs font-semibold transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copy Plan to Clipboard
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: AI ENHANCE ─────────────────────────────────────────────────────────
function AIEnhanceTab({ user, profile }) {
  const [enhanceType, setEnhanceType] = useState("full");
  const [videoContext, setVideoContext] = useState("");
  const [currentIssues, setCurrentIssues] = useState([]);
  const [targetPlatform, setTargetPlatform] = useState("youtube");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const ISSUES = ["Bad lighting", "Shaky footage", "Poor audio", "Boring pacing", "No transitions", "Weak intro", "No subtitles", "Low resolution"];
  const ENHANCE_TYPES = [
    { id: "full", label: "Full Enhancement", icon: "✨" },
    { id: "audio", label: "Audio Fix", icon: "🎙️" },
    { id: "pacing", label: "Pacing & Cuts", icon: "✂️" },
    { id: "color", label: "Color Grading", icon: "🎨" },
    { id: "engagement", label: "Engagement Boost", icon: "🚀" },
  ];

  const handleEnhance = async () => {
    setLoading(true);
    setResult(null);
    const issuesText = currentIssues.length > 0 ? `Issues to fix: ${currentIssues.join(", ")}` : "No specific issues identified";

    const prompts = {
      full: `You're a professional gaming video editor. Give a complete enhancement guide for this video:
Video description: "${videoContext}"
${issuesText}
Target platform: ${targetPlatform}

Provide:
## 🎬 ENHANCEMENT CHECKLIST (priority order)
## ✂️ EDITING IMPROVEMENTS (specific cuts, pacing changes)
## 🎨 COLOR GRADING GUIDE (exact settings for DaVinci Resolve/Premiere)
## 🎙️ AUDIO ENHANCEMENT STEPS
## 📝 TEXT & GRAPHICS TO ADD
## 🔄 TRANSITIONS & EFFECTS
## ⚡ FREE AI TOOLS TO USE (list specific tools and how)
## 📊 EXPECTED IMPACT on views/retention`,

      audio: `Gaming video audio enhancement expert guide.
Video: "${videoContext}" | Issues: ${issuesText}
Provide: mic settings, background noise removal steps (Audacity/Adobe Audition/free tools), EQ settings, music mix levels, sound effects timing, game audio balancing. Include specific dB numbers and settings.`,

      pacing: `Gaming video pacing & editing expert.
Video: "${videoContext}" | Issues: ${issuesText} | Platform: ${targetPlatform}
Provide: exact cut timing recommendations, where to add jump cuts, slow-mo moments, fast-forward sections, chapter markers, hook optimization, retention graph analysis, when to show gameplay vs face cam.`,

      color: `Professional color grading guide for gaming videos.
Video: "${videoContext}" | Target: ${targetPlatform}
Provide: LUT recommendations (free ones), exact color wheel settings, contrast/saturation/exposure values, how to match colors across clips, how to make it look cinematic, specific presets in DaVinci Resolve.`,

      engagement: `YouTube gaming engagement specialist.
Video: "${videoContext}" | Platform: ${targetPlatform}
Provide: Hook rewrite for first 15 seconds, end screen optimization, card placement timing, chapter markers strategy, comment-bait questions, community post strategy, shorts version plan, thumbnail A/B test ideas.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({ prompt: prompts[enhanceType] });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-4">
        <p className="text-blue-300 font-bold text-sm mb-1">🎨 AI Video Enhancement</p>
        <p className="text-gray-400 text-xs">Describe your existing video and select what needs improving. AI gives you a precise fix guide.</p>
      </div>

      {/* Enhancement Type */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-3 block">What to Enhance?</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ENHANCE_TYPES.map(t => (
            <button key={t.id} onClick={() => setEnhanceType(t.id)}
              className={`py-3 rounded-xl text-xs font-bold transition-colors ${enhanceType === t.id ? "bg-blue-600/30 border border-blue-500/50 text-blue-300" : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"}`}>
              <div className="text-lg mb-1">{t.icon}</div>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Description */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Describe Your Current Video</label>
        <textarea value={videoContext} onChange={e => setVideoContext(e.target.value)}
          placeholder="e.g. '10 minute GTA 5 mod showcase, recorded on PC, has some shaky moments, audio is a bit quiet, I want it to feel more professional and cinematic'"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm resize-none" />
      </div>

      {/* Issues */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Known Issues (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {ISSUES.map(issue => (
            <button key={issue} onClick={() => setCurrentIssues(prev => prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue])}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${currentIssues.includes(issue) ? "bg-red-600/30 border border-red-500/50 text-red-300" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
              {issue}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Target Platform</label>
        <div className="flex gap-2">
          {["youtube", "tiktok", "instagram", "facebook"].map(p => (
            <button key={p} onClick={() => setTargetPlatform(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${targetPlatform === p ? "bg-purple-600/30 border border-purple-500/50 text-purple-300" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleEnhance} disabled={loading || !videoContext.trim()}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> AI Analyzing...</> : <><Wand2 className="w-4 h-4" /> Get AI Enhancement Guide</>}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-900 border border-blue-700/30 rounded-2xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
          {result}
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: UPLOAD & COPYRIGHT SCAN ────────────────────────────────────────────
function UploadScanTab({ user, profile, onVideoCreated }) {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("gameplay");
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) setVideoFile(f);
  };

  const handleUploadAndScan = async () => {
    if (!videoFile || !title.trim()) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
    setUploadedUrl(file_url);
    setUploading(false);

    // AI Copyright Scan
    setScanning(true);
    const scanPrompt = `You are a copyright detection AI for a gaming video platform. 

Analyze this video submission:
- Title: "${title}"
- Description: "${description}"
- Category: ${category}
- Creator: ${profile?.username || user?.email}
- File name: ${videoFile.name}

Perform a comprehensive copyright risk assessment:

## COPYRIGHT RISK ANALYSIS

### Risk Level: [LOW / MEDIUM / HIGH / CRITICAL]

### Detected Potential Issues:
1. Music: Analyze if the title/description suggests popular copyrighted music
2. Game Content: Identify if gameplay content has known copyright restrictions
3. Brand/Logo: Check for trademarked content
4. Third-party clips: Check for unauthorized reuse

### Platform-Specific Flags:
- YouTube Content ID match risk
- Twitch DMCA risk
- Facebook Rights Manager risk

### Recommended Actions:
- What creator should do before publishing
- Suggested copyright-safe alternatives

### Verdict: [APPROVED / NEEDS_REVIEW / FLAGGED]
- Reason for verdict

Be realistic — most gaming gameplay videos are fine. Flag only genuine copyright concerns.`;

    const scanRes = await base44.integrations.Core.InvokeLLM({
      prompt: scanPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string" },
          verdict: { type: "string" },
          issues: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          full_report: { type: "string" },
        }
      }
    });

    setScanResult(scanRes);
    setScanning(false);

    // If flagged, notify via backend
    if (scanRes?.verdict === "FLAGGED" || scanRes?.risk_level === "HIGH" || scanRes?.risk_level === "CRITICAL") {
      base44.functions.invoke("copyrightViolationAlert", {
        creator_email: user.email,
        creator_username: profile?.username || user.email,
        video_title: title,
        risk_level: scanRes.risk_level,
        issues: scanRes.issues,
        video_url: file_url,
      }).catch(() => {});
    }
  };

  const handlePublish = async () => {
    if (!uploadedUrl || !title.trim()) return;
    setSubmitting(true);
    await base44.entities.VideoPost.create({
      creator_email: user.email,
      creator_username: profile?.username || user.full_name,
      creator_avatar: profile?.avatar_url || "",
      title: title.trim(),
      description: description.trim(),
      video_url: uploadedUrl,
      category,
      status: "active",
      is_approved: true,
    });
    setSubmitting(false);
    setDone(true);
    onVideoCreated?.();
  };

  const riskColors = { LOW: "text-green-400", MEDIUM: "text-yellow-400", HIGH: "text-orange-400", CRITICAL: "text-red-400" };
  const riskBgs = { LOW: "bg-green-900/20 border-green-700/30", MEDIUM: "bg-yellow-900/20 border-yellow-700/30", HIGH: "bg-orange-900/20 border-orange-700/30", CRITICAL: "bg-red-900/20 border-red-700/30" };

  if (done) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-white font-black text-xl mb-2">Video Published!</h3>
        <p className="text-green-400 font-semibold">Your video has been shared to the community.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-orange-400" />
          <p className="text-orange-300 font-bold text-sm">Upload Video with AI Copyright Scan</p>
        </div>
        <p className="text-gray-400 text-xs">Your video will be scanned for potential copyright issues before publishing. Flagged videos will be reviewed by admin.</p>
      </div>

      {/* Video Upload */}
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Select Video File</label>
        <label className={`flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${videoFile ? "border-purple-500 bg-purple-950/20" : "border-gray-700 hover:border-purple-600"}`}>
          <Video className={`w-8 h-8 ${videoFile ? "text-purple-400" : "text-gray-500"}`} />
          <div className="text-center">
            {videoFile ? (
              <>
                <p className="text-white font-semibold text-sm">{videoFile.name}</p>
                <p className="text-gray-400 text-xs mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </>
            ) : (
              <>
                <p className="text-white font-semibold text-sm">Click to select video</p>
                <p className="text-gray-500 text-xs mt-1">MP4, MOV, AVI, WebM supported</p>
              </>
            )}
          </div>
          <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {/* Meta */}
      <div className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title *"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 text-sm" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description — mention any music or third-party content used"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 text-sm resize-none" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 text-sm">
          {["gameplay", "tutorial", "review", "highlights", "mods", "esports", "vlog", "other"].map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <button onClick={handleUploadAndScan} disabled={!videoFile || !title.trim() || uploading || scanning}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {uploading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
          : scanning ? <><Shield className="w-4 h-4 animate-pulse" /> Running Copyright Scan...</>
          : <><Shield className="w-4 h-4" /> Upload & Scan for Copyright</>}
      </button>

      {/* Scan Result */}
      {scanResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-5 ${riskBgs[scanResult.risk_level] || "bg-gray-900 border-gray-700"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {scanResult.verdict === "APPROVED" ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-orange-400" />}
              <p className="text-white font-black text-sm">Copyright Scan Complete</p>
            </div>
            <span className={`text-sm font-black px-3 py-1 rounded-full bg-gray-900/50 ${riskColors[scanResult.risk_level] || "text-gray-400"}`}>
              {scanResult.risk_level} RISK
            </span>
          </div>

          {scanResult.issues?.length > 0 && (
            <div className="mb-3">
              <p className="text-gray-400 text-xs font-semibold mb-2">⚠️ Potential Issues Found:</p>
              <ul className="space-y-1">
                {scanResult.issues.map((issue, i) => (
                  <li key={i} className="text-orange-300 text-xs flex items-start gap-2">
                    <span className="mt-0.5">•</span>{issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scanResult.recommendations?.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs font-semibold mb-2">✅ Recommendations:</p>
              <ul className="space-y-1">
                {scanResult.recommendations.map((rec, i) => (
                  <li key={i} className="text-green-300 text-xs flex items-start gap-2">
                    <span className="mt-0.5">•</span>{rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scanResult.full_report && (
            <details className="mt-2">
              <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300">View full report</summary>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed whitespace-pre-wrap">{scanResult.full_report}</p>
            </details>
          )}

          {(scanResult.verdict === "APPROVED" || scanResult.risk_level === "LOW") ? (
            <button onClick={handlePublish} disabled={submitting}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {submitting ? "Publishing..." : "✅ Publish Video"}
            </button>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-orange-300 text-xs font-semibold">⚠️ This video has been flagged for admin review. You may still publish but it may be removed.</p>
              <div className="flex gap-2">
                <button onClick={handlePublish} disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-orange-900/40 border border-orange-700/50 text-orange-300 text-sm font-bold hover:bg-orange-900/60 transition-colors">
                  {submitting ? "Publishing..." : "Publish Anyway"}
                </button>
                <button onClick={() => { setVideoFile(null); setScanResult(null); setUploadedUrl(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-sm font-bold hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: MUSIC ADVISOR ──────────────────────────────────────────────────────
function MusicAdvisorTab() {
  const [gameType, setGameType] = useState("");
  const [videoMood, setVideoMood] = useState("Hype");
  const [videoStyle, setVideoStyle] = useState("");
  const [bpmPref, setBpmPref] = useState("any");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetMusic = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a royalty-free music curator for gaming content creators.

Find the perfect NON-COPYRIGHTED music for:
- Game type: ${gameType || "general gaming"}
- Video mood: ${videoMood}
- Video style: ${videoStyle || "standard gaming video"}
- BPM preference: ${bpmPref}

Provide 12 specific royalty-free music recommendations with:
1. Track Name & Artist
2. Source (YouTube Audio Library / Free Music Archive / Pixabay Music / NCS / Epidemic Sound Free / Incompetech / ccMixter)
3. BPM & Key
4. Mood tags
5. Best for (intro / main content / outro / montage / emotional)
6. Direct search terms to find it

Also include:
## 🎵 TOP FREE MUSIC PLATFORMS FOR GAMERS
- List 8 platforms with direct URLs
- What makes each good for gaming content
- How to properly credit each platform

## ⚠️ MUSIC TO AVOID (commonly copyright flagged)
- Types of music that trigger Content ID
- Artists whose gaming use is restricted
- How to check if music is safe before using`,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Music className="w-4 h-4 text-green-400" />
          <p className="text-green-300 font-bold text-sm">AI Music Advisor — 100% Copyright Safe</p>
        </div>
        <p className="text-gray-400 text-xs">Get specific royalty-free music track recommendations curated by AI for your exact gaming video style.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-300 text-sm font-bold mb-2 block">Game Type</label>
          <input value={gameType} onChange={e => setGameType(e.target.value)} placeholder="e.g. GTA 5, Valorant, FIFA..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-600 text-sm" />
        </div>
        <div>
          <label className="text-gray-300 text-sm font-bold mb-2 block">Mood</label>
          <select value={videoMood} onChange={e => setVideoMood(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-600 text-sm">
            {MUSIC_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-300 text-sm font-bold mb-2 block">Video Style</label>
          <select value={videoStyle} onChange={e => setVideoStyle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-600 text-sm">
            <option value="">Any Style</option>
            {VIDEO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-300 text-sm font-bold mb-2 block">BPM Range</label>
          <select value={bpmPref} onChange={e => setBpmPref(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-green-600 text-sm">
            <option value="any">Any BPM</option>
            <option value="slow (60-80 BPM)">Slow (60-80)</option>
            <option value="mid (90-110 BPM)">Mid (90-110)</option>
            <option value="fast (120-140 BPM)">Fast (120-140)</option>
            <option value="very fast (150+ BPM)">Very Fast (150+)</option>
          </select>
        </div>
      </div>

      <button onClick={handleGetMusic} disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Finding music...</> : <><Music className="w-4 h-4" /> Get Music Recommendations</>}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-900 border border-green-700/30 rounded-2xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
          {result}
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: SCRIPT WRITER ──────────────────────────────────────────────────────
function ScriptWriterTab({ profile }) {
  const [topic, setTopic] = useState("");
  const [scriptType, setScriptType] = useState("full");
  const [duration, setDuration] = useState("10");
  const [tone, setTone] = useState("energetic");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SCRIPT_TYPES = [
    { id: "full", label: "Full Script" },
    { id: "hook", label: "Hook Only (0-15s)" },
    { id: "outro", label: "Outro + CTA" },
    { id: "commentary", label: "Gameplay Commentary" },
    { id: "shorts", label: "YouTube Shorts" },
  ];

  const handleWrite = async () => {
    setLoading(true);
    setResult(null);

    const prompts = {
      full: `Write a complete, ready-to-record gaming YouTube script.
Topic: "${topic}" | Duration: ~${duration} minutes | Tone: ${tone}
Channel: ${profile?.username || "gaming channel"}

Include EVERY word to say, not just bullet points. Format:
[HOOK - 0:00-0:15] (word for word)
[INTRO - 0:15-0:45]
[SECTION 1 - name] (timestamps)
...all sections...
[ENGAGEMENT MOMENT] (ask for like/subscribe naturally)
[OUTRO - last 30s]

Make it natural, conversational, platform-optimized. Include stage directions in [brackets].`,

      hook: `Write 5 different video hook variations (0-15 seconds each) for this gaming video topic: "${topic}"
Each hook should use a different technique: curiosity gap, bold claim, question, shocking stat, story.
Include exact words to say, camera direction, and why each hook works.`,

      outro: `Write an outro + call-to-action script for a gaming video about: "${topic}"
Include: thanks, engagement ask (like/sub/comment), next video tease, channel trailer mention, end screen countdown narration.
Make it under 45 seconds and genuinely enthusiastic.`,

      commentary: `Write natural, engaging gameplay commentary for: "${topic}"
Include: live reactions, analysis, humor, engagement questions, expertise moments, personality.
Write it as a 5-minute commentary with timestamps and [action/event] markers for when things happen.`,

      shorts: `Write a YouTube Shorts script for: "${topic}"
Max 60 seconds. Start with a hook in first 3 words. Make it super punchy and shareable.
Include: hook, main content, quick CTA. Format with timestamps.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({ prompt: prompts[scriptType] });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Script Type</label>
        <div className="flex flex-wrap gap-2">
          {SCRIPT_TYPES.map(t => (
            <button key={t.id} onClick={() => setScriptType(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${scriptType === t.id ? "bg-yellow-600/30 border border-yellow-500/50 text-yellow-300" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Video Topic</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. 'Top 5 most insane GTA 5 mods you've never seen' or 'How to win every ranked match in Valorant'"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 text-sm resize-none" />
      </div>

      <div className="flex gap-3">
        {scriptType === "full" && (
          <div className="flex-1">
            <label className="text-gray-300 text-xs font-bold mb-1.5 block">Duration (min)</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-yellow-600 text-sm">
              {["3","5","8","10","15","20"].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
        )}
        <div className="flex-1">
          <label className="text-gray-300 text-xs font-bold mb-1.5 block">Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-yellow-600 text-sm">
            {["energetic","calm","funny","professional","hype","educational"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <button onClick={handleWrite} disabled={loading || !topic.trim()}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Writing script...</> : <><Zap className="w-4 h-4" /> Write My Script</>}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-white font-bold text-sm">✅ Script Ready!</p>
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="bg-gray-900 border border-yellow-700/30 rounded-2xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {result}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: THUMBNAIL AI ───────────────────────────────────────────────────────
function ThumbnailAITab({ profile }) {
  const [videoTitle, setVideoTitle] = useState("");
  const [game, setGame] = useState("");
  const [style, setStyle] = useState("bold");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional YouTube thumbnail designer specializing in gaming content.

Create thumbnail concepts for:
- Video title: "${videoTitle}"
- Game: ${game || "general gaming"}
- Style preference: ${style}

Provide:

## 🖼️ 3 THUMBNAIL CONCEPTS

For each concept:
### Concept [1/2/3]: [Name]
- **Layout**: Exact positioning of all elements
- **Background**: Color, image, gradient details
- **Main Subject**: What's the focal point (character, gameplay screenshot, reaction face)
- **Text**: What text, exact size, font style, position, color, shadow/stroke
- **Color Palette**: 3-4 specific hex codes
- **Emotion/Energy**: What feeling it triggers
- **Click Psychology**: Why it will make people click

## 🛠️ FREE TOOLS TO CREATE IT
- Canva gaming templates to use
- Adobe Express options
- Photopea (free Photoshop)
- Remove.bg for cutouts

## 📊 THUMBNAIL A/B TEST PLAN
- Which concept to test first and why
- How to run a YouTube thumbnail A/B test
- Metrics to watch

## 🔥 POWER TIPS
- Thumbnail mistakes gaming creators make
- The "Rule of thirds" for gaming thumbnails
- Face expressions that get 40% more clicks`,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-300 text-sm font-bold mb-2 block">Video Title</label>
          <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="e.g. Top 10 GTA 5 Mods 2025"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-600 text-sm" />
        </div>
        <div>
          <label className="text-gray-300 text-sm font-bold mb-2 block">Game</label>
          <input value={game} onChange={e => setGame(e.target.value)} placeholder="e.g. GTA 5, Minecraft..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-600 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Thumbnail Style</label>
        <div className="flex flex-wrap gap-2">
          {["bold", "minimal", "cinematic", "clickbait", "professional", "neon", "retro"].map(s => (
            <button key={s} onClick={() => setStyle(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${style === s ? "bg-pink-600/30 border border-pink-500/50 text-pink-300" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading || !videoTitle.trim()}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Designing...</> : <><Palette className="w-4 h-4" /> Generate Thumbnail Concepts</>}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-900 border border-pink-700/30 rounded-2xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
          {result}
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: TITLE & SEO ────────────────────────────────────────────────────────
function TitleSEOTab({ profile }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a gaming content SEO specialist and viral title expert.

Topic: "${topic}"
Platform: ${platform}
Creator: ${profile?.username || "gaming creator"}

Generate a complete SEO + titles package:

## 🔥 10 VIRAL TITLE OPTIONS
For each: the title, why it works, click-through rate prediction (low/med/high/viral), best for which audience

## 📝 OPTIMIZED VIDEO DESCRIPTION
Full 300-word description with:
- Hook paragraph
- Chapter timestamps template
- Keywords naturally embedded  
- Social links section
- Hashtags (15 relevant ones)

## 🏷️ COMPLETE TAG LIST
30 highly-searched gaming tags ranked by search volume

## 🗓️ UPLOAD TIMING STRATEGY
Best days/times to upload for ${platform} gaming content
Algorithm tips for initial push

## 💬 COMMENT STRATEGY
3 pinned comment templates to boost engagement
Reply templates for common comments
Community post ideas to complement the video`,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Video Topic</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. 'GTA 5 best mods 2025 compilation' or 'How I got Diamond rank in Valorant'"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-600 text-sm resize-none" />
      </div>

      <div>
        <label className="text-gray-300 text-sm font-bold mb-2 block">Platform</label>
        <div className="flex gap-2">
          {["youtube", "tiktok", "instagram", "twitch"].map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${platform === p ? "bg-cyan-600/30 border border-cyan-500/50 text-cyan-300" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading || !topic.trim()}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Type className="w-4 h-4" /> Generate Titles & SEO Pack</>}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-white font-bold text-sm">✅ SEO Pack Ready!</p>
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">
              <Copy className="w-3 h-3" /> Copy All
            </button>
          </div>
          <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {result}
          </div>
        </motion.div>
      )}
    </div>
  );
}