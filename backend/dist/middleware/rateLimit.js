"use strict";
/**
 * Rate Limiting Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensitiveOperationLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
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
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
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
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: 'Too many password reset requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
exports.sensitiveOperationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please slow down.',
            retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60 * 1000 - Date.now()) / 1000),
        });
    },
});
