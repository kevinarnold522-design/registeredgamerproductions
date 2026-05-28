import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Plus, Send, Heart, X, ChevronRight, Star, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isAdmin } from "@/lib/constants";

// Top gaming franchises with AI-matched colors/logos
const TOP_FRANCHISES = [
  { id: "call-of-duty", name: "Call of Duty", emoji: "🎖️", color: "#1a1a2e", accent: "#e94560", genre: "FPS" },
  { id: "minecraft", name: "Minecraft", emoji: "⛏️", color: "#2d5a27", accent: "#7cb342", genre: "Sandbox" },
  { id: "gta", name: "Grand Theft Auto", emoji: "🚗", color: "#1a1a1a", accent: "#fcb045", genre: "Open World" },
  { id: "valorant", name: "Valorant", emoji: "🔫", color: "#0f1923", accent: "#ff4655", genre: "FPS" },
  { id: "csgo2", name: "CS2", emoji: "💣", color: "#1a1f2e", accent: "#f4a722", genre: "FPS" },
  { id: "fortnite", name: "Fortnite", emoji: "🏗️", color: "#0a1929", accent: "#00d4ff", genre: "Battle Royale" },
  { id: "nba2k", name: "NBA 2K", emoji: "🏀", color: "#1a1a2e", accent: "#f85f36", genre: "Sports" },
  { id: "fifa", name: "EA FC / FIFA", emoji: "⚽", color: "#0d3349", accent: "#00d2ff", genre: "Sports" },
  { id: "madden-nfl", name: "Madden NFL", emoji: "🏈", color: "#1a2a1a", accent: "#00843d", genre: "Sports" },
  { id: "wwe2k", name: "WWE 2K", emoji: "🤼", color: "#1a0a0a", accent: "#ffd700", genre: "Wrestling" },
  { id: "ufc", name: "UFC", emoji: "🥊", color: "#1a0a0a", accent: "#e63946", genre: "Fighting" },
  { id: "mario", name: "Super Mario", emoji: "🍄", color: "#c0392b", accent: "#f39c12", genre: "Platformer" },
  { id: "zelda", name: "Legend of Zelda", emoji: "🗡️", color: "#1a2a0a", accent: "#27ae60", genre: "Adventure" },
  { id: "pokemon", name: "Pokémon", emoji: "⚡", color: "#1a1a0a", accent: "#f4d03f", genre: "RPG" },
  { id: "league-of-legends", name: "League of Legends", emoji: "🏆", color: "#0a1a2a", accent: "#c89b3c", genre: "MOBA" },
  { id: "dota2", name: "Dota 2", emoji: "🔮", color: "#1a0a2a", accent: "#a855f7", genre: "MOBA" },
  { id: "pubg", name: "PUBG", emoji: "🪂", color: "#1a1400", accent: "#f0a500", genre: "Battle Royale" },
  { id: "apex-legends", name: "Apex Legends", emoji: "💥", color: "#1a0a0a", accent: "#ff6b35", genre: "Battle Royale" },
  { id: "overwatch", name: "Overwatch 2", emoji: "🦸", color: "#0a1a2a", accent: "#fa9c1e", genre: "Hero Shooter" },
  { id: "rocket-league", name: "Rocket League", emoji: "🚀", color: "#0a0a2a", accent: "#4fc3f7", genre: "Sports" },
  { id: "among-us", name: "Among Us", emoji: "🔴", color: "#1a0a1a", accent: "#e91e63", genre: "Social" },
  { id: "fall-guys", name: "Fall Guys", emoji: "🫘", color: "#2a1a0a", accent: "#ff9800", genre: "Party" },
  { id: "roblox", name: "Roblox", emoji: "🧱", color: "#1a1a1a", accent: "#e53935", genre: "Sandbox" },
  { id: "destiny2", name: "Destiny 2", emoji: "🌌", color: "#0a0a1a", accent: "#6a1de8", genre: "FPS" },
  { id: "halo", name: "Halo", emoji: "🪖", color: "#0a1a1a", accent: "#00bcd4", genre: "FPS" },
  { id: "god-of-war", name: "God of War", emoji: "⚔️", color: "#2a0a0a", accent: "#c0392b", genre: "Action" },
  { id: "spider-man", name: "Spider-Man", emoji: "🕷️", color: "#1a0a2a", accent: "#e53935", genre: "Action" },
  { id: "mortal-kombat", name: "Mortal Kombat", emoji: "💀", color: "#1a0a0a", accent: "#f44336", genre: "Fighting" },
  { id: "street-fighter", name: "Street Fighter", emoji: "👊", color: "#1a0a0a", accent: "#3f51b5", genre: "Fighting" },
  { id: "tekken", name: "Tekken", emoji: "🥋", color: "#0a0a1a", accent: "#2196f3", genre: "Fighting" },
  { id: "elden-ring", name: "Elden Ring", emoji: "💫", color: "#1a1400", accent: "#c8a84b", genre: "RPG" },
  { id: "dark-souls", name: "Dark Souls", emoji: "🔥", color: "#1a0a0a", accent: "#ff6f00", genre: "RPG" },
  { id: "witcher", name: "The Witcher", emoji: "🐺", color: "#1a1400", accent: "#8bc34a", genre: "RPG" },
  { id: "cyberpunk", name: "Cyberpunk 2077", emoji: "🌆", color: "#0a0a1a", accent: "#f7e716", genre: "RPG" },
  { id: "last-of-us", name: "The Last of Us", emoji: "🍄", color: "#0a1a0a", accent: "#8bc34a", genre: "Adventure" },
  { id: "red-dead", name: "Red Dead Redemption", emoji: "🤠", color: "#1a0a00", accent: "#bf360c", genre: "Open World" },
  { id: "assassins-creed", name: "Assassin's Creed", emoji: "🦅", color: "#0a0a1a", accent: "#f5f5f5", genre: "Action" },
  { id: "battlefield", name: "Battlefield", emoji: "💣", color: "#1a1200", accent: "#ff8f00", genre: "FPS" },
  { id: "rainbow-six", name: "Rainbow Six Siege", emoji: "🛡️", color: "#0a1a1a", accent: "#00bcd4", genre: "Tactical" },
  { id: "warzone", name: "Warzone", emoji: "☠️", color: "#0a0a1a", accent: "#78909c", genre: "Battle Royale" },
  { id: "2k-sports", name: "MLB The Show", emoji: "⚾", color: "#0a1a2a", accent: "#1565c0", genre: "Sports" },
  { id: "diablo", name: "Diablo", emoji: "👹", color: "#1a0000", accent: "#b71c1c", genre: "RPG" },
  { id: "world-of-warcraft", name: "World of Warcraft", emoji: "⚔️", color: "#0a0a2a", accent: "#33691e", genre: "MMO" },
  { id: "final-fantasy", name: "Final Fantasy", emoji: "💎", color: "#0a0a1a", accent: "#7986cb", genre: "RPG" },
  { id: "dragon-ball", name: "Dragon Ball FighterZ", emoji: "⚡", color: "#1a0a00", accent: "#ff9100", genre: "Fighting" },
  { id: "naruto-storm", name: "Naruto Storm", emoji: "🌀", color: "#1a0800", accent: "#ff6d00", genre: "Fighting" },
  { id: "nfs", name: "Need for Speed", emoji: "🏎️", color: "#0a0a1a", accent: "#00bfa5", genre: "Racing" },
  { id: "forza", name: "Forza Horizon", emoji: "🚘", color: "#0a1a2a", accent: "#29b6f6", genre: "Racing" },
  { id: "borderlands", name: "Borderlands", emoji: "🔫", color: "#1a1400", accent: "#f9a825", genre: "Looter Shooter" },
  { id: "genshin", name: "Genshin Impact", emoji: "🌸", color: "#0a0a1a", accent: "#ab47bc", genre: "RPG" },
];

