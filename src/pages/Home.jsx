import React, { useState, useEffect } from "react";
import SplashScreen from "@/components/home/SplashScreen";
import Navbar from "@/components/home/Navbar";
import AuthNavbar from "@/components/layout/AuthNavbar";
import VideoHeroBanner from "@/components/home/VideoHeroBanner";
import HeroSection from "@/components/home/HeroSection";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import CategoryCards from "@/components/home/CategoryCards";
import BusinessModelSection from "@/components/home/BusinessModelSection";
import MovingDashboard from "@/components/home/MovingDashboard";
import LiveStreamSection from "@/components/home/LiveStreamSection";
import HowWeHelpSection from "@/components/home/HowWeHelpSection";
import ServicesSection from "@/components/home/ServicesSection";
import ModdingSection from "@/components/home/ModdingSection";
import MonetizationBadge from "@/components/home/MonetizationBadge";
import VideosSection from "@/components/home/VideosSection";
import FeaturedGames from "@/components/home/FeaturedGames";
import CommunitySection from "@/components/home/CommunitySection";
import Footer from "@/components/home/Footer";
import AIAssistBanner from "@/components/home/AIAssistBanner";
import FeedbackWidget from "@/components/shared/FeedbackWidget";
import AdminLinkScanner from "@/components/admin/AdminLinkScanner";
import DailyRewards from "@/components/rewards/DailyRewards";
import DailyRewardPopup from "@/components/rewards/DailyRewardPopup";
import AdminApprovalPanel from "@/components/community/AdminApprovalPanel";
import VerifiedBadgeBanner from "@/components/home/VerifiedBadgeBanner";
import First10KBanner from "@/components/home/First10KBanner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState(null);
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  useScrollReveal();

  // Ad injection schedule for non-signed-in users:
  // 0-4 min: no ads (grace period)
  // 4 min: ads start
  // 10 min: 3 ads simultaneously
  // 20 min: all ads flood
  useEffect(() => {
    if (isAuthenticated || window.__adminBlocked) return;

    const injectBanner = (slot, style) => {
      if (window.__adminBlocked) return;
      const el = document.createElement("div");
      el.setAttribute("data-zone", slot);
      el.style.cssText = style;
      document.body.appendChild(el);
    };

    // 4 min: first ad appears
    const t1 = setTimeout(() => {
      injectBanner("243750", "position:fixed;bottom:0;left:0;right:0;z-index:39;text-align:center;pointer-events:auto;");
      document.querySelectorAll("[data-ad-slot]").forEach(el => { el.style.display = "block"; });
    }, 240000);

    // 10 min: 3 ads at once
    const t2 = setTimeout(() => {
      injectBanner("243751", "position:fixed;bottom:80px;left:0;right:0;z-index:38;text-align:center;pointer-events:auto;");
      injectBanner("243752", "position:fixed;top:64px;right:8px;z-index:38;width:160px;text-align:center;pointer-events:auto;");
      injectBanner("243753", "position:fixed;top:64px;left:8px;z-index:38;width:160px;text-align:center;pointer-events:auto;");
    }, 600000);

    // 20 min: full ad flood
    const t3 = setTimeout(() => {
      window.__adsHeld = false;
      ["243754","243755","243756"].forEach((slot, i) => {
        injectBanner(slot, `position:fixed;top:${150 + i * 80}px;right:8px;z-index:37;width:200px;pointer-events:auto;`);
      });
    }, 1200000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAuthenticated]);

  // Load or auto-create user profile once auth is confirmed
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          // Check if there's a pending profile from manual sign-up
          let pendingProfile = {};
          try { pendingProfile = JSON.parse(localStorage.getItem("pending_profile") || "{}"); localStorage.removeItem("pending_profile"); } catch {}
          // If signed in via Google with no pending profile, show setup prompt
          const needsSetup = !pendingProfile.username;
          const newProfile = await base44.entities.UserProfile.create({
            user_email: user.email,
            username: pendingProfile.username || user.full_name?.toLowerCase().replace(/\s+/g, "") || user.email.split('@')[0],
            display_name: pendingProfile.display_name || user.full_name || user.email.split('@')[0],
            account_type: pendingProfile.account_type || "regular",
            phone_number: pendingProfile.phone_number || "",
            preferred_otp_method: pendingProfile.preferred_otp_method || "email",
            honor_badge: pendingProfile.honor_badge || "founding_member",
            honor_badge_label: pendingProfile.honor_badge_label || "Founding Member",
            joined_date: new Date().toISOString(),
            needs_setup: needsSetup,
          });
          setProfile(newProfile);
          // Redirect new Google users to complete their profile
          if (needsSetup) {
            window.location.href = "/channel?setup=1";
          }
        }
      } catch {}
    };
    loadProfile();
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen text-white relative z-10">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          <div className="relative z-10">
            {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
            {user && <AIAssistBanner user={user} />}
            <VideoHeroBanner />
            <HeroSection />
            <MarqueeTicker />

            {/* GET VERIFIED BADGE — prominent top banner */}
            <VerifiedBadgeBanner />

            {/* First 10K Free Verified Badge promotion */}
            <First10KBanner user={user} profile={profile} />

            {/* Categories moved up — prominent position */}
            <CategoryCards />

            {/* What GAMER Productions is */}
            <BusinessModelSection />

            {/* Live Moving Dashboard */}
            <MovingDashboard />

            {/* Live Streaming Tools */}
            <LiveStreamSection />

            {/* How We Help */}
            <HowWeHelpSection />

            <ServicesSection />
            <ModdingSection />
            <MonetizationBadge />
            <VideosSection />
            <FeaturedGames />
            <CommunitySection />
            <Footer />
            <FeedbackWidget userEmail={user?.email} userName={user?.full_name} />
            <AdminLinkScanner userEmail={user?.email} />
            <DailyRewards user={user} profile={profile} />
            {user && <DailyRewardPopup user={user} />}
            <AdminApprovalPanel userEmail={user?.email} />
          </div>
        </>
      )}
    </div>
  );
}