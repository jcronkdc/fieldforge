"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchedulingRouter = createSchedulingRouter;
const express_1 = require("express");
const auth_js_1 = require("../../middleware/auth.js");
const database_js_1 = __importDefault(require("../../database.js"));
const auditLog_js_1 = require("../../middleware/auditLog.js");
function createSchedulingRouter() {
    const router = (0, express_1.Router)();
    // Apply authentication to all routes
    router.use(auth_js_1.authenticateRequest);
    // Get lookahead activities
    router.get('/lookahead', async (req, res) => {
        try {
            const { start_date, end_date, status, priority } = req.query;
            let query = `
        SELECT 
          la.*,
          COUNT(ad.id) as dependency_count
        FROM lookahead_activities la
        LEFT JOIN activity_dependencies ad ON la.id = ad.activity_id
        WHERE 1=1
      `;
            const params = [];
            if (start_date) {
                params.push(start_date);
                query += ` AND la.scheduled_date >= $${params.length}`;
            }
            if (end_date) {
                params.push(end_date);
                query += ` AND la.scheduled_date <= $${params.length}`;
            }
            if (status) {
                params.push(status);
                query += ` AND la.status = $${params.length}`;
            }
            if (priority) {
                params.push(priority);
                query += ` AND la.priority = $${params.length}`;
            }
            query += `
        GROUP BY la.id
        ORDER BY la.scheduled_date, la.start_time
      `;
            const result = await database_js_1.default.query(query, params);
            res.json({
                success: true,
                data: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching lookahead activities:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch activities' });
        }
    });
    // Create new activity
    router.post('/lookahead', async (req, res) => {
        try {
            const { project_id, project_name, activity_name, description, scheduled_date, start_time, end_time, location, crew_size, crew_assigned, status, priority, weather_dependent, equipment_needed, notes } = req.body;
            const result = await database_js_1.default.query(`INSERT INTO lookahead_activities (
          project_id, project_name, activity_name, description,
          scheduled_date, start_time, end_time, location,
          crew_size, crew_assigned, status, priority,
          weather_dependent, equipment_needed, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`, [
                project_id,
                project_name,
                activity_name,
                description,
                scheduled_date,
                start_time,
                end_time,
                location,
                crew_size || 0,
                JSON.stringify(crew_assigned || []),
                status || 'planned',
                priority || 'medium',
                weather_dependent || false,
                JSON.stringify(equipment_needed || []),
                notes,
                req.user?.id
            ]);
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'activity_created',
                user_id: req.user?.id || 'system',
                resource_type: 'lookahead_activity',
                resource_id: result.rows[0].id,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { activity_name, project_id, scheduled_date },
                success: true
            });
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error creating activity:', error);
            res.status(500).json({ success: false, error: 'Failed to create activity' });
        }
    });
    // Update activity
    router.put('/lookahead/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { activity_name, description, scheduled_date, start_time, end_time, location, crew_size, crew_assigned, status, priority, weather_dependent, equipment_needed, notes } = req.body;
            const result = await database_js_1.default.query(`UPDATE lookahead_activities 
        SET 
          activity_name = COALESCE($2, activity_name),
          description = COALESCE($3, description),
          scheduled_date = COALESCE($4, scheduled_date),
          start_time = COALESCE($5, start_time),
          end_time = COALESCE($6, end_time),
          location = COALESCE($7, location),
          crew_size = COALESCE($8, crew_size),
          crew_assigned = COALESCE($9, crew_assigned),
          status = COALESCE($10, status),
          priority = COALESCE($11, priority),
          weather_dependent = COALESCE($12, weather_dependent),
          equipment_needed = COALESCE($13, equipment_needed),
          notes = COALESCE($14, notes),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`, [
                id,
                activity_name,
                description,
                scheduled_date,
                start_time,
                end_time,
                location,
                crew_size,
                crew_assigned ? JSON.stringify(crew_assigned) : undefined,
                status,
                priority,
                weather_dependent,
                equipment_needed ? JSON.stringify(equipment_needed) : undefined,
                notes
            ]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Activity not found' });
            }
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'activity_updated',
                user_id: req.user?.id || 'system',
                resource_type: 'lookahead_activity',
                resource_id: id,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { changes: req.body },
                success: true
            });
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error updating activity:', error);
            res.status(500).json({ success: false, error: 'Failed to update activity' });
        }
    });
    // Delete activity
    router.delete('/lookahead/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await database_js_1.default.query('DELETE FROM lookahead_activities WHERE id = $1 RETURNING activity_name', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Activity not found' });
            }
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'activity_deleted',
                user_id: req.user?.id || 'system',
                resource_type: 'lookahead_activity',
                resource_id: id,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { activity_name: result.rows[0].activity_name },
                success: true
            });
            res.json({
                success: true,
                message: 'Activity deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting activity:', error);
            res.status(500).json({ success: false, error: 'Failed to delete activity' });
        }
    });
    // Get activity dependencies
    router.get('/lookahead/:id/dependencies', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await database_js_1.default.query(`SELECT 
          ad.*,
          la.activity_name as depends_on_name,
          la.scheduled_date as depends_on_date
        FROM activity_dependencies ad
        JOIN lookahead_activities la ON ad.depends_on_id = la.id
        WHERE ad.activity_id = $1
        ORDER BY la.scheduled_date`, [id]);
            res.json({
                success: true,
                data: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching dependencies:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch dependencies' });
        }
    });
    // Add activity dependency
    router.post('/lookahead/:id/dependencies', async (req, res) => {
        try {
            const { id } = req.params;
            const { depends_on_id, dependency_type, lag_days } = req.body;
            const result = await database_js_1.default.query(`INSERT INTO activity_dependencies (
          activity_id, depends_on_id, dependency_type, lag_days
        ) VALUES ($1, $2, $3, $4)
        RETURNING *`, [id, depends_on_id, dependency_type || 'finish_to_start', lag_days || 0]);
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'dependency_added',
                user_id: req.user?.id || 'system',
                resource_type: 'activity_dependency',
                resource_id: result.rows[0].id,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { activity_id: id, depends_on_id },
                success: true
            });
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error adding dependency:', error);
            res.status(500).json({ success: false, error: 'Failed to add dependency' });
        }
    });
    // Get schedule conflicts
    router.get('/conflicts', async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const result = await database_js_1.default.query(`WITH conflicts AS (
          SELECT 
            a1.id as activity1_id,
            a1.activity_name as activity1_name,
            a2.id as activity2_id,
            a2.activity_name as activity2_name,
            a1.scheduled_date,
            a1.location,
            a1.crew_assigned
          FROM lookahead_activities a1
          JOIN lookahead_activities a2 
            ON a1.id < a2.id
            AND a1.scheduled_date = a2.scheduled_date
            AND a1.location = a2.location
            AND (
              (a1.start_time <= a2.start_time AND a1.end_time > a2.start_time)
              OR (a2.start_time <= a1.start_time AND a2.end_time > a1.start_time)
            )
          WHERE ($1::date IS NULL OR a1.scheduled_date >= $1)
            AND ($2::date IS NULL OR a1.scheduled_date <= $2)
        )
        SELECT * FROM conflicts
        ORDER BY scheduled_date, location`, [start_date, end_date]);
            res.json({
                success: true,
                data: result.rows
            });
        }
        catch (error) {
            console.error('Error checking conflicts:', error);
            res.status(500).json({ success: false, error: 'Failed to check conflicts' });
        }
    });
    // Get resource utilization
    router.get('/utilization', async (req, res) => {
        try {
            const { start_date, end_date } = req.query;
            const result = await database_js_1.default.query(`SELECT 
          scheduled_date,
          COUNT(*) as total_activities,
          SUM(crew_size) as total_crew_needed,
          COUNT(DISTINCT location) as locations_active,
          json_agg(DISTINCT jsonb_array_elements_text(equipment_needed)) as equipment_in_use
        FROM lookahead_activities
        WHERE ($1::date IS NULL OR scheduled_date >= $1)
          AND ($2::date IS NULL OR scheduled_date <= $2)
          AND status NOT IN ('cancelled', 'completed')
        GROUP BY scheduled_date
        ORDER BY scheduled_date`, [start_date, end_date]);
            res.json({
                success: true,
                data: result.rows
            });
        }
        catch (error) {
            console.error('Error calculating utilization:', error);
            res.status(500).json({ success: false, error: 'Failed to calculate utilization' });
        }
    });
    return router;
}
