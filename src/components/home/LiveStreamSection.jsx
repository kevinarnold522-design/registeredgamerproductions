import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Mic, Video, Settings, Copy, Check, Music, AlertTriangle, ChevronRight, Zap, Eye } from "lucide-react";
import LiveStreamStudio from "@/components/streaming/LiveStreamStudio";

const FREE_MUSIC = [
  { title: "No Copyright Gaming Beat", artist: "Chillpill", source: "YouTube Audio Library", genre: "Electronic", link: "https://studio.youtube.com/channel/music" },
  { title: "Upbeat Gamer", artist: "Kevin MacLeod", source: "Incompetech.com", genre: "Chiptune", link: "https://incompetech.filmmusic.io" },
  { title: "Neon Racing", artist: "FreeMusicArchive", source: "freemusicarchive.org", genre: "Synthwave", link: "https://freemusicarchive.org" },
  { title: "Epic Boss Battle", artist: "Pixabay Music", source: "pixabay.com/music", genre: "Orchestral", link: "https://pixabay.com/music" },
  { title: "Lofi Gamer Session", artist: "Chosic", source: "chosic.com", genre: "Lo-Fi", link: "https://www.chosic.com" },
  { title: "Digital Horizon", artist: "Bensound", source: "bensound.com", genre: "Electronic", link: "https://www.bensound.com" },
];

const STREAMING_TOOLS = [
  { icon: "🎬", title: "OBS Studio", desc: "Free & open-source broadcaster — industry standard for PC streaming", href: "https://obsproject.com", tag: "Free" },
  { icon: "📱", title: "Streamlabs Mobile", desc: "Go live directly from your phone with professional overlays", href: "https://streamlabs.com/mobile-app", tag: "Free" },
  { icon: "🎨", title: "Stream Overlay Builder", desc: "Custom overlays, alerts & scene transitions — AI-assisted branding", href: "#dashboard", tag: "Built-in" },
  { icon: "🔗", title: "Multi-Stream", desc: "Stream to YouTube, Twitch & Facebook simultaneously via Restream", href: "https://restream.io", tag: "Restream" },
  { icon: "📊", title: "Stream Analytics", desc: "Track live viewers, peak concurrent, avg watch time & retention", href: "#analytics", tag: "Dashboard" },
  { icon: "💬", title: "Live Chat Widget", desc: "Embeddable chat box to engage your audience during livestreams", href: "#dashboard", tag: "Built-in" },
];

