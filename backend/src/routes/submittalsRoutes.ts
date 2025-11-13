import { Router, Request, Response } from 'express';
import { query } from '../database.js';
import { z } from 'zod';
import { auditLog } from '../middleware/auditLogger.js';

// Validation schemas
const createSubmittalSchema = z.object({
  project_id: z.string().uuid(),
  submittal_number: z.string(),
  title: z.string().min(1),
  spec_section: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  required_date: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

const updateSubmittalSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'revise_resubmit']).optional(),
  reviewer_comments: z.string().optional(),
  approved_date: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export function createSubmittalsRouter(): Router {
  const router = Router();

  // Get all submittals
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { status, project_id } = req.query;
      const userId = (req as any).user?.id;

      let queryText = `
        SELECT s.*, u.raw_user_meta_data->>'full_name' as submitted_by_name
        FROM submittals s
        LEFT JOIN auth.users u ON s.submitted_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status) {
        params.push(status);
        queryText += ` AND s.status = $${params.length}`;
      }

      if (project_id) {
        params.push(project_id);
        queryText += ` AND s.project_id = $${params.length}`;
      }

      queryText += ' ORDER BY s.created_at DESC';

      const result = await query(queryText, params);

      await auditLog(userId, 'view_submittals', {
        count: result.rows.length,
        filters: { status, project_id }
      });

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error fetching submittals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch submittals'
      });
    }
  });

  // Get single submittal
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await query(
        `SELECT s.*, u.raw_user_meta_data->>'full_name' as submitted_by_name
         FROM submittals s
         LEFT JOIN auth.users u ON s.submitted_by = u.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Submittal not found'
        });
      }

      await auditLog(userId, 'view_submittal', { submittal_id: id });

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error fetching submittal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch submittal'
      });
    }
  });

  // Create new submittal
  router.post('/', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = createSubmittalSchema.parse(req.body);

      const result = await query(
        `INSERT INTO submittals (
          project_id, submittal_number, title, spec_section, description,
          status, priority, submitted_by, submitted_date, required_date,
          revision_number, attachments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          validatedData.project_id,
          validatedData.submittal_number,
          validatedData.title,
          validatedData.spec_section,
          validatedData.description || null,
          'draft',
          validatedData.priority || 'medium',
          userId,
          new Date().toISOString(),
          validatedData.required_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          1,
          validatedData.attachments || []
        ]
      );

      await auditLog(userId, 'create_submittal', {
        submittal_id: result.rows[0].id,
        title: validatedData.title
      });

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating submittal:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: error.format()
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create submittal'
      });
    }
  });

  // Update submittal
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const validatedData = updateSubmittalSchema.parse(req.body);

      // Build dynamic update query
      const updates: string[] = [];
      const params: any[] = [];
      
      if (validatedData.status !== undefined) {
        params.push(validatedData.status);
        updates.push(`status = $${params.length}`);
        
        if (validatedData.status === 'submitted') {
          params.push(new Date().toISOString());
          updates.push(`submitted_date = $${params.length}`);
        }
      }
      
      if (validatedData.reviewer_comments !== undefined) {
        params.push(validatedData.reviewer_comments);
        updates.push(`reviewer_comments = $${params.length}`);
      }
      
      if (validatedData.approved_date !== undefined) {
        params.push(validatedData.approved_date);
        updates.push(`approved_date = $${params.length}`);
      }
      
      if (validatedData.attachments !== undefined) {
        params.push(validatedData.attachments);
        updates.push(`attachments = $${params.length}`);
      }

      // Always update the updated_at timestamp
      updates.push('updated_at = NOW()');
      
      params.push(id);
      const updateQuery = `
        UPDATE submittals 
        SET ${updates.join(', ')}
        WHERE id = $${params.length}
        RETURNING *
      `;

      const result = await query(updateQuery, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Submittal not found'
        });
      }

      await auditLog(userId, 'update_submittal', {
        submittal_id: id,
        updates: Object.keys(validatedData)
      });

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating submittal:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: error.format()
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update submittal'
      });
    }
  });

  // Delete submittal
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await query(
        'DELETE FROM submittals WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Submittal not found'
        });
      }

      await auditLog(userId, 'delete_submittal', {
        submittal_id: id,
        title: result.rows[0].title
      });

      res.json({
        success: true,
        message: 'Submittal deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting submittal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete submittal'
      });
    }
  });

  return router;
}
