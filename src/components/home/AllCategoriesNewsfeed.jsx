import React, { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import ListingEngagementBar from "@/components/community/ListingEngagementBar";
import { formatListingPrice } from "@/lib/currency";
import ListingImageFrame from "@/components/listings/ListingImageFrame";
import DownloadHostBadge from "@/components/shared/DownloadHostBadge";
import ListerAvatarBadge from "@/components/shared/ListerAvatarBadge";
import { getActiveListings, peekActiveListings } from "@/lib/homeDataCache";

const PER_PAGE = 8;

// Single newsfeed for ALL categories — pulls every previous listing from the
// Cloudflare database, newest first, paginated 1..10.
export default function AllCategoriesNewsfeed({ user, profile }) {
  const [listings, setListings] = useState(() => peekActiveListings());
  const [loading, setLoading] = useState(() => peekActiveListings().length === 0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setListings(peekActiveListings());
        const active = await getActiveListings();
        setListings(Array.isArray(active) ? active : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Unlimited pages — grows as more listings are added (starts at 1..10, then keeps going).
  const totalPages = Math.max(1, Math.ceil(listings.length / PER_PAGE));
  const startIdx = (page - 1) * PER_PAGE;
  const pageItems = listings.slice(startIdx, startIdx + PER_PAGE);

  return (
    <div className="rounded-2xl border border-purple-700/40 bg-gray-900/70 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/50 to-gray-900">
        <Newspaper className="w-5 h-5 text-purple-300" />
        <div>
          <h3 className="text-white font-black text-sm">Newsfeed</h3>
          <p className="text-gray-500 text-[10px]">All categories · latest listings</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading newsfeed...</div>
      ) : pageItems.length === 0 ? (
        <div className="py-12 text-center text-gray-600 text-sm">No listings yet</div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {pageItems.map(item => (
            <a key={item.id} href={`/listing?id=${item.id}`} className="flex gap-3 p-3 hover:bg-purple-950/20 transition-colors">
              <div className="relative w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                {item.images?.[0] ? <ListingImageFrame src={item.images[0]} alt="" className="w-full h-full" foregroundClassName="w-full h-full object-contain p-1.5" backgroundClassName="w-full h-full object-cover scale-110 blur-lg opacity-35" /> : <div className="w-full h-full flex items-center justify-center text-xl">🎮</div>}
                <ListerAvatarBadge listing={item} size="w-[18px] h-[18px]" className="absolute bottom-1 right-1" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-xs truncate">{item.title}</p>
                {item.category && <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-[8px] font-black text-purple-200 capitalize">{String(item.category).replace(/_/g, " ")}</span>}
                {item.download_host && <div className="mt-1"><DownloadHostBadge host={item.download_host} size="sm" /></div>}
                <p className="text-purple-300 text-xs font-black mt-1">{item.is_free || !item.price ? "FREE" : formatListingPrice(item.price, item.currency)}</p>
                <div className="mt-1"><ListingEngagementBar listing={item} user={user} profile={profile} compact hideReport /></div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Page numbers — starts 1..10, grows unlimited as listings evolve (windowed) */}
      {!loading && totalPages > 1 && (() => {
        const start = Math.max(1, Math.min(page - 4, totalPages - 9));
        const end = Math.min(totalPages, start + 9);
        const nums = [];
        for (let i = start; i <= end; i++) nums.push(i);
        const numBtn = (p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-all ${p === page ? "bg-purple-600 text-white border border-purple-500" : "bg-gray-900 border border-gray-700 text-gray-300 hover:border-purple-500/50"}`}
          >
            {p}
          </button>
        );
        return (
          <div className="flex items-center justify-center gap-1.5 flex-wrap px-3 py-3 border-t border-gray-800/60">
            {start > 1 && (<>{numBtn(1)}{start > 2 && <span className="text-gray-600 text-xs">…</span>}</>)}
            {nums.map(numBtn)}
            {end < totalPages && (<>{end < totalPages - 1 && <span className="text-gray-600 text-xs">…</span>}{numBtn(totalPages)}</>)}
          </div>
        );
      })()}
    </div>
  );
}
