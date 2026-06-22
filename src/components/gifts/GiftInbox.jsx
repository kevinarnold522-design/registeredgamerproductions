import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Gift as GiftIcon } from "lucide-react";

// Shows gifts a user has received, grouped by emoji with counts,
// plus the most recent senders. Live-updates via subscription.
export default function GiftInbox({ userEmail }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    let active = true;
    const load = () =>
      base44.entities.Gift.filter({ recipient_email: userEmail }, "-created_date", 100)
        .then((r) => { if (active) { setGifts(r); setLoading(false); } })
        .catch(() => { if (active) setLoading(false); });
    load();
    const unsub = base44.entities.Gift.subscribe((event) => {
      if (event?.data?.recipient_email === userEmail) load();
    });
    return () => { active = false; unsub && unsub(); };
  }, [userEmail]);

  if (loading || gifts.length === 0) return null;

  // Group by emoji for the showcase row
  const counts = {};
  gifts.forEach((g) => {
    const key = g.gift_emoji || "🎁";
    counts[key] = (counts[key] || 0) + 1;
  });

  return (
    <div className="mb-6 p-4 rounded-2xl bg-purple-900/20 border border-purple-700/30">
      <div className="flex items-center gap-2 mb-3">
        <GiftIcon className="w-4 h-4 text-pink-400" />
        <h3 className="text-white font-bold text-sm">Gifts Received</h3>
        <span className="text-purple-300 text-xs font-bold">{gifts.length}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(counts).map(([emoji, n]) => (
          <div key={emoji} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/50 border border-purple-700/40">
            <span className="text-lg">{emoji}</span>
            <span className="text-purple-200 text-xs font-black">×{n}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {gifts.slice(0, 5).map((g) => (
          <div key={g.id} className="flex items-center gap-2 text-xs">
            <span className="text-base">{g.gift_emoji}</span>
            <span className="text-gray-300">
              <span className="font-bold text-purple-200">{g.sender_username || "A gamer"}</span> sent a {g.gift_label}
            </span>
            {g.message && <span className="text-gray-500 truncate">— "{g.message}"</span>}
          </div>
        ))}
      </div>
    </div>
  );
}