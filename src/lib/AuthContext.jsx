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
  const [isGhostSession, setIsGhostSession] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  // Build the full app user from the worker's auth user + their UserProfile.
  const buildUser = async (cfUser) => {
    const formattedUser = {
      id: cfUser.id,
      email: cfUser.email,
      full_name: cfUser.full_name || cfUser.email?.split('@')[0],
      avatar_url: cfUser.avatar_url,
      role: cfUser.role || (isAdmin(cfUser.email) ? 'admin' : 'user'),
    };

    // Merge in the stored UserProfile so real account details show up.
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_email: cfUser.email });
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        formattedUser.profile = p;
        formattedUser.full_name = p.display_name || p.username || formattedUser.full_name;
        formattedUser.avatar_url = p.avatar_url || formattedUser.avatar_url;
        formattedUser.username = p.username;
        formattedUser.account_type = p.account_type;
        formattedUser.role = isAdmin(p.user_email) ? 'admin' : (cfUser.role || 'user');
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    }

    setUser(formattedUser);
    setIsAuthenticated(true);

    // Log login once per browser session.
    try {
      const key = `login_logged_${formattedUser.email}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        await base44.functions.invoke('logLogin', {});
      }
    } catch (e) {
      console.error("Failed to log login", e);
    }

    if (isAdmin(cfUser.email)) blockAdsForAdmin();
  };

  const blockAdsForAdmin = () => {
    if (!document.getElementById('admin-ad-block')) {
      const style = document.createElement('style');
      style.id = 'admin-ad-block';
      style.textContent = `iframe, ins, .adsbygoogle { display: none !important; }`;
      document.head.appendChild(style);
    }
  };

  const initAuth = async () => {
    setIsLoadingAuth(true);
    try {
      // Persistent ghost/impersonation session takes priority.
      const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
      if (impersonationData.isImpersonating && impersonationData.isGhostLogin && impersonationData.isPersistent) {
        const ghostProfile = await base44.entities.UserProfile
          .filter({ user_email: impersonationData.targetEmail }).catch(() => []);
        setUser({
          email: impersonationData.targetEmail,
          full_name: impersonationData.targetUsername,
          isGhostAccount: true,
          ghostData: impersonationData,
          ...(ghostProfile.length > 0 ? ghostProfile[0] : {}),
        });
        setIsAuthenticated(true);
        setIsGhostSession(true);
        setIsLoadingAuth(false);
        return;
      }

      // Current user from the Cloudflare session cookie (don't hang public pages).
      const cfUser = await Promise.race([
        base44.auth.me().catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 3500)),
      ]);
      if (cfUser) await buildUser(cfUser);
    } catch (e) {
      console.error("Auth init error", e);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('impersonation_session');
      localStorage.removeItem('gp_session_token');
    } catch (e) {
      console.error("Logout cleanup failed", e);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsGhostSession(false);
    // Worker clears the session cookie, then redirects home.
    await base44.auth.logout('/');
  };

  const navigateToLogin = async (provider) => {
    base44.auth.loginWithProvider(provider || 'google', window.location.pathname);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      isGhostSession,
      logout,
      navigateToLogin,
      initAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);