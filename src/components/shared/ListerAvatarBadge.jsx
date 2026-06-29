import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ListerAvatarBadge({ listing, size = "w-5 h-5", className = "" }) {
  const [avatarUrl, setAvatarUrl] = useState(listing?.seller_avatar || "");
  const fallback = (listing?.seller_username || listing?.seller_email || "G").trim().charAt(0).toUpperCase();

  useEffect(() => {
    let mounted = true;
    if (listing?.seller_avatar) {
      setAvatarUrl(listing.seller_avatar);
      return () => {
        mounted = false;
      };
    }

    if (!listing?.seller_email) {
      setAvatarUrl("");
      return () => {
        mounted = false;
      };
    }

    base44.entities.UserProfile
      .filter({ user_email: listing.seller_email })
      .then((rows) => {
        if (!mounted) return;
        setAvatarUrl(rows?.[0]?.avatar_url || "");
      })
      .catch(() => {
        if (mounted) setAvatarUrl("");
      });

    return () => {
      mounted = false;
    };
  }, [listing?.seller_avatar, listing?.seller_email]);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border border-purple-400/70 bg-gray-950/90 p-[2px] shadow-[0_0_12px_rgba(168,85,247,0.35)] ${className}`}
      style={{ clipPath: "circle(50% at 50% 50%)" }}
    >
      <div className={`overflow-hidden rounded-full bg-gradient-to-br from-purple-950 via-gray-900 to-fuchsia-950 ${size}`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-purple-200">
            {fallback}
          </div>
        )}
      </div>
    </div>
  );
}
