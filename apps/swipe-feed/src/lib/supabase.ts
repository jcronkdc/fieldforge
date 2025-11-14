import { createClient } from '@supabase/supabase-js';
import { demoAuth } from './demo-auth';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in demo mode (no Supabase configured)
const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Validate required environment variables
if (isDemoMode) {
  console.log(
    '[FieldForge] Running in Demo Mode - No Supabase configured.',
    'To enable full functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client or demo client
let supabaseClient: any;

if (isDemoMode) {
  // Create a mock Supabase client that uses demo auth
  supabaseClient = {
    auth: {
      ...demoAuth,
      getSession: async () => {
        const { data } = await demoAuth.getUser();
        if (data.user) {
          return {
            data: {
              session: {
                user: data.user,
                access_token: 'demo-token',
                refresh_token: 'demo-refresh',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
              }
            },
            error: null
          };
        }
        return { data: { session: null }, error: null };
      },
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        return demoAuth.signIn(credentials.email, credentials.password);
      }
    },
    from: (table: string) => {
      // Mock database operations for demo mode
      console.log(`[Demo Mode] Database operation on table: ${table}`);
      return {
        select: () => Promise.resolve({ data: [], error: null }),
        insert: (data: any) => Promise.resolve({ data, error: null }),
        update: (data: any) => ({
          eq: () => Promise.resolve({ data, error: null }),
          match: () => Promise.resolve({ data, error: null })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          match: () => Promise.resolve({ data: null, error: null })
        }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        }),
        maybeSingle: () => Promise.resolve({ data: null, error: null, status: 200 })
      };
    },
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: { path: 'demo-path' }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/demo/${path}` } })
      })
    },
    realtime: {
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
        unsubscribe: () => {}
      })
    }
  };
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'FieldForge'
      }
    }
  });
}

export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !isDemoMode;
};

// Types for database tables (will be generated from Supabase later)
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_id?: string;
  job_title?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_number: string;
  name: string;
  project_type: 'transmission' | 'distribution' | 'substation' | 'mixed';
  voltage_class?: string;
  start_date?: string;
  end_date?: string;
  status: string;
}

export interface DailyReport {
  id: string;
  project_id: string;
  report_date: string;
  shift: 'day' | 'night' | 'swing';
  weather_am?: string;
  weather_pm?: string;
  crew_count?: number;
  structures_set?: number;
  conductor_strung_ft?: number;
  safety_briefing_held: boolean;
  created_at: string;
}
