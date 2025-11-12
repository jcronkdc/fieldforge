import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

// File upload configuration
const allowedFileTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/x-autocad',
  'application/dwg',
  'image/vnd.dwg',
  'text/plain',
  'application/zip'
];

const maxFileSize = 100 * 1024 * 1024; // 100MB

export function createDocumentRouter(): Router {
  const router = Router();

  // ============================================================================
  // DOCUMENT MANAGEMENT - COMPLETE E2E FUNCTIONALITY
  // ============================================================================

  // GET document categories
  router.get('/categories', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const categories = [
        { id: 'drawings', name: 'Drawings & Plans', icon: 'blueprint' },
        { id: 'specs', name: 'Specifications', icon: 'document' },
        { id: 'permits', name: 'Permits & Licenses', icon: 'certificate' },
        { id: 'safety', name: 'Safety Documents', icon: 'shield' },
        { id: 'contracts', name: 'Contracts', icon: 'contract' },
        { id: 'submittals', name: 'Submittals', icon: 'upload' },
        { id: 'rfis', name: 'RFIs', icon: 'question' },
        { id: 'reports', name: 'Reports', icon: 'chart' },
        { id: 'photos', name: 'Photos', icon: 'camera' },
        { id: 'other', name: 'Other', icon: 'folder' }
      ];
      
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // UPLOAD document (base64 encoded)
  router.post('/upload', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];
      const { 
        project_id, 
        category, 
        title, 
        description, 
        tags,
        version,
        file_name,
        file_type,
        file_data // base64 encoded
      } = req.body;

      if (!project_id || !category || !title || !file_name || !file_type || !file_data) {
        return res.status(400).json({ 
          error: 'Missing required fields: project_id, category, title, file_name, file_type, file_data' 
        });
      }

      // Validate file type
      if (!allowedFileTypes.includes(file_type)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      // Decode base64 and check size
      const fileBuffer = Buffer.from(file_data, 'base64');
      if (fileBuffer.length > maxFileSize) {
        return res.status(400).json({ error: 'File size exceeds 100MB limit' });
      }

      await query('BEGIN');

      try {
        // Create document record
        const docResult = await query(
          `INSERT INTO documents 
           (project_id, category, title, description, file_name, 
            file_type, file_size, tags, version, uploaded_by, 
            company_id, status, file_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', $12)
           RETURNING id, project_id, category, title, file_name, file_size, version`,
          [project_id, category, title, description, file_name,
           file_type, fileBuffer.length, tags || [], version || '1.0',
           userId, companyId, fileBuffer]
        );

        const document = docResult.rows[0];

        // Log audit event
        await logAuditEvent({
          action: 'document_uploaded',
          user_id: userId,
          resource_type: 'document',
          resource_id: document.id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { 
            file_name: req.file.originalname,
            file_size: req.file.size,
            category 
          },
          success: true
        });

        // If this is a new version, mark previous as superseded
        if (version && version !== '1.0') {
          await query(
            `UPDATE documents 
             SET status = 'superseded', superseded_by = $1
             WHERE project_id = $2 AND title = $3 
             AND id != $1 AND status = 'active'`,
            [document.id, project_id, title]
          );
        }

        await query('COMMIT');

        res.status(201).json(document);
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('[documents] Error uploading:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  // GET documents list with filters
  router.get('/', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { 
        project_id, 
        category, 
        search, 
        tags,
        status = 'active',
        limit = 50,
        offset = 0 
      } = req.query;

      let queryText = `
        SELECT 
          d.id, d.project_id, d.category, d.title, d.description,
          d.file_name, d.file_type, d.file_size, d.tags, d.version,
          d.status, d.created_at, d.download_count, d.last_accessed,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as uploaded_by_name
        FROM documents d
        JOIN projects p ON d.project_id = p.id
        JOIN auth.users u ON d.uploaded_by = u.id
        WHERE d.company_id = $1
      `;
      const params: any[] = [companyId];
      let paramIndex = 2;

      if (project_id) {
        queryText += ` AND d.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND d.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND d.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (search) {
        queryText += ` AND (d.title ILIKE $${paramIndex} OR d.description ILIKE $${paramIndex} OR d.file_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (tags && Array.isArray(tags)) {
        queryText += ` AND d.tags && $${paramIndex}`;
        params.push(tags);
        paramIndex++;
      }

      queryText += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Get total count
      const countQuery = queryText.replace(
        /SELECT[\s\S]*FROM/, 
        'SELECT COUNT(*) as total FROM'
      ).replace(/ORDER BY[\s\S]*$/, '');
      const countResult = await query(
        countQuery.replace(/LIMIT[\s\S]*$/, ''), 
        params.slice(0, -2)
      );

      res.json({
        documents: result.rows,
        total: parseInt(countResult.rows[0]?.total || 0),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      
    } catch (error) {
      console.error('[documents] Error fetching:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // DOWNLOAD document
  router.get('/download/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT 
          file_name, file_type, file_data, project_id
         FROM documents 
         WHERE id = $1 AND status = 'active'`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = result.rows[0];

      // Update download count and last accessed
      await query(
        `UPDATE documents 
         SET download_count = download_count + 1,
             last_accessed = NOW()
         WHERE id = $1`,
        [id]
      );

      // Log download
      await logAuditEvent({
        action: 'document_downloaded',
        user_id: req.user?.id,
        resource_type: 'document',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { file_name: document.file_name },
        success: true
      });

      // Set headers for file download
      res.setHeader('Content-Type', document.file_type);
      res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
      res.send(document.file_data);
      
    } catch (error) {
      console.error('[documents] Error downloading:', error);
      res.status(500).json({ error: 'Failed to download document' });
    }
  });

  // VIEW document (inline)
  router.get('/view/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT 
          file_name, file_type, file_data
         FROM documents 
         WHERE id = $1 AND status = 'active'`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = result.rows[0];

      // Update last accessed
      await query(
        `UPDATE documents SET last_accessed = NOW() WHERE id = $1`,
        [id]
      );

      // Set headers for inline viewing
      res.setHeader('Content-Type', document.file_type);
      res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
      res.send(document.file_data);
      
    } catch (error) {
      console.error('[documents] Error viewing:', error);
      res.status(500).json({ error: 'Failed to view document' });
    }
  });

  // UPDATE document metadata
  router.put('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, tags, category } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(title);
        paramIndex++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(description);
        paramIndex++;
      }

      if (tags !== undefined) {
        updates.push(`tags = $${paramIndex}`);
        values.push(tags);
        paramIndex++;
      }

      if (category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        values.push(category);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push('updated_at = NOW()');
      values.push(id);

      const result = await query(
        `UPDATE documents 
         SET ${updates.join(', ')} 
         WHERE id = $${paramIndex}
         RETURNING id, title, description, category, tags`,
        values
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json(result.rows[0]);
      
    } catch (error) {
      console.error('[documents] Error updating:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  // DELETE document (soft delete)
  router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await query(
        `UPDATE documents 
         SET status = 'deleted', 
             deleted_at = NOW(),
             deleted_by = $1
         WHERE id = $2 AND status = 'active'
         RETURNING id, title`,
        [userId, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      await logAuditEvent({
        action: 'document_deleted',
        user_id: userId,
        resource_type: 'document',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { title: result.rows[0].title },
        success: true
      });

      res.json({ message: 'Document deleted successfully' });
      
    } catch (error) {
      console.error('[documents] Error deleting:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // GET document history/versions
  router.get('/:id/history', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const historyQuery = `
        SELECT 
          d.id, d.version, d.created_at, d.status,
          u.raw_user_meta_data->>'full_name' as uploaded_by
        FROM documents d
        JOIN auth.users u ON d.uploaded_by = u.id
        WHERE d.title = (SELECT title FROM documents WHERE id = $1)
        AND d.project_id = (SELECT project_id FROM documents WHERE id = $1)
        ORDER BY d.created_at DESC
      `;

      const result = await query(historyQuery, [id]);

      res.json({
        versions: result.rows,
        total: result.rowCount || 0
      });
      
    } catch (error) {
      console.error('[documents] Error fetching history:', error);
      res.status(500).json({ error: 'Failed to fetch document history' });
    }
  });

  // SHARE document link
  router.post('/:id/share', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { expires_in_hours = 24 } = req.body;
      const userId = req.user?.id;

      // Generate share token
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);

      const result = await query(
        `INSERT INTO document_shares 
         (document_id, shared_by, share_token, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '${expires_in_hours} hours')
         RETURNING share_token, expires_at`,
        [id, userId, shareToken]
      );

      res.json({
        share_url: `/api/documents/shared/${shareToken}`,
        expires_at: result.rows[0].expires_at
      });
      
    } catch (error) {
      console.error('[documents] Error sharing:', error);
      res.status(500).json({ error: 'Failed to share document' });
    }
  });

  return router;
}
