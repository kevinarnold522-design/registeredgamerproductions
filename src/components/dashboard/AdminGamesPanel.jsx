import React, { useState, useEffect } from "react";
import { Gamepad2, Star, Trash2, Pencil, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import IgnRatingBadge from "@/components/shared/IgnRatingBadge";
import { isServiceListing } from "@/lib/constants";

// Admin-only management of the Games category: edit IGN rating, remove, jump to full edit.
export default function AdminGamesPanel() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [ratingDraft, setRatingDraft] = useState("");

  useEffect(() => {
    base44.entities.Listing.filter({ category: "games" }, "-created_date", 200).then(l => {
      setGames(l.filter(x => !isServiceListing(x) && !x.modding_subcategory));
      setLoading(false);
    });
  }, []);

  const saveRating = async (id) => {
    const val = ratingDraft === "" ? null : Math.max(0, Math.min(10, parseFloat(ratingDraft)));
    await base44.entities.Listing.update(id, { ign_rating: val });
    setGames(prev => prev.map(g => g.id === id ? { ...g, ign_rating: val } : g));
    setEditingId(null);
    setRatingDraft("");
  };

  const removeGame = async (id) => {
    await base44.entities.Listing.update(id, { status: "removed" });
    setGames(prev => prev.filter(g => g.id !== id));
  };

  const filtered = games.filter(g =>
    !search || g.title?.toLowerCase().includes(search.toLowerCase()) || g.seller_username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-purple-400" /> Games Management ({games.length})
        </h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games..."
            className="bg-transparent text-white text-xs placeholder-gray-600 outline-none flex-1" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No game listings found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                {["Game", "Seller", "Price", "IGN Rating", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-semibold text-xs max-w-[180px] truncate flex items-center gap-2">
                    {g.images?.[0] && <img src={g.images[0]} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />}
                    {g.title}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{g.seller_username || g.seller_email}</td>
                  <td className="px-4 py-3 text-green-400 font-bold">{g.price === 0 ? "FREE" : `$${g.price?.toLocaleString()}`}</td>
                  <td className="px-4 py-3">
                    {editingId === g.id ? (
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="0" max="10" step="0.1" value={ratingDraft}
                          onChange={e => setRatingDraft(e.target.value)} placeholder="0-10"
                          className="bg-gray-800 border border-purple-500 rounded px-2 py-1 text-white text-xs w-16 focus:outline-none" />
                        <button onClick={() => saveRating(g.id)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-bold">Save</button>
                        <button onClick={() => { setEditingId(null); setRatingDraft(""); }} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">×</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(g.id); setRatingDraft(g.ign_rating != null ? String(g.ign_rating) : ""); }}
                        className="flex items-center gap-1.5 group">
                        {g.ign_rating != null ? <IgnRatingBadge rating={g.ign_rating} size="sm" /> : <span className="text-gray-600 text-xs">No rating</span>}
                        <Star className="w-3 h-3 text-gray-600 group-hover:text-yellow-400 transition-colors" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.status === "active" ? "bg-green-900/50 text-green-400" : g.status === "pending" ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <a href={`/create-listing?edit=${g.id}`} className="text-purple-400 hover:text-purple-300" title="Edit listing"><Pencil className="w-3.5 h-3.5" /></a>
                      {g.status !== "removed" && (
                        <button onClick={() => removeGame(g.id)} className="text-red-400 hover:text-red-300" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}