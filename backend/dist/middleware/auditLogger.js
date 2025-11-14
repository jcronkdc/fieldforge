"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = exports.auditLogger = void 0;
class AuditLogger {
    async log(action, userId, metadata) {
        try {
            // In production, this would insert into an audit log table
            console.log(`[AUDIT] ${action} by user ${userId}`, metadata);
            // Optional: Insert into database
            // await query(
            //   `INSERT INTO audit_logs (action, user_id, metadata, created_at)
            //    VALUES ($1, $2, $3, NOW())`,
            //   [action, userId, JSON.stringify(metadata)]
            // );
        }
        catch (error) {
            console.error('Failed to write audit log:', error);
        }
    }
}
exports.auditLogger = new AuditLogger();
exports.auditLog = exports.auditLogger.log.bind(exports.auditLogger);
