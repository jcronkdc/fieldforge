"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanyRouter = createCompanyRouter;
const express_1 = require("express");
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const database_js_1 = require("../database.js");
const auditLogger_js_1 = require("../middleware/auditLogger.js");
// Company data validation schema
const companyDataSchema = zod_1.z.object({
    name: zod_1.z.string(),
    legalName: zod_1.z.string(),
    taxId: zod_1.z.string().optional(),
    registrationNumber: zod_1.z.string().optional(),
    industry: zod_1.z.string(),
    founded: zod_1.z.string(),
    website: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.object({
        street: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        zipCode: zod_1.z.string().optional(),
        country: zod_1.z.string()
    }),
    branding: zod_1.z.object({
        primaryColor: zod_1.z.string(),
        secondaryColor: zod_1.z.string(),
        logoUrl: zod_1.z.string().optional(),
        faviconUrl: zod_1.z.string().optional(),
        emailHeader: zod_1.z.string().optional()
    }),
    settings: zod_1.z.object({
        timezone: zod_1.z.string(),
        currency: zod_1.z.string(),
        dateFormat: zod_1.z.string(),
        fiscalYearStart: zod_1.z.string(),
        defaultProjectDuration: zod_1.z.number(),
        autoNumberProjects: zod_1.z.boolean(),
        projectPrefix: zod_1.z.string(),
        requireApprovals: zod_1.z.boolean(),
        approvalThreshold: zod_1.z.number()
    }),
    subscription: zod_1.z.object({
        plan: zod_1.z.enum(['starter', 'professional', 'enterprise']),
        status: zod_1.z.enum(['active', 'trialing', 'canceled', 'past_due']),
        currentPeriodEnd: zod_1.z.string(),
        seats: zod_1.z.number(),
        usedSeats: zod_1.z.number()
    }),
    features: zod_1.z.object({
        advancedAnalytics: zod_1.z.boolean(),
        apiAccess: zod_1.z.boolean(),
        customWorkflows: zod_1.z.boolean(),
        unlimitedProjects: zod_1.z.boolean(),
        prioritySupport: zod_1.z.boolean(),
        whiteLabel: zod_1.z.boolean(),
        ssoEnabled: zod_1.z.boolean()
    })
});
// Role validation schema
const roleSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string())
});
// Workflow template validation schema
const workflowTemplateSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    steps: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        assignee: zod_1.z.string(),
        duration: zod_1.z.number(),
        dependencies: zod_1.z.array(zod_1.z.string())
    })),
    isDefault: zod_1.z.boolean()
});
// API key validation schema
const apiKeySchema = zod_1.z.object({
    name: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string())
});
function createCompanyRouter() {
    const router = (0, express_1.Router)();
    // Get company data
    router.get('/', async (req, res) => {
        try {
            const userId = req.user?.id;
            // Get user's company ID
            const userResult = await (0, database_js_1.query)('SELECT company_id FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const companyId = userResult.rows[0].company_id;
            // Fetch company data
            const companyResult = await (0, database_js_1.query)('SELECT * FROM company_settings WHERE id = $1', [companyId]);
            if (companyResult.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Company not found' });
            }
            res.json({ success: true, company: companyResult.rows[0].data });
        }
        catch (error) {
            console.error('Error fetching company data:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch company data' });
        }
    });
    // Update company data
    router.put('/', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = companyDataSchema.parse(req.body);
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            // Check if user has permission to update company settings
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Update company data
            await (0, database_js_1.query)(`INSERT INTO company_settings (id, data, updated_at, updated_by)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (id)
         DO UPDATE SET data = $2, updated_at = NOW(), updated_by = $3`, [companyId, JSON.stringify(validatedData), userId]);
            auditLogger_js_1.auditLogger.log('company_settings_updated', userId, {
                company_id: companyId,
                changes: Object.keys(req.body)
            });
            res.json({ success: true, company: validatedData });
        }
        catch (error) {
            console.error('Error updating company data:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid company data',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to update company data' });
        }
    });
    // Get company roles
    router.get('/roles', async (req, res) => {
        try {
            const userId = req.user?.id;
            // Get user's company ID
            const userResult = await (0, database_js_1.query)('SELECT company_id FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const companyId = userResult.rows[0].company_id;
            // Fetch roles
            const rolesResult = await (0, database_js_1.query)(`SELECT r.*, COUNT(u.id) as member_count
         FROM company_roles r
         LEFT JOIN users u ON u.company_id = r.company_id AND u.role = r.name
         WHERE r.company_id = $1
         GROUP BY r.id
         ORDER BY r.created_at`, [companyId]);
            const roles = rolesResult.rows.map((row) => ({
                id: row.id,
                name: row.name,
                description: row.description,
                permissions: row.permissions,
                isSystem: row.is_system,
                memberCount: parseInt(row.member_count)
            }));
            res.json({ success: true, roles });
        }
        catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch roles' });
        }
    });
    // Create new role
    router.post('/roles', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = roleSchema.parse(req.body);
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Create role
            const result = await (0, database_js_1.query)(`INSERT INTO company_roles (company_id, name, description, permissions, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`, [companyId, validatedData.name, validatedData.description, validatedData.permissions, userId]);
            auditLogger_js_1.auditLogger.log('role_created', userId, {
                company_id: companyId,
                role_name: validatedData.name
            });
            res.json({
                success: true,
                role: {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    description: result.rows[0].description,
                    permissions: result.rows[0].permissions,
                    isSystem: false,
                    memberCount: 0
                }
            });
        }
        catch (error) {
            console.error('Error creating role:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid role data',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to create role' });
        }
    });
    // Update role
    router.put('/roles/:roleId', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { roleId } = req.params;
            const validatedData = roleSchema.parse(req.body);
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Check if role is system role
            const roleCheck = await (0, database_js_1.query)('SELECT is_system FROM company_roles WHERE id = $1 AND company_id = $2', [roleId, companyId]);
            if (!roleCheck.rows.length) {
                return res.status(404).json({ success: false, error: 'Role not found' });
            }
            if (roleCheck.rows[0].is_system) {
                // For system roles, only update permissions
                await (0, database_js_1.query)('UPDATE company_roles SET permissions = $1, updated_at = NOW() WHERE id = $2', [validatedData.permissions, roleId]);
            }
            else {
                // For custom roles, update everything
                await (0, database_js_1.query)('UPDATE company_roles SET name = $1, description = $2, permissions = $3, updated_at = NOW() WHERE id = $4', [validatedData.name, validatedData.description, validatedData.permissions, roleId]);
            }
            auditLogger_js_1.auditLogger.log('role_updated', userId, {
                company_id: companyId,
                role_id: roleId
            });
            res.json({ success: true, role: validatedData });
        }
        catch (error) {
            console.error('Error updating role:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid role data',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to update role' });
        }
    });
    // Delete role
    router.delete('/roles/:roleId', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { roleId } = req.params;
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Check if role is system role or has members
            const roleCheck = await (0, database_js_1.query)(`SELECT r.is_system, COUNT(u.id) as member_count
         FROM company_roles r
         LEFT JOIN users u ON u.company_id = r.company_id AND u.role = r.name
         WHERE r.id = $1 AND r.company_id = $2
         GROUP BY r.id, r.is_system`, [roleId, companyId]);
            if (!roleCheck.rows.length) {
                return res.status(404).json({ success: false, error: 'Role not found' });
            }
            if (roleCheck.rows[0].is_system) {
                return res.status(400).json({ success: false, error: 'Cannot delete system role' });
            }
            if (parseInt(roleCheck.rows[0].member_count) > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete role with active members'
                });
            }
            // Delete role
            await (0, database_js_1.query)('DELETE FROM company_roles WHERE id = $1 AND company_id = $2', [roleId, companyId]);
            auditLogger_js_1.auditLogger.log('role_deleted', userId, {
                company_id: companyId,
                role_id: roleId
            });
            res.json({ success: true, message: 'Role deleted' });
        }
        catch (error) {
            console.error('Error deleting role:', error);
            res.status(500).json({ success: false, error: 'Failed to delete role' });
        }
    });
    // Get workflow templates
    router.get('/workflows', async (req, res) => {
        try {
            const userId = req.user?.id;
            // Get user's company ID
            const userResult = await (0, database_js_1.query)('SELECT company_id FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const companyId = userResult.rows[0].company_id;
            // Fetch workflows
            const workflowsResult = await (0, database_js_1.query)('SELECT * FROM workflow_templates WHERE company_id = $1 ORDER BY created_at', [companyId]);
            const workflows = workflowsResult.rows.map((row) => ({
                id: row.id,
                name: row.name,
                description: row.description,
                category: row.category,
                steps: row.steps,
                isDefault: row.is_default
            }));
            res.json({ success: true, workflows });
        }
        catch (error) {
            console.error('Error fetching workflows:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
        }
    });
    // Create workflow template
    router.post('/workflows', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = workflowTemplateSchema.parse(req.body);
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner', 'manager'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Create workflow
            const result = await (0, database_js_1.query)(`INSERT INTO workflow_templates 
         (company_id, name, description, category, steps, is_default, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [
                companyId,
                validatedData.name,
                validatedData.description,
                validatedData.category,
                JSON.stringify(validatedData.steps),
                validatedData.isDefault,
                userId
            ]);
            auditLogger_js_1.auditLogger.log('workflow_created', userId, {
                company_id: companyId,
                workflow_name: validatedData.name
            });
            res.json({
                success: true,
                workflow: {
                    id: result.rows[0].id,
                    ...validatedData
                }
            });
        }
        catch (error) {
            console.error('Error creating workflow:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid workflow data',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to create workflow' });
        }
    });
    // Get API keys
    router.get('/api-keys', async (req, res) => {
        try {
            const userId = req.user?.id;
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Fetch API keys
            const keysResult = await (0, database_js_1.query)('SELECT * FROM api_keys WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
            const keys = keysResult.rows.map((row) => ({
                id: row.id,
                name: row.name,
                key: row.key_preview, // Only show preview
                created: row.created_at,
                lastUsed: row.last_used,
                permissions: row.permissions,
                isActive: row.is_active
            }));
            res.json({ success: true, keys });
        }
        catch (error) {
            console.error('Error fetching API keys:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
        }
    });
    // Create API key
    router.post('/api-keys', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = apiKeySchema.parse(req.body);
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Generate API key
            const apiKey = `ff_${companyId}_${generateRandomKey()}`;
            const keyPreview = `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`;
            // Store API key
            const result = await (0, database_js_1.query)(`INSERT INTO api_keys 
         (company_id, name, key_hash, key_preview, permissions, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`, [
                companyId,
                validatedData.name,
                hashApiKey(apiKey), // Hash the key for storage
                keyPreview,
                validatedData.permissions,
                userId
            ]);
            auditLogger_js_1.auditLogger.log('api_key_created', userId, {
                company_id: companyId,
                key_id: result.rows[0].id,
                key_name: validatedData.name
            });
            res.json({
                success: true,
                key: {
                    id: result.rows[0].id,
                    name: validatedData.name,
                    key: apiKey, // Return full key only on creation
                    created: new Date().toISOString(),
                    permissions: validatedData.permissions,
                    isActive: true
                }
            });
        }
        catch (error) {
            console.error('Error creating API key:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid API key data',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to create API key' });
        }
    });
    // Revoke API key
    router.delete('/api-keys/:keyId', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { keyId } = req.params;
            // Get user's company ID and verify permissions
            const userResult = await (0, database_js_1.query)('SELECT company_id, role FROM users WHERE id = $1', [userId]);
            if (!userResult.rows[0]?.company_id) {
                return res.status(404).json({ success: false, error: 'No company found' });
            }
            const { company_id: companyId, role } = userResult.rows[0];
            if (!['admin', 'owner'].includes(role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }
            // Revoke key
            await (0, database_js_1.query)('UPDATE api_keys SET is_active = false, revoked_at = NOW(), revoked_by = $3 WHERE id = $1 AND company_id = $2', [keyId, companyId, userId]);
            auditLogger_js_1.auditLogger.log('api_key_revoked', userId, {
                company_id: companyId,
                key_id: keyId
            });
            res.json({ success: true, message: 'API key revoked' });
        }
        catch (error) {
            console.error('Error revoking API key:', error);
            res.status(500).json({ success: false, error: 'Failed to revoke API key' });
        }
    });
    return router;
}
// Helper functions
function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}
function hashApiKey(key) {
    return crypto_1.default.createHash('sha256').update(key).digest('hex');
}
