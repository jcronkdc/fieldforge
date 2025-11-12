"use strict";
/**
 * Authentication Middleware
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRequest = authenticateRequest;
exports.requireAdmin = requireAdmin;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../worker/env");
const auditLog_1 = require("./auditLog");
const env = (0, env_1.loadEnv)();
// Initialize Supabase admin client for token verification
let supabaseAdmin = null;
if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    supabaseAdmin = (0, supabase_js_1.createClient)(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
/**
 * Middleware to authenticate requests
 * Verifies Supabase JWT tokens in production, allows demo users in development
 */
async function authenticateRequest(req, res, next) {
    const isProduction = process.env.NODE_ENV === 'production';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (isProduction) {
            // Production: Verify JWT token with Supabase
            if (!supabaseAdmin) {
                console.warn('[auth] Supabase not configured - falling back to header-based auth');
                // Fallback to header-based auth if Supabase not configured
                const userId = req.headers['x-user-id'];
                if (!userId) {
                    return res.status(401).json({ error: 'Invalid authentication token' });
                }
                req.user = {
                    id: userId,
                    email: req.headers['x-user-email'] || undefined,
                    role: req.headers['x-user-role'] || 'user',
                };
                return next();
            }
            try {
                // Verify token with Supabase
                const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
                if (error || !user) {
                    (0, auditLog_1.logTokenVerification)(undefined, false, req, error?.message || 'Invalid or expired token');
                    return res.status(401).json({ error: 'Invalid or expired authentication token' });
                }
                // Get user profile for role information
                try {
                    const { data: profile } = await supabaseAdmin
                        .from('user_profiles')
                        .select('role, is_admin, company_id')
                        .eq('id', user.id)
                        .maybeSingle();
                    const profileData = profile;
                    req.user = {
                        id: user.id,
                        email: user.email || undefined,
                        role: (profileData?.is_admin ? 'admin' : (profileData?.role || 'user')),
                    };
                    // Log successful token verification
                    (0, auditLog_1.logTokenVerification)(user.id, true, req);
                }
                catch (profileError) {
                    // If profile lookup fails, still allow auth but with default role
                    console.warn('[auth] Profile lookup failed:', profileError);
                    req.user = {
                        id: user.id,
                        email: user.email || undefined,
                        role: 'user',
                    };
                    (0, auditLog_1.logTokenVerification)(user.id, true, req);
                }
                next();
            }
            catch (error) {
                console.error('[auth] Token verification error:', error);
                (0, auditLog_1.logTokenVerification)(undefined, false, req, error instanceof Error ? error.message : 'Unknown error');
                return res.status(401).json({ error: 'Authentication failed' });
            }
        }
        else {
            // Development: Allow with headers or demo user
            req.user = {
                id: req.headers['x-user-id'] || 'demo_user',
                email: req.headers['x-user-email'] || 'demo@mythatron.com',
                role: req.headers['x-user-role'] || 'user',
            };
            next();
        }
    }
    else {
        if (isProduction) {
            // Production: Require authentication
            (0, auditLog_1.logAuthFailure)(undefined, 'missing_token', req, 'No authentication token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }
        else {
            // Development: Allow with demo user
            req.user = {
                id: 'demo_user',
                email: 'demo@mythatron.com',
                role: 'user',
            };
            next();
        }
    }
}
/**
 * Middleware to require admin role
 */
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}
