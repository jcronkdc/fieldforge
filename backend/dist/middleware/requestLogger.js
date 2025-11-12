"use strict";
/**
 * Request Logging Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 *
 * Logs HTTP requests with structured logging for better observability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
/**
 * Middleware to log HTTP requests
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();
    const requestId = req.requestId;
    // Log request start
    const logData = {
        requestId,
        method: req.method,
        path: req.path,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        ip: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.get('user-agent') || undefined,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
    };
    // Log response when finished
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logData.statusCode = res.statusCode;
        logData.responseTime = responseTime;
        // Log the request
        const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        const logMessage = `${req.method} ${req.path} ${res.statusCode} ${responseTime}ms`;
        if (logLevel === 'error') {
            console.error(`[${logLevel.toUpperCase()}] ${logMessage}`, logData);
        }
        else if (logLevel === 'warn') {
            console.warn(`[${logLevel.toUpperCase()}] ${logMessage}`, logData);
        }
        else {
            console.log(`[${logLevel.toUpperCase()}] ${logMessage}`, logData);
        }
    });
    next();
}
