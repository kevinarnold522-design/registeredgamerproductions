import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Youtube, DollarSign, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VideoManagementTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.VideoPost.list("-created_date", 100);
      setVideos(data);
      setLoading(false);
    };
    load();
  }, []);

  const toggleMonetize = async (v) => {
    const updated = { ...v, is_monetized: !v.is_monetized };
    await base44.entities.VideoPost.update(v.id, { is_monetized: updated.is_monetized });
    setVideos(prev => prev.map(x => x.id === v.id ? updated : x));
  };

  const removeVideo = async (id) => {
    await base44.entities.VideoPost.update(id, { status: "removed" });
    setVideos(prev => prev.map(x => x.id === id ? { ...x, status: "removed" } : x));
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-5">Video Management ({videos.length})</h3>
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                {["Creator", "Title", "Views", "Earnings", "Monetized", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-gray-300 text-xs">@{v.creator_username}</td>
                  <td className="px-4 py-3 text-white text-xs font-medium max-w-[140px] truncate">{v.title}</td>
                  <td className="px-4 py-3 text-blue-400 text-xs font-bold">{(v.views || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-400 text-xs font-bold">${((v.views || 0) / 1000).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMonetize(v)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${v.is_monetized ? "bg-yellow-900/40 border border-yellow-700/50 text-yellow-300" : "bg-gray-800 border border-gray-700 text-gray-500 hover:text-white"}`}>
                      {v.is_monetized ? <><Star className="w-3 h-3" />🎮 Yes</> : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.status === "active" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.status !== "removed" && (
                      <button onClick={() => removeVideo(v.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}