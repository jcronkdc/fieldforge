import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';
import { validateRequestBody } from '../../middleware/inputValidation.js';

export function createReceiptRouter(): Router {
  const router = Router();

  router.use(validateRequestBody);

  // ============================================================================
  // RECEIPT MANAGEMENT ENDPOINTS - EXPENSE TRACKING
  // ============================================================================

  // Create new receipt/expense
  router.post('/', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      if (!userId || !companyId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        merchant_name, 
        amount, 
        category, 
        description, 
        receipt_date,
        project_id,
        payment_method,
        image_data // base64 image
      } = req.body;

      if (!merchant_name || !amount || !category || !receipt_date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await query(
        `INSERT INTO receipts 
         (merchant_name, amount, category, description, receipt_date, project_id,
          payment_method, submitted_by, company_id, status, image_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10)
         RETURNING *`,
        [merchant_name, amount, category, description, receipt_date, project_id,
         payment_method, userId, companyId, image_data ? Buffer.from(image_data, 'base64') : null]
      );

      await logAuditEvent({
        action: 'receipt_submitted',
        user_id: userId,
        resource_type: 'receipt',
        resource_id: result.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { amount, category, merchant_name },
        success: true
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[receipts] Error creating receipt:', error);
      res.status(500).json({ error: 'Failed to create receipt' });
    }
  });

  // Get receipts with filters
  router.get('/', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      if (!companyId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { status, category, project_id, start_date, end_date, search } = req.query;
      
      let queryText = `
        SELECT r.*, 
               p.name as project_name,
               u.raw_user_meta_data->>'full_name' as submitted_by_name,
               a.raw_user_meta_data->>'full_name' as approved_by_name
        FROM receipts r
        LEFT JOIN projects p ON r.project_id = p.id
        LEFT JOIN auth.users u ON r.submitted_by = u.id
        LEFT JOIN auth.users a ON r.approved_by = a.id
        WHERE r.company_id = $1
      `;
      const params: any[] = [companyId];
      let paramIndex = 2;

      if (status) {
        queryText += ` AND r.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      if (category) {
        queryText += ` AND r.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (project_id) {
        queryText += ` AND r.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }
      
      if (start_date) {
        queryText += ` AND r.receipt_date >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }
      
      if (end_date) {
        queryText += ` AND r.receipt_date <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }
      
      if (search) {
        queryText += ` AND (r.merchant_name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      queryText += ` ORDER BY r.receipt_date DESC`;

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[receipts] Error fetching receipts:', error);
      res.status(500).json({ error: 'Failed to fetch receipts' });
    }
  });

  // Get receipt statistics
  router.get('/stats', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      if (!companyId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { project_id, period = 'month' } = req.query;
      
      let baseQuery = `WHERE company_id = $1`;
      const params: any[] = [companyId];
      let paramIndex = 2;
      
      if (project_id) {
        baseQuery += ` AND project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      // Get totals by status
      const statusQuery = await query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
          SUM(amount) FILTER (WHERE status = 'pending') as pending_amount,
          SUM(amount) FILTER (WHERE status = 'approved') as approved_amount,
          SUM(amount) FILTER (WHERE status = 'rejected') as rejected_amount
         FROM receipts ${baseQuery}`,
        params
      );

      // Get spending by category
      const categoryQuery = await query(
        `SELECT category, COUNT(*) as count, SUM(amount) as total
         FROM receipts ${baseQuery} AND status = 'approved'
         GROUP BY category
         ORDER BY total DESC`,
        params
      );

      // Get monthly trend
      const trendQuery = await query(
        `SELECT 
          DATE_TRUNC('month', receipt_date) as month,
          COUNT(*) as count,
          SUM(amount) as total
         FROM receipts ${baseQuery} AND status = 'approved'
         AND receipt_date >= NOW() - INTERVAL '6 months'
         GROUP BY month
         ORDER BY month`,
        params
      );

      res.json({
        summary: statusQuery.rows[0],
        by_category: categoryQuery.rows,
        monthly_trend: trendQuery.rows
      });
    } catch (error) {
      console.error('[receipts] Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Upload receipt with image
  router.post('/upload', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      if (!userId || !companyId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        merchant_name, 
        amount, 
        category, 
        description, 
        receipt_date,
        project_id,
        payment_method,
        image_data // base64
      } = req.body;

      if (!merchant_name || !amount || !category || !image_data) {
        return res.status(400).json({ error: 'Missing required fields or image' });
      }

      // Decode base64 and validate size
      const imageBuffer = Buffer.from(image_data, 'base64');
      if (imageBuffer.length > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({ error: 'Image size exceeds 5MB limit' });
      }

      const result = await query(
        `INSERT INTO receipts 
         (merchant_name, amount, category, description, receipt_date, project_id,
          payment_method, submitted_by, company_id, status, image_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10)
         RETURNING id, merchant_name, amount, category, status, created_at`,
        [merchant_name, amount, category, description, receipt_date || new Date(),
         project_id, payment_method, userId, companyId, imageBuffer]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[receipts] Error uploading receipt:', error);
      res.status(500).json({ error: 'Failed to upload receipt' });
    }
  });

  // Approve receipt
  router.put('/:id/approve', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      const userRole = req.user?.role;
      
      // Only managers can approve
      if (userRole !== 'manager' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Only managers can approve receipts' });
      }

      const { id } = req.params;
      const { notes } = req.body;

      const result = await query(
        `UPDATE receipts 
         SET status = 'approved', 
             approved_by = $1, 
             approved_at = NOW(),
             approval_notes = $2
         WHERE id = $3 AND company_id = $4 AND status = 'pending'
         RETURNING *`,
        [userId, notes, id, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Receipt not found or already processed' });
      }

      await logAuditEvent({
        action: 'receipt_approved',
        user_id: userId!,
        resource_type: 'receipt',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { amount: result.rows[0].amount },
        success: true
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[receipts] Error approving receipt:', error);
      res.status(500).json({ error: 'Failed to approve receipt' });
    }
  });

  // Reject receipt
  router.put('/:id/reject', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      const userRole = req.user?.role;
      
      if (userRole !== 'manager' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Only managers can reject receipts' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const result = await query(
        `UPDATE receipts 
         SET status = 'rejected', 
             approved_by = $1, 
             approved_at = NOW(),
             rejection_reason = $2
         WHERE id = $3 AND company_id = $4 AND status = 'pending'
         RETURNING *`,
        [userId, reason, id, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Receipt not found or already processed' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[receipts] Error rejecting receipt:', error);
      res.status(500).json({ error: 'Failed to reject receipt' });
    }
  });

  // Update receipt (only pending ones)
  router.put('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      const { id } = req.params;
      
      const { 
        merchant_name, 
        amount, 
        category, 
        description,
        receipt_date,
        project_id,
        payment_method
      } = req.body;

      const result = await query(
        `UPDATE receipts 
         SET merchant_name = $1, amount = $2, category = $3, description = $4,
             receipt_date = $5, project_id = $6, payment_method = $7, updated_at = NOW()
         WHERE id = $8 AND company_id = $9 AND submitted_by = $10 AND status = 'pending'
         RETURNING *`,
        [merchant_name, amount, category, description, receipt_date, 
         project_id, payment_method, id, companyId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Receipt not found or cannot be edited' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[receipts] Error updating receipt:', error);
      res.status(500).json({ error: 'Failed to update receipt' });
    }
  });

  // Delete receipt (only own pending ones)
  router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      const { id } = req.params;

      const result = await query(
        `DELETE FROM receipts 
         WHERE id = $1 AND company_id = $2 AND submitted_by = $3 AND status = 'pending'
         RETURNING id`,
        [id, companyId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Receipt not found or cannot be deleted' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('[receipts] Error deleting receipt:', error);
      res.status(500).json({ error: 'Failed to delete receipt' });
    }
  });

  // Get single receipt
  router.get('/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { id } = req.params;

      const result = await query(
        `SELECT r.*, 
                p.name as project_name,
                u.raw_user_meta_data->>'full_name' as submitted_by_name,
                a.raw_user_meta_data->>'full_name' as approved_by_name
         FROM receipts r
         LEFT JOIN projects p ON r.project_id = p.id
         LEFT JOIN auth.users u ON r.submitted_by = u.id
         LEFT JOIN auth.users a ON r.approved_by = a.id
         WHERE r.id = $1 AND r.company_id = $2`,
        [id, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[receipts] Error fetching receipt:', error);
      res.status(500).json({ error: 'Failed to fetch receipt' });
    }
  });

  return router;
}