/**
 * Authentication Middleware for FieldForge
 * Ensures all protected routes and API calls are authenticated
 */

import { supabase } from '../supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  session: Session;
  isAdmin: boolean;
  company_id?: string;
}

/**
 * Check if user is authenticated
 */
export async function requireAuth(): Promise<AuthContext | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_admin, company_id')
      .eq('id', session.user.id)
      .single();

    return {
      user: session.user,
      session,
      isAdmin: profile?.is_admin || profile?.role === 'admin',
      company_id: profile?.company_id
    };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export async function requireRole(requiredRole: string): Promise<boolean> {
  try {
    const auth = await requireAuth();
    if (!auth) return false;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', auth.user.id)
      .single();

    return profile?.role === requiredRole || profile?.role === 'admin';
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

/**
 * Check if user belongs to specific project
 */
export async function requireProjectAccess(projectId: string): Promise<boolean> {
  try {
    const auth = await requireAuth();
    if (!auth) return false;

    // Admins have access to all projects
    if (auth.isAdmin) return true;

    const { data: teamMember } = await supabase
      .from('project_team')
      .select('id, role')
      .eq('project_id', projectId)
      .eq('user_id', auth.user.id)
      .single();

    return !!teamMember;
  } catch (error) {
    console.error('Project access check failed:', error);
    return false;
  }
}

/**
 * Check if user can manage team for a project
 */
export async function requireProjectManagement(projectId: string): Promise<boolean> {
  try {
    const auth = await requireAuth();
    if (!auth) return false;

    // Admins can manage all projects
    if (auth.isAdmin) return true;

    const { data: teamMember } = await supabase
      .from('project_team')
      .select('role, permissions')
      .eq('project_id', projectId)
      .eq('user_id', auth.user.id)
      .single();

    // Check if user is project manager or has manage_team permission
    return teamMember?.role === 'manager' || 
           teamMember?.role === 'admin' ||
           teamMember?.permissions?.manage_team === true;
  } catch (error) {
    console.error('Project management check failed:', error);
    return false;
  }
}

/**
 * Check if user can approve receipts
 */
export async function requireReceiptApproval(projectId?: string): Promise<boolean> {
  try {
    const auth = await requireAuth();
    if (!auth) return false;

    // Admins can approve all receipts
    if (auth.isAdmin) return true;

    if (projectId) {
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('role, permissions')
        .eq('project_id', projectId)
        .eq('user_id', auth.user.id)
        .single();

      // Project managers and those with budget permissions can approve
      return teamMember?.role === 'manager' || 
             teamMember?.role === 'admin' ||
             teamMember?.permissions?.manage_budget === true;
    }

    // Check if user has any manager role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, job_title')
      .eq('id', auth.user.id)
      .single();

    return profile?.role === 'manager' || 
           profile?.role === 'admin' ||
           profile?.job_title?.toLowerCase().includes('manager');
  } catch (error) {
    console.error('Receipt approval check failed:', error);
    return false;
  }
}

/**
 * Check if user can access safety features
 */
export async function requireSafetyAccess(): Promise<boolean> {
  try {
    const auth = await requireAuth();
    if (!auth) return false;

    // All authenticated users can access safety features
    // But we log it for audit purposes
    await supabase
      .from('activity_logs')
      .insert({
        user_id: auth.user.id,
        action: 'safety_access',
        timestamp: new Date().toISOString()
      });

    return true;
  } catch (error) {
    console.error('Safety access check failed:', error);
    return false;
  }
}

/**
 * Middleware to check authentication on route change
 */
export function authGuard(requiredAuth: boolean = true) {
  return async (context: any, next: () => void) => {
    if (requiredAuth) {
      const auth = await requireAuth();
      if (!auth) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      context.auth = auth;
    }
    next();
  };
}

/**
 * Get current user's company
 */
export async function getUserCompany(): Promise<string | null> {
  try {
    const auth = await requireAuth();
    if (!auth) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', auth.user.id)
      .single();

    return profile?.company_id || null;
  } catch (error) {
    console.error('Failed to get user company:', error);
    return null;
  }
}

/**
 * Refresh authentication token
 */
export async function refreshAuth(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }
}

/**
 * Monitor authentication state changes
 */
export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return subscription;
}

export default {
  requireAuth,
  requireRole,
  requireProjectAccess,
  requireProjectManagement,
  requireReceiptApproval,
  requireSafetyAccess,
  authGuard,
  getUserCompany,
  refreshAuth,
  onAuthStateChange
};
