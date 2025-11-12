import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

export function createQAQCRouter(): Router {
  const router = Router();

  // ============================================================================
  // QAQC MANAGEMENT ENDPOINTS - COMPLETE E2E FUNCTIONALITY
  // ============================================================================

  // Get inspections with filters
  router.get('/inspections', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { status, project_id, inspection_type } = req.query;

      let queryText = `
        SELECT 
          i.*,
          p.name as project_name,
          u.email as inspector_email,
          u.raw_user_meta_data->>'full_name' as inspector_name,
          COUNT(DISTINCT f.id) as finding_count,
          COUNT(DISTINCT f.id) FILTER (WHERE f.severity = 'critical') as critical_findings,
          COUNT(DISTINCT f.id) FILTER (WHERE f.severity = 'major') as major_findings,
          COUNT(DISTINCT f.id) FILTER (WHERE f.severity = 'minor') as minor_findings
        FROM qaqc_inspections i
        LEFT JOIN projects p ON i.project_id = p.id
        LEFT JOIN auth.users u ON i.inspector_id = u.id
        LEFT JOIN qaqc_findings f ON f.inspection_id = i.id
        WHERE i.company_id = $1
      `;

      const params: any[] = [companyId];
      let paramIndex = 2;

      if (status) {
        queryText += ` AND i.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (project_id) {
        queryText += ` AND i.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (inspection_type) {
        queryText += ` AND i.inspection_type = $${paramIndex}`;
        params.push(inspection_type);
        paramIndex++;
      }

      queryText += ` GROUP BY i.id, p.name, u.email, u.raw_user_meta_data ORDER BY i.scheduled_date DESC`;

      const result = await query(queryText, params);

      // Get findings for each inspection
      for (const inspection of result.rows) {
        const findingsResult = await query(
          'SELECT * FROM qaqc_findings WHERE inspection_id = $1 ORDER BY severity DESC',
          [inspection.id]
        );
        inspection.findings = findingsResult.rows;
      }

      res.json({ inspections: result.rows });
    } catch (error) {
      console.error('[qaqc] Error fetching inspections:', error);
      res.status(500).json({ error: 'Failed to fetch inspections' });
    }
  });

  // Get quality metrics
  router.get('/metrics', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;

      const metricsQuery = await query(
        `SELECT 
          COUNT(DISTINCT i.id) as total_inspections,
          COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'completed' AND i.score >= 70) as passed,
          COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'completed') as completed,
          COUNT(DISTINCT i.id) FILTER (WHERE i.scheduled_date < NOW() AND i.status = 'scheduled') as overdue,
          COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'open') as open_findings,
          AVG(i.score) FILTER (WHERE i.status = 'completed') as avg_score
        FROM qaqc_inspections i
        LEFT JOIN qaqc_findings f ON f.inspection_id = i.id
        WHERE i.company_id = $1`,
        [companyId]
      );

      const metrics = metricsQuery.rows[0];
      
      res.json({
        totalInspections: parseInt(metrics.total_inspections) || 0,
        passRate: metrics.completed > 0 
          ? Math.round((metrics.passed / metrics.completed) * 100) 
          : 0,
        openFindings: parseInt(metrics.open_findings) || 0,
        avgScore: Math.round(metrics.avg_score) || 0,
        overdueInspections: parseInt(metrics.overdue) || 0,
        completionRate: metrics.total_inspections > 0
          ? Math.round((metrics.completed / metrics.total_inspections) * 100)
          : 0
      });
    } catch (error) {
      console.error('[qaqc] Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch quality metrics' });
    }
  });

  // Create new inspection
  router.post('/inspections', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;
      
      const {
        inspection_type,
        scheduled_date,
        project_id,
        notes,
        checklist_template_id
      } = req.body;

      if (!inspection_type || !scheduled_date) {
        return res.status(400).json({ 
          error: 'Missing required fields: inspection_type, scheduled_date' 
        });
      }

      const result = await query(
        `INSERT INTO qaqc_inspections 
         (inspection_type, scheduled_date, project_id, notes, checklist_template_id,
          company_id, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7)
         RETURNING *`,
        [inspection_type, scheduled_date, project_id, notes, checklist_template_id,
         companyId, userId]
      );

      await logAuditEvent({
        action: 'inspection_scheduled',
        user_id: userId!,
        resource_type: 'inspection',
        resource_id: result.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { inspection_type, scheduled_date },
        success: true
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[qaqc] Error creating inspection:', error);
      res.status(500).json({ error: 'Failed to create inspection' });
    }
  });

  // Start inspection
  router.put('/inspections/:id/start', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const result = await query(
        `UPDATE qaqc_inspections 
         SET status = 'in_progress', 
             inspector_id = $1,
             updated_at = NOW()
         WHERE id = $2 AND status = 'scheduled'
         RETURNING *`,
        [userId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inspection not found or already started' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[qaqc] Error starting inspection:', error);
      res.status(500).json({ error: 'Failed to start inspection' });
    }
  });

  // Complete inspection with findings
  router.post('/inspections/:id/complete', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { score, findings, photos, summary } = req.body;

      await query('BEGIN');

      try {
        // Update inspection
        const inspectionResult = await query(
          `UPDATE qaqc_inspections 
           SET status = $1, 
               score = $2, 
               completed_date = NOW(),
               summary = $3,
               photos = $4,
               updated_at = NOW()
           WHERE id = $5 AND inspector_id = $6
           RETURNING *`,
          [score >= 70 ? 'completed' : 'failed', score, summary, photos || [], id, userId]
        );

        if (inspectionResult.rows.length === 0) {
          throw new Error('Inspection not found or unauthorized');
        }

        // Add findings
        if (findings && findings.length > 0) {
          for (const finding of findings) {
            await query(
              `INSERT INTO qaqc_findings 
               (inspection_id, description, severity, location, photos, 
                corrective_action, status)
               VALUES ($1, $2, $3, $4, $5, $6, 'open')`,
              [id, finding.description, finding.severity, finding.location,
               finding.photos || [], finding.corrective_action]
            );
          }
        }

        await query('COMMIT');

        // Log critical findings
        const criticalCount = findings?.filter((f: any) => f.severity === 'critical').length || 0;
        if (criticalCount > 0) {
          await logAuditEvent({
            action: 'critical_qaqc_findings',
            user_id: userId!,
            resource_type: 'inspection',
            resource_id: id,
            ip_address: req.ip || '',
            user_agent: req.headers['user-agent'] as string,
            metadata: { score, critical_findings: criticalCount },
            success: true
          });
        }

        res.json(inspectionResult.rows[0]);
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[qaqc] Error completing inspection:', error);
      res.status(500).json({ error: 'Failed to complete inspection' });
    }
  });

  // Update finding status
  router.put('/findings/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, resolution_notes, resolution_photos } = req.body;

      const result = await query(
        `UPDATE qaqc_findings 
         SET status = $1, 
             resolution_notes = $2,
             resolution_photos = $3,
             resolution_date = CASE WHEN $1 IN ('resolved', 'verified') THEN NOW() ELSE NULL END,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, resolution_notes, resolution_photos || [], id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Finding not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[qaqc] Error updating finding:', error);
      res.status(500).json({ error: 'Failed to update finding' });
    }
  });

  // Get inspection types
  router.get('/inspection-types', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const types = [
        { value: 'Concrete Pour', category: 'Structural' },
        { value: 'Structural Steel', category: 'Structural' },
        { value: 'Electrical Installation', category: 'MEP' },
        { value: 'Mechanical Systems', category: 'MEP' },
        { value: 'Fire Protection', category: 'MEP' },
        { value: 'Waterproofing', category: 'Building Envelope' },
        { value: 'Insulation', category: 'Building Envelope' },
        { value: 'Final Walkthrough', category: 'Commissioning' },
        { value: 'Safety Inspection', category: 'Safety' },
        { value: 'Environmental Compliance', category: 'Compliance' }
      ];

      res.json({ types });
    } catch (error) {
      console.error('[qaqc] Error fetching inspection types:', error);
      res.status(500).json({ error: 'Failed to fetch inspection types' });
    }
  });

  return router;
}