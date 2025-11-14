import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { query } from '../database.js';
import { auditLogger } from '../middleware/auditLogger.js';

// Company data validation schema
const companyDataSchema = z.object({
  name: z.string(),
  legalName: z.string(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  industry: z.string(),
  founded: z.string(),
  website: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string()
  }),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
    emailHeader: z.string().optional()
  }),
  settings: z.object({
    timezone: z.string(),
    currency: z.string(),
    dateFormat: z.string(),
    fiscalYearStart: z.string(),
    defaultProjectDuration: z.number(),
    autoNumberProjects: z.boolean(),
    projectPrefix: z.string(),
    requireApprovals: z.boolean(),
    approvalThreshold: z.number()
  }),
  subscription: z.object({
    plan: z.enum(['starter', 'professional', 'enterprise']),
    status: z.enum(['active', 'trialing', 'canceled', 'past_due']),
    currentPeriodEnd: z.string(),
    seats: z.number(),
    usedSeats: z.number()
  }),
  features: z.object({
    advancedAnalytics: z.boolean(),
    apiAccess: z.boolean(),
    customWorkflows: z.boolean(),
    unlimitedProjects: z.boolean(),
    prioritySupport: z.boolean(),
    whiteLabel: z.boolean(),
    ssoEnabled: z.boolean()
  })
});

// Role validation schema
const roleSchema = z.object({
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.string())
});

// Workflow template validation schema
const workflowTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  steps: z.array(z.object({
    name: z.string(),
    assignee: z.string(),
    duration: z.number(),
    dependencies: z.array(z.string())
  })),
  isDefault: z.boolean()
});

// API key validation schema
const apiKeySchema = z.object({
  name: z.string(),
  permissions: z.array(z.string())
});

