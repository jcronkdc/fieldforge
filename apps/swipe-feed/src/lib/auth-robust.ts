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
    // Clear demo session too
    localStorage.removeItem('fieldforge-demo-session');
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

  // Check if this is a demo session
  const isDemoSession = session.user.id.startsWith('demo-') || session.access_token.startsWith('demo-token-');
  
  if (isDemoSession) {
    // For demo sessions, create a simple profile from user metadata
    const profile: UserProfile = {
      id: session.user.id,
      email: session.user.email || '',
      first_name: session.user.user_metadata?.full_name?.split(' ')[0] || 'Demo',
      last_name: session.user.user_metadata?.full_name?.split(' ')[1] || 'User',
      job_title: session.user.user_metadata?.role === 'admin' ? 'Administrator' : 
                 session.user.user_metadata?.role === 'manager' ? 'Manager' : 'Field Worker',
      role: session.user.user_metadata?.role || 'field_worker',
      is_admin: session.user.user_metadata?.role === 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    updateAuthState({
      user: session.user,
      session,
      profile,
      loading: false,
      error: null,
      isAuthenticated: true,
      isAdmin: session.user.user_metadata?.role === 'admin',
    });
  } else {
    // Load user profile from Supabase
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
  updateAuthState({ loading: true });
  
  // Check for demo session first
  const demoSessionStr = localStorage.getItem('fieldforge-demo-session');
  if (demoSessionStr) {
    try {
      const demoSessionData = JSON.parse(demoSessionStr);
      // Check if session is expired
      if (demoSessionData.expires_at && demoSessionData.expires_at > Math.floor(Date.now() / 1000)) {
        const demoSession: Session = {
          access_token: demoSessionData.access_token,
          refresh_token: `demo-refresh-${Date.now()}`,
          expires_in: demoSessionData.expires_at - Math.floor(Date.now() / 1000),
          expires_at: demoSessionData.expires_at,
          token_type: 'bearer',
          user: demoSessionData.user
        } as Session;
        
        console.log('✅ Restored demo session');
        await applySession(demoSession);
        return globalAuthState;
      } else {
        // Session expired, remove it
        localStorage.removeItem('fieldforge-demo-session');
      }
    } catch (error) {
      console.error('Error parsing demo session:', error);
      localStorage.removeItem('fieldforge-demo-session');
    }
  }
  
  // Check for Supabase session if configured
  if (supabaseUrl && supabaseAnonKey) {
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
  } else {
    console.log('⚠️ Supabase not configured, demo mode only');
    updateAuthState({ loading: false });
  }
  
  return globalAuthState;
}

// Demo account credentials (from Landing.tsx)
const DEMO_ACCOUNTS = {
  'demo@fieldforge.com': 'FieldForge2025!Demo',
  'manager@fieldforge.com': 'FieldForge2025!Demo',
  'admin@fieldforge.com': 'FieldForge2025!Demo'
};

// Sign in function
export async function signIn(email: string, password: string) {
  console.log('🔐 Signing in:', email);
  updateAuthState({ loading: true, error: null });
  
  // Check if this is a demo account
  const normalizedEmail = email.toLowerCase().trim();
  const isDemoAccount = normalizedEmail in DEMO_ACCOUNTS;
  const correctPassword = DEMO_ACCOUNTS[normalizedEmail as keyof typeof DEMO_ACCOUNTS];
  
  // If demo account and password matches, create demo session
  if (isDemoAccount && password === correctPassword) {
    console.log('✅ Demo account login detected');
    
    // Create demo session
    const demoSession: Session = {
      access_token: `demo-token-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: `demo-${normalizedEmail.split('@')[0]}`,
        email: normalizedEmail,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {
          provider: 'email',
          providers: ['email']
        },
        user_metadata: {
          role: normalizedEmail.includes('admin') ? 'admin' : normalizedEmail.includes('manager') ? 'manager' : 'field_worker',
          full_name: normalizedEmail.includes('admin') ? 'Demo Admin' : normalizedEmail.includes('manager') ? 'Demo Manager' : 'Demo Worker'
        },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      }
    } as Session;
    
    // Store demo session
    if (supabaseUrl && supabaseAnonKey) {
      // Try real Supabase first, but don't fail if it doesn't work
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: correctPassword
        });
        
        if (!error && data.session) {
          console.log('✅ Real Supabase login successful');
          updateAuthState({ loading: false, error: null, user: data.user, session: data.session });
          return data;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase login failed, using demo session:', supabaseError);
      }
    }
    
    // Use demo session
    console.log('✅ Using demo session');
    updateAuthState({ 
      loading: false, 
      error: null, 
      user: demoSession.user, 
      session: demoSession 
    });
    
    // Store in localStorage for persistence
    localStorage.setItem('fieldforge-demo-session', JSON.stringify({
      user: demoSession.user,
      access_token: demoSession.access_token,
      expires_at: demoSession.expires_at
    }));
    
    return { user: demoSession.user, session: demoSession };
  }
  
  // Regular Supabase login
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please use demo account: demo@fieldforge.com / FieldForge2025!Demo');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('✅ Sign in successful');
    updateAuthState({ loading: false, error: null, user: data.user, session: data.session });
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
  
  // Always clear demo session
  localStorage.removeItem('fieldforge-demo-session');
  
  try {
    // Try Supabase sign out if configured
    if (supabaseUrl && supabaseAnonKey) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    
    console.log('✅ Sign out successful');
    
  } catch (error) {
    console.error('❌ Sign out error:', error);
    // Even if sign out fails, clear local state
  }
  
  // Always clear auth state regardless of Supabase result
  updateAuthState({
    user: null,
    session: null,
    profile: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
  });
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








