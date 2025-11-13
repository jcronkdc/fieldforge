import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

export function createOperationsRouter(): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticateRequest);

  // Get daily reports
  router.get('/daily-reports', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { report_date, project_id, status, start_date, end_date } = req.query;

      let queryText = `
        SELECT 
          dr.*,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as supervisor_name
        FROM daily_reports dr
        LEFT JOIN projects p ON dr.project_id = p.id
        LEFT JOIN auth.users u ON dr.supervisor_id = u.id
        WHERE dr.company_id = $1
      `;
      const params: any[] = [companyId];

      if (report_date) {
        params.push(report_date);
        queryText += ` AND dr.report_date = $${params.length}`;
      }

      if (project_id) {
        params.push(project_id);
        queryText += ` AND dr.project_id = $${params.length}`;
      }

      if (status) {
        params.push(status);
        queryText += ` AND dr.status = $${params.length}`;
      }

      if (start_date) {
        params.push(start_date);
        queryText += ` AND dr.report_date >= $${params.length}`;
      }

      if (end_date) {
        params.push(end_date);
        queryText += ` AND dr.report_date <= $${params.length}`;
      }

      queryText += ` ORDER BY dr.report_date DESC, dr.created_at DESC`;

      const result = await query(queryText, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('[operations] Error fetching daily reports:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
  });

  // Create daily report
  router.post('/daily-reports', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id;

      const {
        report_date,
        project_id,
        weather_conditions,
        work_summary,
        crew_count,
        crew_details,
        activities_completed,
        equipment_used,
        materials_used,
        safety_incidents,
        safety_notes,
        delays,
        photos,
        tomorrow_plan,
        additional_notes
      } = req.body;

      // Validate required fields
      if (!report_date || !work_summary) {
        return res.status(400).json({ 
          success: false, 
          error: 'Report date and work summary are required' 
        });
      }

      await query('BEGIN');

      try {
        const result = await query(
          `INSERT INTO daily_reports (
            report_date, project_id, supervisor_id, company_id,
            weather_conditions, work_summary, crew_count, crew_details,
            activities_completed, equipment_used, materials_used,
            safety_incidents, safety_notes, delays, photos,
            tomorrow_plan, additional_notes, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            report_date,
            project_id,
            userId,
            companyId,
            JSON.stringify(weather_conditions || {}),
            work_summary,
            crew_count || 0,
            JSON.stringify(crew_details || []),
            JSON.stringify(activities_completed || []),
            JSON.stringify(equipment_used || []),
            JSON.stringify(materials_used || []),
            safety_incidents || 0,
            safety_notes,
            JSON.stringify(delays || []),
            JSON.stringify(photos || []),
            tomorrow_plan,
            additional_notes,
            'draft'
          ]
        );

        // Log audit event
        await logAuditEvent({
          action: 'daily_report_created',
          user_id: userId!,
          resource_type: 'daily_report',
          resource_id: result.rows[0].id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { report_date, project_id },
          success: true
        });

        await query('COMMIT');

        res.status(201).json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[operations] Error creating daily report:', error);
      res.status(500).json({ success: false, error: 'Failed to create report' });
    }
  });

  // Update daily report
  router.put('/daily-reports/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        weather_conditions,
        work_summary,
        crew_count,
        crew_details,
        activities_completed,
        equipment_used,
        materials_used,
        safety_incidents,
        safety_notes,
        delays,
        photos,
        tomorrow_plan,
        additional_notes
      } = req.body;

      const result = await query(
        `UPDATE daily_reports 
        SET 
          weather_conditions = COALESCE($2, weather_conditions),
          work_summary = COALESCE($3, work_summary),
          crew_count = COALESCE($4, crew_count),
          crew_details = COALESCE($5, crew_details),
          activities_completed = COALESCE($6, activities_completed),
          equipment_used = COALESCE($7, equipment_used),
          materials_used = COALESCE($8, materials_used),
          safety_incidents = COALESCE($9, safety_incidents),
          safety_notes = COALESCE($10, safety_notes),
          delays = COALESCE($11, delays),
          photos = COALESCE($12, photos),
          tomorrow_plan = COALESCE($13, tomorrow_plan),
          additional_notes = COALESCE($14, additional_notes),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [
          id,
          weather_conditions ? JSON.stringify(weather_conditions) : undefined,
          work_summary,
          crew_count,
          crew_details ? JSON.stringify(crew_details) : undefined,
          activities_completed ? JSON.stringify(activities_completed) : undefined,
          equipment_used ? JSON.stringify(equipment_used) : undefined,
          materials_used ? JSON.stringify(materials_used) : undefined,
          safety_incidents,
          safety_notes,
          delays ? JSON.stringify(delays) : undefined,
          photos ? JSON.stringify(photos) : undefined,
          tomorrow_plan,
          additional_notes
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('[operations] Error updating daily report:', error);
      res.status(500).json({ success: false, error: 'Failed to update report' });
    }
  });

  // Submit daily report
  router.put('/daily-reports/:id/submit', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await query(
        `UPDATE daily_reports 
        SET status = 'submitted', submitted_at = NOW()
        WHERE id = $1 AND supervisor_id = $2 AND status = 'draft'
        RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Report not found or already submitted' 
        });
      }

      // Log audit event
      await logAuditEvent({
        action: 'daily_report_submitted',
        user_id: userId!,
        resource_type: 'daily_report',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { report_date: result.rows[0].report_date },
        success: true
      });

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('[operations] Error submitting daily report:', error);
      res.status(500).json({ success: false, error: 'Failed to submit report' });
    }
  });

  // Approve daily report (supervisor/admin only)
  router.put('/daily-reports/:id/approve', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { approval_notes } = req.body;

      const result = await query(
        `UPDATE daily_reports 
        SET status = 'approved', 
            approved_by = $2, 
            approved_at = NOW(),
            approval_notes = $3
        WHERE id = $1 AND status = 'submitted'
        RETURNING *`,
        [id, userId, approval_notes]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Report not found or not submitted' 
        });
      }

      // Log audit event
      await logAuditEvent({
        action: 'daily_report_approved',
        user_id: userId!,
        resource_type: 'daily_report',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { report_date: result.rows[0].report_date },
        success: true
      });

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('[operations] Error approving daily report:', error);
      res.status(500).json({ success: false, error: 'Failed to approve report' });
    }
  });

  // Get daily report summary/analytics
  router.get('/daily-reports/summary', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { start_date, end_date, project_id } = req.query;

      let queryText = `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
          COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          SUM(crew_count) as total_crew_hours,
          SUM(safety_incidents) as total_safety_incidents,
          COUNT(CASE WHEN safety_incidents > 0 THEN 1 END) as reports_with_incidents
        FROM daily_reports
        WHERE company_id = $1
      `;
      const params: any[] = [companyId];

      if (start_date) {
        params.push(start_date);
        queryText += ` AND report_date >= $${params.length}`;
      }

      if (end_date) {
        params.push(end_date);
        queryText += ` AND report_date <= $${params.length}`;
      }

      if (project_id) {
        params.push(project_id);
        queryText += ` AND project_id = $${params.length}`;
      }

      const summaryResult = await query(queryText, params);

      // Get weather impact summary
      const weatherResult = await query(
        `SELECT 
          weather_conditions->>'work_impact' as impact,
          COUNT(*) as count
        FROM daily_reports
        WHERE company_id = $1
          ${start_date ? `AND report_date >= $2` : ''}
          ${end_date ? `AND report_date <= $${end_date ? 3 : 2}` : ''}
          ${project_id ? `AND project_id = $${project_id ? 4 : 3}` : ''}
        GROUP BY weather_conditions->>'work_impact'`,
        params
      );

      res.json({
        success: true,
        data: {
          summary: summaryResult.rows[0],
          weather_impact: weatherResult.rows
        }
      });
    } catch (error) {
      console.error('[operations] Error fetching report summary:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch summary' });
    }
  });

  // Get equipment utilization from daily reports
  router.get('/equipment-utilization', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { start_date, end_date } = req.query;

      const result = await query(
        `WITH equipment_data AS (
          SELECT 
            report_date,
            jsonb_array_elements(equipment_used) as equipment
          FROM daily_reports
          WHERE company_id = $1
            AND ($2::date IS NULL OR report_date >= $2)
            AND ($3::date IS NULL OR report_date <= $3)
            AND jsonb_array_length(equipment_used) > 0
        )
        SELECT 
          equipment->>'name' as equipment_name,
          COUNT(DISTINCT report_date) as days_used,
          SUM((equipment->>'hours_used')::numeric) as total_hours
        FROM equipment_data
        GROUP BY equipment->>'name'
        ORDER BY total_hours DESC`,
        [companyId, start_date, end_date]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('[operations] Error fetching equipment utilization:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch utilization' });
    }
  });

  // Get crew productivity metrics
  router.get('/crew-productivity', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { start_date, end_date, project_id } = req.query;

      const result = await query(
        `WITH productivity_data AS (
          SELECT 
            dr.report_date,
            dr.crew_count,
            jsonb_array_length(dr.activities_completed) as activities_count,
            AVG((jsonb_array_elements(dr.activities_completed)->>'completed_percentage')::numeric) as avg_completion
          FROM daily_reports dr
          WHERE dr.company_id = $1
            AND ($2::date IS NULL OR dr.report_date >= $2)
            AND ($3::date IS NULL OR dr.report_date <= $3)
            AND ($4::uuid IS NULL OR dr.project_id = $4)
            AND jsonb_array_length(dr.activities_completed) > 0
          GROUP BY dr.report_date, dr.crew_count
        )
        SELECT 
          TO_CHAR(report_date, 'Day') as day_of_week,
          AVG(crew_count) as avg_crew_size,
          AVG(activities_count) as avg_activities_per_day,
          AVG(avg_completion) as avg_completion_rate,
          AVG(activities_count::numeric / NULLIF(crew_count, 0)) as activities_per_worker
        FROM productivity_data
        GROUP BY TO_CHAR(report_date, 'Day'), EXTRACT(DOW FROM report_date)
        ORDER BY EXTRACT(DOW FROM report_date)`,
        [companyId, start_date, end_date, project_id]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('[operations] Error fetching crew productivity:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch productivity' });
    }
  });

  return router;
}
