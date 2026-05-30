import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isAdmin } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [appPublicSettings] = useState({ id: import.meta.env.VITE_BASE44_APP_ID });

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        handleSetUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSetUser = (supaUser) => {
    const formattedUser = {
      id: supaUser.id,
      email: supaUser.email,
      name: supaUser.user_metadata?.full_name || supaUser.email.split('@')[0],
      avatar_url: supaUser.user_metadata?.avatar_url,
      isSupabase: true
    };
    setUser(formattedUser);
    setIsAuthenticated(true);
    if (isAdmin(supaUser.email)) {
      window.__adminBlocked = true;
      window.__adsBlocked = true;
      blockAdsForAdmin();
    }
  };

  const blockAdsForAdmin = () => {
    // ... (Keep your existing ad blocking logic here)
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleSetUser(session.user);
        return;
      }
      // Fallback to Base44 if no Supabase session
      const currentUser = await base44.auth.me().catch(() => null);
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      // Clear legacy tokens
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('base44_token');
      
      // Sign out of Supabase
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout cleanup failed", e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // FIXED: Use hard window location change to prevent 404s from legacy API routers
      window.location.href = '/';
    }
  };

  const navigateToLogin = async (provider) => {
    if (!provider || provider === 'google') {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } else {
      base44.auth.loginWithProvider(provider, window.location.pathname);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      logout,
      navigateToLogin,
      initAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
