import { useState, useEffect, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
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

type CheckSessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;
type SignInResult = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
type SignUpResult = Awaited<ReturnType<typeof supabase.auth.signUp>>;
type SignOutResult = Awaited<ReturnType<typeof supabase.auth.signOut>>;
type RefreshSessionResult = Awaited<ReturnType<typeof supabase.auth.refreshSession>>;

const INITIAL_STATE: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
};

/**
 * Manage Supabase authentication state, including user profile lookups and helpers.
 * @returns Authentication state plus helpers for sign-in, sign-out, and profile updates.
 */
export function useAuth(): AuthState & {
  signIn(email: string, password: string): Promise<SignInResult['data']>;
  signUp(
    email: string,
    password: string,
    userData: { firstName: string; lastName: string; phone?: string; jobTitle?: string; employeeId?: string; }
  ): Promise<SignUpResult['data']>;
  signOut(): Promise<void>;
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  refreshSession(): Promise<Session | null>;
  checkSession(): Promise<void>;
} {
  const [authState, setAuthState] = useState<AuthState>({
    ...INITIAL_STATE,
  });
  const mountedRef = useRef(true);

  const updateAuthState = useCallback(
    (updater: AuthState | ((prev: AuthState) => AuthState)) => {
      if (!mountedRef.current) return;
      setAuthState((prev) => (typeof updater === 'function' ? (updater as (prev: AuthState) => AuthState)(prev) : updater));
    },
    []
  );

  const loadProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      return await getUserProfile(userId);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }, []);

  const applySession = useCallback(
    async (session: Session | null) => {
      if (!session) {
        updateAuthState({
          ...INITIAL_STATE,
          loading: false,
        });
        return;
      }

      const profile = await loadProfile(session.user.id);
      updateAuthState({
        user: session.user,
        session,
        profile,
        loading: false,
        error: null,
        isAuthenticated: true,
        isAdmin: Boolean(profile?.is_admin || profile?.role === 'admin'),
      });
    },
    [loadProfile, updateAuthState]
  );

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const { data, error }: CheckSessionResult = await supabase.auth.getSession();
      if (error) throw error;
      await applySession(data.session ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to check session';
      updateAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, [applySession, updateAuthState]);

  useEffect(() => {
    mountedRef.current = true;
    void checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session ?? null);
    });

    return () => {
      subscription.unsubscribe();
      mountedRef.current = false;
    };
  }, [applySession, checkSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult['data']> => {
    try {
        updateAuthState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.session) {
          await applySession(data.session);
        } else {
          updateAuthState((prev) => ({ ...prev, loading: false }));
        }

        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sign in';
        updateAuthState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
        throw error;
      }
    },
    [applySession, updateAuthState]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      userData: {
        firstName: string;
        lastName: string;
        phone?: string;
        jobTitle?: string;
        employeeId?: string;
      }
    ): Promise<SignUpResult['data']> => {
    try {
        updateAuthState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone: userData.phone,
              job_title: userData.jobTitle,
              employee_id: userData.employeeId,
            },
          },
        });

        if (error) throw error;

        updateAuthState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));

        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sign up';
        updateAuthState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
        throw error;
      }
    },
    [updateAuthState]
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error }: SignOutResult = await supabase.auth.signOut();
      if (error) throw error;

      updateAuthState({
        ...INITIAL_STATE,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out';
      updateAuthState((prev) => ({
        ...prev,
        error: message,
      }));
      throw error;
    }
  }, [updateAuthState]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<UserProfile> => {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authState.user.id)
          .select()
          .single();

        if (error) throw error;

        updateAuthState((prev) => ({
          ...prev,
          profile: data,
        }));

        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update profile';
        updateAuthState((prev) => ({
          ...prev,
          error: message,
        }));
        throw error;
      }
    },
    [authState.user, updateAuthState]
  );

  const refreshSession = useCallback(async (): Promise<Session | null> => {
    try {
      const { data, error }: RefreshSessionResult = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        await applySession(data.session);
      }
      return data.session ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh session';
      updateAuthState((prev) => ({
        ...prev,
        error: message,
      }));
      throw error;
    }
  }, [applySession, updateAuthState]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
    checkSession,
  };
}
