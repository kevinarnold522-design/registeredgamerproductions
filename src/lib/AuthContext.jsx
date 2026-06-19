import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isAdmin } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';

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

    // Only subscribe to Supabase auth if the client is available
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          handleSetUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      });
      return () => subscription?.unsubscribe();
    }
  }, []);

  const handleSetUser = async (supaUser) => {
    const formattedUser = {
      id: supaUser.id,
      email: supaUser.email,
      full_name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0],
      avatar_url: supaUser.user_metadata?.avatar_url,
      isSupabase: true
    };

    // Merge in the stored UserProfile so real account details (username,
    // avatar, account_type, etc.) actually show up instead of just the bare auth object.
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_email: supaUser.email });
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        formattedUser.profile = p;
        formattedUser.full_name = p.display_name || p.username || formattedUser.full_name;
        formattedUser.avatar_url = p.avatar_url || formattedUser.avatar_url;
        formattedUser.username = p.username;
        formattedUser.account_type = p.account_type;
        formattedUser.role = p.user_email && isAdmin(p.user_email) ? 'admin' : 'user';
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    }

    setUser(formattedUser);
    setIsAuthenticated(true);
    
    // Log login once per browser session to avoid repeated auth refresh calls
    try {
      const key = `login_logged_${formattedUser.email}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        await base44.functions.invoke('logLogin', {});
      }
    } catch (e) {
      console.error("Failed to log login", e);
    }
    
    if (isAdmin(supaUser.email)) {
      blockAdsForAdmin();
    }
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
      // Check for persistent ghost session first
      const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
      
      // If in persistent ghost session, use ghost account data
      if (impersonationData.isImpersonating && impersonationData.isGhostLogin && impersonationData.isPersistent) {
        // Fetch ghost account's actual profile data
        const ghostProfile = await base44.entities.UserProfile.filter({ 
          user_email: impersonationData.targetEmail 
        }).catch(() => []);
        
        const ghostUser = {
          email: impersonationData.targetEmail,
          full_name: impersonationData.targetUsername,
          isGhostAccount: true,
          ghostData: impersonationData,
          // Use actual profile data if available
          ...(ghostProfile.length > 0 ? ghostProfile[0] : {})
        };
        setUser(ghostUser);
        setIsAuthenticated(true);
        setIsGhostSession(true);
        setIsLoadingAuth(false);
        return;
      }
      
      // Try Supabase session first if available
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleSetUser(session.user);
          setIsLoadingAuth(false);
          return;
        }
      }
      // Fallback to Base44 auth, but don't let public pages get stuck waiting forever
      const currentUser = await Promise.race([
        base44.auth.me().catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 3500)),
      ]);
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Auth init error", e);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      // Check if this is a ghost session logout
      const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
      const isGhostLogout = impersonationData.isImpersonating && impersonationData.isGhostLogin;
      
      // Clear ghost session
      localStorage.removeItem('impersonation_session');
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('base44_token');
      
      // Sign out of Supabase (the live auth provider). Never call the old
      // base44.auth.logout — that hits the dead /api/apps/auth/logout route (404).
      if (supabase) await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout cleanup failed", e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsGhostSession(false);
      window.location.href = '/';
    }
  };

  const navigateToLogin = async (provider) => {
    if (supabase && (!provider || provider === 'google')) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } else {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      logout,
      navigateToLogin,
      initAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);