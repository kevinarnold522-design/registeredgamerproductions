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
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState(null);
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  // Load or auto-create user profile once auth is confirmed
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          let pendingProfile = {};
          try { pendingProfile = JSON.parse(localStorage.getItem("pending_profile") || "{}"); localStorage.removeItem("pending_profile"); } catch {}
          const newProfile = await base44.entities.UserProfile.create({
            user_email: user.email,
            username: pendingProfile.username || user.full_name || user.email.split('@')[0],
            display_name: pendingProfile.display_name || user.full_name || user.email.split('@')[0],
            account_type: pendingProfile.account_type || "regular",
            phone_number: pendingProfile.phone_number || "",
            preferred_otp_method: pendingProfile.preferred_otp_method || "email",
            honor_badge: pendingProfile.honor_badge || "founding_member",
            honor_badge_label: pendingProfile.honor_badge_label || "Founding Member",
            joined_date: new Date().toISOString(),
          });
          setProfile(newProfile);
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
          </div>
        </>
      )}
    </div>
  );
}