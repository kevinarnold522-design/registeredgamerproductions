import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ShootingStars from '@/components/home/ShootingStars';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguagePrompt from '@/components/layout/LanguagePrompt';
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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
      <Route path="/admin-editor" element={<AdminWebsiteEditor />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsDMCA />} />
      <Route path="/gaming-community" element={<GamingCommunity />} />
      <Route path="/community-section" element={<CommunitySectionPage />} />
      <Route path="/community/:id" element={<CommunityLandingPage />} />
      <Route path="/social-manager" element={<SocialMediaManager />} />
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="/sub-landing" element={<SubcategoryLandingPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/listing" element={<ListingPage />} />
      <Route path="/routing-dashboard" element={<RoutingDashboard />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ShootingStars />
            <div style={{ position: "relative", zIndex: 10 }}>
              <SidebarLayout>
                <AuthenticatedApp />
              </SidebarLayout>
            </div>
            <LanguagePrompt />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App