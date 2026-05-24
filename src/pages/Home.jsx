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
import ShootingStars from "@/components/home/ShootingStars";
import Footer from "@/components/home/Footer";
import { base44 } from "@/api/base44Client";


export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

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
            const newProfile = await base44.entities.UserProfile.create({
              user_email: me.email,
              username: me.full_name || me.email.split('@')[0],
              display_name: me.full_name || me.email.split('@')[0],
              account_type: "regular",
              joined_date: new Date().toISOString(),
            });
            setProfile(newProfile);
          }
        }
      } catch (e) {
        // User not authenticated
      }
    };
    initAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          {/* Global shooting stars background */}
          <ShootingStars />

          <div className="relative z-10">
            {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
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
          </div>
        </>
      )}
    </div>
  );
}