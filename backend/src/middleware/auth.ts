/**
 * Authentication Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Request, Response, NextFunction } from 'express';

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

/**
 * Middleware to authenticate requests
 * In production, this would verify JWT tokens or session
 */
export function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  // For development/testing, extract user from headers or use demo user
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In production, verify JWT token here
    const token = authHeader.substring(7);
    
    // Mock user for development
    req.user = {
      id: req.headers['x-user-id'] as string || 'demo_user',
      email: req.headers['x-user-email'] as string || 'demo@mythatron.com',
      role: req.headers['x-user-role'] as string || 'user',
    };
    
    next();
  } else {
    // For development, allow with demo user
    req.user = {
      id: 'demo_user',
      email: 'demo@mythatron.com',
      role: 'user',
    };
    next();
    
    // In production, uncomment this:
    // res.status(401).json({ error: 'Authentication required' });
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
