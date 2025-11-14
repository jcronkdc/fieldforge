import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db.js';

// Company settings schema
const companySettingsSchema = z.object({
  company_name: z.string().optional(),
  legal_entity_name: z.string().optional(),
  industry: z.string().optional(),
  address: z.string().optional(),
  contact_email: z.string().email().optional(),
  phone_number: z.string().optional(),
  logo_url: z.string().url().optional(),
  branding: z.object({
    primary_color: z.string().optional(),
    secondary_color: z.string().optional(),
    logo_position: z.enum(['left', 'center', 'right']).optional(),
    custom_css: z.string().optional()
  }).optional(),
  integrations: z.object({
    slack: z.object({
      enabled: z.boolean(),
      webhook_url: z.string().optional()
    }).optional(),
    microsoft_teams: z.object({
      enabled: z.boolean(),
      webhook_url: z.string().optional()
    }).optional(),
    google_workspace: z.object({
      enabled: z.boolean(),
      api_key: z.string().optional()
    }).optional()
  }).optional(),
  billing: z.object({
    plan: z.enum(['starter', 'professional', 'enterprise']).optional(),
    billing_email: z.string().email().optional(),
    tax_id: z.string().optional(),
    payment_method: z.enum(['card', 'invoice', 'ach']).optional()
  }).optional(),
  data_retention: z.object({
    logs: z.enum(['30days', '90days', '1year', 'forever']).optional(),
    documents: z.enum(['1year', '3years', '7years', 'forever']).optional(),
    analytics: z.enum(['90days', '1year', '3years', 'forever']).optional()
  }).optional()
});

// Middleware to check if user is admin
async function isAdmin(req: Request, res: Response, next: Function) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check user profile for admin status
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role, is_admin')
    .eq('user_id', userId)
    .single();

  if (error || (!profile?.is_admin && profile?.role !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

export function createCompanyRouter(): Router {
  const router = Router();

  // Get company settings (admin only)
  router.get('/settings', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      // Get user's company ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile?.company_id) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Get company settings
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', profile.company_id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create defaults
        const defaultSettings = {
          company_id: profile.company_id,
          company_name: 'FieldForge Construction',
          industry: 'Construction',
          branding: {
            primary_color: '#DAA520',
            secondary_color: '#1e293b',
            logo_position: 'left'
          },
          integrations: {
            slack: { enabled: false },
            microsoft_teams: { enabled: false },
            google_workspace: { enabled: false }
          },
          billing: {
            plan: 'starter'
          },
          data_retention: {
            logs: '90days',
            documents: '3years',
            analytics: '1year'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newSettings, error: createError } = await supabase
          .from('company_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default company settings:', createError);
          return res.status(500).json({ error: 'Failed to create settings' });
        }

        return res.json({ success: true, settings: newSettings });
      }

      if (error) {
        console.error('Error fetching company settings:', error);
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

      res.json({ success: true, settings });
    } catch (error) {
      console.error('Error in GET /company/settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update company settings (admin only)
  router.put('/settings', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile?.company_id) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Validate request body
      const validatedData = companySettingsSchema.parse(req.body);

      const { data: updatedSettings, error } = await supabase
        .from('company_settings')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', profile.company_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company settings:', error);
        return res.status(500).json({ error: 'Failed to update settings' });
      }

      res.json({ success: true, settings: updatedSettings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid settings data', details: error.errors });
      }
      console.error('Error in PUT /company/settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Upload company logo (admin only)
  router.post('/settings/logo', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { logo_url } = req.body;

      if (!logo_url) {
        return res.status(400).json({ error: 'Logo URL required' });
      }

      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile?.company_id) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Update logo URL
      const { data: updatedSettings, error } = await supabase
        .from('company_settings')
        .update({
          logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', profile.company_id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update logo' });
      }

      res.json({ success: true, settings: updatedSettings });
    } catch (error) {
      console.error('Error in POST /company/settings/logo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Export company settings (admin only)
  router.post('/settings/export', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile?.company_id) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', profile.company_id)
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

      // Remove sensitive data
      const exportData = {
        ...settings,
        company_id: undefined,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
        integrations: {
          ...settings.integrations,
          slack: { ...settings.integrations?.slack, webhook_url: undefined },
          microsoft_teams: { ...settings.integrations?.microsoft_teams, webhook_url: undefined },
          google_workspace: { ...settings.integrations?.google_workspace, api_key: undefined }
        }
      };

      res.json({ success: true, export: exportData });
    } catch (error) {
      console.error('Error in POST /company/settings/export:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
