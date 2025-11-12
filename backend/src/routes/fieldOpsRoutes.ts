import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../middleware/auth.js';
import { query } from '../database.js';
import { logAuditEvent } from '../middleware/auditLog.js';

export function createFieldOpsRouter(): Router {
  const router = Router();

  // ============================================================================
  // TIME TRACKING ENDPOINTS
  // ============================================================================

  // Get time entries for a user
  router.get('/time/entries', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { start_date, end_date, project_id } = req.query;
      
      let queryText = `
        SELECT 
          te.*,
          p.name as project_name,
          p.project_number,
          u.email as user_email,
          u.raw_user_meta_data->>'full_name' as user_name
        FROM time_entries te
        LEFT JOIN projects p ON te.project_id = p.id
        LEFT JOIN auth.users u ON te.user_id = u.id
        WHERE te.user_id = $1
      `;
      const params: any[] = [userId];
      let paramIndex = 2;

      if (start_date) {
        queryText += ` AND te.start_time >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        queryText += ` AND te.start_time <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      if (project_id) {
        queryText += ` AND te.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      queryText += ' ORDER BY te.start_time DESC';

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[fieldOps] Error fetching time entries:', error);
      res.status(500).json({ error: 'Failed to fetch time entries' });
    }
  });

  // Start a new time entry
  router.post('/time/start', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { project_id, task_description, location, weather_conditions } = req.body;

      if (!project_id || !task_description) {
        return res.status(400).json({ error: 'Project ID and task description are required' });
      }

      // Check if user has an active timer
      const activeCheck = await query(
        'SELECT id FROM time_entries WHERE user_id = $1 AND end_time IS NULL',
        [userId]
      );

      if (activeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'You already have an active timer running' });
      }

      // Create new time entry
      const result = await query(
        `INSERT INTO time_entries 
         (user_id, project_id, task_description, start_time, location, weather_conditions, break_duration)
         VALUES ($1, $2, $3, NOW(), $4, $5, 0)
         RETURNING *`,
        [userId, project_id, task_description, location ? JSON.stringify(location) : null, weather_conditions ? JSON.stringify(weather_conditions) : null]
      );

      await logAuditEvent({
        action: 'time_entry_started',
        user_id: userId,
        resource_type: 'time_entry',
        resource_id: result.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        success: true
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error starting time entry:', error);
      res.status(500).json({ error: 'Failed to start time entry' });
    }
  });

  // Stop a time entry
  router.post('/time/stop/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const entryId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify ownership and stop the timer
      const result = await query(
        `UPDATE time_entries 
         SET end_time = NOW()
         WHERE id = $1 AND user_id = $2 AND end_time IS NULL
         RETURNING *`,
        [entryId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Time entry not found or already stopped' });
      }

      await logAuditEvent({
        action: 'time_entry_stopped',
        user_id: userId,
        resource_type: 'time_entry',
        resource_id: entryId,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        success: true
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error stopping time entry:', error);
      res.status(500).json({ error: 'Failed to stop time entry' });
    }
  });

  // Update break time for an entry
  router.patch('/time/break/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const entryId = req.params.id;
      const { break_duration } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (typeof break_duration !== 'number' || break_duration < 0) {
        return res.status(400).json({ error: 'Invalid break duration' });
      }

      const result = await query(
        `UPDATE time_entries 
         SET break_duration = $1
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [break_duration, entryId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error updating break time:', error);
      res.status(500).json({ error: 'Failed to update break time' });
    }
  });

  // ============================================================================
  // DAILY OPERATIONS ENDPOINTS
  // ============================================================================

  // Create daily report
  router.post('/daily-report', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        project_id, 
        date, 
        weather,
        crew_count,
        work_performed,
        materials_used,
        equipment_used,
        safety_issues,
        delays,
        photos
      } = req.body;

      const result = await query(
        `INSERT INTO daily_reports 
         (project_id, report_date, submitted_by, weather, crew_count, 
          work_performed, materials_used, equipment_used, safety_issues, 
          delays, photos, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft')
         RETURNING *`,
        [project_id, date, userId, weather, crew_count, work_performed, 
         materials_used, equipment_used, safety_issues, delays, photos]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error creating daily report:', error);
      res.status(500).json({ error: 'Failed to create daily report' });
    }
  });

  // ============================================================================
  // CREW MANAGEMENT ENDPOINTS
  // ============================================================================

  // Get crew members
  router.get('/crew/members', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { project_id } = req.query;
      
      let queryText = `
        SELECT 
          cm.*,
          u.email,
          u.raw_user_meta_data->>'full_name' as name,
          ca.project_id,
          ca.role as project_role,
          ca.status as assignment_status
        FROM crew_members cm
        LEFT JOIN auth.users u ON cm.user_id = u.id
        LEFT JOIN crew_assignments ca ON cm.id = ca.crew_member_id
      `;
      const params: any[] = [];

      if (project_id) {
        queryText += ' WHERE ca.project_id = $1';
        params.push(project_id);
      }

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[fieldOps] Error fetching crew members:', error);
      res.status(500).json({ error: 'Failed to fetch crew members' });
    }
  });

  // Assign crew to project
  router.post('/crew/assign', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { crew_member_id, project_id, role, start_date } = req.body;

      const result = await query(
        `INSERT INTO crew_assignments 
         (crew_member_id, project_id, role, start_date, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING *`,
        [crew_member_id, project_id, role, start_date || new Date()]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error assigning crew:', error);
      res.status(500).json({ error: 'Failed to assign crew member' });
    }
  });

  // ============================================================================
  // WEATHER TRACKING ENDPOINTS
  // ============================================================================

  // Log weather conditions
  router.post('/weather/log', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { project_id, temperature, conditions, wind_speed, precipitation, visibility } = req.body;

      const result = await query(
        `INSERT INTO weather_logs 
         (project_id, recorded_by, temperature, conditions, wind_speed, precipitation, visibility)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [project_id, userId, temperature, conditions, wind_speed, precipitation, visibility]
      );

      // Check for weather delays
      if (wind_speed > 25 || visibility < 0.5 || ['heavy rain', 'snow', 'thunderstorm'].includes(conditions?.toLowerCase())) {
        await query(
          `INSERT INTO weather_delays 
           (project_id, weather_log_id, delay_reason, reported_by)
           VALUES ($1, $2, $3, $4)`,
          [project_id, result.rows[0].id, `Severe weather: ${conditions}`, userId]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error logging weather:', error);
      res.status(500).json({ error: 'Failed to log weather conditions' });
    }
  });

  // ============================================================================
  // SAFETY MANAGEMENT ENDPOINTS
  // ============================================================================

  // Get safety incidents
  router.get('/safety/incidents', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { project_id, status, severity, start_date, end_date } = req.query;
      
      let queryText = `
        SELECT 
          si.*,
          p.name as project_name,
          u.email as reporter_email,
          u.raw_user_meta_data->>'full_name' as reporter_name
        FROM safety_incidents si
        LEFT JOIN projects p ON si.project_id = p.id
        LEFT JOIN auth.users u ON si.reported_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (project_id) {
        queryText += ` AND si.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND si.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (severity) {
        queryText += ` AND si.severity = $${paramIndex}`;
        params.push(severity);
        paramIndex++;
      }

      if (start_date) {
        queryText += ` AND si.incident_date >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        queryText += ` AND si.incident_date <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      queryText += ' ORDER BY si.incident_date DESC, si.created_at DESC';

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[fieldOps] Error fetching safety incidents:', error);
      res.status(500).json({ error: 'Failed to fetch safety incidents' });
    }
  });

  // Report safety incident
  router.post('/safety/incident', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        project_id,
        incident_date,
        incident_time,
        incident_type,
        severity,
        description,
        location,
        location_description,
        witnesses,
        injuries,
        property_damage,
        immediate_actions,
        photos
      } = req.body;

      const result = await query(
        `INSERT INTO safety_incidents 
         (project_id, reported_by, incident_date, incident_time, incident_type,
          severity, description, location, location_description, witnesses,
          injuries, property_damage, immediate_actions, photos, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'open')
         RETURNING *`,
        [project_id, userId, incident_date, incident_time, incident_type,
         severity, description, location, location_description, witnesses,
         injuries, property_damage, immediate_actions, photos]
      );

      // Log critical incidents
      if (severity === 'critical' || severity === 'high') {
        await logAuditEvent({
          action: 'critical_safety_incident',
          user_id: userId,
          resource_type: 'safety_incident',
          resource_id: result.rows[0].id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { severity, incident_type },
          success: true
        });

        // In production, this would trigger notifications
        console.log(`CRITICAL SAFETY INCIDENT: ${incident_type} - ${severity}`);
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error reporting safety incident:', error);
      res.status(500).json({ error: 'Failed to report safety incident' });
    }
  });

  // Get work permits
  router.get('/safety/permits', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { project_id, status, permit_type } = req.query;
      
      let queryText = `
        SELECT 
          wp.*,
          p.name as project_name,
          req.email as requester_email,
          req.raw_user_meta_data->>'full_name' as requester_name,
          app.email as approver_email,
          app.raw_user_meta_data->>'full_name' as approver_name
        FROM work_permits wp
        LEFT JOIN projects p ON wp.project_id = p.id
        LEFT JOIN auth.users req ON wp.requested_by = req.id
        LEFT JOIN auth.users app ON wp.approved_by = app.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (project_id) {
        queryText += ` AND wp.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND wp.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (permit_type) {
        queryText += ` AND wp.permit_type = $${paramIndex}`;
        params.push(permit_type);
        paramIndex++;
      }

      queryText += ' ORDER BY wp.created_at DESC';

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[fieldOps] Error fetching work permits:', error);
      res.status(500).json({ error: 'Failed to fetch work permits' });
    }
  });

  // Request work permit
  router.post('/safety/permit', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        project_id,
        permit_type,
        description,
        location,
        valid_from,
        valid_to,
        hazards,
        precautions,
        required_ppe
      } = req.body;

      // Generate permit number
      const permitNumber = `${permit_type.toUpperCase()}-${Date.now()}`;

      const result = await query(
        `INSERT INTO work_permits 
         (project_id, permit_type, permit_number, description, location,
          requested_by, valid_from, valid_to, hazards, precautions, 
          required_ppe, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
         RETURNING *`,
        [project_id, permit_type, permitNumber, description, location,
         userId, valid_from, valid_to, hazards, precautions, required_ppe]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[fieldOps] Error requesting work permit:', error);
      res.status(500).json({ error: 'Failed to request work permit' });
    }
  });

  // Get safety trainings
  router.get('/safety/trainings', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const queryText = `
        SELECT 
          st.*,
          stc.completed_at,
          stc.expires_at,
          stc.score,
          CASE 
            WHEN stc.id IS NOT NULL THEN true 
            ELSE false 
          END as completed
        FROM safety_trainings st
        LEFT JOIN safety_training_completions stc 
          ON st.id = stc.training_id AND stc.user_id = $1
        ORDER BY st.created_at DESC
      `;

      const result = await query(queryText, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('[fieldOps] Error fetching safety trainings:', error);
      res.status(500).json({ error: 'Failed to fetch safety trainings' });
    }
  });

  return router;
}
