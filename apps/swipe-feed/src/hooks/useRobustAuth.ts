/**
 * ROBUST AUTH HOOK
 * 
 * Single hook that provides all authentication functionality.
 * Designed to survive app updates and hot reloads.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  addAuthListener, 
  initializeAuth, 
  signIn as authSignIn, 
  signOut as authSignOut,
  refreshSession,
  type AuthState 
} from '../lib/auth-robust';

export function useRobustAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    console.log('🔐 useRobustAuth: Subscribing to auth state');
    
    // Subscribe to auth state changes
    const unsubscribe = addAuthListener((state) => {
      console.log('🔐 useRobustAuth: State update received');
      setAuthState(state);
    });

    // Ensure auth is initialized
    initializeAuth().catch(console.error);

    return () => {
      console.log('🔐 useRobustAuth: Unsubscribing from auth state');
      unsubscribe();
    };
  }, []);

  // Sign in wrapper
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await authSignIn(email, password);
      return result;
    } catch (error) {
      console.error('useRobustAuth: Sign in error:', error);
      throw error;
    }
  }, []);

  // Sign out wrapper
  const signOut = useCallback(async () => {
    try {
      await authSignOut();
    } catch (error) {
      console.error('useRobustAuth: Sign out error:', error);
      // Don't throw - always allow sign out attempt
    }
  }, []);

  // Refresh session wrapper
  const refresh = useCallback(async () => {
    try {
      return await refreshSession();
    } catch (error) {
      console.error('useRobustAuth: Refresh error:', error);
      return null;
    }
  }, []);

  return {
    ...authState,
    signIn,
    signOut,
    refreshSession: refresh,
  };
}

export default useRobustAuth;












