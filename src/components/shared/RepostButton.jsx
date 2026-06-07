import React, { useState } from "react";
import { Repeat2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";

/**
 * RepostButton — reposts any listing/post/mod to the user's own profile feed.
 * Creates a new Listing record pointing back to the original.
 * 
 * Props:
 *   item: { id, title, images, description, price, category, seller_email, ... }
 *   type: "listing" | "post"
 *   user: current user
 *   profile: current user profile
 *   compact: boolean
 */
export default function RepostButton({ item, type = "listing", user, profile, compact = false }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRepost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (done || loading) return;
    setLoading(true);

    try {
      if (type === "listing") {
        // Repost listing: create a new listing credited to the reposter with repost attribution
        await base44.entities.Listing.create({
          seller_email: user.email,
          seller_username: profile?.username || user.full_name || "Gamer",
          title: `🔁 ${item.title}`,
          description: `Reposted from @${item.seller_username || "community"}\n\n${item.description || ""}`,
          price: item.price || 0,
          is_free: item.is_free || !item.price,
          category: item.category || "modding",
          product_type: item.product_type || "digital",
          images: item.images || [],
          tags: [...(item.tags || []), "repost"],
          community_franchise_id: item.community_franchise_id || "",
          status: "active",
          is_approved: true,
          download_url: item.download_url || "",
          external_link: item.external_link || item.id ? `/listing?id=${item.id}` : "",
        });
      } else {
        // Repost community post
        await base44.entities.CommunityPost.create({
          community_id: item.community_id || "",
          franchise_id: item.franchise_id || "",
          author_email: user.email,
          author_username: profile?.username || user.full_name || "Gamer",
          author_avatar: profile?.avatar_url || "",
          content: `🔁 Repost from @${item.author_username || "community"}:\n\n${item.content || ""}`,
          image_urls: item.image_urls || [],
          status: "active",
        });
      }
      setDone(true);
      setShowConfirm(false);
    } catch {}

    setLoading(false);
  };

  const iconSize = compact ? "w-3 h-3" : "w-3.5 h-3.5";
  const textSize = compact ? "text-[9px]" : "text-[10px]";

  return (
    <div className="relative inline-flex">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!done) setShowConfirm(v => !v); }}
        className={`flex items-center gap-0.5 ${textSize} transition-colors`}
        style={{ color: done ? "#a855f7" : "rgba(156,163,175,0.7)" }}
        title="Repost to your profile"
      >
        <Repeat2 className={iconSize} />
        {!compact && <span>{done ? "Reposted" : "Repost"}</span>}
      </button>

      <AnimatePresence>
        {showConfirm && !done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            className="absolute bottom-6 left-0 z-50 bg-gray-900 border border-purple-700/50 rounded-xl p-3 shadow-xl min-w-[160px]"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white text-xs font-bold mb-2">Repost to your profile?</p>
            <p className="text-gray-400 text-[10px] mb-3">This will appear on your channel.</p>
            <div className="flex gap-2">
              <button
                onClick={handleRepost}
                disabled={loading}
                className="flex-1 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                {loading ? "..." : "Repost"}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(false); }}
                className="px-2 py-1.5 rounded-lg text-gray-400 text-xs hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}