import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db.js';

// User settings schema
const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  language: z.enum(['en', 'es', 'fr']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    safety: z.boolean().optional(),
    projects: z.boolean().optional(),
    equipment: z.boolean().optional()
  }).optional(),
  sync_preferences: z.object({
    auto_sync: z.boolean().optional(),
    sync_interval: z.enum(['5min', '15min', '30min', '1hour']).optional(),
    offline_mode: z.boolean().optional()
  }).optional(),
  performance: z.object({
    animations: z.boolean().optional(),
    high_quality_images: z.boolean().optional(),
    data_saver: z.boolean().optional()
  }).optional()
});

export function createSettingsRouter(): Router {
  const router = Router();

  // Get user settings (or create defaults)
  router.get('/settings', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Try to get existing settings
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create defaults
        const defaultSettings = {
          user_id: userId,
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
            safety: true,
            projects: true,
            equipment: true
          },
          sync_preferences: {
            auto_sync: true,
            sync_interval: '15min',
            offline_mode: true
          },
          performance: {
            animations: true,
            high_quality_images: true,
            data_saver: false
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default settings:', createError);
          return res.status(500).json({ error: 'Failed to create settings' });
        }

        return res.json({ success: true, settings: newSettings });
      }

      if (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

      res.json({ success: true, settings });
    } catch (error) {
      console.error('Error in GET /settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user settings
  router.put('/settings', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request body
      const validatedData = userSettingsSchema.parse(req.body);

      const { data: updatedSettings, error } = await supabase
        .from('user_settings')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ error: 'Failed to update settings' });
      }

      res.json({ success: true, settings: updatedSettings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid settings data', details: error.errors });
      }
      console.error('Error in PUT /settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Export settings as JSON
  router.post('/settings/export', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

      // Remove sensitive data
      const exportData = {
        ...settings,
        user_id: undefined,
        id: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      res.json({ success: true, export: exportData });
    } catch (error) {
      console.error('Error in POST /settings/export:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reset settings to defaults
  router.post('/settings/reset', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const defaultSettings = {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
          safety: true,
          projects: true,
          equipment: true
        },
        sync_preferences: {
          auto_sync: true,
          sync_interval: '15min',
          offline_mode: true
        },
        performance: {
          animations: true,
          high_quality_images: true,
          data_saver: false
        },
        updated_at: new Date().toISOString()
      };

      const { data: resetSettings, error } = await supabase
        .from('user_settings')
        .update(defaultSettings)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to reset settings' });
      }

      res.json({ success: true, settings: resetSettings, message: 'Settings reset to defaults' });
    } catch (error) {
      console.error('Error in POST /settings/reset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
