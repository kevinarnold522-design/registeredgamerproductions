import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";
import { Store, User } from "lucide-react";

/**
 * Shows seller username + verified badge under a listing card.
 * Fetches seller profile lazily.
 */
export default function ListingSellerBadge({ sellerEmail, sellerUsername }) {
  const [verified, setVerified] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!sellerEmail) return;
    base44.entities.UserProfile.filter({ user_email: sellerEmail }, "-created_date", 1)
      .then(profiles => {
        setVerified(profiles[0]?.is_verified || false);
        setAvatarUrl(profiles[0]?.avatar_url || "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [sellerEmail]);

  const name = sellerUsername || sellerEmail?.split("@")[0] || "Seller";

  return (
    <a
      href={`/channel?email=${encodeURIComponent(sellerEmail)}`}
      onClick={e => e.stopPropagation()}
      className="flex items-center gap-2 mt-2 group"
    >
      <span className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 border border-purple-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,.25)] flex-shrink-0">
        {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-300" />}
      </span>
      <span className="min-w-0 flex flex-col">
        <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"><Store className="w-2.5 h-2.5" /> Owner</span>
        <span className="text-gray-300 text-[11px] font-semibold group-hover:text-purple-400 transition-colors truncate max-w-[110px]">{name}</span>
      </span>
      {loaded && verified && (
        <VerifiedCheckmark size="sm" showLabel={false} showTooltip={true} label="Verified Partner" />
      )}
      {loaded && verified && (
        <span className="text-purple-400 text-[10px] font-bold whitespace-nowrap">Verified Partner</span>
      )}
    </a>
  );
}