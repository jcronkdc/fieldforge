/**
 * Audit Logging Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { loadEnv } from '../worker/env';

const env = loadEnv();

// Database pool for audit logging
let auditPool: Pool | null = null;
if (env.DATABASE_URL) {
  auditPool = new Pool({
    connectionString: env.DATABASE_URL,
  });
}

export interface AuditEvent {
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  error_message?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  if (!auditPool) {
    console.warn('[audit] Database pool not available, skipping audit log');
    return;
  }

  try {
    await auditPool.query(
      `INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, ip_address, 
        user_agent, metadata, success, error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        event.user_id || null,
        event.action,
        event.resource_type || null,
        event.resource_id || null,
        event.ip_address || null,
        event.user_agent || null,
        event.metadata ? JSON.stringify(event.metadata) : null,
        event.success,
        event.error_message || null,
      ]
    );
  } catch (error) {
    // Don't throw - audit logging should never break the application
    console.error('[audit] Failed to log audit event:', error);
  }
}

/**
 * Middleware to log authentication events
 */
export function auditAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  const startTime = Date.now();

  // Override res.send to capture response
  res.send = function (body: unknown) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;

    // Extract user info from request
    const userId = (req as any).user?.id;
    const action = `auth_${req.method.toLowerCase()}_${req.path.replace(/^\/api\/auth\//, '').replace(/\//g, '_')}`;

    // Log authentication event
    logAuditEvent({
      user_id: userId,
      action,
      resource_type: 'authentication',
      ip_address: req.ip || req.socket.remoteAddress || undefined,
      user_agent: req.get('user-agent') || undefined,
      metadata: {
        method: req.method,
        path: req.path,
        status_code: res.statusCode,
        duration_ms: duration,
      },
      success,
      error_message: success ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
    }).catch(() => {
      // Ignore audit logging errors
    });

    return originalSend.call(this, body);
  };

  next();
}

/**
 * Helper to log authentication success
 */
export function logAuthSuccess(userId: string, action: string, req: Request, metadata?: Record<string, unknown>): void {
  logAuditEvent({
    user_id: userId,
    action: `auth_${action}_success`,
    resource_type: 'authentication',
    ip_address: req.ip || req.socket.remoteAddress || undefined,
    user_agent: req.get('user-agent') || undefined,
    metadata,
    success: true,
  }).catch(() => {
    // Ignore audit logging errors
  });
}

/**
 * Helper to log authentication failure
 */
export function logAuthFailure(
  userId: string | undefined,
  action: string,
  req: Request,
  errorMessage: string,
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    user_id: userId,
    action: `auth_${action}_failure`,
    resource_type: 'authentication',
    ip_address: req.ip || req.socket.remoteAddress || undefined,
    user_agent: req.get('user-agent') || undefined,
    metadata,
    success: false,
    error_message: errorMessage,
  }).catch(() => {
    // Ignore audit logging errors
  });
}

/**
 * Helper to log token verification events
 */
export function logTokenVerification(
  userId: string | undefined,
  success: boolean,
  req: Request,
  errorMessage?: string
): void {
  logAuditEvent({
    user_id: userId,
    action: 'token_verification',
    resource_type: 'authentication',
    ip_address: req.ip || req.socket.remoteAddress || undefined,
    user_agent: req.get('user-agent') || undefined,
    metadata: {
      method: req.method,
      path: req.path,
    },
    success,
    error_message: errorMessage,
  }).catch(() => {
    // Ignore audit logging errors
  });
}

