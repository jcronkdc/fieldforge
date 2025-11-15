/**
 * ROBUST AUTHENTICATION SYSTEM
 * 
 * This is the single source of truth for authentication.
 * Designed to be rock-solid and survive any app updates.
 */

import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('Check your .env file in apps/swipe-feed/');
  
  if (import.meta.env.PROD) {
    throw new Error('Authentication not configured - Missing Supabase credentials');
  }
}

// Create Supabase client with robust configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Add more robust session storage
    storageKey: 'fieldforge-auth',
  },
  global: {
    headers: {
      'x-application-name': 'FieldForge',
      'x-client-version': '1.0.0'
    }
  }
});

// Types
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  job_title?: string;
  company_id?: string;
  role?: string;
  is_admin?: boolean;
  address?: string;
  employee_id?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Global state management
let globalAuthState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
};

// Listeners for state changes
const listeners = new Set<(state: AuthState) => void>();

// Add listener
export function addAuthListener(callback: (state: AuthState) => void) {
  listeners.add(callback);
  // Immediately call with current state
  callback(globalAuthState);
  
  // Return cleanup function
  return () => {
    listeners.delete(callback);
  };
}

// Update state and notify all listeners
function updateAuthState(newState: Partial<AuthState>) {
  globalAuthState = { ...globalAuthState, ...newState };
  
  // Notify all listeners
  listeners.forEach(listener => {
    try {
      listener(globalAuthState);
    } catch (error) {
      console.error('Error in auth listener:', error);
    }
  });
  
  // Debug logging
  console.log('🔐 Auth state updated:', {
    authenticated: globalAuthState.isAuthenticated,
    user: globalAuthState.user?.email,
    loading: globalAuthState.loading,
    error: globalAuthState.error
  });
}

// Load user profile
export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Profile loading error:', error);
    return null;
  }
}

// Apply session to global state
async function applySession(session: Session | null) {
  if (!session) {
    updateAuthState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    return;
  }

  // Load user profile
  const profile = await loadUserProfile(session.user.id);
  
  updateAuthState({
    user: session.user,
    session,
    profile,
    loading: false,
    error: null,
    isAuthenticated: true,
    isAdmin: Boolean(profile?.is_admin || profile?.role === 'admin'),
  });
}

// Initialize authentication system
let initialized = false;
export async function initializeAuth() {
  if (initialized) {
    console.log('🔐 Auth already initialized');
    return globalAuthState;
  }
  
  console.log('🔐 Initializing robust authentication system...');
  initialized = true;
  
  try {
    // Check current session with timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 10000);
    });
    
    const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Session check error:', error);
      updateAuthState({
        loading: false,
        error: error.message
      });
    } else {
      await applySession(data.session);
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event);
      await applySession(session);
    });
    
    console.log('✅ Authentication system initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize auth:', error);
    updateAuthState({
      loading: false,
      error: error instanceof Error ? error.message : 'Auth initialization failed'
    });
  }
  
  return globalAuthState;
}

// Sign in function
export async function signIn(email: string, password: string) {
  console.log('🔐 Signing in:', email);
  updateAuthState({ loading: true, error: null });
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('✅ Sign in successful');
    return data;
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed';
    console.error('❌ Sign in error:', message);
    updateAuthState({
      loading: false,
      error: message
    });
    throw error;
  }
}

// Sign out function
export async function signOut() {
  console.log('🔐 Signing out');
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('✅ Sign out successful');
    
  } catch (error) {
    console.error('❌ Sign out error:', error);
    // Even if sign out fails, clear local state
    updateAuthState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    throw error;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return globalAuthState.isAuthenticated;
}

// Get current user
export function getCurrentUser(): User | null {
  return globalAuthState.user;
}

// Get current session
export function getCurrentSession(): Session | null {
  return globalAuthState.session;
}

// Get current auth state
export function getAuthState(): AuthState {
  return globalAuthState;
}

// Refresh session
export async function refreshSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    if (data.session) {
      await applySession(data.session);
    }
    
    return data.session;
  } catch (error) {
    console.error('❌ Session refresh error:', error);
    updateAuthState({
      error: error instanceof Error ? error.message : 'Session refresh failed'
    });
    return null;
  }
}

// Auto-initialize when module loads
initializeAuth().catch(console.error);







