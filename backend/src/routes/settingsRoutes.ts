import { Router, Request, Response } from 'express';
import { query } from '../database.js';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z.object({
    safety: z.boolean(),
    projects: z.boolean(),
    equipment: z.boolean(),
    crew: z.boolean(),
    documents: z.boolean(),
    email_digest: z.enum(['daily', 'weekly', 'never'])
  }).optional(),
  sync_preferences: z.object({
    wifi_only: z.boolean(),
    auto_sync: z.boolean(),
    sync_interval: z.number()
  }).optional(),
  performance: z.object({
    animations: z.boolean(),
    high_quality_images: z.boolean(),
    cache_size: z.number()
  }).optional()
});

export function createSettingsRouter(): Router {
  const router = Router();

  // Get user settings
  router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      // Get or create user settings
      const result = await query(
        'SELECT * FROM get_or_create_user_settings($1)',
        [userId]
      );

      const settings = result.rows[0];
      
      res.json({
        success: true,
        settings: {
          theme: settings.theme,
          language: settings.language,
          notifications: settings.notifications,
          sync_preferences: settings.sync_preferences,
          performance: settings.performance
        }
      });

    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch settings'
      });
    }
  });

  // Update user settings
  router.put('/', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { settings } = req.body;

      // Validate settings
      const validatedSettings = settingsSchema.parse(settings);

      // Update settings
      const result = await query(
        `UPDATE user_settings 
         SET theme = COALESCE($1, theme),
             language = COALESCE($2, language),
             notifications = COALESCE($3, notifications),
             sync_preferences = COALESCE($4, sync_preferences),
             performance = COALESCE($5, performance)
         WHERE user_id = $6
         RETURNING *`,
        [
          validatedSettings.theme || null,
          validatedSettings.language || null,
          validatedSettings.notifications ? JSON.stringify(validatedSettings.notifications) : null,
          validatedSettings.sync_preferences ? JSON.stringify(validatedSettings.sync_preferences) : null,
          validatedSettings.performance ? JSON.stringify(validatedSettings.performance) : null,
          userId
        ]
      );

      if (result.rows.length === 0) {
        // Create settings if they don't exist
        await query(
          `INSERT INTO user_settings (user_id, theme, language, notifications, sync_preferences, performance)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            userId,
            validatedSettings.theme || 'auto',
            validatedSettings.language || 'en',
            JSON.stringify(validatedSettings.notifications || {
              safety: true,
              projects: true,
              equipment: true,
              crew: true,
              documents: true,
              email_digest: 'daily'
            }),
            JSON.stringify(validatedSettings.sync_preferences || {
              wifi_only: false,
              auto_sync: true,
              sync_interval: 30
            }),
            JSON.stringify(validatedSettings.performance || {
              animations: true,
              high_quality_images: true,
              cache_size: 100
            })
          ]
        );
      }

      res.json({
        success: true,
        message: 'Settings updated successfully'
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid settings format',
          details: error.format()
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update settings'
      });
    }
  });

  // Reset settings to defaults
  router.post('/reset', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      await query(
        `UPDATE user_settings 
         SET theme = 'auto',
             language = 'en',
             notifications = '{"safety": true, "projects": true, "equipment": true, "crew": true, "documents": true, "email_digest": "daily"}',
             sync_preferences = '{"wifi_only": false, "auto_sync": true, "sync_interval": 30}',
             performance = '{"animations": true, "high_quality_images": true, "cache_size": 100}'
         WHERE user_id = $1`,
        [userId]
      );

      res.json({
        success: true,
        message: 'Settings reset to defaults'
      });

    } catch (error) {
      console.error('Error resetting settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset settings'
      });
    }
  });

  // Get app configuration (public settings)
  router.get('/config', async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        config: {
          available_languages: ['en', 'es', 'fr'],
          sync_intervals: [15, 30, 60, 120],
          cache_sizes: { min: 50, max: 500, step: 50 },
          features: {
            offline_mode: true,
            push_notifications: true,
            biometric_auth: true
          }
        }
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch configuration'
      });
    }
  });

  return router;
}
