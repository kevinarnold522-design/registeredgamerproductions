import { useEffect, useState, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { clearAssetRecoveryState } from '@/lib/assetRecovery';
import { isLikelyMobileWebDevice } from '@/lib/deviceProfile';
// Added "Navigate" to standard react-router-dom handling
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ShootingStars from '@/components/home/ShootingStars';
import MobileSpaceBackdrop from '@/components/home/MobileSpaceBackdrop';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguagePrompt from '@/components/layout/LanguagePrompt';
import InAppBrowserLinkFix from '@/components/layout/InAppBrowserLinkFix';
import PageTransition from '@/components/layout/PageTransition';
import VisitorCountryTracker from '@/components/analytics/VisitorCountryTracker';
import GlobalHtmlAd from '@/components/ads/GlobalHtmlAd';
import FloatingNewsfeed from '@/components/home/FloatingNewsfeed';
import RouteErrorBoundary from '@/components/system/RouteErrorBoundary';

// -----------------------------------------------------------------------------
// MOBILE-FRIENDLY LAZY ROUTES
// Loading ~40 pages synchronously produced a giant single bundle that timed
// out on mobile networks, causing the "PAGE HICCUP" card. Each page is now a
// code-split chunk so one slow / failed page never blocks the rest of the app.
// -----------------------------------------------------------------------------
const Home = lazy(() => import("./pages/Home"));
const GamingCommunity = lazy(() => import("./pages/GamingCommunity"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const Profile = lazy(() => import("./pages/Profile"));
const Channel = lazy(() => import("./pages/Channel"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.jsx"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Messages = lazy(() => import("./pages/Messages"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const AIVideoStudioPage = lazy(() => import("./pages/AIVideoStudioPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const MusicLibrary = lazy(() => import("./pages/MusicLibrary"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AdminWebsiteEditor = lazy(() => import("./pages/AdminWebsiteEditor"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsDMCA = lazy(() => import("./pages/TermsDMCA"));
const CommunitySectionPage = lazy(() => import("./pages/CommunitySectionPage"));
const CommunityLandingPage = lazy(() => import("./pages/CommunityLandingPage"));
const SocialMediaManager = lazy(() => import("./pages/SocialMediaManager"));
const TournamentsPage = lazy(() => import("./pages/TournamentsPage"));
const SubcategoryLandingPage = lazy(() => import("./pages/SubcategoryLandingPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const ListingPage = lazy(() => import("./pages/ListingPage.jsx"));
const RoutingDashboard = lazy(() => import("./pages/RoutingDashboard"));
const EarningsDashboard = lazy(() => import("./pages/EarningsDashboard"));
const UploadContent = lazy(() => import("./pages/UploadContent"));
const ContentFeedPage = lazy(() => import("./pages/ContentFeedPage"));
const CreatedAccountsPage = lazy(() => import("./pages/CreatedAccountsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const UsersLanding = lazy(() => import("./pages/UsersLanding"));
const ListingsLanding = lazy(() => import("./pages/ListingsLanding"));
const OrdersLanding = lazy(() => import("./pages/OrdersLanding"));
const GamingNewsfeed = lazy(() => import("./pages/GamingNewsfeed"));

// Lightweight spinner while a page chunk is downloading on mobile.
const RouteFallback = () => (
  <div
    className="flex items-center justify-center"
    style={{ minHeight: "60vh", width: "100%" }}
    data-testid="route-suspense-fallback"
  >
    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  // Pulling 'user' mapping from Base44 state engine layout
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const location = useLocation();

  // Only block routes that truly require auth/admin state. Public pages should
  // render immediately instead of being held behind the auth bootstrap.
  const isAdminPath = location.pathname === '/admin-editor'
    || location.pathname === '/admin/created-accounts'
    || location.pathname === '/routing-dashboard'
    || location.pathname === '/users';

  if (isLoadingPublicSettings || (isLoadingAuth && isAdminPath)) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  // Handle authentication errors
  if (!isLoadingAuth && authError) {
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

    if (isLoadingAuth) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      );
    }

    // Safely pull the email value regardless of how Base44 nests it
    const currentEmail = user?.email || user?.attributes?.email || user?.primaryEmail || "";
    const isMasterAdmin = currentEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

    // If they aren't using your exact master email address, boot them instantly!
    if (!isMasterAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    return element;
  };

  // Render the main app. The error boundary is keyed by pathname so a transient
  // failure on one route doesn't keep "Page hiccup" stuck on every page after
  // the user navigates away.
  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </RouteErrorBoundary>
  );
};


function App() {
  const [useLowOverheadMobileShell, setUseLowOverheadMobileShell] = useState(() => isLikelyMobileWebDevice());

  useEffect(() => {
    const syncMobileShell = () => setUseLowOverheadMobileShell(isLikelyMobileWebDevice());
    syncMobileShell();

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const viewportMedia = window.matchMedia('(max-width: 1023px)');
    const pointerMedia = window.matchMedia('(pointer: coarse)');

    if (typeof viewportMedia.addEventListener === 'function') {
      viewportMedia.addEventListener('change', syncMobileShell);
      pointerMedia.addEventListener('change', syncMobileShell);
      return () => {
        viewportMedia.removeEventListener('change', syncMobileShell);
        pointerMedia.removeEventListener('change', syncMobileShell);
      };
    }

    viewportMedia.addListener(syncMobileShell);
    pointerMedia.addListener(syncMobileShell);
    return () => {
      viewportMedia.removeListener(syncMobileShell);
      pointerMedia.removeListener(syncMobileShell);
    };
  }, []);

  useEffect(() => {
    clearAssetRecoveryState();

    if (typeof document !== 'undefined') {
      document.documentElement.style.maxWidth = '100%';
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.maxWidth = '100%';
      document.body.style.overflowX = 'hidden';
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.maxWidth = '';
        document.documentElement.style.overflowX = '';
        document.body.style.maxWidth = '';
        document.body.style.overflowX = '';
      }
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            {!useLowOverheadMobileShell && <PageTransition />}
            <InAppBrowserLinkFix />
            <VisitorCountryTracker />
            {useLowOverheadMobileShell ? <MobileSpaceBackdrop /> : <ShootingStars />}
            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "100%", overflowX: "clip" }}>
              <SidebarLayout>
                <AuthenticatedApp />
              </SidebarLayout>
            </div>
            <LanguagePrompt />
            {!useLowOverheadMobileShell && <FloatingNewsfeed />}
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
