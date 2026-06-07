import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, TrendingUp, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/shared/UserAvatar";

export default function MemberLeaderboard({ franchiseId, accentColor }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all_time");

  useEffect(() => {
    if (!franchiseId) return;
    setLoading(true);
    loadLeaderboard();
  }, [franchiseId, timeframe]);

  const loadLeaderboard = async () => {
    try {
      // Get all community members
      const communityMembers = await base44.entities.CommunityMember.filter({ franchise_id: franchiseId });
      
      // Get all posts in this community
      const posts = await base44.entities.CommunityPost.filter({ franchise_id: franchiseId });
      
      // Calculate stats for each member
      const memberStats = await Promise.all(
        communityMembers.map(async (member) => {
          const memberPosts = posts.filter(p => p.author_email === member.user_email);
          const totalLikes = memberPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
          const totalComments = await base44.entities.PostComment.filter({ 
            franchise_id: franchiseId, 
            author_email: member.user_email 
          }).then(c => c.length);
          
          // Get user profile
          const profiles = await base44.entities.UserProfile.filter({ user_email: member.user_email });
          const profile = profiles[0];
          
          // Calculate score (weighted)
          const score = (memberPosts.length * 10) + (totalLikes * 5) + (totalComments * 3);
          
          return {
            ...member,
            profile,
            postCount: memberPosts.length,
            totalLikes,
            totalComments,
            score,
          };
        })
      );
      
      // Sort by score
      const sorted = memberStats.sort((a, b) => b.score - a.score);
      setMembers(sorted.slice(0, 20)); // Top 20
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      setMembers([]);
    }
    setLoading(false);
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold text-sm">{index + 1}</span>;
  };

  const getRankBadge = (index) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
    if (index === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (index === 2) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
    return "bg-gray-800/50 border-gray-700";
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3 h-12 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-black text-sm">🏆 Community Leaders</h3>
        </div>
        <select 
          value={timeframe} 
          onChange={e => setTimeframe(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-400 text-xs focus:outline-none focus:border-purple-500"
        >
          <option value="all_time">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
        </select>
      </div>

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-4">No members yet. Be the first!</p>
        ) : (
          members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all hover:scale-[1.02] ${getRankBadge(idx)}`}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {getRankIcon(idx)}
              </div>

              {/* Avatar */}
              <UserAvatar 
                avatarUrl={member.avatar_url || member.profile?.avatar_url} 
                username={member.username || member.profile?.username} 
                size={32} 
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-bold text-xs truncate">
                    {member.username || member.profile?.username || "Gamer"}
                  </p>
                  {member.is_moderator && (
                    <span className="text-[8px] px-1 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-black">
                      🛡
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> {member.postCount} posts
                  </span>
                  <span className="flex items-center gap-0.5">
                    ❤️ {member.totalLikes} likes
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <p className="text-white font-black text-sm" style={{ color: accentColor || "#a855f7" }}>
                  {member.score.toLocaleString()}
                </p>
                <p className="text-[9px] text-gray-600">points</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}