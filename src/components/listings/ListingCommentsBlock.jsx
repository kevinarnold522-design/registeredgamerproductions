import React from "react";
import { MessageCircle } from "lucide-react";
import CommentThread from "@/components/shared/CommentThread";
import { formatCount } from "@/lib/formatCounts";

export default function ListingCommentsBlock({ comments, commentKey, user, profile, listing, onRefresh }) {
  return (
    <div className="mt-12 rounded-3xl border border-purple-500/20 bg-gray-950/50 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-black text-white">Comments</h2>
        <span className="px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 text-xs font-bold">{formatCount(comments.length)}</span>
      </div>
      <CommentThread key={commentKey} comments={comments} user={user} profile={profile} postId={listing.id} onRefresh={onRefresh} />
    </div>
  );
}