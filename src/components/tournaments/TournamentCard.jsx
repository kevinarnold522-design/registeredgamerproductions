import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, ExternalLink, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TournamentCard({ tournament, user, profile, onUpdate }) {
  const [joining, setJoining] = useState(false);

  const participants = tournament.participants || [];
  const isParticipant = participants.some(p => p.email === user?.email);
  const isFull = participants.length >= (tournament.max_players || 16);
  const isUpcoming = tournament.status === "upcoming";
  const isActive = tournament.status === "active";

  const handleParticipate = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (isParticipant) return;
    setJoining(true);
    const updated = await base44.entities.Tournament.update(tournament.id, {
      participants: [...participants, {
        email: user.email,
        username: profile?.username || user.full_name,
        avatar: profile?.avatar_url || "",
        joined_at: new Date().toISOString(),
      }]
    });
    onUpdate?.(updated);
    setJoining(false);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Join the ${tournament.title} tournament on GAMER.Productions! 🏆`;
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const statusColors = {
    upcoming: "bg-blue-900/40 text-blue-300 border-blue-700/40",
    active: "bg-green-900/40 text-green-300 border-green-700/40",
    completed: "bg-gray-900/40 text-gray-400 border-gray-700/40",
    cancelled: "bg-red-900/40 text-red-300 border-red-700/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-700/50 transition-all group"
    >
      {/* Cover */}
      {tournament.cover_url ? (
        <div className="h-36 overflow-hidden relative">
          <img src={tournament.cover_url} alt={tournament.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[tournament.status]}`}>
            {tournament.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1 animate-pulse" />}
            {tournament.status?.toUpperCase()}
          </span>
        </div>
      ) : (
        <div className="h-28 flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #052e16, #14532d)" }}>
          <Trophy className="w-12 h-12 text-green-400 opacity-60" />
          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[tournament.status]}`}>
            {tournament.status?.toUpperCase()}
          </span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-white font-black text-base truncate mb-1">{tournament.title}</h3>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{tournament.game}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{tournament.game_platform}</span>
          {tournament.is_online
            ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300">🌐 Online</span>
            : <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-900/30 text-orange-300">📍 LAN</span>
          }
        </div>

        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            <span>{participants.length}/{tournament.max_players || 16} players</span>
            {tournament.prize_pool && <span className="ml-auto text-green-400 font-bold">🏆 {tournament.prize_pool}</span>}
          </div>
          {tournament.start_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
            </div>
          )}
          {!tournament.is_online && tournament.venue && (
            <div className="flex items-center gap-1.5">
              <span>📍</span><span className="line-clamp-1">{tournament.venue}</span>
            </div>
          )}
        </div>

        {/* Participant bar */}
        <div className="h-1.5 rounded-full bg-gray-800 mb-3 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
            style={{ width: `${Math.min(100, (participants.length / (tournament.max_players || 16)) * 100)}%` }} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {(isUpcoming || isActive) && (
            <button onClick={handleParticipate} disabled={joining || isParticipant || isFull}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                isParticipant ? "bg-green-900/30 text-green-400 border border-green-700/40" :
                isFull ? "bg-gray-800 text-gray-600 cursor-not-allowed" :
                "text-white hover:scale-[1.02]"
              }`}
              style={!isParticipant && !isFull ? { background: "linear-gradient(135deg, #16a34a, #059669)" } : {}}>
              {joining ? "..." : isParticipant ? "✓ Registered" : isFull ? "Full" : "Participate"}
            </button>
          )}
          {tournament.stream_link && (
            <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-red-900/30 border border-red-700/40 flex items-center justify-center text-red-400 hover:bg-red-900/50 transition-all flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={() => handleShare("facebook")}
            className="w-9 h-9 rounded-xl bg-blue-900/30 border border-blue-700/40 flex items-center justify-center text-blue-400 hover:bg-blue-900/50 transition-all flex-shrink-0">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Social links */}
        {(tournament.social_facebook || tournament.social_discord || tournament.social_youtube) && (
          <div className="flex gap-2 mt-2">
            {tournament.social_facebook && <a href={tournament.social_facebook} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">FB Group</a>}
            {tournament.social_discord && <a href={tournament.social_discord} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:underline">Discord</a>}
            {tournament.social_youtube && <a href={tournament.social_youtube} target="_blank" rel="noopener noreferrer" className="text-[10px] text-red-400 hover:underline">YouTube</a>}
          </div>
        )}
      </div>
    </motion.div>
  );
}