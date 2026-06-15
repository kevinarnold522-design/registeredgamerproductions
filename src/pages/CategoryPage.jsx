import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import GenericCategoryPage from "@/components/category/GenericCategoryPage";
import BuySellLandingPage from "@/components/category/BuySellLandingPage";
import ContentLandingPage from "@/components/category/ContentLandingPage";
import SubcategoryLandingPage from "@/components/category/SubcategoryLandingPage";
import { CATEGORIES } from "@/lib/constants";
import RecommendModal from "@/components/shared/RecommendModal";

export default function CategoryPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat") || "games";
  const sub = params.get("sub") || "";

  const categoryData = CATEGORIES.find(c => c.id === cat);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          base44.entities.UserProfile.filter({ user_email: me.email }).then(profiles => {
            if (profiles.length > 0) setProfile(profiles[0]);
          });
        }
      } catch {}
      setAuthLoaded(true);
    };
    init();
  }, []);

  const [showRecommend, setShowRecommend] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative z-10">
      {/* Show correct navbar based on auth state; show guest navbar until auth check completes */}
      {authLoaded && user ? (
        <AuthNavbar user={user} profile={profile} />
      ) : (
        <Navbar />
      )}
      {/* Recommend Category bar */}
      <div className="pt-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-end pt-3">
          <button onClick={() => setShowRecommend(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-purple-700/50 text-purple-300 hover:bg-purple-900/20 transition-colors">
            Recommend Category
          </button>
        </div>
      </div>
      {showRecommend && (
        <RecommendModal type="category" parentCategory={cat} user={user} profile={profile} onClose={() => setShowRecommend(false)} />
      )}
      <div className="pt-2">
        {/* If a specific subcategory is selected, render its own unique landing page */}
        {sub ? (
          <SubcategoryLandingPage
            user={user} profile={profile} cat={cat} sub={sub}
            parentCategoryName={categoryData?.label || cat}
          />
        ) : cat === "buy_sell" ? (
          <BuySellLandingPage user={user} profile={profile} sub={sub} />
        ) : cat === "content" ? (
          <ContentLandingPage user={user} profile={profile} sub={sub} />
        ) : (
          <GenericCategoryPage user={user} profile={profile} cat={cat} sub={sub} categoryData={categoryData} />
        )}
      </div>
    </div>
  );
}