import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

export function createReportingRouter(): Router {
  const router = Router();

  // ============================================================================
  // REPORTING SYSTEM - PDF GENERATION & ANALYTICS REPORTS
  // ============================================================================

  // GET available report templates
  router.get('/templates', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const templates = [
        { id: 'daily_report', name: 'Daily Construction Report', category: 'operations' },
        { id: 'weekly_summary', name: 'Weekly Summary Report', category: 'operations' },
        { id: 'safety_summary', name: 'Safety Summary Report', category: 'safety' },
        { id: 'incident_report', name: 'Incident Investigation Report', category: 'safety' },
        { id: 'qaqc_inspection', name: 'QAQC Inspection Report', category: 'quality' },
        { id: 'progress_report', name: 'Project Progress Report', category: 'management' },
        { id: 'crew_productivity', name: 'Crew Productivity Report', category: 'productivity' },
        { id: 'equipment_utilization', name: 'Equipment Utilization Report', category: 'equipment' },
        { id: 'budget_status', name: 'Budget Status Report', category: 'financial' },
        { id: 'schedule_status', name: 'Schedule Status Report', category: 'planning' }
      ];
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch report templates' });
    }
  });

  // GENERATE report
  router.post('/generate', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];
      const {
        template_id,
        project_id,
        date_from,
        date_to,
        include_photos,
        include_signatures,
        custom_data
      } = req.body;
      
      if (!template_id || !project_id) {
        return res.status(400).json({ 
          error: 'Missing required fields: template_id, project_id' 
        });
      }

      // Generate report data based on template
      let reportData: any = {};
      
      switch (template_id) {
        case 'daily_report':
          reportData = await generateDailyReport(project_id, date_from || new Date());
          break;
        case 'weekly_summary':
          reportData = await generateWeeklySummary(project_id, date_from, date_to);
          break;
        case 'safety_summary':
          reportData = await generateSafetySummary(project_id, date_from, date_to);
          break;
        case 'progress_report':
          reportData = await generateProgressReport(project_id);
          break;
        case 'crew_productivity':
          reportData = await generateCrewProductivity(project_id, date_from, date_to);
          break;
        default:
          return res.status(400).json({ error: 'Invalid template ID' });
      }

      // Create report record
      const reportResult = await query(
        `INSERT INTO reports 
         (template_id, project_id, company_id, generated_by, 
          date_from, date_to, status, report_data)
         VALUES ($1, $2, $3, $4, $5, $6, 'generated', $7)
         RETURNING *`,
        [template_id, project_id, companyId, userId, 
         date_from, date_to, JSON.stringify(reportData)]
      );

      const report = reportResult.rows[0];

      // Generate PDF (simplified - would use real PDF library)
      const pdfContent = generatePDFContent(reportData, template_id);

      // Save PDF
      await query(
        `UPDATE reports 
         SET pdf_data = $1, file_size = $2 
         WHERE id = $3`,
        [Buffer.from(pdfContent, 'base64'), pdfContent.length, report.id]
      );

      res.status(201).json({
        id: report.id,
        download_url: `/api/reporting/download/${report.id}`,
        preview_url: `/api/reporting/preview/${report.id}`,
        created_at: report.created_at
      });
      
    } catch (error) {
      console.error('[reporting] Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  // DOWNLOAD report PDF
  router.get('/download/:reportId', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;

      const result = await query(
        `SELECT 
          r.*,
          p.name as project_name
         FROM reports r
         JOIN projects p ON r.project_id = p.id
         WHERE r.id = $1`,
        [reportId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const report = result.rows[0];
      const fileName = `${report.project_name}_${report.template_id}_${new Date(report.created_at).toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(report.pdf_data);
      
    } catch (error) {
      console.error('[reporting] Error downloading report:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  });

  // GET report history
  router.get('/history', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { project_id, template_id, limit = 50 } = req.query;

      let queryText = `
        SELECT 
          r.*,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as generated_by_name
        FROM reports r
        JOIN projects p ON r.project_id = p.id
        JOIN auth.users u ON r.generated_by = u.id
        WHERE r.company_id = $1
      `;
      const params: any[] = [companyId];
      let paramIndex = 2;

      if (project_id) {
        queryText += ` AND r.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (template_id) {
        queryText += ` AND r.template_id = $${paramIndex}`;
        params.push(template_id);
        paramIndex++;
      }

      queryText += ` ORDER BY r.created_at DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const result = await query(queryText, params);

      res.json({
        reports: result.rows,
        total: result.rowCount || 0
      });
      
    } catch (error) {
      console.error('[reporting] Error fetching history:', error);
      res.status(500).json({ error: 'Failed to fetch report history' });
    }
  });

  // SCHEDULE recurring report
  router.post('/schedule', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const {
        template_id,
        project_id,
        frequency,
        day_of_week,
        time_of_day,
        recipients
      } = req.body;

      if (!template_id || !project_id || !frequency || !recipients) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }

      const result = await query(
        `INSERT INTO report_schedules 
         (template_id, project_id, frequency, day_of_week, 
          time_of_day, recipients, created_by, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [template_id, project_id, frequency, day_of_week,
         time_of_day || '08:00', recipients, userId]
      );

      res.status(201).json(result.rows[0]);
      
    } catch (error) {
      console.error('[reporting] Error scheduling report:', error);
      res.status(500).json({ error: 'Failed to schedule report' });
    }
  });

  // GET dashboard metrics for executive reporting
  router.get('/executive-dashboard/:projectId', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      const [
        projectMetrics,
        safetyMetrics,
        qualityMetrics,
        scheduleMetrics,
        budgetMetrics
      ] = await Promise.all([
        // Project overview
        query(`
          SELECT 
            p.*,
            COUNT(DISTINCT te.user_id) as workers_on_site,
            COUNT(DISTINCT e.id) as equipment_count
          FROM projects p
          LEFT JOIN time_entries te ON p.id = te.project_id 
            AND te.date = CURRENT_DATE
          LEFT JOIN equipment_inventory e ON e.current_project_id = p.id
          WHERE p.id = $1
          GROUP BY p.id`, 
          [projectId]
        ),
        
        // Safety metrics
        query(`
          SELECT 
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as monthly_incidents,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_incidents,
            COALESCE(DATE_PART('day', NOW() - MAX(created_at)), 999) as days_without_incident,
            COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN DATE(created_at) END) as incident_days_this_week
          FROM safety_incidents
          WHERE project_id = $1`,
          [projectId]
        ),
        
        // Quality metrics  
        query(`
          SELECT 
            COUNT(*) as total_inspections,
            COUNT(CASE WHEN overall_status = 'pass' THEN 1 END) as passed,
            COUNT(CASE WHEN overall_status = 'fail' THEN 1 END) as failed,
            COUNT(CASE WHEN has_critical_defects THEN 1 END) as critical_defects
          FROM qaqc_inspections
          WHERE project_id = $1 AND status = 'completed'`,
          [projectId]
        ),
        
        // Schedule metrics
        query(`
          SELECT 
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
            COUNT(CASE WHEN status != 'completed' AND end_date < NOW() THEN 1 END) as overdue_tasks,
            AVG(progress_percentage) as avg_progress
          FROM schedule_tasks
          WHERE project_id = $1`,
          [projectId]
        ),
        
        // Budget metrics
        query(`
          SELECT 
            p.budget as total_budget,
            COALESCE(SUM(te.hours_regular * te.hourly_rate + te.hours_overtime * te.hourly_rate * 1.5), 0) as labor_cost,
            COALESCE(SUM(r.amount), 0) as material_cost
          FROM projects p
          LEFT JOIN time_entries te ON p.id = te.project_id
          LEFT JOIN receipts r ON p.id = r.project_id
          WHERE p.id = $1
          GROUP BY p.budget`,
          [projectId]
        )
      ]);

      res.json({
        project: projectMetrics.rows[0],
        safety: safetyMetrics.rows[0],
        quality: qualityMetrics.rows[0],
        schedule: scheduleMetrics.rows[0],
        budget: {
          ...budgetMetrics.rows[0],
          total_spent: parseFloat(budgetMetrics.rows[0]?.labor_cost || 0) + 
                      parseFloat(budgetMetrics.rows[0]?.material_cost || 0),
          percentage_used: budgetMetrics.rows[0]?.total_budget > 0 ? 
            ((parseFloat(budgetMetrics.rows[0]?.labor_cost || 0) + 
              parseFloat(budgetMetrics.rows[0]?.material_cost || 0)) / 
              budgetMetrics.rows[0].total_budget * 100).toFixed(1) : 0
        }
      });
      
    } catch (error) {
      console.error('[reporting] Error fetching executive dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch executive dashboard' });
    }
  });

  return router;
}

