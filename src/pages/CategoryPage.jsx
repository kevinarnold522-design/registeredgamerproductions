import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import GenericCategoryPage from "@/components/category/GenericCategoryPage";
import BuySellLandingPage from "@/components/category/BuySellLandingPage";
import ContentLandingPage from "@/components/category/ContentLandingPage";
import SubcategoryLandingPage from "@/components/category/SubcategoryLandingPage";
import { CATEGORIES } from "@/lib/constants";
import StickySearchBar from "@/components/shared/StickySearchBar";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "react-router-dom";

export default function CategoryPage() {
  const { user, isLoadingAuth } = useAuth();
  const [profile, setProfile] = useState(null);

  // Read from the live location so query-string changes (cat / sub) re-render
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat") || "games";
  const sub = params.get("sub") || "";

  const categoryData = CATEGORIES.find(c => c.id === cat);

  useEffect(() => {
    if (!user?.email) { setProfile(null); return; }
    base44.entities.UserProfile.filter({ user_email: user.email }).then(profiles => {
      if (profiles.length > 0) setProfile(profiles[0]);
    });
  }, [user?.email]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-950 text-white relative z-10">
      {!isLoadingAuth && (user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />)}
      <StickySearchBar />
      <div className="pt-1">
        {/* If a specific subcategory is selected, render its own unique landing page */}
        {sub ? (
          <SubcategoryLandingPage
            user={user} profile={profile} cat={cat} sub={sub}
            parentCategoryName={categoryData?.label || cat}
          />
        ) : cat === "buy_sell" ? (
          <BuySellLandingPage user={user} profile={profile} sub={sub} />
        ) : cat === "content" || cat === "content_streaming" ? (
          <ContentLandingPage user={user} profile={profile} sub={sub} />
        ) : (
          <GenericCategoryPage user={user} profile={profile} cat={cat} sub={sub} categoryData={categoryData} />
        )}
      </div>
    </div>
  );
}
