/**
 * Rate Limiting Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Extend Express Request type to include rateLimit property
declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: number;
    };
  }
}

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 15 * 60 * 1000 - Date.now()) / 1000),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 15 * 60 * 1000 - Date.now()) / 1000),
    });
  },
});

/**
 * Strict rate limiter for password reset endpoints
 * Limits: 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many password reset requests',
      message: 'Too many password reset attempts. Please try again in an hour.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60 * 60 * 1000 - Date.now()) / 1000),
    });
  },
});

/**
 * Rate limiter for sensitive operations (e.g., payments, admin actions)
 * Limits: 10 requests per minute per IP
 */
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please slow down.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60 * 1000 - Date.now()) / 1000),
    });
  },
});

