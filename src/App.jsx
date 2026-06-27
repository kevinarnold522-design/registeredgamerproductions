import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { clearAssetRecoveryState } from '@/lib/assetRecovery';
// Added "Navigate" to standard react-router-dom handling
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ShootingStars from '@/components/home/ShootingStars';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguagePrompt from '@/components/layout/LanguagePrompt';
import InAppBrowserLinkFix from '@/components/layout/InAppBrowserLinkFix';
import PageTransition from '@/components/layout/PageTransition';
import VisitorCountryTracker from '@/components/analytics/VisitorCountryTracker';
import GlobalHtmlAd from '@/components/ads/GlobalHtmlAd';
import FloatingNewsfeed from '@/components/home/FloatingNewsfeed';
// Add page imports here
import GamingCommunity from "./pages/GamingCommunity";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import Channel from "./pages/Channel";
import CategoryPage from "./pages/CategoryPage.jsx";
import Checkout from "./pages/Checkout";
import Messages from "./pages/Messages";
import PaymentPage from "./pages/PaymentPage";
import AIVideoStudioPage from "./pages/AIVideoStudioPage";
import StudioPage from "./pages/StudioPage";
import MusicLibrary from "./pages/MusicLibrary";
import AboutUs from "./pages/AboutUs";
import Analytics from "./pages/Analytics";
import AdminWebsiteEditor from "./pages/AdminWebsiteEditor";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsDMCA from "./pages/TermsDMCA";
import CommunitySectionPage from "./pages/CommunitySectionPage";
import CommunityLandingPage from "./pages/CommunityLandingPage";
import SocialMediaManager from "./pages/SocialMediaManager";
import TournamentsPage from "./pages/TournamentsPage";
import SubcategoryLandingPage from "./pages/SubcategoryLandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ListingPage from "./pages/ListingPage.jsx";
import RoutingDashboard from "./pages/RoutingDashboard";
import EarningsDashboard from "./pages/EarningsDashboard";
import UploadContent from "./pages/UploadContent";
import ContentFeedPage from "./pages/ContentFeedPage";
import CreatedAccountsPage from "./pages/CreatedAccountsPage";
import SearchPage from "./pages/SearchPage.jsx";
import UsersLanding from "./pages/UsersLanding";
import ListingsLanding from "./pages/ListingsLanding";
import OrdersLanding from "./pages/OrdersLanding";
import GamingNewsfeed from "./pages/GamingNewsfeed";

const AuthenticatedApp = () => {
  // Pulling 'user' mapping from Base44 state engine layout
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // 🛡️ EXCLUSIVE EMAIL-ONLY ROUTE GUARD
  const AdminRoute = ({ element }) => {
    const MASTER_EMAIL = 'kevinarnold522@gmail.com';
    
    // Safely pull the email value regardless of how Base44 nests it
    const currentEmail = user?.email || user?.attributes?.email || user?.primaryEmail || "";
    const isMasterAdmin = currentEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

    // If they aren't using your exact master email address, boot them instantly!
    if (!isMasterAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    return element;
  };

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/channel" element={<Channel />} />
      <Route path="/category" element={<CategoryPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/ai-video-studio" element={<AIVideoStudioPage />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/music-library" element={<MusicLibrary />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/analytics" element={<Analytics />} />
      
      {/* 🔒 SECURED ADMINISTRATIVE SUITE - EXCLUSIVE TO KEVIN */}
      <Route path="/admin-editor" element={<AdminRoute element={<AdminWebsiteEditor />} />} />
      <Route path="/admin/created-accounts" element={<AdminRoute element={<CreatedAccountsPage />} />} />
      
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsDMCA />} />
      <Route path="/gaming-community" element={<GamingCommunity />} />
      <Route path="/gaming-newsfeed" element={<GamingNewsfeed />} />
      <Route path="/community-section" element={<CommunitySectionPage />} />
      <Route path="/community/:id" element={<CommunityLandingPage />} />
      <Route path="/social-manager" element={<SocialMediaManager />} />
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="/sub-landing" element={<SubcategoryLandingPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/listing" element={<ListingPage />} />
      <Route path="/routing-dashboard" element={<AdminRoute element={<RoutingDashboard />} />} />
      <Route path="/earnings" element={<EarningsDashboard />} />
      <Route path="/upload-content" element={<UploadContent />} />
      <Route path="/content" element={<ContentFeedPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/users" element={<AdminRoute element={<UsersLanding />} />} />
      <Route path="/all-listings" element={<ListingsLanding mode="all" />} />
      <Route path="/my-listings" element={<ListingsLanding mode="mine" />} />
      <Route path="/orders" element={<OrdersLanding />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  useEffect(() => {
    clearAssetRecoveryState();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <PageTransition />
            <InAppBrowserLinkFix />
            <VisitorCountryTracker />
            <ShootingStars />
            <div style={{ position: "relative", zIndex: 10 }}>
              <SidebarLayout>
                <AuthenticatedApp />
              </SidebarLayout>
            </div>
            <LanguagePrompt />
            <FloatingNewsfeed />
            <GlobalHtmlAd />
          </Router>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App;