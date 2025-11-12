/**
 * Authentication Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from '../worker/env';
import { logTokenVerification, logAuthFailure } from './auditLog';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

const env = loadEnv();

// Initialize Supabase admin client for token verification
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
  supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Middleware to authenticate requests
 * Verifies Supabase JWT tokens in production, allows demo users in development
 */
export async function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production';
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (isProduction) {
      // Production: Verify JWT token with Supabase
      if (!supabaseAdmin) {
        console.error('[auth] CRITICAL: Supabase not configured in production - authentication cannot proceed');
        logAuthFailure(undefined, 'supabase_not_configured', req, 'Supabase admin client not initialized');
        return res.status(500).json({ error: 'Authentication service unavailable' });
      }
      
      try {
        // Verify token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) {
          logTokenVerification(undefined, false, req, error?.message || 'Invalid or expired token');
          return res.status(401).json({ error: 'Invalid or expired authentication token' });
        }
        
        // Get user profile for role information
        try {
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('role, is_admin, company_id')
            .eq('id', user.id)
            .maybeSingle();
          
          const profileData = profile as { role?: string; is_admin?: boolean; company_id?: string } | null;
          
          req.user = {
            id: user.id,
            email: user.email || undefined,
            role: (profileData?.is_admin ? 'admin' : (profileData?.role || 'user')) as string,
          };
          
          // Log successful token verification
          logTokenVerification(user.id, true, req);
        } catch (profileError) {
          // If profile lookup fails, still allow auth but with default role
          console.warn('[auth] Profile lookup failed:', profileError);
          req.user = {
            id: user.id,
            email: user.email || undefined,
            role: 'user',
          };
          logTokenVerification(user.id, true, req);
        }
        
        next();
      } catch (error) {
        console.error('[auth] Token verification error:', error);
        logTokenVerification(undefined, false, req, error instanceof Error ? error.message : 'Unknown error');
        return res.status(401).json({ error: 'Authentication failed' });
      }
    } else {
      // Development: Allow with headers or demo user
      req.user = {
        id: req.headers['x-user-id'] as string || 'demo_user',
        email: req.headers['x-user-email'] as string || 'demo@mythatron.com',
        role: req.headers['x-user-role'] as string || 'user',
      };
      next();
    }
  } else {
    if (isProduction) {
      // Production: Require authentication
      logAuthFailure(undefined, 'missing_token', req, 'No authentication token provided');
      return res.status(401).json({ error: 'Authentication required' });
    } else {
      // Development: Allow with demo user
      req.user = {
        id: 'demo_user',
        email: 'demo@mythatron.com',
        role: 'user',
      };
      next();
    }
  }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