function CommunityCard3D({ franchise, memberCount, isJoined, onJoin, onClick }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTilt({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden"
      style={{
        transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 0.1s ease-out",
        background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}dd)`,
        border: `2px solid ${franchise.accent}44`,
        boxShadow: `0 0 20px ${franchise.accent}22`,
      }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 35px ${franchise.accent}66` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Glow background */}
      <div className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(circle at 50% 30%, ${franchise.accent}, transparent 70%)` }} />

      <div className="relative p-4 flex flex-col gap-3">
        {/* Emoji logo */}
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ background: `${franchise.accent}22`, border: `1px solid ${franchise.accent}55` }}>
            {franchise.emoji}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}44` }}>
            {franchise.genre}
          </span>
        </div>

        <div>
          <h3 className="text-white font-black text-sm leading-tight">{franchise.name}</h3>
          <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" /> {memberCount > 0 ? memberCount.toLocaleString() : "0"} members
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onJoin(); }}
          className="w-full py-2 rounded-xl text-xs font-black transition-all"
          style={isJoined
            ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
            : { background: franchise.accent, color: "#fff" }
          }
        >
          {isJoined ? "✓ Joined" : "Join Community"}
        </button>
      </div>
    </motion.div>
  );
}

function CommunityModal({ franchise, user, profile, onClose }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [community, setCommunity] = useState(null);
  const admin = isAdmin(user?.email);

  useEffect(() => {
    loadData();
  }, [franchise.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [comms, members, postsData] = await Promise.all([
        base44.entities.GamingCommunity.filter({ franchise_id: franchise.id }),
        base44.entities.CommunityMember.filter({ franchise_id: franchise.id }),
        base44.entities.CommunityPost.filter({ franchise_id: franchise.id }),
      ]);
      setCommunity(comms[0] || null);
      setMemberCount(members.length);
      setPosts(postsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 30));
      if (user?.email) {
        setIsJoined(members.some(m => m.user_email === user.email));
      }
    } catch {}
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user) return;
    if (isJoined) {
      const existing = await base44.entities.CommunityMember.filter({ franchise_id: franchise.id, user_email: user.email });
      if (existing[0]) await base44.entities.CommunityMember.delete(existing[0].id);
      setIsJoined(false);
      setMemberCount(c => Math.max(0, c - 1));
    } else {
      let communityId = community?.id;
      if (!communityId) {
        const newComm = await base44.entities.GamingCommunity.create({
          franchise_id: franchise.id, name: franchise.name,
          color_primary: franchise.color, color_secondary: franchise.accent,
          genre: franchise.genre, member_count: 0,
        });
        communityId = newComm.id;
        setCommunity(newComm);
      }
      await base44.entities.CommunityMember.create({
        community_id: communityId, franchise_id: franchise.id,
        user_email: user.email, username: profile?.username || user.full_name,
        avatar_url: profile?.avatar_url || "",
      });
      setIsJoined(true);
      setMemberCount(c => c + 1);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user || !isJoined) return;
    setPosting(true);
    let communityId = community?.id;
    if (!communityId) {
      const newComm = await base44.entities.GamingCommunity.create({
        franchise_id: franchise.id, name: franchise.name,
        color_primary: franchise.color, color_secondary: franchise.accent,
        genre: franchise.genre,
      });
      communityId = newComm.id;
      setCommunity(newComm);
    }
    const post = await base44.entities.CommunityPost.create({
      community_id: communityId, franchise_id: franchise.id,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: newPost,
      likes: 0,
    });
    setPosts(prev => [post, ...prev]);
    setNewPost("");
    setPosting(false);
  };

  const handleAdminSize = async (delta) => {
    if (!admin || !community) return;
    await base44.entities.GamingCommunity.update(community.id, { member_count: Math.max(0, memberCount + delta) });
    setMemberCount(c => Math.max(0, c + delta));
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(0,0,0,0.9)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="w-full sm:max-w-2xl bg-gray-950 rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ border: `2px solid ${franchise.accent}44`, maxHeight: "90vh" }}
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${franchise.color}, ${franchise.color}aa)` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: `${franchise.accent}22`, border: `2px solid ${franchise.accent}55` }}>
            {franchise.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-white font-black text-xl">{franchise.name}</h2>
            <p className="text-white/60 text-sm flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> {memberCount.toLocaleString()} members
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${franchise.accent}22`, color: franchise.accent }}>{franchise.genre}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {admin && (
              <div className="flex items-center gap-1">
                <button onClick={() => handleAdminSize(-100)} className="w-7 h-7 rounded-lg bg-red-900/40 text-red-400 text-xs font-black hover:bg-red-900/70">−</button>
                <button onClick={() => handleAdminSize(100)} className="w-7 h-7 rounded-lg bg-green-900/40 text-green-400 text-xs font-black hover:bg-green-900/70">+</button>
                <span className="text-[9px] text-gray-600">Admin</span>
              </div>
            )}
            {user && (
              <button onClick={handleJoin}
                className="px-4 py-2 rounded-xl text-sm font-black transition-all"
                style={isJoined
                  ? { background: `${franchise.accent}22`, color: franchise.accent, border: `1px solid ${franchise.accent}55` }
                  : { background: franchise.accent, color: "#fff" }
                }>
                {isJoined ? "✓ Joined" : "+ Join"}
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Post input */}
        {user && isJoined && (
          <div className="px-5 py-3 border-b border-gray-800 flex gap-3 items-center">
            <input
              value={newPost} onChange={e => setNewPost(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePost()}
              placeholder={`Post in ${franchise.name} community...`}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
            <button onClick={handlePost} disabled={!newPost.trim() || posting}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-50"
              style={{ background: franchise.accent }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
        {user && !isJoined && (
          <div className="px-5 py-3 border-b border-gray-800 text-center text-gray-500 text-sm">
            Join this community to post
          </div>
        )}

        {/* Posts */}
        <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">{franchise.emoji}</p>
              <p className="text-gray-400 font-semibold">Be the first to post!</p>
              <p className="text-gray-600 text-sm mt-1">Join & share your thoughts about {franchise.name}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {posts.map(post => (
                <div key={post.id} className="px-5 py-4 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                    {post.author_username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-300 text-xs font-bold mb-0.5">{post.author_username}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>
                    <p className="text-gray-600 text-[10px] mt-1">{new Date(post.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GamingCommunity() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [memberCounts, setMemberCounts] = useState({});
  const [joinedIds, setJoinedIds] = useState(new Set());

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserProfile.filter({ user_email: user.email }).then(p => setProfile(p[0] || null));
      base44.entities.CommunityMember.filter({ user_email: user.email }).then(m => {
        setJoinedIds(new Set(m.map(x => x.franchise_id)));
      });
    }
    base44.entities.GamingCommunity.list().then(comms => {
      const counts = {};
      comms.forEach(c => { counts[c.franchise_id] = c.member_count || 0; });
      setMemberCounts(counts);
    });
  }, [user]);

  const genres = ["All", ...Array.from(new Set(TOP_FRANCHISES.map(f => f.genre)))];
  const filtered = TOP_FRANCHISES.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "All" || f.genre === selectedGenre;
    return matchSearch && matchGenre;
  });

  const handleJoinCard = async (franchise) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const already = joinedIds.has(franchise.id);
    if (already) {
      const existing = await base44.entities.CommunityMember.filter({ franchise_id: franchise.id, user_email: user.email });
      if (existing[0]) await base44.entities.CommunityMember.delete(existing[0].id);
      setJoinedIds(prev => { const n = new Set(prev); n.delete(franchise.id); return n; });
      setMemberCounts(prev => ({ ...prev, [franchise.id]: Math.max(0, (prev[franchise.id] || 0) - 1) }));
    } else {
      let comms = await base44.entities.GamingCommunity.filter({ franchise_id: franchise.id });
      let communityId = comms[0]?.id;
      if (!communityId) {
        const nc = await base44.entities.GamingCommunity.create({
          franchise_id: franchise.id, name: franchise.name,
          color_primary: franchise.color, color_secondary: franchise.accent, genre: franchise.genre,
        });
        communityId = nc.id;
      }
      await base44.entities.CommunityMember.create({
        community_id: communityId, franchise_id: franchise.id,
        user_email: user.email, username: profile?.username || user.full_name || "Gamer",
      });
      setJoinedIds(prev => new Set([...prev, franchise.id]));
      setMemberCounts(prev => ({ ...prev, [franchise.id]: (prev[franchise.id] || 0) + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      {/* Hero Banner */}
      <div className="relative pt-16 pb-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold mb-4">
              <Users className="w-3.5 h-3.5" /> Top 1000+ Gaming Communities
            </span>
            <h1 className="text-4xl sm:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Gaming Community
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Join communities for your favourite franchises · Post, connect & celebrate gaming culture
            </p>
          </motion.div>

          {/* Search */}
          <motion.div className="max-w-md mx-auto relative mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search franchises..."
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
          </motion.div>

          {/* Genre filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {genres.slice(0, 12).map(g => (
              <button key={g} onClick={() => setSelectedGenre(g)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={selectedGenre === g
                  ? { background: "#7c3aed", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }
                }>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">{filtered.length} communities</p>
          {!user && (
            <button onClick={() => base44.auth.redirectToLogin()}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              Sign In to Join
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((franchise, i) => (
            <CommunityCard3D
              key={franchise.id}
              franchise={franchise}
              memberCount={memberCounts[franchise.id] || 0}
              isJoined={joinedIds.has(franchise.id)}
              onJoin={() => handleJoinCard(franchise)}
              onClick={() => setSelectedFranchise(franchise)}
            />
          ))}
        </div>
      </div>

      {/* Community Modal */}
      <AnimatePresence>
        {selectedFranchise && (
          <CommunityModal
            franchise={selectedFranchise}
            user={user}
            profile={profile}
            onClose={() => setSelectedFranchise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}