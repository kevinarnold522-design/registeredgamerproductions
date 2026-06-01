import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Download, Star } from "lucide-react";
import ModReviewModal from "@/components/shared/ModReviewModal";

const MODDING_SUBCATEGORIES = [
  "WWE2K", "Football Life", "GTA 4", "GTA 5", "GTA SA",
  "Android", "PES", "FIFA", "NBA2K", "PPSSPP/PSP", "PS2", "PC",
];

export default function ModdingSection() {
  const [mods, setMods] = useState([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [reviewMod, setReviewMod] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        base44.auth.me().then(me => {
          setUser(me);
          if (me) base44.entities.UserProfile.filter({ user_email: me.email }).then(p => p.length > 0 && setProfile(p[0]));
        });
      }
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Listing.filter({ category: "modding", status: "active" }, "-created_date", 12);
        setMods(data);
        // Total downloads = sum of all views (as proxy for downloads) for real data
        const total = data.reduce((sum, m) => sum + (m.views || 0), 0);
        setTotalDownloads(total);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeFilter === "All" ? mods : mods.filter(m => m.subcategory === activeFilter);

  return (
    <section id="modding" className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-wider mb-1">Modding Community</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              🔧 Mods &{" "}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Downloads</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Premium and free mods by our community</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-900/20 border border-orange-700/30 rounded-xl px-4 py-2.5">
            <Download className="w-4 h-4 text-orange-400" />
            <div>
              <span className="text-orange-400 font-black text-lg">{totalDownloads > 0 ? totalDownloads.toLocaleString() : "0"}</span>
              <p className="text-gray-500 text-xs">Total Downloads</p>
            </div>
          </div>
        </div>

        {/* Subcategory Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {["All", ...MODDING_SUBCATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeFilter === cat ? "bg-orange-500/20 border border-orange-500/50 text-orange-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="text-5xl mb-4">🔧</div>
            <p className="text-gray-400 font-semibold">No mods listed yet{activeFilter !== "All" ? ` for ${activeFilter}` : ""}</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to upload a mod for this game!</p>
            <a href="/register" className="inline-flex mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
              Upload Your Mod
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((mod, i) => (
              <motion.a key={mod.id} href={`/listing?id=${mod.id}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-700/50 transition-colors group block">
                <div className="relative h-36">
                  {mod.images?.[0] ? (
                    <img src={mod.images[0]} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800">🔧</div>
                  )}
                  {mod.is_premium && (
                    <span className="absolute top-2 left-2 text-xs font-bold bg-yellow-500/90 text-black px-2 py-0.5 rounded-full">⭐ Premium</span>
                  )}
                  {mod.price === 0 && (
                    <span className="absolute top-2 right-2 text-xs font-bold bg-green-500/90 text-black px-2 py-0.5 rounded-full">FREE</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-orange-400 text-xs font-semibold mb-0.5">{mod.subcategory}</p>
                  <h3 className="text-white font-bold text-sm truncate">{mod.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`font-black text-sm ${mod.price === 0 || mod.is_free ? "text-green-400" : "text-yellow-400"}`}>
                      {mod.price === 0 || mod.is_free ? "FREE" : `₱${mod.price?.toLocaleString()}`}
                    </span>
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <Download className="w-3 h-3" />{mod.views || 0}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">by @{mod.seller_username}</p>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReviewMod(mod); }}
                    className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    <Star className="w-3 h-3" /> Reviews
                  </button>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
            🔧 Upload & Sell Your Mods
          </a>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewMod && (
          <ModReviewModal
            listing={reviewMod}
            user={user}
            profile={profile}
            onClose={() => setReviewMod(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}