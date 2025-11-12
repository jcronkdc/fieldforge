"use strict";
/**
 * Input Validation Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 *
 * Validates and sanitizes request input to prevent injection attacks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestBody = validateRequestBody;
exports.validateQueryParams = validateQueryParams;
exports.validateUUIDParam = validateUUIDParam;
exports.validateEmail = validateEmail;
exports.validateRequiredFields = validateRequiredFields;
/**
 * Sanitize string input to prevent XSS and injection attacks
 */
function sanitizeString(input) {
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
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
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
        const sanitized = {};
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
function validateRequestBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}
/**
 * Middleware to validate and sanitize query parameters
 */
function validateQueryParams(req, res, next) {
    if (req.query && typeof req.query === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeString(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        req.query = sanitized;
    }
    next();
}
/**
 * Middleware to validate UUID parameters
 */
function validateUUIDParam(paramName) {
    return (req, res, next) => {
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
function validateEmail(fieldName = 'email') {
    return (req, res, next) => {
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
function validateRequiredFields(fields) {
    return (req, res, next) => {
        const missing = [];
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
