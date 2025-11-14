import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../database.js';
import { auditLogger } from '../middleware/auditLogger.js';

// Validation schemas
const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

const equipmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  position: positionSchema,
  status: z.enum(['active', 'idle', 'maintenance']),
  operator_id: z.string().uuid().optional()
});

const crewLocationSchema = z.object({
  user_id: z.string().uuid(),
  position: positionSchema,
  zone: z.string(),
  status: z.enum(['active', 'break', 'offline'])
});

const safetyZoneSchema = z.object({
  name: z.string(),
  type: z.enum(['restricted', 'caution', 'safe']),
  bounds: z.object({
    x: z.number(),
    z: z.number(),
    width: z.number(),
    depth: z.number()
  }),
  height: z.number(),
  active: z.boolean()
});

export function createMapRouter(): Router {
  const router = Router();

  // Get all equipment positions
  router.get('/equipment', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { project_id } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }
      
      // Get equipment with current positions
      const equipmentResult = await query(
        `SELECT 
          e.id,
          e.name,
          e.type,
          e.status,
          ep.position,
          ep.updated_at as last_update,
          u.name as operator_name,
          array_agg(
            jsonb_build_object(
              'x', eph.position->'x',
              'y', eph.position->'y', 
              'z', eph.position->'z'
            ) ORDER BY eph.created_at
          ) FILTER (WHERE eph.created_at > NOW() - INTERVAL '1 hour') as path
         FROM equipment e
         LEFT JOIN equipment_positions ep ON e.id = ep.equipment_id 
           AND ep.created_at = (
             SELECT MAX(created_at) 
             FROM equipment_positions 
             WHERE equipment_id = e.id
           )
         LEFT JOIN users u ON e.assigned_to = u.id
         LEFT JOIN equipment_position_history eph ON e.id = eph.equipment_id
           AND eph.created_at > NOW() - INTERVAL '1 hour'
         WHERE e.project_id = $1
         GROUP BY e.id, e.name, e.type, e.status, ep.position, ep.updated_at, u.name`,
        [project_id]
      );
      
      const equipment = equipmentResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        position: row.position || { x: 0, y: 0, z: 0 },
        status: row.status,
        operator: row.operator_name || 'Unassigned',
        lastUpdate: row.last_update,
        path: row.path || []
      }));
      
      res.json({ success: true, equipment });
    } catch (error) {
      console.error('Error fetching equipment positions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch equipment positions' 
      });
    }
  });

  // Update equipment position
  router.put('/equipment/:equipmentId/position', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { equipmentId } = req.params;
      const { position } = req.body;
      
      const validatedPosition = positionSchema.parse(position);
      
      // Verify equipment exists and user has access
      const equipmentCheck = await query(
        `SELECT e.id, e.project_id 
         FROM equipment e
         JOIN project_members pm ON e.project_id = pm.project_id
         WHERE e.id = $1 AND pm.user_id = $2`,
        [equipmentId, userId]
      );
      
      if (!equipmentCheck.rows.length) {
        return res.status(404).json({ 
          success: false, 
          error: 'Equipment not found or access denied' 
        });
      }
      
      // Insert new position (keeps history)
      await query(
        `INSERT INTO equipment_positions (equipment_id, position, updated_by)
         VALUES ($1, $2, $3)`,
        [equipmentId, JSON.stringify(validatedPosition), userId]
      );
      
      // Also insert into history table
      await query(
        `INSERT INTO equipment_position_history (equipment_id, position, recorded_by)
         VALUES ($1, $2, $3)`,
        [equipmentId, JSON.stringify(validatedPosition), userId]
      );
      
      auditLogger.log('equipment_position_updated', userId, {
        equipment_id: equipmentId,
        position: validatedPosition
      });
      
      res.json({ success: true, message: 'Position updated' });
    } catch (error) {
      console.error('Error updating equipment position:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid position data', 
          details: error.format() 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update position' 
      });
    }
  });

  // Get crew locations
  router.get('/crew', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { project_id } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }
      
      // Get crew members currently on site
      const crewResult = await query(
        `SELECT 
          cl.id,
          cl.user_id,
          u.name,
          u.role,
          cl.position,
          cl.status,
          cl.zone,
          cl.heart_rate,
          cl.updated_at as last_update
         FROM crew_locations cl
         JOIN users u ON cl.user_id = u.id
         JOIN project_members pm ON u.id = pm.user_id
         WHERE pm.project_id = $1
           AND cl.updated_at > NOW() - INTERVAL '30 minutes'
           AND cl.status != 'offline'
         ORDER BY u.name`,
        [project_id]
      );
      
      const crew = crewResult.rows.map(row => ({
        id: row.user_id,
        name: row.name,
        role: row.role,
        position: row.position,
        status: row.status,
        zone: row.zone,
        heartRate: row.heart_rate,
        lastUpdate: row.last_update
      }));
      
      res.json({ success: true, crew });
    } catch (error) {
      console.error('Error fetching crew locations:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch crew locations' 
      });
    }
  });

  // Update crew member location
  router.put('/crew/location', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const validatedData = crewLocationSchema.parse(req.body);
      
      // User can only update their own location unless they're a supervisor
      const userCheck = await query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );
      
      const canUpdateOthers = ['admin', 'supervisor', 'safety_officer'].includes(
        userCheck.rows[0]?.role
      );
      
      if (validatedData.user_id !== userId && !canUpdateOthers) {
        return res.status(403).json({ 
          success: false, 
          error: 'Cannot update other crew member locations' 
        });
      }
      
      // Upsert crew location
      await query(
        `INSERT INTO crew_locations (user_id, position, zone, status, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET position = $2, zone = $3, status = $4, updated_at = NOW()`,
        [
          validatedData.user_id,
          JSON.stringify(validatedData.position),
          validatedData.zone,
          validatedData.status
        ]
      );
      
      res.json({ success: true, message: 'Location updated' });
    } catch (error) {
      console.error('Error updating crew location:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid location data', 
          details: error.format() 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update location' 
      });
    }
  });

  // Get safety zones
  router.get('/zones', async (req: Request, res: Response) => {
    try {
      const { project_id } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }
      
      const zonesResult = await query(
        `SELECT * FROM safety_zones 
         WHERE project_id = $1 
         ORDER BY created_at`,
        [project_id]
      );
      
      const zones = zonesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        bounds: row.bounds,
        height: row.height,
        active: row.active
      }));
      
      res.json({ success: true, zones });
    } catch (error) {
      console.error('Error fetching safety zones:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch safety zones' 
      });
    }
  });

  // Create or update safety zone
  router.post('/zones', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { project_id } = req.body;
      const validatedData = safetyZoneSchema.parse(req.body);
      
      // Check if user has permission (safety officer or admin)
      const userCheck = await query(
        `SELECT u.role 
         FROM users u
         JOIN project_members pm ON u.id = pm.user_id
         WHERE u.id = $1 AND pm.project_id = $2`,
        [userId, project_id]
      );
      
      const canManageZones = ['admin', 'safety_officer', 'supervisor'].includes(
        userCheck.rows[0]?.role
      );
      
      if (!canManageZones) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to manage safety zones' 
        });
      }
      
      const result = await query(
        `INSERT INTO safety_zones 
         (project_id, name, type, bounds, height, active, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          project_id,
          validatedData.name,
          validatedData.type,
          JSON.stringify(validatedData.bounds),
          validatedData.height,
          validatedData.active,
          userId
        ]
      );
      
      auditLogger.log('safety_zone_created', userId, {
        project_id,
        zone_id: result.rows[0].id,
        zone_name: validatedData.name
      });
      
      res.json({ 
        success: true, 
        zone: { id: result.rows[0].id, ...validatedData } 
      });
    } catch (error) {
      console.error('Error creating safety zone:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid zone data', 
          details: error.format() 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create safety zone' 
      });
    }
  });

  // Toggle safety zone active state
  router.patch('/zones/:zoneId/toggle', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { zoneId } = req.params;
      
      // Verify permissions
      const zoneCheck = await query(
        `SELECT sz.active, u.role
         FROM safety_zones sz
         JOIN project_members pm ON sz.project_id = pm.project_id
         JOIN users u ON pm.user_id = u.id
         WHERE sz.id = $1 AND u.id = $2`,
        [zoneId, userId]
      );
      
      if (!zoneCheck.rows.length) {
        return res.status(404).json({ 
          success: false, 
          error: 'Zone not found' 
        });
      }
      
      const canManageZones = ['admin', 'safety_officer', 'supervisor'].includes(
        zoneCheck.rows[0].role
      );
      
      if (!canManageZones) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions' 
        });
      }
      
      const newState = !zoneCheck.rows[0].active;
      
      await query(
        'UPDATE safety_zones SET active = $1, updated_at = NOW() WHERE id = $2',
        [newState, zoneId]
      );
      
      auditLogger.log('safety_zone_toggled', userId, {
        zone_id: zoneId,
        active: newState
      });
      
      res.json({ success: true, active: newState });
    } catch (error) {
      console.error('Error toggling safety zone:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to toggle safety zone' 
      });
    }
  });

  // Get map statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const { project_id } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }
      
      // Get various statistics
      const [equipment, crew, zones] = await Promise.all([
        query(
          `SELECT status, COUNT(*) as count 
           FROM equipment 
           WHERE project_id = $1 
           GROUP BY status`,
          [project_id]
        ),
        query(
          `SELECT cl.status, COUNT(*) as count
           FROM crew_locations cl
           JOIN users u ON cl.user_id = u.id
           JOIN project_members pm ON u.id = pm.user_id
           WHERE pm.project_id = $1
             AND cl.updated_at > NOW() - INTERVAL '30 minutes'
           GROUP BY cl.status`,
          [project_id]
        ),
        query(
          `SELECT type, COUNT(*) as count
           FROM safety_zones
           WHERE project_id = $1 AND active = true
           GROUP BY type`,
          [project_id]
        )
      ]);
      
      const stats = {
        equipment: equipment.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {} as Record<string, number>),
        crew: crew.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {} as Record<string, number>),
        zones: zones.rows.reduce((acc, row) => {
          acc[row.type] = parseInt(row.count);
          return acc;
        }, {} as Record<string, number>),
        lastUpdate: new Date().toISOString()
      };
      
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error fetching map stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch statistics' 
      });
    }
  });

  return router;
}
