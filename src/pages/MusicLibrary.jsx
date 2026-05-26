import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, ExternalLink, Play, Download, Search, Headphones, Youtube, Globe } from "lucide-react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

const MUSIC_SITES = [
  { name: "YouTube Audio Library", url: "https://www.youtube.com/audiolibrary", desc: "Free music & sound effects for creators. No attribution required on most tracks.", badge: "FREE", color: "bg-red-900/30 border-red-700/40 text-red-300", icon: "🎵" },
  { name: "Free Music Archive", url: "https://freemusicarchive.org", desc: "Curated library of high-quality, legal audio downloads under Creative Commons.", badge: "CC", color: "bg-blue-900/30 border-blue-700/40 text-blue-300", icon: "🎶" },
  { name: "ccMixter", url: "https://ccmixter.org", desc: "Community music site featuring remixes licensed under Creative Commons.", badge: "CC", color: "bg-purple-900/30 border-purple-700/40 text-purple-300", icon: "🎸" },
  { name: "Bensound", url: "https://www.bensound.com", desc: "Royalty free music for YouTube videos and content creators.", badge: "FREE", color: "bg-green-900/30 border-green-700/40 text-green-300", icon: "🎹" },
  { name: "Pixabay Music", url: "https://pixabay.com/music/", desc: "100% royalty free music with no attribution required. Large library.", badge: "FREE", color: "bg-yellow-900/30 border-yellow-700/40 text-yellow-300", icon: "🎺" },
  { name: "Incompetech (Kevin MacLeod)", url: "https://incompetech.com", desc: "Huge catalog by Kevin MacLeod. Free under CC-BY license.", badge: "CC-BY", color: "bg-cyan-900/30 border-cyan-700/40 text-cyan-300", icon: "🎻" },
  { name: "Mixkit", url: "https://mixkit.co/free-music/", desc: "Free stock music tracks for video projects. No attribution needed.", badge: "FREE", color: "bg-pink-900/30 border-pink-700/40 text-pink-300", icon: "🥁" },
  { name: "SoundBible", url: "https://soundbible.com", desc: "Free sound clips, effects and soundbites for your projects.", badge: "SFX", color: "bg-orange-900/30 border-orange-700/40 text-orange-300", icon: "🔊" },
  { name: "Musopen", url: "https://musopen.org", desc: "Classical music recordings and sheet music in the public domain.", badge: "PUBLIC", color: "bg-indigo-900/30 border-indigo-700/40 text-indigo-300", icon: "🎼" },
  { name: "NCS (NoCopyrightSounds)", url: "https://ncs.io", desc: "Electronic music specifically made for content creators. YouTube-safe.", badge: "NCS", color: "bg-teal-900/30 border-teal-700/40 text-teal-300", icon: "⚡" },
];

const CATEGORIES = [
  { id: "all", label: "All Music" },
  { id: "gaming", label: "🎮 Gaming" },
  { id: "electronic", label: "⚡ Electronic" },
  { id: "ambient", label: "🌙 Ambient" },
  { id: "hiphop", label: "🎤 Hip Hop" },
  { id: "rock", label: "🎸 Rock" },
  { id: "cinematic", label: "🎬 Cinematic" },
  { id: "lofi", label: "☕ Lo-Fi" },
  { id: "sfx", label: "🔊 Sound FX" },
];

const SAMPLE_TRACKS = [
  { title: "Epic Gaming Intro", artist: "Kevin MacLeod", category: "gaming", duration: "2:34", source: "Incompetech", url: "https://incompetech.com", tags: ["gaming", "epic", "intro"] },
  { title: "Cyberpunk Future Bass", artist: "NCS", category: "electronic", duration: "3:12", source: "NCS", url: "https://ncs.io", tags: ["electronic", "gaming", "cyberpunk"] },
  { title: "Midnight Lofi Chill", artist: "Pixabay Artist", category: "lofi", duration: "4:05", source: "Pixabay", url: "https://pixabay.com/music/", tags: ["lofi", "chill", "study"] },
  { title: "Action Montage Rock", artist: "Bensound", category: "rock", duration: "2:58", source: "Bensound", url: "https://www.bensound.com", tags: ["rock", "action", "montage"] },
  { title: "Ambient Space Journey", artist: "Free Music Archive", category: "ambient", duration: "5:20", source: "FMA", url: "https://freemusicarchive.org", tags: ["ambient", "space", "background"] },
  { title: "Hip Hop Beat Maker", artist: "ccMixter", category: "hiphop", duration: "3:44", source: "ccMixter", url: "https://ccmixter.org", tags: ["hiphop", "beat", "urban"] },
  { title: "Cinematic Trailer Build", artist: "Mixkit", category: "cinematic", duration: "1:48", source: "Mixkit", url: "https://mixkit.co/free-music/", tags: ["cinematic", "trailer", "epic"] },
  { title: "Notification Ping SFX", artist: "SoundBible", category: "sfx", duration: "0:03", source: "SoundBible", url: "https://soundbible.com", tags: ["sfx", "ui", "notification"] },
  { title: "Classical Piano Sonata", artist: "Musopen", category: "ambient", duration: "6:12", source: "Musopen", url: "https://musopen.org", tags: ["classical", "piano", "ambient"] },
  { title: "8-Bit Gaming Retro", artist: "Kevin MacLeod", category: "gaming", duration: "2:15", source: "Incompetech", url: "https://incompetech.com", tags: ["8bit", "retro", "gaming"] },
  { title: "Dark Electronic Boss Fight", artist: "NCS", category: "gaming", duration: "4:30", source: "NCS", url: "https://ncs.io", tags: ["electronic", "dark", "gaming"] },
  { title: "Upbeat Gameplay Loop", artist: "YouTube Audio Library", category: "gaming", duration: "3:05", source: "YT Audio", url: "https://www.youtube.com/audiolibrary", tags: ["upbeat", "gaming", "loop"] },
];

