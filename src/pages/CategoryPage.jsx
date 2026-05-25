import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import GenericCategoryPage from "@/components/category/GenericCategoryPage";
import BuySellLandingPage from "@/components/category/BuySellLandingPage";
import ContentLandingPage from "@/components/category/ContentLandingPage";
import SubcategoryLandingPage from "@/components/category/SubcategoryLandingPage.jsx";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          if (profiles.length > 0) setProfile(profiles[0]);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16">
        {/* If a specific subcategory is selected, render its own unique landing page */}
        {sub ? (
          <SubcategoryLandingPage
            user={user} profile={profile} cat={cat} sub={sub}
            parentCategoryName={categoryData?.label?.replace(/^[^ ]+ /, "") || cat}
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