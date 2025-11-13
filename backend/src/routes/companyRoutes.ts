import { Router, Request, Response } from 'express';
import { query } from '../database.js';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';

const companySettingsSchema = z.object({
  name: z.string().min(1),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional()
  }).optional(),
  branding: z.object({
    logo_url: z.string().optional(),
    primary_color: z.string().optional(),
    secondary_color: z.string().optional()
  }).optional(),
  settings: z.object({
    default_language: z.string().optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    fiscal_year_start: z.number().min(1).max(12).optional()
  }).optional(),
  subscription: z.object({
    plan: z.string().optional(),
    status: z.string().optional(),
    seats: z.number().optional(),
    billing_email: z.string().email().optional(),
    next_billing_date: z.string().optional()
  }).optional(),
  integrations: z.object({
    accounting: z.object({ enabled: z.boolean(), provider: z.string() }).optional(),
    crm: z.object({ enabled: z.boolean(), provider: z.string() }).optional(),
    payroll: z.object({ enabled: z.boolean(), provider: z.string() }).optional()
  }).optional(),
  data_retention: z.object({
    projects: z.number().optional(),
    documents: z.number().optional(),
    analytics: z.number().optional()
  }).optional()
});

async function checkAdminAccess(req: Request, res: Response): Promise<boolean> {
  const userId = (req as any).user.id;
  
  try {
    const result = await query(
      'SELECT is_admin, role FROM users WHERE id = $1',
      [userId]
    );
    
    const user = result.rows[0];
    if (!user || (!user.is_admin && user.role !== 'admin')) {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking admin access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify permissions'
    });
    return false;
  }
}

async function logAudit(companyId: string, userId: string, action: string, changes: any, req: Request) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    
    await query(
      `INSERT INTO company_settings_audit (company_id, user_id, action, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [companyId, userId, action, JSON.stringify(changes), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

export function createCompanyRouter(): Router {
  const router = Router();

  // Get company settings
  router.get('/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!await checkAdminAccess(req, res)) return;
      
      const userId = (req as any).user.id;
      
      // Get user's company
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      if (!userResult.rows[0]?.company_id) {
        return res.status(400).json({
          success: false,
          error: 'User not associated with a company'
        });
      }
      
      const companyId = userResult.rows[0].company_id;
      
      // Get or create company settings
      const result = await query(
        'SELECT * FROM get_or_create_company_settings($1)',
        [companyId]
      );

      const settings = result.rows[0];
      
      res.json({
        success: true,
        company: {
          id: settings.id,
          name: settings.name,
          legal_name: settings.legal_name,
          tax_id: settings.tax_id,
          address: settings.address,
          contact: settings.contact,
          branding: settings.branding,
          settings: settings.settings,
          subscription: settings.subscription,
          integrations: settings.integrations,
          data_retention: settings.data_retention
        }
      });

    } catch (error) {
      console.error('Error fetching company settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company settings'
      });
    }
  });

  // Update company settings
  router.put('/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!await checkAdminAccess(req, res)) return;
      
      const userId = (req as any).user.id;
      const updates = req.body;
      
      // Validate input
      const validatedData = companySettingsSchema.parse(updates);
      
      // Get user's company
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      const companyId = userResult.rows[0]?.company_id;
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'User not associated with a company'
        });
      }
      
      // Update settings
      const result = await query(
        `UPDATE company_settings 
         SET name = COALESCE($1, name),
             legal_name = COALESCE($2, legal_name),
             tax_id = COALESCE($3, tax_id),
             address = COALESCE($4, address),
             contact = COALESCE($5, contact),
             branding = COALESCE($6, branding),
             settings = COALESCE($7, settings),
             subscription = COALESCE($8, subscription),
             integrations = COALESCE($9, integrations),
             data_retention = COALESCE($10, data_retention)
         WHERE company_id = $11
         RETURNING *`,
        [
          validatedData.name || null,
          validatedData.legal_name || null,
          validatedData.tax_id || null,
          validatedData.address ? JSON.stringify(validatedData.address) : null,
          validatedData.contact ? JSON.stringify(validatedData.contact) : null,
          validatedData.branding ? JSON.stringify(validatedData.branding) : null,
          validatedData.settings ? JSON.stringify(validatedData.settings) : null,
          validatedData.subscription ? JSON.stringify(validatedData.subscription) : null,
          validatedData.integrations ? JSON.stringify(validatedData.integrations) : null,
          validatedData.data_retention ? JSON.stringify(validatedData.data_retention) : null,
          companyId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Company settings not found'
        });
      }
      
      // Log audit
      await logAudit(companyId, userId, 'UPDATE_SETTINGS', validatedData, req);
      
      res.json({
        success: true,
        message: 'Company settings updated successfully'
      });

    } catch (error) {
      console.error('Error updating company settings:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid data format',
          details: error.format()
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update company settings'
      });
    }
  });

  // Get audit logs
  router.get('/audit', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!await checkAdminAccess(req, res)) return;
      
      const userId = (req as any).user.id;
      const { limit = 100, offset = 0 } = req.query;
      
      // Get user's company
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      const companyId = userResult.rows[0]?.company_id;
      
      const result = await query(
        `SELECT 
          a.*,
          u.email as user_email,
          u.full_name as user_name
         FROM company_settings_audit a
         JOIN users u ON a.user_id = u.id
         WHERE a.company_id = $1
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [companyId, limit, offset]
      );
      
      res.json({
        success: true,
        audit_logs: result.rows
      });

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs'
      });
    }
  });

  // Export company data
  router.get('/export', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!await checkAdminAccess(req, res)) return;
      
      const userId = (req as any).user.id;
      
      // Get user's company
      const userResult = await query(
        'SELECT company_id FROM users WHERE id = $1',
        [userId]
      );
      
      const companyId = userResult.rows[0]?.company_id;
      
      // Fetch all company data
      const [settingsResult, projectsResult, usersResult] = await Promise.all([
        query('SELECT * FROM company_settings WHERE company_id = $1', [companyId]),
        query('SELECT COUNT(*) as count FROM projects WHERE company_id = $1', [companyId]),
        query('SELECT COUNT(*) as count FROM users WHERE company_id = $1', [companyId])
      ]);
      
      const exportData = {
        company: settingsResult.rows[0],
        statistics: {
          total_projects: projectsResult.rows[0].count,
          total_users: usersResult.rows[0].count
        },
        exported_at: new Date().toISOString(),
        exported_by: userId
      };
      
      // Log audit
      await logAudit(companyId, userId, 'EXPORT_DATA', {}, req);
      
      res.json({
        success: true,
        data: exportData
      });

    } catch (error) {
      console.error('Error exporting company data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export company data'
      });
    }
  });

  return router;
}
