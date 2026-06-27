import React, { useState, useEffect, Suspense, lazy } from "react";
import SplashScreen from "@/components/home/SplashScreen";
import Navbar from "@/components/home/Navbar";
import AuthNavbar from "@/components/layout/AuthNavbar";
import VideoHeroBanner from "@/components/home/VideoHeroBanner";
import HeroSection from "@/components/home/HeroSection";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import { InlineFloatingNewsfeed } from "@/components/home/FloatingNewsfeed";
import CategoryCards from "@/components/home/CategoryCards";
import AIAssistBanner from "@/components/home/AIAssistBanner";
import GamerSocialsBar from "@/components/shared/GamerSocialsBar";
import GuestAuthDock from "@/components/home/GuestAuthDock";
import HeyGamerWelcomeModal from "@/components/home/HeyGamerWelcomeModal";
import HeyGamerBanner from "@/components/home/HeyGamerBanner";
import { isNewJoiner } from "@/lib/isNewJoiner";
import { Gamepad2, Wrench, Cloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import useScrollReveal from "@/hooks/useScrollReveal";

// Retry a lazy import once on chunk-load failure (recovers from stale
// Vite chunks after a deploy instead of crashing the page).
const lazyWithRetry = (importer) =>
  lazy(() =>
    importer().catch((err) => {
      if (!sessionStorage.getItem("chunk_reloaded")) {
        sessionStorage.setItem("chunk_reloaded", "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw err;
    })
  );

// Below-the-fold sections are lazy-loaded so the page paints faster
const BusinessModelSection = lazyWithRetry(() => import("@/components/home/BusinessModelSection"));
const MovingDashboard = lazyWithRetry(() => import("@/components/home/MovingDashboard"));
const LiveStreamSection = lazyWithRetry(() => import("@/components/home/LiveStreamSection"));
const PaidModsSection = lazyWithRetry(() => import("@/components/home/PaidModsSection"));
const ModdingSection = lazyWithRetry(() => import("@/components/home/ModdingSection"));
const MonetizationBadge = lazyWithRetry(() => import("@/components/home/MonetizationBadge"));
const VideosSection = lazyWithRetry(() => import("@/components/home/VideosSection"));
const FeaturedGames = lazyWithRetry(() => import("@/components/home/FeaturedGames"));
const CommunitySection = lazyWithRetry(() => import("@/components/home/CommunitySection"));
const Footer = lazyWithRetry(() => import("@/components/home/Footer"));
const FeedbackWidget = lazyWithRetry(() => import("@/components/shared/FeedbackWidget"));
const AdminLinkScanner = lazyWithRetry(() => import("@/components/admin/AdminLinkScanner"));
const DailyRewards = lazyWithRetry(() => import("@/components/rewards/DailyRewards"));
const DailyRewardPopup = lazyWithRetry(() => import("@/components/rewards/DailyRewardPopup"));
const AdminApprovalPanel = lazyWithRetry(() => import("@/components/community/AdminApprovalPanel"));
const ListingOfWeek = lazyWithRetry(() => import("@/components/home/ListingOfWeek"));
const VerifiedBadgeBanner = lazyWithRetry(() => import("@/components/home/VerifiedBadgeBanner"));
const First10KBanner = lazyWithRetry(() => import("@/components/home/First10KBanner"));
const FirstLoginTutorial = lazyWithRetry(() => import("@/components/tutorial/FirstLoginTutorial"));
const CategoryMovingDashboard = lazyWithRetry(() => import("@/components/home/CategoryMovingDashboard"));

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showAdSign, setShowAdSign] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
  useScrollReveal();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsMobileViewport(media.matches);
    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  // Page mounted successfully — clear the chunk-retry guard so a future
  // stale-chunk failure can reload again.
  useEffect(() => { sessionStorage.removeItem("chunk_reloaded"); }, []);

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
    if (showSplash || isAuthenticated || profile?.no_ads) return;
    const t = setTimeout(() => setShowAdSign(true), 180000);
    return () => clearTimeout(t);
  }, [showSplash, isAuthenticated, profile?.no_ads]);

  // Ad logic:
  // - During splash (showSplash=true): NEVER show ads
  // - 0-3 min after splash dismissed: no ads for anyone
  // - After 3 min: ads start for non-signed-in users only
  // - Signed-in users: ads permanently disabled
  const adFree = isAuthenticated || profile?.no_ads === true || isMobileViewport;

  useEffect(() => {
    // Always clean up ads for ad-free users (signed-in OR admin-granted no_ads)
    if (adFree) {
      document.querySelectorAll("[data-zone]").forEach(el => el.remove());
      document.querySelectorAll("[data-ad-slot]").forEach(el => { el.style.display = "none"; });
      return;
    }
  }, [adFree]);

  useEffect(() => {
    // Don't start ad timers during splash screen
    if (showSplash) return;
    // Ad-free users never see ads
    if (adFree) return;

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
  }, [adFree, showSplash]);

  // Load or auto-create user profile once auth is confirmed
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Every user automatically follows the Gamer.Productions admin account.
    const ensureFollowsAdmin = async () => {
      const ADMIN_EMAIL = "kevinarnold522@gmail.com";
      if (user.email?.toLowerCase() === ADMIN_EMAIL) return;
      try {
        const existing = await base44.entities.Follow.filter({ follower_email: user.email, following_email: ADMIN_EMAIL });
        if (existing.length === 0) {
          await base44.entities.Follow.create({
            follower_email: user.email,
            following_email: ADMIN_EMAIL,
            follower_username: user.full_name || user.email.split("@")[0],
            following_username: "Gamer.Productions",
            source: "manual",
          });
        }
      } catch {}
    };
    ensureFollowsAdmin();

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
          <div className="relative z-10">
            {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}
            {user && <AIAssistBanner user={user} />}
            {/* New-joiner astronaut welcome banner */}
            {user && profile && isNewJoiner(profile) && (
              <HeyGamerBanner profile={profile} username={profile?.username || user?.full_name} />
            )}
            <VideoHeroBanner />
            <HeroSection />
            <CategoryCards />
            <MarqueeTicker />
            <InlineFloatingNewsfeed />

            <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
              {showTutorial && user && <FirstLoginTutorial onComplete={() => setShowTutorial(false)} />}

              {/* GET VERIFIED BADGE — prominent top banner */}
              <VerifiedBadgeBanner />

              {/* First 10K Free Verified Badge promotion */}
              <First10KBanner user={user} profile={profile} />

              {/* Live Moving Dashboard (marketplace listings) — newsfeed now floats globally on the right */}
              <MovingDashboard currentUser={user} currentProfile={profile} />

              {/* Games moving dashboard */}
              <CategoryMovingDashboard
                title="Games"
                subtitle="Fresh game listings across PC, console & mobile."
                accent="#a855f7"
                icon={Gamepad2}
                filterFn={(l) => l.category === "games"}
                viewAllHref="/category?cat=games"
                user={user}
                profile={profile}
              />

              {/* Cloud Gaming moving dashboard */}
              <CategoryMovingDashboard
                title="Cloud Gaming"
                subtitle="Stream and play instantly — GeForce NOW, Xbox Cloud, PS Plus & more."
                accent="#38bdf8"
                icon={Cloud}
                filterFn={(l) => l.category === "cloud_gaming"}
                viewAllHref="/category?cat=cloud_gaming"
                user={user}
                profile={profile}
              />

              {/* Tools moving dashboard */}
              <CategoryMovingDashboard
                title="Tools"
                subtitle="Premium utilities, launchers, automation & creator software."
                accent="#f472b6"
                icon={Wrench}
                filterFn={(l) => l.category === "paid_tools"}
                viewAllHref="/category?cat=paid_tools"
                user={user}
                profile={profile}
                reverse
              />

              {/* Listing of the Week — right after marketplace listings */}
              <ListingOfWeek />

              {/* Content/Streaming - Merged */}
              <LiveStreamSection />
              <VideosSection />

              <PaidModsSection />
              <MonetizationBadge />

              {/* Official socials — right below the Get Monetized section */}
              <div className="max-w-7xl mx-auto px-4 py-4">
                <GamerSocialsBar />
              </div>

              <FeaturedGames />
              <CommunitySection />

              {/* What GAMER Productions is — moved to bottom above footer */}
              <BusinessModelSection />

              <Footer />
              <FeedbackWidget userEmail={user?.email} userName={user?.full_name} />
              <AdminLinkScanner userEmail={user?.email} />
              {/* Activities (daily rewards) — new joiners only */}
              {profile && isNewJoiner(profile) && <DailyRewards user={user} profile={profile} />}
              {user && profile && isNewJoiner(profile) && <DailyRewardPopup user={user} />}
              <AdminApprovalPanel userEmail={user?.email} />
            </Suspense>
          </div>
        </>
      )}

      {/* New-joiner astronaut welcome popup (first visit) */}
      {!showSplash && user && profile && isNewJoiner(profile) && (
        <HeyGamerWelcomeModal userEmail={user.email} username={profile?.username || user?.full_name} />
      )}

      {/* Earn Now / Get Started / Log In — floating lower-left dock for guests */}
      {!showSplash && !isLoadingAuth && !isAuthenticated && <GuestAuthDock />}

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