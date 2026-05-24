import React, { useState } from "react";
import SplashScreen from "@/components/home/SplashScreen";
import Navbar from "@/components/home/Navbar";
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
import TopGamingGear from "@/components/home/TopGamingGear";
import CommunitySection from "@/components/home/CommunitySection";
import ShootingStars from "@/components/home/ShootingStars";
import Footer from "@/components/home/Footer";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          {/* Global shooting stars background */}
          <ShootingStars />

          <div className="relative z-10">
            <Navbar />
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
            <TopGamingGear />
            <CommunitySection />
            <Footer />
          </div>
        </>
      )}
    </div>
  );
}