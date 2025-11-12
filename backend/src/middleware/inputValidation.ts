/**
 * Input Validation Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Validates and sanitizes request input to prevent injection attacks
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes and control characters
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware to validate and sanitize request body
 */
export function validateRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body) as typeof req.body;
  }
  next();
}

/**
 * Middleware to validate and sanitize query parameters
 */
export function validateQueryParams(req: Request, res: Response, next: NextFunction) {
  if (req.query && typeof req.query === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    req.query = sanitized as typeof req.query;
  }
  next();
}

/**
 * Middleware to validate UUID parameters
 */
export function validateUUIDParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (value && !isValidUUID(value)) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }
    next();
  };
}

/**
 * Middleware to validate email in body
 */
export function validateEmail(fieldName: string = 'email') {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body?.[fieldName];
    if (email && typeof email === 'string' && !isValidEmail(email)) {
      return res.status(400).json({ error: `Invalid ${fieldName} format` });
    }
    next();
  };
}

/**
 * Middleware to validate required fields in request body
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missing 
      });
    }
    next();
  };
}

