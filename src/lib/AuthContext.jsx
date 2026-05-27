import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const APP_URL = "https://gamerproductions.vercel.app/";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false); // App is public — no gate needed
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: import.meta.env.VITE_BASE44_APP_ID });

  useEffect(() => {
    // On mount, handle any access_token in the URL (magic link return),
    // then attempt to load the current user.
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setIsLoadingAuth(true);

      // If there's a token in localStorage that the SDK hasn't picked up yet, set it explicitly
      try {
        const storedToken = localStorage.getItem('base44_access_token') || localStorage.getItem('base44_token');
        if (storedToken && base44.auth.setToken) {
          base44.auth.setToken(storedToken, true);
        }
      } catch (_) {}

      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      // Not authenticated — that's fine, app is public
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
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(APP_URL);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(APP_URL);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
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