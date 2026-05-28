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
    // Remove ALL ad scripts from DOM
    document.querySelectorAll('script[src*="quge5.com"], script[src*="elementarywhole.com"], script[src*="monetag"]').forEach(el => el.remove());

    // Inject aggressive CSS to hide any ad iframes/elements injected at runtime
    if (!document.getElementById('admin-ad-block')) {
      const style = document.createElement('style');
      style.id = 'admin-ad-block';
      style.textContent = `
        iframe, ins.adsbygoogle,
        div[id*="monetag"], div[class*="monetag"],
        div[id*="adsbygoogle"], div[class*="adsbygoogle"],
        [data-zone], [data-cfasync],
        div[id*="quge"], div[class*="ad-"],
        div[id*="pop"], div[class*="pop-up"],
        div[class*="popup"], div[id*="overlay-ad"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Block future script injections via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT') {
            const src = node.src || '';
            if (src.includes('quge5') || src.includes('elementarywhole') || src.includes('monetag')) {
              node.remove();
            }
          }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
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