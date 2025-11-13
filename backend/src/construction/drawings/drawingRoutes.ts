import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';
import { z } from 'zod';

export function createDrawingRouter(): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticateRequest);

  // Validation schemas
  const DrawingUploadSchema = z.object({
    name: z.string().min(1),
    file_data: z.string(), // Base64 encoded file
    file_type: z.string(),
    sheet_number: z.string(),
    revision: z.string(),
    discipline: z.enum(['architectural', 'structural', 'electrical', 'mechanical', 'civil', 'other']),
    project_id: z.number().optional(),
    tags: z.array(z.string()).optional()
  });

  const AnnotationSchema = z.object({
    type: z.enum(['comment', 'measurement', 'markup']),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    text: z.string().optional(),
    color: z.string().optional(),
    resolved: z.boolean().optional()
  });

  // GET all drawings
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { company_id } = req.user || {};
      const { discipline, search, project_id } = req.query;

      if (!company_id) {
        return res.status(401).json({ error: 'Unauthorized: Company ID missing' });
      }

      let queryText = `
        SELECT 
          d.*,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as uploaded_by_name,
          COUNT(da.id) as annotation_count
        FROM drawings d
        LEFT JOIN projects p ON d.project_id = p.id
        LEFT JOIN auth.users u ON d.uploaded_by = u.id
        LEFT JOIN drawing_annotations da ON d.id = da.drawing_id
        WHERE p.company_id = $1
      `;
      const params: any[] = [company_id];
      let paramIndex = 2;

      if (discipline && discipline !== 'all') {
        queryText += ` AND d.discipline = $${paramIndex}`;
        params.push(discipline);
        paramIndex++;
      }

      if (search) {
        queryText += ` AND (d.name ILIKE $${paramIndex} OR d.sheet_number ILIKE $${paramIndex} OR d.tags::text ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (project_id) {
        queryText += ` AND d.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      queryText += ` 
        GROUP BY d.id, p.name, u.raw_user_meta_data
        ORDER BY d.uploaded_at DESC
      `;

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[drawings] Error fetching drawings:', error);
      res.status(500).json({ error: 'Failed to fetch drawings' });
    }
  });

  // GET specific drawing
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { company_id } = req.user || {};
      const { id } = req.params;

      if (!company_id) {
        return res.status(401).json({ error: 'Unauthorized: Company ID missing' });
      }

      const result = await query(
        `SELECT 
          d.*,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as uploaded_by_name,
          COALESCE(
            json_agg(
              json_build_object(
                'id', da.id,
                'type', da.type,
                'x', da.x,
                'y', da.y,
                'width', da.width,
                'height', da.height,
                'text', da.text,
                'color', da.color,
                'created_by', da.created_by,
                'created_at', da.created_at,
                'resolved', COALESCE(da.resolved, false)
              )
            ) FILTER (WHERE da.id IS NOT NULL),
            '[]'::json
          ) as annotations
        FROM drawings d
        LEFT JOIN projects p ON d.project_id = p.id
        LEFT JOIN auth.users u ON d.uploaded_by = u.id
        LEFT JOIN drawing_annotations da ON d.id = da.drawing_id
        WHERE d.id = $1 AND p.company_id = $2
        GROUP BY d.id, p.name, u.raw_user_meta_data`,
        [id, company_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Drawing not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[drawings] Error fetching drawing:', error);
      res.status(500).json({ error: 'Failed to fetch drawing' });
    }
  });

  // POST new drawing
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { id: user_id, company_id } = req.user || {};
      
      if (!user_id || !company_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validation = DrawingUploadSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.flatten() });
      }

      const {
        name,
        file_data,
        file_type,
        sheet_number,
        revision,
        discipline,
        project_id,
        tags
      } = validation.data;

      // In production, you would upload the file to cloud storage
      // For now, we'll store a placeholder URL
      const file_url = `/api/drawings/files/${Date.now()}-${name}`;
      const file_size = Buffer.from(file_data, 'base64').length;

      // Get default project if not specified
      let projectId = project_id;
      if (!projectId) {
        const projectResult = await query(
          'SELECT id FROM projects WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1',
          [company_id]
        );
        projectId = projectResult.rows[0]?.id;
      }

      const result = await query(
        `INSERT INTO drawings (
          project_id, name, file_url, file_type, revision,
          sheet_number, discipline, status, uploaded_by,
          file_size, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          projectId,
          name,
          file_url,
          file_type,
          revision,
          sheet_number,
          discipline,
          'draft',
          user_id,
          file_size,
          JSON.stringify(tags || [])
        ]
      );

      await logAuditEvent({
        action: 'drawing_uploaded',
        user_id: user_id,
        resource_type: 'drawing',
        resource_id: result.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { name, sheet_number, discipline },
        success: true
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[drawings] Error creating drawing:', error);
      res.status(500).json({ error: 'Failed to upload drawing' });
    }
  });

  // PUT update drawing
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { company_id } = req.user || {};
      const { id } = req.params;
      const { status, revision, tags } = req.body;

      if (!company_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (status) {
        updates.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      if (revision) {
        updates.push(`revision = $${paramIndex}`);
        values.push(revision);
        paramIndex++;
      }

      if (tags) {
        updates.push(`tags = $${paramIndex}`);
        values.push(JSON.stringify(tags));
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await query(
        `UPDATE drawings SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        AND project_id IN (SELECT id FROM projects WHERE company_id = $${paramIndex + 1})
        RETURNING *`,
        [...values, company_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Drawing not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[drawings] Error updating drawing:', error);
      res.status(500).json({ error: 'Failed to update drawing' });
    }
  });

  // DELETE drawing
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { company_id } = req.user || {};
      const { id } = req.params;

      if (!company_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await query(
        `DELETE FROM drawings
        WHERE id = $1
        AND project_id IN (SELECT id FROM projects WHERE company_id = $2)
        RETURNING id`,
        [id, company_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Drawing not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('[drawings] Error deleting drawing:', error);
      res.status(500).json({ error: 'Failed to delete drawing' });
    }
  });

  // POST annotation
  router.post('/:id/annotations', async (req: Request, res: Response) => {
    try {
      const { id: user_id, company_id } = req.user || {};
      const { id: drawing_id } = req.params;

      if (!user_id || !company_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validation = AnnotationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.flatten() });
      }

      // Verify drawing belongs to company
      const drawingCheck = await query(
        `SELECT 1 FROM drawings d
        JOIN projects p ON d.project_id = p.id
        WHERE d.id = $1 AND p.company_id = $2`,
        [drawing_id, company_id]
      );

      if (drawingCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Drawing not found' });
      }

      const annotation = validation.data;
      const result = await query(
        `INSERT INTO drawing_annotations (
          drawing_id, type, x, y, width, height, text, color,
          created_by, resolved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          drawing_id,
          annotation.type,
          annotation.x,
          annotation.y,
          annotation.width || null,
          annotation.height || null,
          annotation.text || null,
          annotation.color || '#f59e0b',
          user_id,
          annotation.resolved || false
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[drawings] Error creating annotation:', error);
      res.status(500).json({ error: 'Failed to create annotation' });
    }
  });

  // GET annotations for drawing
  router.get('/:id/annotations', async (req: Request, res: Response) => {
    try {
      const { company_id } = req.user || {};
      const { id: drawing_id } = req.params;

      if (!company_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await query(
        `SELECT da.*, u.raw_user_meta_data->>'full_name' as created_by_name
        FROM drawing_annotations da
        LEFT JOIN auth.users u ON da.created_by = u.id
        WHERE da.drawing_id = $1
        AND EXISTS (
          SELECT 1 FROM drawings d
          JOIN projects p ON d.project_id = p.id
          WHERE d.id = $1 AND p.company_id = $2
        )
        ORDER BY da.created_at DESC`,
        [drawing_id, company_id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('[drawings] Error fetching annotations:', error);
      res.status(500).json({ error: 'Failed to fetch annotations' });
    }
  });

  // PUT update annotation
  router.put('/annotations/:id', async (req: Request, res: Response) => {
    try {
      const { id: user_id } = req.user || {};
      const { id } = req.params;
      const { text, resolved } = req.body;

      if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (text !== undefined) {
        updates.push(`text = $${paramIndex}`);
        values.push(text);
        paramIndex++;
      }

      if (resolved !== undefined) {
        updates.push(`resolved = $${paramIndex}`);
        values.push(resolved);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);
      values.push(user_id);

      const result = await query(
        `UPDATE drawing_annotations SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        AND created_by = $${paramIndex + 1}
        RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Annotation not found or unauthorized' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[drawings] Error updating annotation:', error);
      res.status(500).json({ error: 'Failed to update annotation' });
    }
  });

  // DELETE annotation
  router.delete('/annotations/:id', async (req: Request, res: Response) => {
    try {
      const { id: user_id } = req.user || {};
      const { id } = req.params;

      if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await query(
        `DELETE FROM drawing_annotations
        WHERE id = $1 AND created_by = $2
        RETURNING id`,
        [id, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Annotation not found or unauthorized' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('[drawings] Error deleting annotation:', error);
      res.status(500).json({ error: 'Failed to delete annotation' });
    }
  });

  return router;
}
