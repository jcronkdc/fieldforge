import { Router, Request, Response } from 'express';
import { query } from '../database.js';
import { z } from 'zod';
import { auditLogger } from '../middleware/auditLogger.js';

// Validation schemas
const profileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  employee_id: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  bio: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  hire_date: z.string().optional(),
  supervisor_id: z.string().uuid().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications_enabled: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional()
});

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issue_date: z.string(),
  expiry_date: z.string().optional(),
  certificate_number: z.string().optional(),
  document_url: z.string().optional()
});

const trainingSchema = z.object({
  course_name: z.string().min(1),
  provider: z.string().min(1),
  completion_date: z.string(),
  hours: z.number().optional(),
  certificate_url: z.string().optional(),
  next_renewal: z.string().optional()
});

export function createUserRouter(): Router {
  const router = Router();

  // Get user profile
  router.get('/profile', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const result = await query(
        `SELECT up.*, u.email, u.last_sign_in_at as last_login,
         s.email as supervisor_email, s.raw_user_meta_data->>'full_name' as supervisor_name
         FROM user_profiles up
         LEFT JOIN auth.users u ON up.user_id = u.id
         LEFT JOIN auth.users s ON up.supervisor_id = s.id
         WHERE up.user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // Create default profile if none exists
        const createResult = await query(
          `INSERT INTO user_profiles (user_id, email, created_at, updated_at)
           VALUES ($1, $2, NOW(), NOW())
           RETURNING *`,
          [userId, (req as any).user?.email]
        );
        
        res.json({ success: true, profile: createResult.rows[0] });
      } else {
        res.json({ success: true, profile: result.rows[0] });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
  });

  // Update user profile
  router.put('/profile', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = profileSchema.parse(req.body);

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      const result = await query(
        `UPDATE user_profiles 
         SET ${updateFields.join(', ')}
         WHERE user_id = $${paramCount}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }

      auditLogger.log('user_profile_updated', userId, {
        updated_fields: Object.keys(validatedData)
      });

      res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
      console.error('Error updating user profile:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid input', 
          details: error.format() 
        });
      }
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  });

  // Upload avatar
  router.post('/avatar', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { avatar } = req.body;

      if (!avatar || !avatar.startsWith('data:image')) {
        return res.status(400).json({ success: false, error: 'Invalid image data' });
      }

      // In production, upload to S3/Cloudinary and store URL
      // For now, store base64 (not recommended for production)
      const result = await query(
        `UPDATE user_profiles 
         SET avatar_url = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING avatar_url`,
        [avatar, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }

      auditLogger.log('user_avatar_updated', userId);

      res.json({ success: true, avatar_url: result.rows[0].avatar_url });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ success: false, error: 'Failed to upload avatar' });
    }
  });

  // Get user certifications
  router.get('/certifications', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const result = await query(
        `SELECT *,
         CASE
           WHEN expiry_date < NOW() THEN 'expired'
           WHEN expiry_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
           ELSE 'active'
         END as status
         FROM user_certifications
         WHERE user_id = $1
         ORDER BY expiry_date DESC NULLS LAST, issue_date DESC`,
        [userId]
      );

      res.json({ success: true, certifications: result.rows });
    } catch (error) {
      console.error('Error fetching certifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch certifications' });
    }
  });

  // Add certification
  router.post('/certifications', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = certificationSchema.parse(req.body);

      const result = await query(
        `INSERT INTO user_certifications (
          user_id, name, issuer, issue_date, expiry_date,
          certificate_number, document_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          userId,
          validatedData.name,
          validatedData.issuer,
          validatedData.issue_date,
          validatedData.expiry_date || null,
          validatedData.certificate_number || null,
          validatedData.document_url || null
        ]
      );

      auditLogger.log('certification_added', userId, {
        certification_id: result.rows[0].id,
        name: validatedData.name
      });

      res.status(201).json({ success: true, certification: result.rows[0] });
    } catch (error) {
      console.error('Error adding certification:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid input', 
          details: error.format() 
        });
      }
      res.status(500).json({ success: false, error: 'Failed to add certification' });
    }
  });

  // Update certification
  router.put('/certifications/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const validatedData = certificationSchema.partial().parse(req.body);

      const result = await query(
        `UPDATE user_certifications
         SET name = COALESCE($1, name),
             issuer = COALESCE($2, issuer),
             issue_date = COALESCE($3, issue_date),
             expiry_date = COALESCE($4, expiry_date),
             certificate_number = COALESCE($5, certificate_number),
             updated_at = NOW()
         WHERE id = $6 AND user_id = $7
         RETURNING *`,
        [
          validatedData.name,
          validatedData.issuer,
          validatedData.issue_date,
          validatedData.expiry_date,
          validatedData.certificate_number,
          id,
          userId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Certification not found' });
      }

      res.json({ success: true, certification: result.rows[0] });
    } catch (error) {
      console.error('Error updating certification:', error);
      res.status(500).json({ success: false, error: 'Failed to update certification' });
    }
  });

  // Delete certification
  router.delete('/certifications/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      const result = await query(
        'DELETE FROM user_certifications WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Certification not found' });
      }

      res.json({ success: true, message: 'Certification deleted' });
    } catch (error) {
      console.error('Error deleting certification:', error);
      res.status(500).json({ success: false, error: 'Failed to delete certification' });
    }
  });

  // Get user trainings
  router.get('/trainings', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const result = await query(
        `SELECT * FROM user_trainings
         WHERE user_id = $1
         ORDER BY completion_date DESC`,
        [userId]
      );

      res.json({ success: true, trainings: result.rows });
    } catch (error) {
      console.error('Error fetching trainings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch trainings' });
    }
  });

  // Add training
  router.post('/trainings', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = trainingSchema.parse(req.body);

      const result = await query(
        `INSERT INTO user_trainings (
          user_id, course_name, provider, completion_date,
          hours, certificate_url, next_renewal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          userId,
          validatedData.course_name,
          validatedData.provider,
          validatedData.completion_date,
          validatedData.hours || null,
          validatedData.certificate_url || null,
          validatedData.next_renewal || null
        ]
      );

      auditLogger.log('training_added', userId, {
        training_id: result.rows[0].id,
        course: validatedData.course_name
      });

      res.status(201).json({ success: true, training: result.rows[0] });
    } catch (error) {
      console.error('Error adding training:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid input', 
          details: error.format() 
        });
      }
      res.status(500).json({ success: false, error: 'Failed to add training' });
    }
  });

  // Export user data (GDPR compliance)
  router.get('/export', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      // Fetch all user data
      const profileResult = await query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      const certificationsResult = await query(
        'SELECT * FROM user_certifications WHERE user_id = $1',
        [userId]
      );

      const trainingsResult = await query(
        'SELECT * FROM user_trainings WHERE user_id = $1',
        [userId]
      );

      const userData = {
        profile: profileResult.rows[0] || {},
        certifications: certificationsResult.rows,
        trainings: trainingsResult.rows,
        exported_at: new Date().toISOString()
      };

      auditLogger.log('user_data_exported', userId);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="fieldforge-data-${userId}.json"`);
      
      res.json(userData);
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ success: false, error: 'Failed to export user data' });
    }
  });

  // Delete user account (soft delete)
  router.delete('/account', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { confirmation } = req.body;

      if (confirmation !== 'DELETE MY ACCOUNT') {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid confirmation' 
        });
      }

      // Soft delete by marking profile as deleted
      await query(
        `UPDATE user_profiles 
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      // In production, also handle Supabase auth deletion
      // await supabase.auth.admin.deleteUser(userId);

      auditLogger.log('account_deleted', userId);

      res.json({ success: true, message: 'Account scheduled for deletion' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ success: false, error: 'Failed to delete account' });
    }
  });

  return router;
}