export default function LiveStreamSection() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");
  const [showStudio, setShowStudio] = useState(false);
  const mockKey = "gprod-live-xxxxxx-stream-key";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="livestream" className="py-20 px-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#0a0118 0%,#160828 40%,#1e0a38 60%,#0a0118 100%)" }}>
      {/* Premium glow bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60" />
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
        <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] rounded-full opacity-18 blur-[120px]" style={{ background: "radial-gradient(circle,#ec4899,transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full opacity-10 blur-[100px]" style={{ background: "radial-gradient(ellipse,#a855f7,transparent)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-black mb-4 tracking-widest uppercase" style={{ background: "rgba(220,38,38,0.15)", borderColor: "rgba(220,38,38,0.5)", color: "#fca5a5", boxShadow: "0 0 20px rgba(220,38,38,0.3), 0 0 40px rgba(168,85,247,0.15)" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            🔴 LIVE STREAMING HUB
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3" style={{ textShadow: "0 0 40px rgba(168,85,247,0.4)" }}>
            Go <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Live</span> on GAMER
          </h2>
          <p className="text-purple-200/60 text-base max-w-2xl mx-auto mb-5">
            Stream your gameplay, tournaments, and content directly on GAMER Productions.
            Grow your audience, earn from views, and build your community — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              onClick={() => setShowStudio(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-white text-base"
              style={{ background: "linear-gradient(90deg, #dc2626, #be123c, #7c3aed)", boxShadow: "0 0 30px rgba(220,38,38,0.6), 0 0 60px rgba(168,85,247,0.3)" }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <Radio className="w-5 h-5" />
              Go Live — PC / Browser
            </motion.button>
            <a href="https://streamlabs.com/mobile-app" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-white text-base"
              style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(168,85,247,0.5)", boxShadow: "0 0 20px rgba(168,85,247,0.2)" }}>
              📱 Android / iOS
            </a>
          </div>
        </motion.div>

        {/* Live Studio Modal */}
        <AnimatePresence>
          {showStudio && (
            <LiveStreamStudio user={null} profile={null} onClose={() => setShowStudio(false)} />
          )}
        </AnimatePresence>

        {/* Copyright Warning Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="rounded-2xl p-5 mb-8 flex gap-4 items-start" style={{ background: "rgba(120,53,15,0.25)", border: "2px solid rgba(234,179,8,0.35)", boxShadow: "0 0 30px rgba(234,179,8,0.1), inset 0 0 30px rgba(120,53,15,0.1)" }}>
          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-black text-base mb-1">⚠️ IMPORTANT: Copyright Rules for Streamers</p>
            <p className="text-yellow-100/70 text-sm leading-relaxed mb-3">
              Using copyrighted music, game footage (without permission), or third-party content in your streams or videos is <strong className="text-yellow-300">strictly prohibited</strong> on GAMER Productions. Violations will result in immediate stream termination, content removal, and account suspension. We use AI content moderation to detect copyrighted audio and video.
            </p>
            <p className="text-yellow-200/80 text-sm font-semibold">✅ Only use music from our approved royalty-free library below.</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { id: "tools", label: "🛠️ Streaming Tools" },
            { id: "music", label: "🎵 Free Music Library" },
            { id: "setup", label: "⚙️ Stream Setup" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50" : "text-purple-300/70 hover:text-white"}`}
              style={activeTab !== t.id ? { background: "rgba(88,28,135,0.2)", border: "1px solid rgba(168,85,247,0.25)" } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Streaming Tools */}
          {activeTab === "tools" && (
            <motion.div key="tools" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {STREAMING_TOOLS.map((tool, i) => (
                  <motion.a key={i} href={tool.href} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="group flex gap-4 p-5 rounded-2xl transition-all"
                    style={{ background: "rgba(59,7,100,0.35)", border: "1px solid rgba(168,85,247,0.2)", boxShadow: "0 4px 20px rgba(88,28,135,0.15)" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(168,85,247,0.4), 0 4px 20px rgba(88,28,135,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(88,28,135,0.15)"}>
                    <div className="text-3xl flex-shrink-0">{tool.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-sm">{tool.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-purple-200 text-[10px] font-semibold" style={{ background: "rgba(124,58,237,0.35)", border: "1px solid rgba(168,85,247,0.3)" }}>{tool.tag}</span>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">{tool.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-purple-400 transition-colors flex-shrink-0 self-center" />
                  </motion.a>
                ))}
              </div>

              {/* Live Stats Preview */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Avg Stream Duration", value: "2h 14m", icon: <Video className="w-5 h-5 text-purple-400" />, glow: "rgba(168,85,247,0.4)", border: "rgba(168,85,247,0.3)" },
                  { label: "Peak Concurrent Viewers", value: "—", icon: <Eye className="w-5 h-5 text-pink-400" />, glow: "rgba(236,72,153,0.4)", border: "rgba(236,72,153,0.3)" },
                  { label: "Streams This Month", value: "—", icon: <Radio className="w-5 h-5 text-red-400" />, glow: "rgba(220,38,38,0.4)", border: "rgba(220,38,38,0.3)" },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-4 text-center" style={{ background: `rgba(59,7,100,0.3)`, border: `1px solid ${s.border}`, boxShadow: `0 0 20px ${s.glow}` }}>
                    <div className="flex justify-center mb-2">{s.icon}</div>
                    <p className="text-white font-black text-xl">{s.value}</p>
                    <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Free Music Library */}
          {activeTab === "music" && (
            <motion.div key="music" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="rounded-2xl p-4 mb-6 flex gap-3 items-center" style={{ background: "rgba(6,78,59,0.2)", border: "1px solid rgba(34,197,94,0.25)", boxShadow: "0 0 20px rgba(34,197,94,0.1)" }}>
                <Music className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm font-semibold">
                  All tracks below are 100% royalty-free & copyright-safe for streaming and gaming content. Always verify before use.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FREE_MUSIC.map((track, i) => (
                  <motion.a key={i} href={track.link} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="group flex gap-3 p-4 rounded-2xl transition-all"
                    style={{ background: "rgba(59,7,100,0.3)", border: "1px solid rgba(34,197,94,0.2)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)"}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(6,78,59,0.3)", border: "1px solid rgba(34,197,94,0.3)" }}>
                      <Music className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{track.title}</p>
                      <p className="text-gray-400 text-xs">{track.artist}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-purple-300 text-[10px]" style={{ background: "rgba(88,28,135,0.4)" }}>{track.genre}</span>
                        <span className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 text-[10px]">✓ Free</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-green-400 transition-colors self-center flex-shrink-0" />
                  </motion.a>
                ))}
              </div>
              <p className="text-center text-gray-600 text-xs mt-6">
                More options: YouTube Audio Library · ccMixter · Free Music Archive · SoundCloud (Free) · Musopen
              </p>
            </motion.div>
          )}

          {/* Stream Setup */}
          {activeTab === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-5">
              <div className="rounded-2xl p-6" style={{ background: "rgba(59,7,100,0.35)", border: "1px solid rgba(168,85,247,0.25)", boxShadow: "0 0 30px rgba(88,28,135,0.3)" }}>
                <p className="text-white font-black text-lg mb-1 flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400" /> Your Stream Key</p>
                <p className="text-purple-300/60 text-sm mb-4">Use this key in OBS, Streamlabs, or any RTMP broadcaster. Keep it private!</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl px-4 py-3 text-purple-300/50 font-mono text-sm select-none" style={{ background: "rgba(88,28,135,0.25)", border: "1px solid rgba(168,85,247,0.2)" }}>
                    ••••••••••••••••••••••••
                  </div>
                  <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-3">🔒 Sign in to your account to access your personal stream key</p>
              </div>

              <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(59,7,100,0.35)", border: "1px solid rgba(168,85,247,0.25)", boxShadow: "0 0 30px rgba(88,28,135,0.3)" }}>
                <p className="text-white font-black text-lg mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Recommended OBS Settings</p>
                {[
                  { label: "Server", value: "rtmp://live.gamerproductions.app/stream" },
                  { label: "Encoder", value: "x264 (CPU) or NVENC (GPU)" },
                  { label: "Bitrate", value: "4000–6000 kbps (1080p60)" },
                  { label: "Resolution", value: "1920×1080 or 1280×720" },
                  { label: "FPS", value: "60 (for fast-paced games) / 30 (casual)" },
                  { label: "Audio Bitrate", value: "160 kbps" },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center py-2 last:border-0" style={{ borderBottom: i < 5 ? "1px solid rgba(168,85,247,0.15)" : "none" }}>
                    <span className="text-purple-300/70 text-sm">{s.label}</span>
                    <span className="text-white font-mono text-sm font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
