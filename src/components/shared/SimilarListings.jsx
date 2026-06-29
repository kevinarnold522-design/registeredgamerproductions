import React, { useState, useEffect } from "react";
import { Eye, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isServiceListing } from "@/lib/constants";
import ListingImageFrame from "@/components/listings/ListingImageFrame";

export default function SimilarListings({ listing, compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listing?.id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const out = [];
      const seen = new Set([listing.id]);
      const blocked = ["premium_mods", "games", "paid_tools", "content_streaming"].includes(listing.category);
      const add = (arr) => {
        arr.filter(l => !seen.has(l.id) && l.status === "active" && l.is_approved !== false && (!blocked || !isServiceListing(l)))
          .forEach(l => { if (out.length < 8) { seen.add(l.id); out.push(l); } });
      };
      const sortNewest = (arr) => [...arr].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      try {
        if (listing.seller_email) add(sortNewest(await base44.entities.Listing.filter({ seller_email: listing.seller_email, status: "active" }, "-created_date", 20)));
        if (out.length < 8 && listing.category) add(sortNewest(await base44.entities.Listing.filter({ category: listing.category, status: "active" }, "-created_date", 50)));
        if (out.length < 8) add(sortNewest(await base44.entities.Listing.filter({ status: "active" }, "-created_date", 50)));
      } catch {}
      if (!cancelled) { setItems(out.slice(0, 8)); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [listing?.id, listing?.category, listing?.seller_email]);

  if (loading) return <div className="grid grid-cols-2 gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />)}</div>;
  if (items.length === 0) return null;

  return (
    <div className={compact ? "mt-2" : "mt-12"}>
      <h2 className="text-lg font-black text-white mb-3">Similar Listings</h2>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 sm:grid-cols-4 gap-3"}>
        {items.map((l) => {
          const free = !l.price || l.price === 0 || l.is_free;
          return (
            <a key={l.id} href={`/listing?id=${l.id}`} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-purple-500/60 transition-all">
              <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden relative">
                {l.images?.[0] ? <ListingImageFrame src={l.images[0]} alt={l.title} className="w-full h-full" foregroundClassName="w-full h-full object-contain p-2" /> : <Play className="w-8 h-8 text-gray-700" />}
                <span className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 text-[9px] font-bold"><Eye className="w-2.5 h-2.5" />{(l.views || 0).toLocaleString()}</span>
              </div>
              <div className="p-2">
                <p className="text-white text-xs font-bold truncate">{l.title}</p>
                <p className="text-purple-400 text-xs font-black mt-0.5">{free ? "FREE" : `$${l.price?.toLocaleString()}`}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
