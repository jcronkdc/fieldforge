import {
  createContext,
  type FC,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabaseClient";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn("Supabase not configured - running in demo mode");
      
      // Check for demo auth
      const demoAuth = localStorage.getItem('mythatron_demo_auth');
      const demoEmail = localStorage.getItem('mythatron_user_email');
      const demoId = localStorage.getItem('mythatron_user_id');
      
      if (demoAuth === 'true' && demoEmail && demoId) {
        // Create a fake session for demo mode
        setSession({
          access_token: 'demo-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          refresh_token: 'demo-refresh',
          user: {
            id: demoId,
            aud: 'authenticated',
            role: 'authenticated',
            email: demoEmail,
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
          }
        } as any);
      }
      
      setLoading(false);
      return;
    }

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        if (isMounted) {
          setSession(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const {
      data: authListener,
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    // Check if in demo mode
    const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!isDemoMode) {
      await supabaseClient.auth.signOut();
    }
    
    // Clear all local storage data
    localStorage.removeItem('mythatron_demo_auth');
    localStorage.removeItem('mythatron_user_id');
    localStorage.removeItem('mythatron_user_email');
    localStorage.removeItem('mythatron_sparks');
    localStorage.removeItem('mythatron_profile');
    // Force reload to landing page
    window.location.href = '/';
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: handleSignOut,
    }),
    [handleSignOut, loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


