import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isServiceListing } from "@/lib/constants";

// Shows at least 10 similar listings. Matches by subcategory/tags first,
// then falls back to the broader parent category to fill remaining slots.
export default function SimilarListings({ listing }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listing?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const out = [];
      const seen = new Set([listing.id]);

      const listingTags = new Set([...(listing.tags || []), ...(listing.keywords || [])].map(t => String(t).toLowerCase()));
      const serviceBlocked = ["premium_mods", "games", "paid_tools", "content_streaming"].includes(listing.category);
      const score = (l) => {
        let total = 0;
        const subs = new Set([...(l.subcategories || []), l.digital_subcategory, l.physical_subcategory, l.modding_subcategory].filter(Boolean));
        const currentSubs = [ ...(listing.subcategories || []), listing.digital_subcategory, listing.physical_subcategory, listing.modding_subcategory ].filter(Boolean);
        if (currentSubs.some(s => subs.has(s))) total += 5;
        for (const tag of [...(l.tags || []), ...(l.keywords || [])]) if (listingTags.has(String(tag).toLowerCase())) total += 2;
        if (l.category === listing.category) total += 1;
        return total;
      };
      const push = (arr) => {
        const sorted = [...arr]
          .filter(l => !seen.has(l.id) && l.status === "active" && l.is_approved !== false && (!serviceBlocked || !isServiceListing(l)))
          .sort((a, b) => score(b) - score(a) || new Date(b.created_date) - new Date(a.created_date));
        for (const l of sorted) {
          if (out.length >= 10) break;
          seen.add(l.id);
          out.push(l);
        }
      };

      try {
        const primarySub = listing.modding_subcategory || listing.digital_subcategory || listing.physical_subcategory || listing.subcategories?.[0];
        if (primarySub) {
          const a = await base44.entities.Listing.filter({ status: "active" }, "-created_date", 80);
          push(a.filter(x => [ ...(x.subcategories || []), x.digital_subcategory, x.physical_subcategory, x.modding_subcategory ].filter(Boolean).includes(primarySub)));
        }
        if (out.length < 10 && listing.category) {
          const b = await base44.entities.Listing.filter({ category: listing.category, status: "active" }, "-created_date", 40);
          push(b);
        }
        // 3. Fallback: newest active listings overall
        if (out.length < 10) {
          const c = await base44.entities.Listing.filter({ status: "active" }, "-created_date", 50);
          push(c);
        }
      } catch {}

      if (!cancelled) {
        setItems(out.slice(0, 10));
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [listing?.id, listing?.category, listing?.modding_subcategory]);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-40 h-48 flex-shrink-0 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-black text-white mb-4">Similar Listings</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x scroll-smooth" style={{ WebkitOverflowScrolling: "touch" }}>
       {items.slice(0, 10).map((l) => {
          const free = !l.price || l.price === 0 || l.is_free;
          return (
            <a
              key={l.id}
              href={`/listing?id=${l.id}`}
              className="w-40 flex-shrink-0 snap-start rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-purple-500/60 transition-all"
            >
              <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
                {l.images?.[0]
                ? <img src={l.images[0]} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
                : <Play className="w-8 h-8 text-gray-700" />}
              </div>
              <div className="p-2">
                <p className="text-white text-xs font-bold truncate">{l.title}</p>
                <p className="text-purple-400 text-xs font-black mt-0.5">{free ? "FREE" : `₱${l.price?.toLocaleString()}`}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}