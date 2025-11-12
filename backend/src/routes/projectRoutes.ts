import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../middleware/auth.js';
import { query } from '../database.js';
import { logAuditEvent } from '../middleware/auditLog.js';

export function createProjectRouter(): Router {
  const router = Router();

  // ============================================================================
  // PROJECT MANAGEMENT ENDPOINTS
  // ============================================================================

  // Get all projects for a user
  router.get('/list', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { status, type, role } = req.query;
      
      let queryText = `
        SELECT DISTINCT
          p.*,
          c.name as company_name,
          pt.role as user_role,
          COUNT(DISTINCT pt2.user_id) as team_count,
          COUNT(DISTINCT si.id) as active_incidents
        FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        INNER JOIN project_team pt ON p.id = pt.project_id AND pt.user_id = $1
        LEFT JOIN project_team pt2 ON p.id = pt2.project_id
        LEFT JOIN safety_incidents si ON p.id = si.project_id AND si.status = 'open'
        WHERE 1=1
      `;
      const params: any[] = [userId];
      let paramIndex = 2;

      if (status) {
        queryText += ` AND p.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (type) {
        queryText += ` AND p.project_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (role) {
        queryText += ` AND pt.role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      queryText += ' GROUP BY p.id, c.name, pt.role ORDER BY p.created_at DESC';

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[projects] Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get project details
  router.get('/:projectId', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has access to this project
      const accessCheck = await query(
        'SELECT role FROM project_team WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // Get project details with related data
      const projectQuery = `
        SELECT 
          p.*,
          c.name as company_name,
          json_build_object(
            'total_hours', COALESCE(SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600), 0),
            'active_crew', COUNT(DISTINCT ca.crew_member_id),
            'safety_score', 100 - (COUNT(DISTINCT si.id) * 5),
            'completion_percentage', p.completion_percentage
          ) as metrics
        FROM projects p
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN time_entries te ON p.id = te.project_id
        LEFT JOIN crew_assignments ca ON p.id = ca.project_id AND ca.status = 'active'
        LEFT JOIN safety_incidents si ON p.id = si.project_id AND si.incident_date > NOW() - INTERVAL '30 days'
        WHERE p.id = $1
        GROUP BY p.id, c.name
      `;

      const result = await query(projectQuery, [projectId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[projects] Error fetching project details:', error);
      res.status(500).json({ error: 'Failed to fetch project details' });
    }
  });

  // Create new project
  router.post('/create', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        name,
        project_number,
        description,
        project_type,
        company_id,
        start_date,
        end_date,
        budget,
        location,
        status = 'planning'
      } = req.body;

      if (!name || !project_number || !project_type) {
        return res.status(400).json({ 
          error: 'Name, project number, and project type are required' 
        });
      }

      // Start transaction
      const client = await query('BEGIN');
      
      try {
        // Create project
        const projectResult = await query(
          `INSERT INTO projects 
           (name, project_number, description, project_type, company_id,
            start_date, end_date, budget, location, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [name, project_number, description, project_type, company_id,
           start_date, end_date, budget, location, status, userId]
        );

        const project = projectResult.rows[0];

        // Add creator as project manager
        await query(
          `INSERT INTO project_team 
           (project_id, user_id, role, permissions, status)
           VALUES ($1, $2, 'project_manager', '["all"]', 'active')`,
          [project.id, userId]
        );

        await query('COMMIT');

        await logAuditEvent({
          action: 'project_created',
          user_id: userId,
          resource_type: 'project',
          resource_id: project.id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { name, project_number, project_type },
          success: true
        });

        res.status(201).json(project);
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[projects] Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update project
  router.put('/:projectId', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check permissions
      const permCheck = await query(
        `SELECT role FROM project_team 
         WHERE project_id = $1 AND user_id = $2 
         AND role IN ('project_manager', 'admin')`,
        [projectId, userId]
      );

      if (permCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = [
        'name', 'description', 'project_type', 'start_date', 'end_date',
        'budget', 'location', 'status', 'completion_percentage'
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(req.body[field]);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(projectId);
      const queryText = `
        UPDATE projects 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[projects] Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Get project team
  router.get('/:projectId/team', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { projectId } = req.params;

      // Verify access
      const accessCheck = await query(
        'SELECT 1 FROM project_team WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const teamQuery = `
        SELECT 
          pt.*,
          u.email,
          u.raw_user_meta_data->>'full_name' as name,
          u.raw_user_meta_data->>'avatar_url' as avatar_url
        FROM project_team pt
        JOIN auth.users u ON pt.user_id = u.id
        WHERE pt.project_id = $1
        ORDER BY pt.created_at
      `;

      const result = await query(teamQuery, [projectId]);
      res.json(result.rows);
    } catch (error) {
      console.error('[projects] Error fetching project team:', error);
      res.status(500).json({ error: 'Failed to fetch project team' });
    }
  });

  // Add team member
  router.post('/:projectId/team', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { projectId } = req.params;
      const { user_id, role, permissions } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check permissions
      const permCheck = await query(
        `SELECT role FROM project_team 
         WHERE project_id = $1 AND user_id = $2 
         AND role IN ('project_manager', 'admin')`,
        [projectId, userId]
      );

      if (permCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Add team member
      const result = await query(
        `INSERT INTO project_team 
         (project_id, user_id, role, permissions, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (project_id, user_id) 
         DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions
         RETURNING *`,
        [projectId, user_id, role, permissions || ['view']]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[projects] Error adding team member:', error);
      res.status(500).json({ error: 'Failed to add team member' });
    }
  });

  // Remove team member
  router.delete('/:projectId/team/:memberId', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { projectId, memberId } = req.params;

      // Check permissions
      const permCheck = await query(
        `SELECT role FROM project_team 
         WHERE project_id = $1 AND user_id = $2 
         AND role IN ('project_manager', 'admin')`,
        [projectId, userId]
      );

      if (permCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Can't remove the last project manager
      const managerCount = await query(
        `SELECT COUNT(*) FROM project_team 
         WHERE project_id = $1 AND role = 'project_manager'`,
        [projectId]
      );

      if (managerCount.rows[0].count <= 1) {
        const isManager = await query(
          `SELECT 1 FROM project_team 
           WHERE project_id = $1 AND user_id = $2 AND role = 'project_manager'`,
          [projectId, memberId]
        );

        if (isManager.rows.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot remove the last project manager' 
          });
        }
      }

      await query(
        'DELETE FROM project_team WHERE project_id = $1 AND user_id = $2',
        [projectId, memberId]
      );

      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      console.error('[projects] Error removing team member:', error);
      res.status(500).json({ error: 'Failed to remove team member' });
    }
  });

  // Get project milestones
  router.get('/:projectId/milestones', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      const result = await query(
        `SELECT * FROM project_milestones 
         WHERE project_id = $1 
         ORDER BY target_date`,
        [projectId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('[projects] Error fetching milestones:', error);
      res.status(500).json({ error: 'Failed to fetch milestones' });
    }
  });

  // Create project milestone
  router.post('/:projectId/milestones', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { projectId } = req.params;
      const { name, description, target_date, deliverables } = req.body;

      const result = await query(
        `INSERT INTO project_milestones 
         (project_id, name, description, target_date, deliverables, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, name, description, target_date, deliverables, userId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[projects] Error creating milestone:', error);
      res.status(500).json({ error: 'Failed to create milestone' });
    }
  });

  // Project analytics endpoint
  router.get('/:projectId/analytics', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { start_date, end_date } = req.query;

      // Complex analytics query
      const analyticsQuery = `
        WITH project_metrics AS (
          SELECT 
            COUNT(DISTINCT te.user_id) as active_workers,
            SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600) as total_hours,
            COUNT(DISTINCT DATE(te.start_time)) as days_worked,
            AVG(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600) as avg_daily_hours
          FROM time_entries te
          WHERE te.project_id = $1
            AND te.start_time >= COALESCE($2::date, NOW() - INTERVAL '30 days')
            AND te.start_time <= COALESCE($3::date, NOW())
        ),
        safety_metrics AS (
          SELECT 
            COUNT(*) FILTER (WHERE incident_type != 'near miss') as total_incidents,
            COUNT(*) FILTER (WHERE incident_type = 'near miss') as near_misses,
            COUNT(*) FILTER (WHERE severity IN ('high', 'critical')) as serious_incidents,
            MAX(incident_date) as last_incident_date
          FROM safety_incidents
          WHERE project_id = $1
            AND incident_date >= COALESCE($2::date, NOW() - INTERVAL '30 days')
        ),
        cost_metrics AS (
          SELECT 
            SUM(amount) as total_cost,
            SUM(amount) FILTER (WHERE category = 'labor') as labor_cost,
            SUM(amount) FILTER (WHERE category = 'material') as material_cost,
            SUM(amount) FILTER (WHERE category = 'equipment') as equipment_cost
          FROM project_costs
          WHERE project_id = $1
            AND date >= COALESCE($2::date, NOW() - INTERVAL '30 days')
        )
        SELECT 
          pm.*,
          sm.*,
          cm.*,
          p.budget,
          p.start_date,
          p.end_date,
          EXTRACT(DAY FROM AGE(NOW(), p.start_date)) as days_elapsed,
          EXTRACT(DAY FROM AGE(p.end_date, p.start_date)) as total_days
        FROM projects p
        CROSS JOIN project_metrics pm
        CROSS JOIN safety_metrics sm
        CROSS JOIN cost_metrics cm
        WHERE p.id = $1
      `;

      const result = await query(analyticsQuery, [projectId, start_date, end_date]);
      res.json(result.rows[0] || {});
    } catch (error) {
      console.error('[projects] Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch project analytics' });
    }
  });

  return router;
}
