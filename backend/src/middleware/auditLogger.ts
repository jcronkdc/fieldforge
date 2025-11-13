import { query } from '../database.js';

interface AuditLogEntry {
  action: string;
  userId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

class AuditLogger {
  async log(action: string, userId?: string, metadata?: any): Promise<void> {
    try {
      // In production, this would insert into an audit log table
      console.log(`[AUDIT] ${action} by user ${userId}`, metadata);
      
      // Optional: Insert into database
      // await query(
      //   `INSERT INTO audit_logs (action, user_id, metadata, created_at)
      //    VALUES ($1, $2, $3, NOW())`,
      //   [action, userId, JSON.stringify(metadata)]
      // );
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}

export const auditLogger = new AuditLogger();
export const auditLog = auditLogger.log.bind(auditLogger);
