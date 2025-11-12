import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';
// File upload configuration for Vercel (no local storage)
const allowedFileTypes = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/dwg',
  'application/dxf'
];

const maxFileSize = 50 * 1024 * 1024; // 50MB

export function createDocumentRouter(): Router {
  const router = Router();

  // ============================================================================
  // DOCUMENT MANAGEMENT ENDPOINTS - COMPLETE E2E FUNCTIONALITY
  // ============================================================================

  // Get documents with filters
  router.get('/', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { folder_id, type, search, project_id } = req.query;

      let queryText = `
        SELECT 
          d.*,
          p.name as project_name,
          u.email as uploader_email,
          u.raw_user_meta_data->>'full_name' as uploader_name,
          f.name as folder_name
        FROM documents d
        LEFT JOIN projects p ON d.project_id = p.id
        LEFT JOIN auth.users u ON d.uploaded_by = u.id
        LEFT JOIN document_folders f ON d.folder_id = f.id
        WHERE d.company_id = $1
      `;

      const params: any[] = [companyId];
      let paramIndex = 2;

      if (folder_id) {
        queryText += ` AND d.folder_id = $${paramIndex}`;
        params.push(folder_id);
        paramIndex++;
      }

      if (type && type !== 'all') {
        queryText += ` AND d.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (search) {
        queryText += ` AND (d.name ILIKE $${paramIndex} OR d.tags::text ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (project_id) {
        queryText += ` AND d.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      queryText += ` ORDER BY d.created_at DESC`;

      const result = await query(queryText, params);
      res.json({ documents: result.rows });
    } catch (error) {
      console.error('[documents] Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // Upload document (base64 for Vercel compatibility)
  router.post('/upload', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      
      const {
        name,
        file_data, // base64 encoded
        file_type,
        type = 'other',
        tags = '',
        is_public = false,
        folder_id,
        project_id
      } = req.body;

      if (!name || !file_data || !file_type) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, file_data, file_type' 
        });
      }

      // Validate file type
      if (!allowedFileTypes.includes(file_type)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      // Decode base64 and check size
      const fileBuffer = Buffer.from(file_data, 'base64');
      if (fileBuffer.length > maxFileSize) {
        return res.status(400).json({ error: 'File size exceeds 50MB limit' });
      }

      const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

      const result = await query(
        `INSERT INTO documents 
         (name, type, file_type, size, file_data, project_id, folder_id,
          uploaded_by, company_id, tags, is_public, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)
         RETURNING id, name, type, file_type, size, created_at, tags`,
        [name, type, file_type, fileBuffer.length, fileBuffer, 
         project_id, folder_id, userId, companyId, tagsArray, is_public]
      );

      await logAuditEvent({
        action: 'document_uploaded',
        user_id: userId!,
        resource_type: 'document',
        resource_id: result.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { filename: name, size: fileBuffer.length, type },
        success: true
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[documents] Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  // Download document
  router.get('/:id/download', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT name, file_type, file_data FROM documents 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = result.rows[0];
      
      // Update download count
      await query(
        `UPDATE documents 
         SET download_count = download_count + 1 
         WHERE id = $1`,
        [id]
      );

      // Send file as response
      res.setHeader('Content-Type', document.file_type);
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
      res.send(document.file_data);
    } catch (error) {
      console.error('[documents] Error downloading document:', error);
      res.status(500).json({ error: 'Failed to download document' });
    }
  });

  // Share document
  router.post('/:id/share', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { expiry_hours = 24 } = req.body;

      // Create share link
      const shareToken = randomUUID();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + expiry_hours);

      await query(
        `INSERT INTO document_shares 
         (document_id, share_token, created_by, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [id, shareToken, req.user?.id, expiryDate]
      );

      const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareToken}`;
      
      res.json({ shareUrl, expiresAt: expiryDate });
    } catch (error) {
      console.error('[documents] Error sharing document:', error);
      res.status(500).json({ error: 'Failed to share document' });
    }
  });

  // Get folders
  router.get('/folders', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;

      const result = await query(
        `SELECT 
          f.*,
          COUNT(DISTINCT d.id) as document_count
         FROM document_folders f
         LEFT JOIN documents d ON d.folder_id = f.id
         WHERE f.company_id = $1
         GROUP BY f.id
         ORDER BY f.name`,
        [companyId]
      );

      res.json({ folders: result.rows });
    } catch (error) {
      console.error('[documents] Error fetching folders:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  });

  // Create folder
  router.post('/folders', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      const { name, parent_id } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
      }

      const result = await query(
        `INSERT INTO document_folders 
         (name, parent_id, company_id, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, parent_id, companyId, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[documents] Error creating folder:', error);
      res.status(500).json({ error: 'Failed to create folder' });
    }
  });

  // Update document
  router.put('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, tags, folder_id } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(name);
        paramIndex++;
      }

      if (tags !== undefined) {
        updates.push(`tags = $${paramIndex}`);
        values.push(tags);
        paramIndex++;
      }

      if (folder_id !== undefined) {
        updates.push(`folder_id = $${paramIndex}`);
        values.push(folder_id);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const updateQuery = `
        UPDATE documents 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[documents] Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  // Delete document
  router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await query(
        `DELETE FROM documents 
         WHERE id = $1 AND uploaded_by = $2
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found or unauthorized' });
      }

      await logAuditEvent({
        action: 'document_deleted',
        user_id: userId!,
        resource_type: 'document',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { filename: result.rows[0].name },
        success: true
      });

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('[documents] Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  return router;
}