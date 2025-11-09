import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserProfile } from '../lib/auth';

interface UserProfile {
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

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Custom hook for authentication management
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isAdmin: false
  });

  useEffect(() => {
    // Check initial session
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await loadProfile(session.user.id);
        setAuthState({
          user: session.user,
          session,
          profile,
          loading: false,
          error: null,
          isAuthenticated: true,
          isAdmin: profile?.is_admin || profile?.role === 'admin'
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          isAdmin: false
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session) {
        const profile = await loadProfile(session.user.id);
        setAuthState({
          user: session.user,
          session,
          profile,
          loading: false,
          error: null,
          isAuthenticated: true,
          isAdmin: profile?.is_admin || profile?.role === 'admin'
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const loadProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const profile = await getUserProfile(userId);
      return profile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        const profile = await loadProfile(data.session.user.id);
        setAuthState({
          user: data.session.user,
          session: data.session,
          profile,
          loading: false,
          error: null,
          isAuthenticated: true,
          isAdmin: profile?.is_admin || profile?.role === 'admin'
        });
      }

      return data;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      phone?: string;
      jobTitle?: string;
      employeeId?: string;
    }
  ) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            job_title: userData.jobTitle,
            employee_id: userData.employeeId
          }
        }
      });

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      return data;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isAdmin: false
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!authState.user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        profile: data
      }));

      return data;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (session) {
        const profile = await loadProfile(session.user.id);
        setAuthState({
          user: session.user,
          session,
          profile,
          loading: false,
          error: null,
          isAuthenticated: true,
          isAdmin: profile?.is_admin || profile?.role === 'admin'
        });
      }

      return session;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
    checkSession
  };
}
