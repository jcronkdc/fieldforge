"use strict";
/**
 * Request ID Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 *
 * Adds a unique request ID to each request for better tracing and logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
/**
 * Middleware to add request ID to each request
 */
function requestIdMiddleware(req, res, next) {
    // Use existing request ID from header if present, otherwise generate one
    const requestId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    req.requestId = requestId;
    // Add request ID to response headers for client tracing
    res.setHeader('X-Request-ID', requestId);
    next();
}