// Helper functions for report generation
async function generateDailyReport(projectId: string, date: Date) {
  const [activities, safety, weather, crews] = await Promise.all([
    query(`
      SELECT * FROM daily_reports 
      WHERE project_id = $1 AND date = $2`,
      [projectId, date]
    ),
    query(`
      SELECT * FROM safety_incidents 
      WHERE project_id = $1 AND DATE(created_at) = $2`,
      [projectId, date]
    ),
    query(`
      SELECT * FROM weather_logs 
      WHERE project_id = $1 AND date = $2`,
      [projectId, date]
    ),
    query(`
      SELECT c.name, COUNT(DISTINCT te.user_id) as workers
      FROM time_entries te
      JOIN crew_members cm ON te.user_id = cm.user_id
      JOIN crews c ON cm.crew_id = c.id
      WHERE te.project_id = $1 AND te.date = $2
      GROUP BY c.name`,
      [projectId, date]
    )
  ]);
  
  return {
    date,
    activities: activities.rows,
    safety: safety.rows,
    weather: weather.rows[0] || {},
    crews: crews.rows
  };
}

async function generateWeeklySummary(projectId: string, dateFrom: Date, dateTo: Date) {
  // Implementation for weekly summary
  return { projectId, dateFrom, dateTo, summary: 'Weekly data' };
}

async function generateSafetySummary(projectId: string, dateFrom: Date, dateTo: Date) {
  // Implementation for safety summary  
  return { projectId, dateFrom, dateTo, incidents: [] };
}

async function generateProgressReport(projectId: string) {
  // Implementation for progress report
  return { projectId, progress: 'Project progress data' };
}

async function generateCrewProductivity(projectId: string, dateFrom: Date, dateTo: Date) {
  // Implementation for crew productivity
  return { projectId, dateFrom, dateTo, productivity: [] };
}

function generatePDFContent(data: any, templateId: string): string {
  // Simplified PDF generation - would use real PDF library like PDFKit
  const content = `
    <html>
      <head><title>${templateId} Report</title></head>
      <body>
        <h1>FieldForge Report</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
  
  return Buffer.from(content).toString('base64');
}
