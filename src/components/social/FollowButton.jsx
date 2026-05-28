import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FollowButton({ currentUserEmail, targetEmail, targetUsername, size = "sm" }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followId, setFollowId] = useState(null);

  useEffect(() => {
    if (!currentUserEmail || !targetEmail || currentUserEmail === targetEmail) {
      setLoading(false);
      return;
    }
    base44.entities.Follow.filter({ follower_email: currentUserEmail, following_email: targetEmail })
      .then(r => {
        if (r.length > 0) { setFollowing(true); setFollowId(r[0].id); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUserEmail, targetEmail]);

  if (!currentUserEmail || currentUserEmail === targetEmail) return null;

  const handleToggle = async () => {
    setLoading(true);
    if (following) {
      await base44.entities.Follow.delete(followId);
      // Decrement follower count
      const profiles = await base44.entities.UserProfile.filter({ user_email: targetEmail });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          followers_count: Math.max(0, (profiles[0].followers_count || 1) - 1),
        });
      }
      setFollowing(false);
      setFollowId(null);
    } else {
      const follow = await base44.entities.Follow.create({
        follower_email: currentUserEmail,
        following_email: targetEmail,
        following_username: targetUsername || "",
        source: "manual",
      });
      // Increment follower count
      const profiles = await base44.entities.UserProfile.filter({ user_email: targetEmail });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          followers_count: (profiles[0].followers_count || 0) + 1,
        });
      }
      setFollowing(true);
      setFollowId(follow.id);
    }
    setLoading(false);
  };

  const sizeClass = size === "sm"
    ? "px-3 py-1.5 text-xs rounded-lg gap-1.5"
    : "px-5 py-2.5 text-sm rounded-xl gap-2";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center font-bold transition-all ${sizeClass} ${
        following
          ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-red-900/30 hover:border-red-700/50 hover:text-red-300"
          : "bg-purple-600 hover:bg-purple-500 text-white"
      } disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`} />
      ) : following ? (
        <UserCheck className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      ) : (
        <UserPlus className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}