export function createCompanyRouter(): Router {
  const router = Router();

  // Get company data
  router.get('/', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      // Get user's company ID
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      if (!userResult.rows[0]?.company_id) {
        return res.status(404).json({ success: false, error: 'No company found' });
      }
      
      const companyId = userResult.rows[0].company_id;
      
      // Fetch company data
      const companyResult = await query(
        'SELECT * FROM company_settings WHERE id = $1',
        [companyId]
      );
      
      if (companyResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Company not found' });
      }
      
      res.json({ success: true, company: companyResult.rows[0].data });
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch company data' });
    }
  });

  // Update company data
  router.put('/', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = companyDataSchema.parse(req.body);
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      await query(
        `INSERT INTO company_settings (id, data, updated_at, updated_by)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (id)
         DO UPDATE SET data = $2, updated_at = NOW(), updated_by = $3`,
        [companyId, JSON.stringify(validatedData), userId]
      );
      
      auditLogger.log('company_settings_updated', userId, {
        company_id: companyId,
        changes: Object.keys(req.body)
      });
      
      res.json({ success: true, company: validatedData });
    } catch (error) {
      console.error('Error updating company data:', error);
      if (error instanceof z.ZodError) {
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
  router.get('/roles', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      // Get user's company ID
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      if (!userResult.rows[0]?.company_id) {
        return res.status(404).json({ success: false, error: 'No company found' });
      }
      
      const companyId = userResult.rows[0].company_id;
      
      // Fetch roles
      const rolesResult = await query(
        `SELECT r.*, COUNT(u.id) as member_count
         FROM company_roles r
         LEFT JOIN users u ON u.company_id = r.company_id AND u.role = r.name
         WHERE r.company_id = $1
         GROUP BY r.id
         ORDER BY r.created_at`,
        [companyId]
      );
      
      const roles = rolesResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        permissions: row.permissions,
        isSystem: row.is_system,
        memberCount: parseInt(row.member_count)
      }));
      
      res.json({ success: true, roles });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch roles' });
    }
  });

  // Create new role
  router.post('/roles', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = roleSchema.parse(req.body);
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      const result = await query(
        `INSERT INTO company_roles (company_id, name, description, permissions, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [companyId, validatedData.name, validatedData.description, validatedData.permissions, userId]
      );
      
      auditLogger.log('role_created', userId, {
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
    } catch (error) {
      console.error('Error creating role:', error);
      if (error instanceof z.ZodError) {
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
  router.put('/roles/:roleId', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { roleId } = req.params;
      const validatedData = roleSchema.parse(req.body);
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      const roleCheck = await query(
        'SELECT is_system FROM company_roles WHERE id = $1 AND company_id = $2',
        [roleId, companyId]
      );
      
      if (!roleCheck.rows.length) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }
      
      if (roleCheck.rows[0].is_system) {
        // For system roles, only update permissions
        await query(
          'UPDATE company_roles SET permissions = $1, updated_at = NOW() WHERE id = $2',
          [validatedData.permissions, roleId]
        );
      } else {
        // For custom roles, update everything
        await query(
          'UPDATE company_roles SET name = $1, description = $2, permissions = $3, updated_at = NOW() WHERE id = $4',
          [validatedData.name, validatedData.description, validatedData.permissions, roleId]
        );
      }
      
      auditLogger.log('role_updated', userId, {
        company_id: companyId,
        role_id: roleId
      });
      
      res.json({ success: true, role: validatedData });
    } catch (error) {
      console.error('Error updating role:', error);
      if (error instanceof z.ZodError) {
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
  router.delete('/roles/:roleId', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { roleId } = req.params;
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      const roleCheck = await query(
        `SELECT r.is_system, COUNT(u.id) as member_count
         FROM company_roles r
         LEFT JOIN users u ON u.company_id = r.company_id AND u.role = r.name
         WHERE r.id = $1 AND r.company_id = $2
         GROUP BY r.id, r.is_system`,
        [roleId, companyId]
      );
      
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
      await query(
        'DELETE FROM company_roles WHERE id = $1 AND company_id = $2',
        [roleId, companyId]
      );
      
      auditLogger.log('role_deleted', userId, {
        company_id: companyId,
        role_id: roleId
      });
      
      res.json({ success: true, message: 'Role deleted' });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ success: false, error: 'Failed to delete role' });
    }
  });

  // Get workflow templates
  router.get('/workflows', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      // Get user's company ID
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      if (!userResult.rows[0]?.company_id) {
        return res.status(404).json({ success: false, error: 'No company found' });
      }
      
      const companyId = userResult.rows[0].company_id;
      
      // Fetch workflows
      const workflowsResult = await query(
        'SELECT * FROM workflow_templates WHERE company_id = $1 ORDER BY created_at',
        [companyId]
      );
      
      const workflows = workflowsResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        steps: row.steps,
        isDefault: row.is_default
      }));
      
      res.json({ success: true, workflows });
    } catch (error) {
      console.error('Error fetching workflows:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
    }
  });

  // Create workflow template
  router.post('/workflows', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = workflowTemplateSchema.parse(req.body);
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      const result = await query(
        `INSERT INTO workflow_templates 
         (company_id, name, description, category, steps, is_default, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          companyId, 
          validatedData.name, 
          validatedData.description,
          validatedData.category,
          JSON.stringify(validatedData.steps),
          validatedData.isDefault,
          userId
        ]
      );
      
      auditLogger.log('workflow_created', userId, {
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
    } catch (error) {
      console.error('Error creating workflow:', error);
      if (error instanceof z.ZodError) {
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
  router.get('/api-keys', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      const keysResult = await query(
        'SELECT * FROM api_keys WHERE company_id = $1 ORDER BY created_at DESC',
        [companyId]
      );
      
      const keys = keysResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        key: row.key_preview, // Only show preview
        created: row.created_at,
        lastUsed: row.last_used,
        permissions: row.permissions,
        isActive: row.is_active
      }));
      
      res.json({ success: true, keys });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
    }
  });

  // Create API key
  router.post('/api-keys', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = apiKeySchema.parse(req.body);
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      const result = await query(
        `INSERT INTO api_keys 
         (company_id, name, key_hash, key_preview, permissions, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          companyId,
          validatedData.name,
          hashApiKey(apiKey), // Hash the key for storage
          keyPreview,
          validatedData.permissions,
          userId
        ]
      );
      
      auditLogger.log('api_key_created', userId, {
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
    } catch (error) {
      console.error('Error creating API key:', error);
      if (error instanceof z.ZodError) {
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
  router.delete('/api-keys/:keyId', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { keyId } = req.params;
      
      // Get user's company ID and verify permissions
      const userResult = await query(
        'SELECT company_id, role FROM users WHERE id = $1',
        [userId]
      );
      
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
      await query(
        'UPDATE api_keys SET is_active = false, revoked_at = NOW(), revoked_by = $3 WHERE id = $1 AND company_id = $2',
        [keyId, companyId, userId]
      );
      
      auditLogger.log('api_key_revoked', userId, {
        company_id: companyId,
        key_id: keyId
      });
      
      res.json({ success: true, message: 'API key revoked' });
    } catch (error) {
      console.error('Error revoking API key:', error);
      res.status(500).json({ success: false, error: 'Failed to revoke API key' });
    }
  });

  return router;
}

// Helper functions
function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}