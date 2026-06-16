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
import PaidModsSection from "@/components/home/PaidModsSection";
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
import ListingOfWeek from "@/components/home/ListingOfWeek";
import VerifiedBadgeBanner from "@/components/home/VerifiedBadgeBanner";
import First10KBanner from "@/components/home/First10KBanner";
import FirstLoginTutorial from "@/components/tutorial/FirstLoginTutorial";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showAdSign, setShowAdSign] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  useScrollReveal();

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeen = localStorage.getItem("has_seen_tutorial");
      if (!hasSeen) {
        setShowTutorial(true);
      }
    }
  }, [isAuthenticated, user?.email]);

  // Show tutorial for new users after splash
  useEffect(() => {
    if (!showSplash && isAuthenticated && user) {
      const hasSeenTutorial = localStorage.getItem("has_seen_tutorial");
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [showSplash, isAuthenticated, user?.email]);

  // Show "Sign in to block ads" sign for guests after 3 min (only after splash dismissed)
  useEffect(() => {
    if (showSplash || isAuthenticated) return;
    const t = setTimeout(() => setShowAdSign(true), 180000);
    return () => clearTimeout(t);
  }, [showSplash, isAuthenticated]);

  // Ad logic:
  // - During splash (showSplash=true): NEVER show ads
  // - 0-3 min after splash dismissed: no ads for anyone
  // - After 3 min: ads start for non-signed-in users only
  // - Signed-in users: ads permanently disabled
  useEffect(() => {
    // Always clean up ads for authenticated users
    if (isAuthenticated) {
      document.querySelectorAll("[data-zone]").forEach(el => el.remove());
      document.querySelectorAll("[data-ad-slot]").forEach(el => { el.style.display = "none"; });
      return;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Don't start ad timers during splash screen
    if (showSplash) return;
    // Signed-in users never see ads
    if (isAuthenticated) return;

    const injectBanner = (slot, style) => {
      const existing = document.querySelector(`[data-zone="${slot}"]`);
      if (existing) return;
      const el = document.createElement("div");
      el.setAttribute("data-zone", slot);
      el.style.cssText = style;
      document.body.appendChild(el);
    };

    // 3 min grace period, then ads start
    const t1 = setTimeout(() => {
      injectBanner("243750", "position:fixed;bottom:0;left:0;right:0;z-index:39;text-align:center;pointer-events:auto;");
      document.querySelectorAll("[data-ad-slot]").forEach(el => { el.style.display = "block"; });
    }, 180000);

    // 10 min: more ads
    const t2 = setTimeout(() => {
      injectBanner("243751", "position:fixed;bottom:80px;left:0;right:0;z-index:38;text-align:center;pointer-events:auto;");
      injectBanner("243752", "position:fixed;top:64px;right:8px;z-index:38;width:160px;text-align:center;pointer-events:auto;");
      injectBanner("243753", "position:fixed;top:64px;left:8px;z-index:38;width:160px;text-align:center;pointer-events:auto;");
    }, 600000);

    // 20 min: flood
    const t3 = setTimeout(() => {
      ["243754","243755","243756"].forEach((slot, i) => {
        injectBanner(slot, `position:fixed;top:${150 + i * 80}px;right:8px;z-index:37;width:200px;pointer-events:auto;`);
      });
    }, 1200000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAuthenticated, showSplash]);

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
  }, [isAuthenticated, user?.email]);

  return (
    <div className="min-h-screen text-white relative z-10">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          {showTutorial && user && <FirstLoginTutorial onComplete={() => setShowTutorial(false)} />}
          <div className="relative z-10">
            {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
            {showTutorial && user && <FirstLoginTutorial onComplete={() => setShowTutorial(false)} />}
            {user && <AIAssistBanner user={user} />}
            <VideoHeroBanner />
            <HeroSection />
            <CategoryCards />
            <MarqueeTicker />

            {/* GET VERIFIED BADGE — prominent top banner */}
            <VerifiedBadgeBanner />

            {/* First 10K Free Verified Badge promotion */}
            <First10KBanner user={user} profile={profile} />

            {/* Live Moving Dashboard (marketplace listings) */}
            <MovingDashboard currentUser={user} currentProfile={profile} />

            {/* Listing of the Week — right after marketplace listings */}
            <ListingOfWeek />

            {/* Content/Streaming - Merged */}
            <LiveStreamSection />
            <VideosSection />

            {/* How We Help */}
            <HowWeHelpSection />

            <PaidModsSection />
            <ModdingSection currentUser={user} currentProfile={profile} />
            <MonetizationBadge />
            <FeaturedGames />
            <CommunitySection />

            {/* What GAMER Productions is — moved to bottom above footer */}
            <BusinessModelSection />

            <Footer />
            <FeedbackWidget userEmail={user?.email} userName={user?.full_name} />
            <AdminLinkScanner userEmail={user?.email} />
            <DailyRewards user={user} profile={profile} />
            {user && <DailyRewardPopup user={user} />}
            <AdminApprovalPanel userEmail={user?.email} />
          </div>
        </>
      )}

      {/* "Sign in to block ads" floating sign — guests only, after 3 min, no close button */}
      {showAdSign && !isAuthenticated && (
        <div
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-700/60 text-xs font-bold text-purple-200 pointer-events-auto"
          style={{ background: "rgba(20,10,40,0.92)", backdropFilter: "blur(8px)", boxShadow: "0 0 18px rgba(124,58,237,0.4)" }}
        >
          <span className="inline-flex w-4 h-4 rounded-full bg-purple-600 items-center justify-center text-[10px]">GP</span> <a href="/register" className="text-purple-300 hover:text-white underline transition-colors">Sign in to block ads</a>
        </div>
      )}
    </div>
  );
}