export default function MusicLibrary() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      if (me) base44.entities.UserProfile.filter({ user_email: me.email }).then(p => setProfile(p[0] || null));
    }).catch(() => {});
  }, []);

  const filteredTracks = SAMPLE_TRACKS.filter(t => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {user ? <AuthNavbar user={user} profile={profile} /> : (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 h-16 flex items-center px-4">
          <a href="/" className="text-purple-400 font-black text-sm">← GAMER Productions</a>
        </nav>
      )}

      {/* Hero */}
      <div className="pt-16 relative py-16 px-4" style={{ background: "linear-gradient(135deg, #050010 0%, #0a0020 50%, #030712 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase mb-4 inline-block">🎵 Free Music Library</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Copyright-Free <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Music</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">Browse royalty-free and Creative Commons music for your gaming videos, streams, and content. All tracks are safe to use!</p>
        </div>
      </div>

      {/* Top Sites */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-white font-black text-xl mb-2 flex items-center gap-2"><Globe className="w-5 h-5 text-purple-400" /> Top Free Music Download Sites</h2>
        <p className="text-gray-500 text-sm mb-6">Verified copyright-free sources trusted by creators worldwide</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {MUSIC_SITES.map((site, i) => (
            <motion.a key={i} href={site.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className={`flex flex-col gap-2 p-4 rounded-2xl border bg-gray-900 hover:border-purple-500/40 transition-colors group`}>
              <div className="flex items-start justify-between">
                <span className="text-2xl">{site.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${site.color}`}>{site.badge}</span>
              </div>
              <p className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">{site.name}</p>
              <p className="text-gray-500 text-xs leading-relaxed flex-1">{site.desc}</p>
              <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold mt-1">
                <ExternalLink className="w-3 h-3" /> Visit Site
              </div>
            </motion.a>
          ))}
        </div>

        {/* Browse Tracks */}
        <div className="mb-6">
          <h2 className="text-white font-black text-xl mb-2 flex items-center gap-2"><Headphones className="w-5 h-5 text-pink-400" /> Browse Sample Tracks by Category</h2>
          <p className="text-gray-500 text-sm mb-5">Click any track to visit the source site and download</p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === c.id ? "bg-purple-600/20 border border-purple-600/40 text-purple-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 max-w-sm mb-6" style={{ boxShadow: "0 0 0 0 rgba(168,85,247,0)" }}>
            <Search className="w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracks, artists, tags..."
              className="bg-transparent text-white text-sm placeholder-gray-600 outline-none flex-1" />
          </div>

          <div className="space-y-2">
            {filteredTracks.map((track, i) => (
              <motion.a key={i} href={track.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-purple-500/40 hover:bg-gray-800/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate group-hover:text-purple-300 transition-colors">{track.title}</p>
                  <p className="text-gray-500 text-xs">{track.artist} · {track.source}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1 hidden sm:flex">
                    {track.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-[10px]">#{tag}</span>
                    ))}
                  </div>
                  <span className="text-gray-600 text-xs font-mono">{track.duration}</span>
                  <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="w-3.5 h-3.5" /> Get
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Usage Notice */}
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-5 mt-8">
          <h3 className="text-yellow-300 font-bold text-sm mb-2">⚠️ Important: Always Check the License</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Even "free" music may require attribution (crediting the artist) or have specific use restrictions. Always read the license before using any track in your content. Creative Commons (CC) licenses vary — CC-BY requires credit, CC0 requires none. For monetized YouTube videos, use only royalty-free or licensed tracks.
          </p>
        </div>
      </div>
    </div>
  );
}