import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
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
