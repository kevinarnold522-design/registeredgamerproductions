import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

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

      const push = (arr) => {
        for (const l of arr) {
          if (out.length >= 10) break;
          if (seen.has(l.id) || l.status === "removed") continue;
          seen.add(l.id);
          out.push(l);
        }
      };

      try {
        // 1. Same modding subcategory / franchise (highest relevance)
        if (listing.modding_subcategory) {
          const a = await base44.entities.Listing.filter({ modding_subcategory: listing.modding_subcategory, status: "active" }, "-created_date", 30);
          push(a);
        }
        // 2. Same category
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
        {items.map((l) => {
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
                  : <span className="text-3xl">🎮</span>}
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