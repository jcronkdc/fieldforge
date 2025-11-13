import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

export function createSafetyRouter(): Router {
  const router = Router();

  // ============================================================================
  // SAFETY MANAGEMENT ENDPOINTS - COMPLETE E2E PATHWAYS
  // ============================================================================

  // CREATE safety incident
  router.post('/incidents', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        type, 
        severity, 
        location_description, 
        description, 
        project_id,
        immediate_actions,
        witnesses
      } = req.body;

      // Validate required fields
      if (!type || !severity || !location_description || !description) {
        return res.status(400).json({ 
          error: 'Missing required fields: type, severity, location_description, description' 
        });
      }

      // SAVE to database with transaction
      await query('BEGIN');

      try {
        const incidentResult = await query(
          `INSERT INTO safety_incidents 
           (type, severity, location_description, description, project_id, 
            immediate_actions, witnesses, reported_by, company_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
           RETURNING *`,
          [type, severity, location_description, description, project_id, 
           immediate_actions, witnesses || [], userId, companyId]
        );

        const incident = incidentResult.rows[0];

        // Log audit event
        await logAuditEvent({
          action: 'safety_incident_created',
          user_id: userId,
          resource_type: 'safety_incident',
          resource_id: incident.id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { type, severity, project_id },
          success: true
        });

        await query('COMMIT');

        // RETURN real data
        res.status(201).json(incident);
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[safety] Error creating incident:', error);
      res.status(500).json({ error: 'Failed to create safety incident' });
    }
  });

  // RETRIEVE safety incidents
  router.get('/incidents', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id || req.headers['x-company-id'];
      const { project_id, status, severity, limit = 50, offset = 0 } = req.query;

      let queryText = `
        SELECT 
          si.*,
          p.name as project_name,
          u.raw_user_meta_data->>'full_name' as reporter_name,
          u.email as reporter_email
        FROM safety_incidents si
        LEFT JOIN projects p ON si.project_id = p.id
        LEFT JOIN auth.users u ON si.reported_by = u.id
        WHERE si.company_id = $1
      `;
      const params: any[] = [companyId];
      let paramIndex = 2;

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

      queryText += ` ORDER BY si.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      
      res.json({
        incidents: result.rows,
        total: result.rowCount || 0
      });
    } catch (error) {
      console.error('[safety] Error fetching incidents:', error);
      res.status(500).json({ error: 'Failed to fetch safety incidents' });
    }
  });

  // CREATE safety briefing
  router.post('/briefings', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        project_id,
        topics,
        hazards_identified,
        safety_reminders,
        attendees,
        date
      } = req.body;

      // Validate required fields
      if (!project_id || !topics || !attendees || attendees.length === 0) {
        return res.status(400).json({ 
          error: 'Missing required fields: project_id, topics, attendees' 
        });
      }

      await query('BEGIN');

      try {
        // Create briefing
        const briefingResult = await query(
          `INSERT INTO safety_briefings
           (project_id, conducted_by, topics, hazards_identified, 
            safety_reminders, date, company_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [project_id, userId, topics, hazards_identified, 
           safety_reminders, date || new Date(), companyId]
        );

        const briefing = briefingResult.rows[0];

        // Record attendee signatures
        for (const attendee of attendees) {
          await query(
            `INSERT INTO safety_briefing_attendees
             (briefing_id, user_id, signature_data, signed_at)
             VALUES ($1, $2, $3, NOW())`,
            [briefing.id, attendee.user_id, attendee.signature]
          );
        }

        await query('COMMIT');

        res.status(201).json(briefing);
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[safety] Error creating briefing:', error);
      res.status(500).json({ error: 'Failed to create safety briefing' });
    }
  });

  // GET safety metrics for dashboard
  router.get('/metrics', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id || req.headers['x-company-id'];

      const [incidents, briefings, permits] = await Promise.all([
        // Days without incident & incident counts
        query(`
          SELECT 
            COUNT(*) as total_incidents,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_incidents,
            COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_incidents,
            COUNT(CASE WHEN status = 'open' THEN 1 END) as open_investigations,
            COALESCE(DATE_PART('day', NOW() - MAX(created_at)), 0) as days_without_incident
          FROM safety_incidents 
          WHERE company_id = $1`, 
          [companyId]
        ),

        // Recent briefings count
        query(`
          SELECT COUNT(*) as briefings_this_week
          FROM safety_briefings
          WHERE company_id = $1 
          AND date >= NOW() - INTERVAL '7 days'`,
          [companyId]
        ),

        // Active permits
        query(`
          SELECT COUNT(*) as active_permits
          FROM work_permits
          WHERE company_id = $1
          AND status = 'active'
          AND valid_until > NOW()`,
          [companyId]
        )
      ]);

      // Calculate safety score (100 - (incidents * impact factor))
      const incidentData = incidents.rows[0];
      const safetyScore = Math.max(0, 100 - 
        (incidentData.critical_incidents * 10) - 
        (incidentData.high_incidents * 5) -
        (incidentData.open_investigations * 2)
      );

      res.json({
        daysWithoutIncident: parseInt(incidentData.days_without_incident) || 0,
        totalIncidents: parseInt(incidentData.total_incidents) || 0,
        openInvestigations: parseInt(incidentData.open_investigations) || 0,
        safetyScore: Math.round(safetyScore),
        weeklyBriefings: parseInt(briefings.rows[0].briefings_this_week) || 0,
        activePermits: parseInt(permits.rows[0].active_permits) || 0
      });
    } catch (error) {
      console.error('[safety] Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch safety metrics' });
    }
  });

  // CREATE work permit
  router.post('/permits', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];

      const {
        type,
        project_id,
        work_description,
        hazards,
        controls,
        valid_until,
        authorized_workers
      } = req.body;

      const permitResult = await query(
        `INSERT INTO work_permits
         (type, project_id, work_description, hazards, controls,
          valid_until, created_by, authorized_workers, company_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
         RETURNING *`,
        [type, project_id, work_description, hazards, controls,
         valid_until, userId, authorized_workers, companyId]
      );

      res.status(201).json(permitResult.rows[0]);
    } catch (error) {
      console.error('[safety] Error creating permit:', error);
      res.status(500).json({ error: 'Failed to create work permit' });
    }
  });

  // UPDATE incident status
  router.put('/incidents/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, investigation_notes, corrective_actions } = req.body;

      const result = await query(
        `UPDATE safety_incidents
         SET status = $1, 
             investigation_notes = $2, 
             corrective_actions = $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, investigation_notes, corrective_actions, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Incident not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[safety] Error updating incident:', error);
      res.status(500).json({ error: 'Failed to update incident' });
    }
  });

  // ============================================================================
  // WORK PERMIT MANAGEMENT ENDPOINTS
  // ============================================================================

  // GET work permits with filters
  router.get('/permits', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id || req.headers['x-company-id'];
      const { status, project_id, type } = req.query;

      let queryText = `
        SELECT 
          wp.*,
          p.name as project_name,
          cu.raw_user_meta_data->>'full_name' as creator_name,
          au.raw_user_meta_data->>'full_name' as approver_name
        FROM work_permits wp
        LEFT JOIN projects p ON wp.project_id = p.id
        LEFT JOIN auth.users cu ON wp.created_by = cu.id
        LEFT JOIN auth.users au ON wp.approved_by = au.id
        WHERE wp.company_id = $1
      `;
      
      const params: any[] = [companyId];
      let paramIndex = 2;

      if (status && status !== 'all') {
        queryText += ` AND wp.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (project_id) {
        queryText += ` AND wp.project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (type) {
        queryText += ` AND wp.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      queryText += ` ORDER BY wp.created_at DESC`;

      const result = await query(queryText, params);
      res.json({ permits: result.rows });
    } catch (error) {
      console.error('[safety] Error fetching permits:', error);
      res.status(500).json({ error: 'Failed to fetch work permits' });
    }
  });

  // CREATE work permit
  router.post('/permits', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.company_id || req.headers['x-company-id'];

      const {
        type,
        project_id,
        work_description,
        hazards,
        controls,
        valid_start,
        valid_until,
        authorized_workers,
        special_requirements
      } = req.body;

      // Validate required fields
      if (!type || !work_description || !hazards || !controls || !valid_until) {
        return res.status(400).json({ 
          error: 'Missing required fields: type, work_description, hazards, controls, valid_until' 
        });
      }

      const permitResult = await query(
        `INSERT INTO work_permits
         (type, project_id, work_description, hazards, controls,
          valid_start, valid_until, created_by, authorized_workers, 
          company_id, status, special_requirements)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11)
         RETURNING *`,
        [type, project_id, work_description, hazards, controls,
         valid_start || new Date(), valid_until, userId, 
         authorized_workers || [], companyId, special_requirements]
      );

      await logAuditEvent({
        action: 'work_permit_created',
        user_id: userId!,
        resource_type: 'work_permit',
        resource_id: permitResult.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { type, project_id },
        success: true
      });

      res.status(201).json(permitResult.rows[0]);
    } catch (error) {
      console.error('[safety] Error creating permit:', error);
      res.status(500).json({ error: 'Failed to create work permit' });
    }
  });

  // APPROVE work permit
  router.put('/permits/:id/approve', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const result = await query(
        `UPDATE work_permits
         SET status = 'active',
             approved_by = $1,
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [userId, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Permit not found or already approved' });
      }

      await logAuditEvent({
        action: 'work_permit_approved',
        user_id: userId!,
        resource_type: 'work_permit',
        resource_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        success: true
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[safety] Error approving permit:', error);
      res.status(500).json({ error: 'Failed to approve work permit' });
    }
  });

  // CANCEL work permit
  router.put('/permits/:id/cancel', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { reason } = req.body;

      const result = await query(
        `UPDATE work_permits
         SET status = 'cancelled',
             cancellation_reason = $1,
             cancelled_by = $2,
             cancelled_at = NOW(),
             updated_at = NOW()
         WHERE id = $3 AND status IN ('pending', 'active')
         RETURNING *`,
        [reason || 'Cancelled by user', userId, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Permit not found or already cancelled' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[safety] Error cancelling permit:', error);
      res.status(500).json({ error: 'Failed to cancel work permit' });
    }
  });

  return router;
}



