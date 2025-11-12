/**
 * Request ID Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Adds a unique request ID to each request for better tracing and logging
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware to add request ID to each request
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing request ID from header if present, otherwise generate one
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  
  req.requestId = requestId;
  
  // Add request ID to response headers for client tracing
  res.setHeader('X-Request-ID', requestId);
  
  next();
}


