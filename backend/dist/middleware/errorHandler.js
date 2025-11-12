"use strict";
/**
 * Error Handling Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 *
 * Centralized error handling with proper logging and user-friendly responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = createError;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
const auditLog_1 = require("./auditLog");
/**
 * Create an application error
 */
function createError(message, statusCode = 500, code) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.isOperational = true;
    return error;
}
/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
    const requestId = req.requestId || 'unknown';
    const userId = req.user?.id;
    // Determine status code
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;
    // Log error
    const errorLog = {
        requestId,
        userId,
        method: req.method,
        path: req.path,
        statusCode,
        error: {
            message: err.message,
            code: err.code,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
        timestamp: new Date().toISOString(),
    };
    if (statusCode >= 500) {
        console.error('[ERROR]', errorLog);
    }
    else {
        console.warn('[WARN]', errorLog);
    }
    // Log to audit if it's an authentication/authorization error
    if (statusCode === 401 || statusCode === 403) {
        (0, auditLog_1.logAuditEvent)({
            user_id: userId,
            action: `error_${statusCode}`,
            resource_type: 'error',
            resource_id: requestId,
            ip_address: req.ip || req.socket.remoteAddress || undefined,
            user_agent: req.get('user-agent') || undefined,
            metadata: {
                method: req.method,
                path: req.path,
                error_message: err.message,
            },
            success: false,
            error_message: err.message,
        }).catch(() => {
            // Ignore audit logging errors
        });
    }
    // Send error response
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(statusCode).json({
        error: {
            message: isProduction && !isOperational
                ? 'An internal server error occurred'
                : err.message,
            code: err.code,
            requestId,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
            }),
        },
    });
}
/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    const error = createError(`Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
    next(error);
}
/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
