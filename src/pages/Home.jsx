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


export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // After magic-link click, Base44 redirects back here with auth tokens in the URL.
    // Reload the page cleanly so AuthContext picks up the new session properly.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const hasToken = url.searchParams.has("token") || url.searchParams.has("access_token") || url.hash.includes("access_token");
      if (hasToken) {
        // Strip token params and do a hard reload so the SDK reads the new session
        url.searchParams.delete("token");
        url.searchParams.delete("access_token");
        url.hash = "";
        window.location.replace(url.toString());
      }
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          if (profiles.length > 0) {
            setProfile(profiles[0]);
          } else {
            // Auto-create minimal profile for existing users
            // Check for pending profile from registration
            let pendingProfile = {};
            try { pendingProfile = JSON.parse(localStorage.getItem("pending_profile") || "{}"); localStorage.removeItem("pending_profile"); } catch {}
            const newProfile = await base44.entities.UserProfile.create({
              user_email: me.email,
              username: pendingProfile.username || me.full_name || me.email.split('@')[0],
              display_name: pendingProfile.display_name || me.full_name || me.email.split('@')[0],
              account_type: pendingProfile.account_type || "regular",
              phone_number: pendingProfile.phone_number || "",
              preferred_otp_method: pendingProfile.preferred_otp_method || "email",
              honor_badge: pendingProfile.honor_badge || "founding_member",
              honor_badge_label: pendingProfile.honor_badge_label || "Founding Member",
              joined_date: new Date().toISOString(),
            });
            setProfile(newProfile);
          }
        }
      } catch (e) {
        // User not authenticated - stay on home page (public)
      }
    };
    initAuth();
  }, []);

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