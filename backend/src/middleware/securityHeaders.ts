/**
 * Security Headers Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Sets security headers to protect against common web vulnerabilities
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to set security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy - only send origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy - restrict access to browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  // Strict Transport Security (HSTS) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production' && req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Content Security Policy for API responses
  // Note: This is a basic CSP - adjust based on your needs
  if (req.path.startsWith('/api')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'none'; style-src 'none'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
    );
  }
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  // Session security headers
  res.setHeader('X-Session-Security', 'strict');
  
  // Prevent caching of sensitive data
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}


