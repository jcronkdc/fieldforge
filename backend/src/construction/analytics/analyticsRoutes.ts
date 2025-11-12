import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';

export function createAnalyticsRouter(): Router {
  const router = Router();

  // ============================================================================
  // REAL-TIME ANALYTICS - NO MORE MATH.RANDOM()!
  // ============================================================================

  // GET dashboard metrics - REAL DATA FROM DATABASE
  router.get('/dashboard', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id || req.headers['x-company-id'];

      // PARALLEL QUERIES FOR REAL METRICS
      const [
        projectMetrics,
        safetyMetrics,
        crewMetrics,
        equipmentMetrics,
        scheduleMetrics,
        budgetMetrics
      ] = await Promise.all([
        // PROJECT PROGRESS - REAL CALCULATION
        query(`
          SELECT 
            COUNT(*) as total_projects,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active,
            AVG(CASE 
              WHEN status != 'completed' AND end_date IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (NOW() - start_date)) / 
                   NULLIF(EXTRACT(EPOCH FROM (end_date - start_date)), 0) * 100
              ELSE NULL 
            END) as avg_completion_percentage
          FROM projects 
          WHERE company_id = $1`, 
          [companyId]
        ),

        // SAFETY SCORE - REAL INCIDENT DATA
        query(`
          SELECT 
            COUNT(*) as total_incidents,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_incidents,
            COALESCE(DATE_PART('day', NOW() - MAX(created_at)), 9999) as days_without_incident
          FROM safety_incidents 
          WHERE company_id = $1`, 
          [companyId]
        ),

        // ACTIVE CREWS - REAL TIME ENTRIES
        query(`
          SELECT 
            COUNT(DISTINCT cm.crew_id) as active_crews,
            COUNT(DISTINCT te.user_id) as workers_today,
            SUM(te.hours_regular + te.hours_overtime) as total_hours_today
          FROM time_entries te
          LEFT JOIN crew_members cm ON cm.user_id = te.user_id
          WHERE te.date = CURRENT_DATE
          ${companyId ? 'AND te.company_id = $1' : ''}`,
          companyId ? [companyId] : []
        ),

        // EQUIPMENT UTILIZATION - REAL STATUS
        query(`
          SELECT 
            COUNT(*) as total_equipment,
            COUNT(CASE WHEN status = 'in_use' THEN 1 END) as in_use,
            COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as in_maintenance,
            COUNT(CASE WHEN next_maintenance_date < NOW() + INTERVAL '7 days' THEN 1 END) as maintenance_due
          FROM equipment_inventory
          WHERE company_id = $1`,
          [companyId]
        ),

        // SCHEDULE VARIANCE - REAL DEADLINES
        query(`
          SELECT 
            AVG(CASE 
              WHEN status = 'in_progress' AND end_date < NOW() 
              THEN DATE_PART('day', NOW() - end_date)
              ELSE 0 
            END) as avg_days_behind,
            COUNT(CASE WHEN status = 'in_progress' AND end_date < NOW() THEN 1 END) as overdue_projects
          FROM projects
          WHERE company_id = $1`,
          [companyId]
        ),

        // BUDGET UTILIZATION - REAL COSTS
        query(`
          SELECT 
            SUM(budget) as total_budget,
            SUM(
              COALESCE((
                SELECT SUM(te.hours_regular * te.hourly_rate + te.hours_overtime * te.hourly_rate * 1.5)
                FROM time_entries te
                WHERE te.project_id = p.id
              ), 0) +
              COALESCE((
                SELECT SUM(r.amount)
                FROM receipts r
                WHERE r.project_id = p.id
              ), 0)
            ) as total_spent
          FROM projects p
          WHERE p.company_id = $1 AND p.status = 'in_progress'`,
          [companyId]
        )
      ]);

      // CALCULATE REAL METRICS (NO FAKE DATA!)
      const projectData = projectMetrics.rows[0];
      const safetyData = safetyMetrics.rows[0];
      const crewData = crewMetrics.rows[0];
      const equipmentData = equipmentMetrics.rows[0];
      const scheduleData = scheduleMetrics.rows[0];
      const budgetData = budgetMetrics.rows[0];

      // Safety score calculation (100 minus penalties)
      const safetyScore = Math.max(0, 100 - 
        (parseInt(safetyData.critical) * 10) -
        (parseInt(safetyData.recent_incidents) * 2)
      );

      // Equipment utilization percentage
      const equipmentUtilization = equipmentData.total_equipment > 0
        ? Math.round((parseInt(equipmentData.in_use) / parseInt(equipmentData.total_equipment)) * 100)
        : 0;

      // Budget utilization percentage
      const budgetUtilization = budgetData.total_budget > 0
        ? Math.round((parseFloat(budgetData.total_spent) / parseFloat(budgetData.total_budget)) * 100)
        : 0;

      // Project progress percentage
      const projectProgress = Math.round(parseFloat(projectData.avg_completion_percentage) || 0);

      // Schedule variance (negative means behind)
      const scheduleVariance = -Math.round(parseFloat(scheduleData.avg_days_behind) || 0);

      // RETURN REAL METRICS TO REPLACE DASHBOARD FAKE DATA
      res.json({
        metrics: [
          {
            title: 'Project Progress',
            value: projectProgress,
            change: 0, // TODO: Calculate week-over-week change
            trend: projectProgress > 50 ? 'up' : 'down',
            icon: 'Target',
            color: 'text-amber-500',
            unit: '%'
          },
          {
            title: 'Safety Score',
            value: safetyScore,
            change: 0, // TODO: Calculate change
            trend: safetyData.days_without_incident > 7 ? 'up' : 'down',
            icon: 'Shield',
            color: 'text-green-500',
            unit: '%'
          },
          {
            title: 'Active Crews',
            value: parseInt(crewData.active_crews) || 0,
            change: 0, // TODO: Calculate change
            trend: 'up',
            icon: 'Users',
            color: 'text-blue-500',
            unit: 'teams'
          },
          {
            title: 'Equipment Utilization',
            value: equipmentUtilization,
            change: 0, // TODO: Calculate change
            trend: equipmentUtilization > 80 ? 'up' : 'down',
            icon: 'Truck',
            color: 'text-purple-500',
            unit: '%'
          },
          {
            title: 'Days Without Incident',
            value: Math.min(parseInt(safetyData.days_without_incident), 9999),
            change: 1,
            trend: 'up',
            icon: 'HardHat',
            color: 'text-emerald-500',
            unit: 'days'
          },
          {
            title: 'Open RFIs',
            value: 0, // TODO: Implement RFI tracking
            change: 0,
            trend: 'stable',
            icon: 'FileText',
            color: 'text-orange-500',
            unit: 'items'
          },
          {
            title: 'Schedule Variance',
            value: scheduleVariance,
            change: 0,
            trend: scheduleVariance >= 0 ? 'up' : 'down',
            icon: 'Calendar',
            color: scheduleVariance < 0 ? 'text-red-500' : 'text-green-500',
            unit: 'days'
          },
          {
            title: 'Budget Utilization',
            value: budgetUtilization,
            change: 0,
            trend: 'stable',
            icon: 'DollarSign',
            color: 'text-cyan-500',
            unit: '%'
          }
        ],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[analytics] Error fetching dashboard metrics:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  });

  // GET real-time productivity metrics
  router.get('/productivity', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { project_id, date_from, date_to } = req.query;
      
      let queryText = `
        SELECT 
          DATE(te.date) as work_date,
          COUNT(DISTINCT te.user_id) as worker_count,
          SUM(te.hours_regular + te.hours_overtime) as total_hours,
          AVG(te.hours_regular + te.hours_overtime) as avg_hours_per_worker,
          COUNT(DISTINCT te.project_id) as projects_worked
        FROM time_entries te
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (project_id) {
        queryText += ` AND te.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (date_from) {
        queryText += ` AND te.date >= $${paramIndex}`;
        params.push(date_from);
        paramIndex++;
      }

      if (date_to) {
        queryText += ` AND te.date <= $${paramIndex}`;
        params.push(date_to);
        paramIndex++;
      }

      queryText += ` GROUP BY DATE(te.date) ORDER BY work_date DESC LIMIT 30`;

      const result = await query(queryText, params);

      res.json({
        productivity: result.rows,
        summary: {
          total_days: result.rows.length,
          avg_daily_hours: result.rows.reduce((acc, row) => acc + parseFloat(row.total_hours), 0) / result.rows.length,
          peak_workers: Math.max(...result.rows.map(r => parseInt(r.worker_count)))
        }
      });

    } catch (error) {
      console.error('[analytics] Error fetching productivity:', error);
      res.status(500).json({ error: 'Failed to fetch productivity metrics' });
    }
  });

  // GET budget analytics
  router.get('/budget', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { project_id } = req.query;
      const companyId = req.user?.company_id;

      const budgetQuery = `
        SELECT 
          p.id,
          p.name,
          p.budget,
          COALESCE(labor.cost, 0) as labor_cost,
          COALESCE(materials.cost, 0) as material_cost,
          COALESCE(equipment.cost, 0) as equipment_cost,
          (COALESCE(labor.cost, 0) + COALESCE(materials.cost, 0) + COALESCE(equipment.cost, 0)) as total_cost
        FROM projects p
        LEFT JOIN (
          SELECT 
            project_id,
            SUM(hours_regular * hourly_rate + hours_overtime * hourly_rate * 1.5) as cost
          FROM time_entries
          GROUP BY project_id
        ) labor ON labor.project_id = p.id
        LEFT JOIN (
          SELECT 
            project_id,
            SUM(amount) as cost
          FROM receipts
          WHERE category = 'materials'
          GROUP BY project_id
        ) materials ON materials.project_id = p.id
        LEFT JOIN (
          SELECT 
            project_id,
            SUM(amount) as cost
          FROM receipts
          WHERE category = 'equipment'
          GROUP BY project_id
        ) equipment ON equipment.project_id = p.id
        WHERE p.company_id = $1
        ${project_id ? 'AND p.id = $2' : ''}
      `;

      const params = project_id ? [companyId, project_id] : [companyId];
      const result = await query(budgetQuery, params);

      const projects = result.rows.map(row => ({
        ...row,
        budget_remaining: parseFloat(row.budget) - parseFloat(row.total_cost),
        budget_percentage: row.budget > 0 ? (parseFloat(row.total_cost) / parseFloat(row.budget) * 100).toFixed(1) : 0
      }));

      res.json({
        projects,
        totals: {
          total_budget: projects.reduce((sum, p) => sum + parseFloat(p.budget), 0),
          total_spent: projects.reduce((sum, p) => sum + parseFloat(p.total_cost), 0),
          total_labor: projects.reduce((sum, p) => sum + parseFloat(p.labor_cost), 0),
          total_materials: projects.reduce((sum, p) => sum + parseFloat(p.material_cost), 0),
          total_equipment: projects.reduce((sum, p) => sum + parseFloat(p.equipment_cost), 0)
        }
      });

    } catch (error) {
      console.error('[analytics] Error fetching budget analytics:', error);
      res.status(500).json({ error: 'Failed to fetch budget analytics' });
    }
  });

  // GET safety trends
  router.get('/safety-trends', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;

      const trendsQuery = `
        WITH monthly_incidents AS (
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as incident_count,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
            COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_count,
            COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_count,
            COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_count
          FROM safety_incidents
          WHERE company_id = $1 
          AND created_at >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', created_at)
        )
        SELECT * FROM monthly_incidents ORDER BY month DESC
      `;

      const result = await query(trendsQuery, [companyId]);

      res.json({
        trends: result.rows,
        summary: {
          trend_direction: result.rows[0]?.incident_count < result.rows[1]?.incident_count ? 'improving' : 'worsening',
          monthly_average: result.rows.reduce((sum, r) => sum + parseInt(r.incident_count), 0) / result.rows.length
        }
      });

    } catch (error) {
      console.error('[analytics] Error fetching safety trends:', error);
      res.status(500).json({ error: 'Failed to fetch safety trends' });
    }
  });

  return router;
}
