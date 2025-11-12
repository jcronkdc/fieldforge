/**
 * Authentication Headers Helper
 * Provides a consistent way to add Supabase auth tokens to API requests
 */

/**
 * Get authorization header with Supabase session token
 * Returns empty object if no session is available
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`
      };
    }
  } catch (error) {
    // Supabase not available or session error
    console.warn('Could not get Supabase session for API request:', error);
  }

  return {};
}


