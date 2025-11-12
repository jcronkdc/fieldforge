import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

export function createQAQCRouter(): Router {
  const router = Router();

  // ============================================================================
  // QAQC INSPECTION SYSTEM - LIVE E2E FUNCTIONALITY
  // ============================================================================

  // GET inspection forms/templates
  router.get('/forms', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { category, status = 'active' } = req.query;
      
      let queryText = `
        SELECT * FROM qaqc_forms 
        WHERE status = $1
      `;
      const params: any[] = [status];
      
      if (category) {
        queryText += ` AND category = $2`;
        params.push(category);
      }
      
      queryText += ` ORDER BY sort_order, name`;
      
      const result = await query(queryText, params);
      
      res.json({
        forms: result.rows,
        total: result.rowCount || 0
      });
      
    } catch (error) {
      console.error('[qaqc] Error fetching forms:', error);
      res.status(500).json({ error: 'Failed to fetch inspection forms' });
    }
  });

  // CREATE inspection
  router.post('/inspections', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];
      
      const {
        form_id,
        project_id,
        equipment_id,
        area,
        type,
        checklist_items
      } = req.body;
      
      if (!form_id || !project_id || !type) {
        return res.status(400).json({ 
          error: 'Missing required fields: form_id, project_id, type' 
        });
      }

      await query('BEGIN');

      try {
        // Create inspection record
        const inspectionResult = await query(
          `INSERT INTO qaqc_inspections 
           (form_id, project_id, equipment_id, area, type, inspector_id, 
            company_id, status, started_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', NOW())
           RETURNING *`,
          [form_id, project_id, equipment_id, area, type, userId, companyId]
        );
        
        const inspection = inspectionResult.rows[0];

        // Create checklist items if provided
        if (checklist_items && Array.isArray(checklist_items)) {
          for (const item of checklist_items) {
            await query(
              `INSERT INTO qaqc_checklist_items
               (inspection_id, item_name, category, status, notes)
               VALUES ($1, $2, $3, $4, $5)`,
              [inspection.id, item.name, item.category, 'pending', item.notes]
            );
          }
        }

        await logAuditEvent({
          action: 'qaqc_inspection_created',
          user_id: userId,
          resource_type: 'qaqc_inspection',
          resource_id: inspection.id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { form_id, project_id, type },
          success: true
        });

        await query('COMMIT');

        res.status(201).json(inspection);
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('[qaqc] Error creating inspection:', error);
      res.status(500).json({ error: 'Failed to create inspection' });
    }
  });

  // GET inspection details with checklist
  router.get('/inspections/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const inspectionQuery = `
        SELECT 
          i.*,
          f.name as form_name,
          f.category as form_category,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as inspector_name,
          e.name as equipment_name,
          e.asset_tag as equipment_tag
        FROM qaqc_inspections i
        JOIN qaqc_forms f ON i.form_id = f.id
        JOIN projects p ON i.project_id = p.id
        JOIN auth.users u ON i.inspector_id = u.id
        LEFT JOIN equipment_inventory e ON i.equipment_id = e.id
        WHERE i.id = $1
      `;
      
      const checklistQuery = `
        SELECT * FROM qaqc_checklist_items
        WHERE inspection_id = $1
        ORDER BY category, sort_order
      `;
      
      const defectsQuery = `
        SELECT 
          d.*,
          u.raw_user_meta_data->>'full_name' as reported_by_name
        FROM qaqc_defects d
        LEFT JOIN auth.users u ON d.reported_by = u.id
        WHERE d.inspection_id = $1
        ORDER BY d.severity DESC, d.created_at
      `;
      
      const [inspectionResult, checklistResult, defectsResult] = await Promise.all([
        query(inspectionQuery, [id]),
        query(checklistQuery, [id]),
        query(defectsQuery, [id])
      ]);
      
      if (inspectionResult.rowCount === 0) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
      
      res.json({
        inspection: inspectionResult.rows[0],
        checklist: checklistResult.rows,
        defects: defectsResult.rows
      });
      
    } catch (error) {
      console.error('[qaqc] Error fetching inspection:', error);
      res.status(500).json({ error: 'Failed to fetch inspection details' });
    }
  });

  // UPDATE checklist item
  router.put('/checklist/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes, measurements, pass_fail } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const result = await query(
        `UPDATE qaqc_checklist_items
         SET status = $1, 
             notes = $2, 
             measurements = $3,
             pass_fail = $4,
             checked_at = NOW(),
             checked_by = $5
         WHERE id = $6
         RETURNING *`,
        [status, notes, measurements, pass_fail, req.user?.id, id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Checklist item not found' });
      }
      
      res.json(result.rows[0]);
      
    } catch (error) {
      console.error('[qaqc] Error updating checklist:', error);
      res.status(500).json({ error: 'Failed to update checklist item' });
    }
  });

  // CREATE defect
  router.post('/defects', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const {
        inspection_id,
        checklist_item_id,
        severity,
        description,
        location,
        images
      } = req.body;
      
      if (!inspection_id || !severity || !description) {
        return res.status(400).json({ 
          error: 'Missing required fields: inspection_id, severity, description' 
        });
      }
      
      const result = await query(
        `INSERT INTO qaqc_defects
         (inspection_id, checklist_item_id, severity, description, 
          location, images, reported_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
         RETURNING *`,
        [inspection_id, checklist_item_id, severity, description, 
         location, images || [], userId]
      );
      
      // Update inspection if critical defect
      if (severity === 'critical') {
        await query(
          `UPDATE qaqc_inspections 
           SET has_critical_defects = true 
           WHERE id = $1`,
          [inspection_id]
        );
      }
      
      res.status(201).json(result.rows[0]);
      
    } catch (error) {
      console.error('[qaqc] Error creating defect:', error);
      res.status(500).json({ error: 'Failed to create defect' });
    }
  });

  // COMPLETE inspection
  router.put('/inspections/:id/complete', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { signature, overall_status, recommendations } = req.body;
      
      if (!signature || !overall_status) {
        return res.status(400).json({ 
          error: 'Signature and overall_status are required' 
        });
      }

      await query('BEGIN');

      try {
        // Check all checklist items are completed
        const pendingItems = await query(
          `SELECT COUNT(*) as pending 
           FROM qaqc_checklist_items 
           WHERE inspection_id = $1 AND status = 'pending'`,
          [id]
        );
        
        if (parseInt(pendingItems.rows[0].pending) > 0) {
          throw new Error('All checklist items must be completed');
        }
        
        // Calculate pass/fail counts
        const stats = await query(
          `SELECT 
            COUNT(CASE WHEN pass_fail = 'pass' THEN 1 END) as passed,
            COUNT(CASE WHEN pass_fail = 'fail' THEN 1 END) as failed,
            COUNT(*) as total
           FROM qaqc_checklist_items
           WHERE inspection_id = $1`,
          [id]
        );
        
        // Update inspection
        const result = await query(
          `UPDATE qaqc_inspections
           SET status = 'completed',
               completed_at = NOW(),
               overall_status = $1,
               recommendations = $2,
               signature = $3,
               items_passed = $4,
               items_failed = $5,
               total_items = $6
           WHERE id = $7
           RETURNING *`,
          [overall_status, recommendations, signature, 
           stats.rows[0].passed, stats.rows[0].failed, 
           stats.rows[0].total, id]
        );
        
        await query('COMMIT');
        
        res.json(result.rows[0]);
        
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('[qaqc] Error completing inspection:', error);
      res.status(500).json({ error: error.message || 'Failed to complete inspection' });
    }
  });

  // GET inspection list with filters
  router.get('/inspections', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { project_id, status, type, date_from, date_to, limit = 50 } = req.query;
      
      let queryText = `
        SELECT 
          i.*,
          f.name as form_name,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as inspector_name
        FROM qaqc_inspections i
        JOIN qaqc_forms f ON i.form_id = f.id
        JOIN projects p ON i.project_id = p.id
        JOIN auth.users u ON i.inspector_id = u.id
        WHERE i.company_id = $1
      `;
      const params: any[] = [companyId];
      let paramIndex = 2;
      
      if (project_id) {
        queryText += ` AND i.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }
      
      if (status) {
        queryText += ` AND i.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      if (type) {
        queryText += ` AND i.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }
      
      if (date_from) {
        queryText += ` AND i.started_at >= $${paramIndex}`;
        params.push(date_from);
        paramIndex++;
      }
      
      if (date_to) {
        queryText += ` AND i.started_at <= $${paramIndex}`;
        params.push(date_to);
        paramIndex++;
      }
      
      queryText += ` ORDER BY i.started_at DESC LIMIT $${paramIndex}`;
      params.push(limit);
      
      const result = await query(queryText, params);
      
      res.json({
        inspections: result.rows,
        total: result.rowCount || 0
      });
      
    } catch (error) {
      console.error('[qaqc] Error fetching inspections:', error);
      res.status(500).json({ error: 'Failed to fetch inspections' });
    }
  });

  // GET testing results
  router.get('/testing/:inspection_id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { inspection_id } = req.params;
      
      const testingQuery = `
        SELECT 
          t.*,
          tt.name as test_name,
          tt.specification,
          tt.unit_of_measure,
          u.raw_user_meta_data->>'full_name' as performed_by_name
        FROM qaqc_testing_results t
        JOIN qaqc_test_types tt ON t.test_type_id = tt.id
        LEFT JOIN auth.users u ON t.performed_by = u.id
        WHERE t.inspection_id = $1
        ORDER BY t.test_date DESC
      `;
      
      const result = await query(testingQuery, [inspection_id]);
      
      res.json({
        tests: result.rows,
        total: result.rowCount || 0
      });
      
    } catch (error) {
      console.error('[qaqc] Error fetching test results:', error);
      res.status(500).json({ error: 'Failed to fetch test results' });
    }
  });

  // CREATE test result
  router.post('/testing', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const {
        inspection_id,
        test_type_id,
        result_value,
        pass_fail,
        notes
      } = req.body;
      
      if (!inspection_id || !test_type_id || !result_value || !pass_fail) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }
      
      const result = await query(
        `INSERT INTO qaqc_testing_results
         (inspection_id, test_type_id, result_value, pass_fail, 
          notes, test_date, performed_by)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         RETURNING *`,
        [inspection_id, test_type_id, result_value, pass_fail, notes, userId]
      );
      
      res.status(201).json(result.rows[0]);
      
    } catch (error) {
      console.error('[qaqc] Error creating test result:', error);
      res.status(500).json({ error: 'Failed to create test result' });
    }
  });

  return router;
}
