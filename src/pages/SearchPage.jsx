import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GamerBrandFooter from "@/components/shared/GamerBrandFooter";
import HomeListingCard from "@/components/home/HomeListingCard";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import StickySearchBar from "@/components/shared/StickySearchBar";
import Pagination from "@/components/shared/Pagination";
import { CATEGORIES, isServiceListing } from "@/lib/constants";
import { useLocation } from "react-router-dom";
import BrandedLoadingScreen from "@/components/shared/BrandedLoadingScreen";

const PER_PAGE = 10;

export default function SearchPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").replace(/[<>]/g, "").trim();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.email) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          setProfile(profiles[0] || null);
        }
      } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!query) { setListings([]); setLoading(false); return; }
      const all = await base44.entities.Listing.filter({ status: "active" }, "-created_date");
      const q = query.toLowerCase();
      setListings(all.filter(l => {
        if (l.is_approved === false) return false;
        if (["premium_mods", "games", "paid_tools", "content_streaming"].includes(l.category) && isServiceListing(l)) return false;
        const text = `${l.title || ""} ${l.description || ""} ${l.category || ""} ${l.seller_username || ""} ${l.game_name || ""} ${l.tool_target_game || ""} ${(l.tags || []).join(" ")} ${(l.keywords || []).join(" ")} ${(l.subcategories || []).join(" ")}`.toLowerCase();
        return text.includes(q);
      }));
      setLoading(false);
    };
    load();
  }, [query]);

  const totalPages = Math.ceil(listings.length / PER_PAGE);
  const paged = listings.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
      <StickySearchBar />
      <GamerBrandFooter position="top" className="px-0 pt-0 pb-6" />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <p className="text-purple-300 text-xs font-black uppercase tracking-widest flex items-center gap-2"><Search className="w-3 h-3" /> Search Results</p>
          <h1 className="text-3xl font-black mt-2">{query ? `Results for “${query}”` : "Search listings"}</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} matching listing{listings.length === 1 ? "" : "s"}</p>
        </div>

        {loading ? (
          <BrandedLoadingScreen label="Loading Your Experience..." minHeight="22rem" />
        ) : paged.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl text-gray-500">No matching listings found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paged.map((l, idx) => (
                <HomeListingCard key={l.id} listing={l} user={user} profile={profile} index={idx} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </main>
    </div>
  );
}
