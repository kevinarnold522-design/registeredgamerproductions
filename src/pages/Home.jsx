import React, { useState } from "react";
import SplashScreen from "@/components/home/SplashScreen";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import ServicesSection from "@/components/home/ServicesSection";
import CategoryCards from "@/components/home/CategoryCards";
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
          <HeroSection />
          <MarqueeTicker />
          <ServicesSection />
          <CategoryCards />
          <FeaturedGames />
          <TopGamingGear />
          <CommunitySection />
          <Footer />
        </>
      )}
    </div>
  );
}