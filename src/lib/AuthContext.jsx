import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isAdmin } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient'; // Added Supabase client integration

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: import.meta.env.VITE_BASE44_APP_ID });

  useEffect(() => {
    initAuth();

    // Listen for Supabase sign-in/sign-out state changes automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const supaUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          isSupabase: true
        };
        setUser(supaUser);
        setIsAuthenticated(true);
        if (isAdmin(session.user.email)) {
          window.__adminBlocked = true;
          window.__adsBlocked = true;
          blockAdsForAdmin();
        }
      } else {
        // Only log out if there isn't a valid base44 user active either
        const currentUser = await base44.auth.me().catch(() => null);
        if (!currentUser) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const blockAdsForAdmin = () => {
    const adDomains = [
      'quge5.com', 'elementarywhole.com', 'monetag', 'pricklyassociation.com',
      'adsbygoogle', 'doubleclick.net', 'googlesyndication.com', 'adnxs.com',
      'bidvertiser', 'popads', 'popcash', 'propellerads', 'adskeeper'
    ];

    const isAdNode = (node) => {
      if (!node || !node.tagName) return false;
      const tag = node.tagName.toUpperCase();
      if (tag === 'SCRIPT') {
        const src = node.src || node.textContent || '';
        return adDomains.some(d => src.includes(d));
      }
      if (tag === 'IFRAME') return true;
      if (tag === 'INS') return true;
      return false;
    };

    document.querySelectorAll('script, iframe, ins').forEach(el => {
      if (isAdNode(el)) el.remove();
    });

    document.querySelectorAll('meta[name="monetag"]').forEach(el => el.remove());

    if (!document.getElementById('admin-ad-block')) {
      const style = document.createElement('style');
      style.id = 'admin-ad-block';
      style.textContent = `
        iframe, ins, ins.adsbygoogle, ins[class*="ad"],
        div[id*="monetag"], div[class*="monetag"],
        div[id*="adsbygoogle"], div[class*="adsbygoogle"],
        div[id*="ad-"], div[class*="ad-banner"], div[class*="ad_"],
        [data-zone], [data-cfasync],
        div[id*="quge"], div[class*="quge"],
        div[id*="pop"], div[class*="pop-up"], div[id*="popup"],
        div[class*="popup"], div[id*="overlay-ad"],
        div[class*="overlay-ad"], div[id*="pricklyas"],
        div[class*="pricklyas"], div[id*="bidvertiser"],
        div[class*="propeller"], div[id*="propeller"],
        #BodyAdWrapper, .ad-wrapper, .ad-container,
        [id*="google_ads"], [class*="google_ads"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          max-height: 0 !important;
          max-width: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          left: -9999px !important;
          }
      `;
      document.head.appendChild(style);
    }
  };

  const initAuth = async () => {
    try {
      setIsLoadingAuth(true);

      // 1. Check for a valid Supabase Session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const supaUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          isSupabase: true
        };
        setUser(supaUser);
        setIsAuthenticated(true);
        if (isAdmin(session.user.email)) {
          window.__adminBlocked = true;
          window.__adsBlocked = true;
          blockAdsForAdmin();
        }
        return;
      }

      // 2. Fall back to base44 token processing if no Supabase user exists
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const urlToken = params.get('access_token') || hashParams.get('access_token') || params.get('token');
        if (urlToken && base44.auth?.setToken) {
          base44.auth.setToken(urlToken, true);
          localStorage.setItem('base44_access_token', urlToken);
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      } catch (_) {}

      try {
        const storedToken = localStorage.getItem('base44_access_token') || localStorage.getItem('base44_token');
        if (storedToken && base44.auth?.setToken) {
          base44.auth.setToken(storedToken, true);
        }
      } catch (_) {}

      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        if (isAdmin(currentUser.email)) {
          window.__adminBlocked = true;
          window.__adsBlocked = true;
          blockAdsForAdmin();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (_) {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          isSupabase: true
        });
        setIsAuthenticated(true);
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('base44_token');
      await supabase.auth.signOut(); // Clean up Supabase session
    } catch (_) {}
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout("/");
  };

  const navigateToLogin = async (provider) => {
    const p = provider || 'google';
    if (p === 'google') {
      // Trigger secure login redirect via your working Supabase project keys
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
    } else {
      base44.auth.loginWithProvider(p, window.location.pathname + window.location.search || '/');
    }
  };

  const isAdminUser = user ? isAdmin(user.email) : false;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdminUser,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: initAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
