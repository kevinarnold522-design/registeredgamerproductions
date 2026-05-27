import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import VerifiedCheckmark from "@/components/shared/VerifiedCheckmark";
import { Store } from "lucide-react";

/**
 * Shows seller username + verified badge under a listing card.
 * Fetches seller profile lazily.
 */
export default function ListingSellerBadge({ sellerEmail, sellerUsername }) {
  const [verified, setVerified] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!sellerEmail) return;
    base44.entities.UserProfile.filter({ user_email: sellerEmail }, "-created_date", 1)
      .then(profiles => {
        setVerified(profiles[0]?.is_verified || false);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [sellerEmail]);

  const name = sellerUsername || sellerEmail?.split("@")[0] || "Seller";

  return (
    <a
      href={`/channel?user=${encodeURIComponent(sellerEmail)}`}
      onClick={e => e.stopPropagation()}
      className="flex items-center gap-1.5 mt-2 group"
    >
      <Store className="w-3 h-3 text-gray-500 flex-shrink-0" />
      <span className="text-gray-400 text-[11px] font-semibold group-hover:text-purple-400 transition-colors truncate max-w-[90px]">
        {name}
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