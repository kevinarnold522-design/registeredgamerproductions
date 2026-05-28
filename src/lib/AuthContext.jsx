import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isAdmin } from '@/lib/constants';

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
  }, []);

  const blockAdsForAdmin = () => {
    // Full list of ad domains to block
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
      if (tag === 'IFRAME') return true; // block ALL iframes for admin
      if (tag === 'INS') return true;
      return false;
    };

    // Remove all existing ad scripts/iframes immediately
    document.querySelectorAll('script, iframe, ins').forEach(el => {
      if (isAdNode(el)) el.remove();
    });

    // Remove Monetag meta tag
    document.querySelectorAll('meta[name="monetag"]').forEach(el => el.remove());

    // Inject aggressive CSS — covers everything
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
        /* Block ALL redirect-click hijacking for admin */
        a[href*="pricklyassociation"], a[href*="quge5"],
        a[href*="elementarywhole"], a[href*="doubleclick"],
        a[href*="googlesyndication"], a[href*="monetag"],
        a[href*="bidvertiser"], a[href*="propellerads"] {
          pointer-events: none !important;
          cursor: default !important;
        }
      `;
      document.head.appendChild(style);
    }

    // MutationObserver: intercept ANY new injected ad node
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (isAdNode(node)) {
            node.remove();
            return;
          }
          // Also scan children of added nodes
          if (node.querySelectorAll) {
            node.querySelectorAll('script, iframe, ins').forEach(child => {
              if (isAdNode(child)) child.remove();
            });
          }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Override window.open — block ALL ad popup windows
    const _originalOpen = window.open;
    window.open = function(url, ...args) {
      if (!url) return null;
      const urlStr = String(url);
      // Allow only same-origin and known-safe navigations
      if (adDomains.some(d => urlStr.includes(d))) return null;
      // Block blank popups that are typical ad behavior
      if (args[0] === '_blank' && !urlStr.startsWith(window.location.origin) &&
          !urlStr.startsWith('https://') && !urlStr.startsWith('http://localhost')) {
        return null;
      }
      return _originalOpen.apply(window, [url, ...args]);
    };

    // Delay-loaded ads: re-sweep every 2 seconds for first 30 seconds
    let sweepCount = 0;
    const sweepInterval = setInterval(() => {
      document.querySelectorAll('script, iframe, ins').forEach(el => {
        if (isAdNode(el)) el.remove();
      });
      sweepCount++;
      if (sweepCount >= 15) clearInterval(sweepInterval);
    }, 2000);
  };

  const initAuth = async () => {
    try {
      setIsLoadingAuth(true);

      // Handle OAuth callback tokens (Yahoo, Outlook, Google) — parse from URL hash/query
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const urlToken = params.get('access_token') || hashParams.get('access_token') || params.get('token');
        if (urlToken && base44.auth?.setToken) {
          base44.auth.setToken(urlToken, true);
          localStorage.setItem('base44_access_token', urlToken);
          // Clean URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      } catch (_) {}

      // Ensure SDK has the stored token if it wasn't picked up at init time
      try {
        const storedToken =
          localStorage.getItem('base44_access_token') ||
          localStorage.getItem('base44_token');
        if (storedToken && base44.auth?.setToken) {
          base44.auth.setToken(storedToken, true);
        }
      } catch (_) {}

      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        // Block ads for admin users permanently
        if (isAdmin(currentUser.email)) {
          window.__adminBlocked = true;
          window.__adsBlocked = true;
          blockAdsForAdmin();
        } else {
          // Check Tier1 and moderator status to block ads for them too
          try {
            const [tier1Subs, modMemberships] = await Promise.all([
              base44.entities.Tier1Subscription.filter({ user_email: currentUser.email, status: "active" }),
              base44.entities.CommunityMember.filter({ user_email: currentUser.email, is_moderator: true }),
            ]);
            const isTier1 = tier1Subs.length > 0;
            const isModerator = modMemberships.length > 0;
            if (isTier1 || isModerator) {
              window.__adsBlocked = true;
              blockAdsForAdmin();
            }
          } catch (_) {}
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

  const logout = () => {
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('base44_token');
    } catch (_) {}
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout("/");
  };

  const navigateToLogin = (provider) => {
    // Default to google; support yahoo and outlook via their respective providers
    const p = provider || 'google';
    base44.auth.loginWithProvider(p, window.location.pathname + window.location.search || '/');
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