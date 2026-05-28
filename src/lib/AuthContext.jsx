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
    // Remove ALL ad & tracking scripts from DOM immediately
    const adDomains = ['quge5.com', 'elementarywhole.com', 'monetag', 'pricklyassociation.com', 'adsbygoogle'];
    document.querySelectorAll('script').forEach(el => {
      const src = el.src || '';
      if (adDomains.some(d => src.includes(d))) el.remove();
    });

    // Nuke all iframes that might be ad containers
    document.querySelectorAll('iframe').forEach(el => el.remove());

    // Inject aggressive CSS to permanently hide ALL ad injections
    if (!document.getElementById('admin-ad-block')) {
      const style = document.createElement('style');
      style.id = 'admin-ad-block';
      style.textContent = `
        iframe, ins.adsbygoogle, ins[class*="ad"],
        div[id*="monetag"], div[class*="monetag"],
        div[id*="adsbygoogle"], div[class*="adsbygoogle"],
        div[id*="ad-"], div[class*="ad-banner"],
        [data-zone], [data-cfasync],
        div[id*="quge"], div[class*="quge"],
        div[id*="pop"], div[class*="pop-up"],
        div[class*="popup"], div[id*="overlay-ad"],
        div[class*="overlay-ad"], div[id*="pricklyas"],
        div[class*="pricklyas"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          max-height: 0 !important;
          max-width: 0 !important;
          overflow: hidden !important;
        }
        /* Block redirect-click hijacking */
        a[href*="pricklyassociation"], a[href*="quge5"],
        a[href*="elementarywhole"] {
          pointer-events: none !important;
          cursor: default !important;
        }
      `;
      document.head.appendChild(style);
    }

    // MutationObserver: block any script/iframe injected later
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!node.tagName) return;
          if (node.tagName === 'SCRIPT') {
            const src = node.src || node.textContent || '';
            if (adDomains.some(d => src.includes(d))) { node.remove(); return; }
          }
          if (node.tagName === 'IFRAME') { node.remove(); return; }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Override window.open to block ad popups
    const _originalOpen = window.open;
    window.open = function(url, ...args) {
      if (!url) return null;
      const blocked = adDomains.some(d => String(url).includes(d));
      if (blocked) return null;
      return _originalOpen.apply(window, [url, ...args]);
    };
  };

  const initAuth = async () => {
    try {
      setIsLoadingAuth(true);

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
        // Block ads for admin users
        if (isAdmin(currentUser.email)) {
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

  const navigateToLogin = () => {
    base44.auth.loginWithProvider('google', '/');
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