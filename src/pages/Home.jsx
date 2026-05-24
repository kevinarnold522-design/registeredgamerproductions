import React, { useState } from "react";
import SplashScreen from "@/components/home/SplashScreen";
import Navbar from "@/components/home/Navbar";
import VideoHeroBanner from "@/components/home/VideoHeroBanner";
import HeroSection from "@/components/home/HeroSection";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import ServicesSection from "@/components/home/ServicesSection";
import CategoryCards from "@/components/home/CategoryCards";
import ModdingSection from "@/components/home/ModdingSection";
import MonetizationBadge from "@/components/home/MonetizationBadge";
import VideosSection from "@/components/home/VideosSection";
import HowWeHelpSection from "@/components/home/HowWeHelpSection";
import FeaturedGames from "@/components/home/FeaturedGames";
import TopGamingGear from "@/components/home/TopGamingGear";
import CommunitySection from "@/components/home/CommunitySection";
import Footer from "@/components/home/Footer";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          <Navbar />
          <VideoHeroBanner />
          <HeroSection />
          <MarqueeTicker />
          <HowWeHelpSection />
          <ServicesSection />
          <CategoryCards />
          <ModdingSection />
          <MonetizationBadge />
          <VideosSection />
          <FeaturedGames />
          <TopGamingGear />
          <CommunitySection />
          <Footer />
        </>
      )}
    </div>
  );
}