import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../middleware/auth.js';
import { query } from '../database.js';
import { logAuditEvent } from '../middleware/auditLog.js';

export function createEquipmentRouter(): Router {
  const router = Router();

  // ============================================================================
  // EQUIPMENT MANAGEMENT ENDPOINTS
  // ============================================================================

  // Get all equipment with filters
  router.get('/inventory', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { status, type, project_id, condition, search } = req.query;
      
      let queryText = `
        SELECT 
          e.*,
          p.name as project_name,
          u.email as assigned_user_email,
          u.raw_user_meta_data->>'full_name' as assigned_user_name,
          CASE 
            WHEN e.next_maintenance_date < NOW() THEN 'overdue'
            WHEN e.next_maintenance_date < NOW() + INTERVAL '7 days' THEN 'due_soon'
            ELSE 'ok'
          END as maintenance_status
        FROM equipment_inventory e
        LEFT JOIN projects p ON e.current_project_id = p.id
        LEFT JOIN auth.users u ON e.assigned_to = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        queryText += ` AND e.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (type) {
        queryText += ` AND e.equipment_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (project_id) {
        queryText += ` AND e.current_project_id = $${paramIndex}`;
        params.push(project_id);
        paramIndex++;
      }

      if (condition) {
        queryText += ` AND e.condition = $${paramIndex}`;
        params.push(condition);
        paramIndex++;
      }

      if (search) {
        queryText += ` AND (
          e.equipment_type ILIKE $${paramIndex} OR 
          e.serial_number ILIKE $${paramIndex} OR 
          e.asset_tag ILIKE $${paramIndex} OR
          e.manufacturer ILIKE $${paramIndex} OR
          e.model ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY e.created_at DESC';

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      console.error('[equipment] Error fetching inventory:', error);
      res.status(500).json({ error: 'Failed to fetch equipment inventory' });
    }
  });

  // Get single equipment details
  router.get('/inventory/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        `SELECT 
          e.*,
          p.name as project_name,
          u.email as assigned_user_email,
          u.raw_user_meta_data->>'full_name' as assigned_user_name,
          json_agg(
            json_build_object(
              'id', ul.id,
              'checked_out_at', ul.checked_out_at,
              'checked_in_at', ul.checked_in_at,
              'hours_used', ul.hours_used,
              'user_name', cu.raw_user_meta_data->>'full_name',
              'project_name', up.name
            ) ORDER BY ul.checked_out_at DESC
          ) FILTER (WHERE ul.id IS NOT NULL) as usage_history
        FROM equipment_inventory e
        LEFT JOIN projects p ON e.current_project_id = p.id
        LEFT JOIN auth.users u ON e.assigned_to = u.id
        LEFT JOIN equipment_usage_logs ul ON e.id = ul.equipment_id
        LEFT JOIN auth.users cu ON ul.checked_out_by = cu.id
        LEFT JOIN projects up ON ul.project_id = up.id
        WHERE e.id = $1
        GROUP BY e.id, p.name, u.email, u.raw_user_meta_data`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[equipment] Error fetching equipment details:', error);
      res.status(500).json({ error: 'Failed to fetch equipment details' });
    }
  });

  // Add new equipment
  router.post('/inventory', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        equipment_type,
        manufacturer,
        model,
        serial_number,
        asset_tag,
        purchase_date,
        purchase_price,
        condition = 'new',
        maintenance_interval_days,
        location_description,
        notes
      } = req.body;

      if (!equipment_type) {
        return res.status(400).json({ error: 'Equipment type is required' });
      }

      // Check for duplicate serial number or asset tag
      if (serial_number || asset_tag) {
        const dupCheck = await query(
          `SELECT id FROM equipment_inventory 
           WHERE serial_number = $1 OR asset_tag = $2`,
          [serial_number, asset_tag]
        );
        
        if (dupCheck.rows.length > 0) {
          return res.status(400).json({ 
            error: 'Equipment with this serial number or asset tag already exists' 
          });
        }
      }

      const result = await query(
        `INSERT INTO equipment_inventory 
         (equipment_type, manufacturer, model, serial_number, asset_tag,
          purchase_date, purchase_price, condition, maintenance_interval_days,
          location_description, notes, status, usage_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'available', 0)
         RETURNING *`,
        [equipment_type, manufacturer, model, serial_number, asset_tag,
         purchase_date, purchase_price, condition, maintenance_interval_days,
         location_description, notes]
      );

      await logAuditEvent({
        action: 'equipment_added',
        user_id: userId,
        resource_type: 'equipment',
        resource_id: result.rows[0].id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] as string,
        metadata: { equipment_type, serial_number, asset_tag },
        success: true
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[equipment] Error adding equipment:', error);
      res.status(500).json({ error: 'Failed to add equipment' });
    }
  });

  // Update equipment
  router.put('/inventory/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = [
        'equipment_type', 'manufacturer', 'model', 'condition',
        'location_description', 'notes', 'maintenance_interval_days',
        'next_maintenance_date'
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

      values.push(id);
      const queryText = `
        UPDATE equipment_inventory 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[equipment] Error updating equipment:', error);
      res.status(500).json({ error: 'Failed to update equipment' });
    }
  });

  // Check out equipment
  router.post('/checkout/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { project_id, expected_return_date, notes } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if equipment is available
      const availability = await query(
        'SELECT status, assigned_to FROM equipment_inventory WHERE id = $1',
        [id]
      );

      if (availability.rows.length === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      if (availability.rows[0].status !== 'available') {
        return res.status(400).json({ error: 'Equipment is not available for checkout' });
      }

      // Start transaction
      const client = await query('BEGIN');
      
      try {
        // Update equipment status
        await query(
          `UPDATE equipment_inventory 
           SET status = 'in use', 
               assigned_to = $1, 
               current_project_id = $2
           WHERE id = $3`,
          [userId, project_id, id]
        );

        // Create usage log
        const logResult = await query(
          `INSERT INTO equipment_usage_logs 
           (equipment_id, project_id, checked_out_by, checked_out_at, 
            expected_return_date, notes, condition_out)
           VALUES ($1, $2, $3, NOW(), $4, $5, 
            (SELECT condition FROM equipment_inventory WHERE id = $1))
           RETURNING *`,
          [id, project_id, userId, expected_return_date, notes]
        );

        await query('COMMIT');

        await logAuditEvent({
          action: 'equipment_checked_out',
          user_id: userId,
          resource_type: 'equipment',
          resource_id: id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { project_id, usage_log_id: logResult.rows[0].id },
          success: true
        });

        res.json({ 
          message: 'Equipment checked out successfully',
          usage_log: logResult.rows[0]
        });
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[equipment] Error checking out equipment:', error);
      res.status(500).json({ error: 'Failed to check out equipment' });
    }
  });

  // Check in equipment
  router.post('/checkin/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { hours_used, condition_in, notes, maintenance_needed } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify user has the equipment checked out
      const usageCheck = await query(
        `SELECT id, checked_out_at FROM equipment_usage_logs 
         WHERE equipment_id = $1 AND checked_out_by = $2 AND checked_in_at IS NULL
         ORDER BY checked_out_at DESC LIMIT 1`,
        [id, userId]
      );

      if (usageCheck.rows.length === 0) {
        return res.status(400).json({ error: 'No active checkout found for this equipment' });
      }

      const usageLogId = usageCheck.rows[0].id;
      const checkoutTime = new Date(usageCheck.rows[0].checked_out_at);
      const actualHours = hours_used || 
        (new Date().getTime() - checkoutTime.getTime()) / (1000 * 60 * 60);

      // Start transaction
      const client = await query('BEGIN');
      
      try {
        // Update usage log
        await query(
          `UPDATE equipment_usage_logs 
           SET checked_in_at = NOW(), 
               hours_used = $1, 
               condition_in = $2, 
               notes = COALESCE(notes || ' | Check-in: ' || $3, $3)
           WHERE id = $4`,
          [actualHours, condition_in, notes, usageLogId]
        );

        // Update equipment
        const status = maintenance_needed ? 'maintenance' : 'available';
        await query(
          `UPDATE equipment_inventory 
           SET status = $1, 
               assigned_to = NULL, 
               current_project_id = NULL,
               condition = $2,
               usage_hours = usage_hours + $3
           WHERE id = $4`,
          [status, condition_in || 'good', actualHours, id]
        );

        // Create maintenance request if needed
        if (maintenance_needed) {
          await query(
            `INSERT INTO maintenance_requests 
             (equipment_id, requested_by, reason, priority, status)
             VALUES ($1, $2, $3, $4, 'pending')`,
            [id, userId, notes || 'Maintenance requested at check-in', 'medium']
          );
        }

        await query('COMMIT');

        res.json({ 
          message: 'Equipment checked in successfully',
          hours_used: actualHours,
          status
        });
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[equipment] Error checking in equipment:', error);
      res.status(500).json({ error: 'Failed to check in equipment' });
    }
  });

  // Get equipment by QR/barcode
  router.get('/scan/:code', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      const result = await query(
        `SELECT * FROM equipment_inventory 
         WHERE serial_number = $1 OR asset_tag = $1`,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[equipment] Error scanning equipment:', error);
      res.status(500).json({ error: 'Failed to scan equipment' });
    }
  });

  // Schedule maintenance
  router.post('/maintenance/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { scheduled_date, description, estimated_hours, assigned_to } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await query(
        `INSERT INTO maintenance_requests 
         (equipment_id, requested_by, scheduled_date, description, 
          estimated_hours, assigned_to, status, priority)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', 'medium')
         RETURNING *`,
        [id, userId, scheduled_date, description, estimated_hours, assigned_to]
      );

      // Update equipment status if maintenance is today
      const scheduledDate = new Date(scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (scheduledDate <= today) {
        await query(
          `UPDATE equipment_inventory 
           SET status = 'maintenance' 
           WHERE id = $1`,
          [id]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[equipment] Error scheduling maintenance:', error);
      res.status(500).json({ error: 'Failed to schedule maintenance' });
    }
  });

  // Get maintenance history
  router.get('/maintenance/history/:id', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        `SELECT 
          mr.*,
          u.email as requested_by_email,
          u.raw_user_meta_data->>'full_name' as requested_by_name,
          a.email as assigned_to_email,
          a.raw_user_meta_data->>'full_name' as assigned_to_name
         FROM maintenance_requests mr
         LEFT JOIN auth.users u ON mr.requested_by = u.id
         LEFT JOIN auth.users a ON mr.assigned_to = a.id
         WHERE mr.equipment_id = $1
         ORDER BY mr.created_at DESC`,
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('[equipment] Error fetching maintenance history:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance history' });
    }
  });

  // Equipment utilization report
  router.get('/reports/utilization', authenticateRequest, async (req: Request, res: Response) => {
    try {
      const { start_date, end_date, project_id } = req.query;
      
      const reportQuery = `
        WITH equipment_usage AS (
          SELECT 
            e.id,
            e.equipment_type,
            e.asset_tag,
            e.serial_number,
            COUNT(DISTINCT ul.id) as total_checkouts,
            COALESCE(SUM(ul.hours_used), 0) as total_hours_used,
            COUNT(DISTINCT ul.project_id) as projects_used_on,
            COUNT(DISTINCT ul.checked_out_by) as unique_users,
            AVG(ul.hours_used) as avg_hours_per_use
          FROM equipment_inventory e
          LEFT JOIN equipment_usage_logs ul ON e.id = ul.equipment_id
            AND ul.checked_out_at >= COALESCE($1::date, NOW() - INTERVAL '30 days')
            AND ul.checked_out_at <= COALESCE($2::date, NOW())
            AND ($3::uuid IS NULL OR ul.project_id = $3::uuid)
          GROUP BY e.id, e.equipment_type, e.asset_tag, e.serial_number
        ),
        maintenance_stats AS (
          SELECT 
            equipment_id,
            COUNT(*) as maintenance_count,
            SUM(actual_hours) as maintenance_hours
          FROM maintenance_requests
          WHERE created_at >= COALESCE($1::date, NOW() - INTERVAL '30 days')
            AND created_at <= COALESCE($2::date, NOW())
          GROUP BY equipment_id
        )
        SELECT 
          eu.*,
          e.status,
          e.condition,
          e.purchase_price,
          ms.maintenance_count,
          ms.maintenance_hours,
          CASE 
            WHEN eu.total_hours_used > 0 
            THEN ROUND((eu.total_hours_used::numeric / 
              (EXTRACT(DAY FROM (COALESCE($2::date, NOW()) - 
               COALESCE($1::date, NOW() - INTERVAL '30 days'))) * 8))::numeric * 100, 2)
            ELSE 0 
          END as utilization_percentage
        FROM equipment_usage eu
        JOIN equipment_inventory e ON eu.id = e.id
        LEFT JOIN maintenance_stats ms ON eu.id = ms.equipment_id
        ORDER BY eu.total_hours_used DESC
      `;

      const result = await query(reportQuery, [start_date, end_date, project_id]);
      
      res.json({
        period: {
          start: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: end_date || new Date()
        },
        equipment: result.rows,
        summary: {
          total_equipment: result.rows.length,
          total_hours: result.rows.reduce((sum, e) => sum + parseFloat(e.total_hours_used), 0),
          avg_utilization: result.rows.reduce((sum, e) => sum + parseFloat(e.utilization_percentage), 0) / result.rows.length || 0
        }
      });
    } catch (error) {
      console.error('[equipment] Error generating utilization report:', error);
      res.status(500).json({ error: 'Failed to generate utilization report' });
    }
  });

  return router;
}



