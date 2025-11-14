"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOutagesRouter = createOutagesRouter;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const zod_1 = require("zod");
const auditLogger_js_1 = require("../middleware/auditLogger.js");
// Validation schemas
const switchingStepSchema = zod_1.z.object({
    sequence: zod_1.z.number(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    equipment_id: zod_1.z.string(),
    safety_notes: zod_1.z.string().optional(),
    completed: zod_1.z.boolean().default(false),
    completed_by: zod_1.z.string().uuid().optional(),
    completed_at: zod_1.z.string().optional()
});
const createOutageSchema = zod_1.z.object({
    outage_number: zod_1.z.string(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().min(1),
    start_time: zod_1.z.string(),
    end_time: zod_1.z.string(),
    status: zod_1.z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
    impact_level: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    affected_circuits: zod_1.z.array(zod_1.z.string()).optional(),
    affected_customers: zod_1.z.number().optional(),
    crews_required: zod_1.z.number().optional(),
    switching_steps: zod_1.z.array(switchingStepSchema).optional(),
    safety_requirements: zod_1.z.array(zod_1.z.string()).optional(),
    notifications_sent: zod_1.z.boolean().optional()
});
const updateOutageSchema = zod_1.z.object({
    status: zod_1.z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
    switching_steps: zod_1.z.array(switchingStepSchema).optional(),
    notifications_sent: zod_1.z.boolean().optional(),
    end_time: zod_1.z.string().optional()
});
function createOutagesRouter() {
    const router = (0, express_1.Router)();
    // Get all outages
    router.get('/', async (req, res) => {
        try {
            const { status, from_date, to_date } = req.query;
            const userId = req.user?.id;
            let queryText = `
        SELECT o.*, u.raw_user_meta_data->>'full_name' as created_by_name
        FROM outage_coordination o
        LEFT JOIN auth.users u ON o.created_by = u.id
        WHERE 1=1
      `;
            const params = [];
            if (status) {
                params.push(status);
                queryText += ` AND o.status = $${params.length}`;
            }
            if (from_date) {
                params.push(from_date);
                queryText += ` AND o.start_time >= $${params.length}`;
            }
            if (to_date) {
                params.push(to_date);
                queryText += ` AND o.start_time <= $${params.length}`;
            }
            queryText += ' ORDER BY o.start_time ASC';
            const result = await (0, database_js_1.query)(queryText, params);
            await (0, auditLogger_js_1.auditLog)(userId, 'view_outages', {
                count: result.rows.length,
                filters: { status, from_date, to_date }
            });
            res.json({
                success: true,
                data: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching outages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch outages'
            });
        }
    });
    // Get single outage
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`SELECT o.*, u.raw_user_meta_data->>'full_name' as created_by_name
         FROM outage_coordination o
         LEFT JOIN auth.users u ON o.created_by = u.id
         WHERE o.id = $1`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Outage not found'
                });
            }
            await (0, auditLogger_js_1.auditLog)(userId, 'view_outage', { outage_id: id });
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error fetching outage:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch outage'
            });
        }
    });
    // Create new outage
    router.post('/', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = createOutageSchema.parse(req.body);
            const result = await (0, database_js_1.query)(`INSERT INTO outage_coordination (
          outage_number, title, description, location,
          start_time, end_time, status, impact_level,
          affected_circuits, affected_customers, crews_required,
          switching_steps, safety_requirements, notifications_sent,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`, [
                validatedData.outage_number,
                validatedData.title,
                validatedData.description || null,
                validatedData.location,
                validatedData.start_time,
                validatedData.end_time,
                validatedData.status || 'planned',
                validatedData.impact_level || 'medium',
                validatedData.affected_circuits || [],
                validatedData.affected_customers || 0,
                validatedData.crews_required || 1,
                JSON.stringify(validatedData.switching_steps || []),
                validatedData.safety_requirements || [],
                validatedData.notifications_sent || false,
                userId
            ]);
            await (0, auditLogger_js_1.auditLog)(userId, 'create_outage', {
                outage_id: result.rows[0].id,
                title: validatedData.title,
                impact_level: validatedData.impact_level
            });
            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error creating outage:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to create outage'
            });
        }
    });
    // Update outage
    router.patch('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const validatedData = updateOutageSchema.parse(req.body);
            // Build dynamic update query
            const updates = [];
            const params = [];
            if (validatedData.status !== undefined) {
                params.push(validatedData.status);
                updates.push(`status = $${params.length}`);
            }
            if (validatedData.switching_steps !== undefined) {
                params.push(JSON.stringify(validatedData.switching_steps));
                updates.push(`switching_steps = $${params.length}::jsonb`);
            }
            if (validatedData.notifications_sent !== undefined) {
                params.push(validatedData.notifications_sent);
                updates.push(`notifications_sent = $${params.length}`);
            }
            if (validatedData.end_time !== undefined) {
                params.push(validatedData.end_time);
                updates.push(`end_time = $${params.length}`);
            }
            // Always update the updated_at timestamp
            updates.push('updated_at = NOW()');
            params.push(id);
            const updateQuery = `
        UPDATE outage_coordination 
        SET ${updates.join(', ')}
        WHERE id = $${params.length}
        RETURNING *
      `;
            const result = await (0, database_js_1.query)(updateQuery, params);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Outage not found'
                });
            }
            await (0, auditLogger_js_1.auditLog)(userId, 'update_outage', {
                outage_id: id,
                updates: Object.keys(validatedData)
            });
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error updating outage:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to update outage'
            });
        }
    });
    // Get active outages (quick endpoint for dashboards)
    router.get('/status/active', async (req, res) => {
        try {
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`SELECT id, outage_number, title, location, start_time, end_time,
                impact_level, affected_customers, affected_circuits
         FROM outage_coordination
         WHERE status = 'active'
         ORDER BY impact_level DESC, affected_customers DESC`);
            await (0, auditLogger_js_1.auditLog)(userId, 'view_active_outages', {
                count: result.rows.length
            });
            res.json({
                success: true,
                data: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching active outages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch active outages'
            });
        }
    });
    // Delete outage
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            // Only allow deletion of planned outages
            const checkResult = await (0, database_js_1.query)('SELECT status, title FROM outage_coordination WHERE id = $1', [id]);
            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Outage not found'
                });
            }
            if (checkResult.rows[0].status !== 'planned') {
                return res.status(400).json({
                    success: false,
                    error: 'Can only delete planned outages'
                });
            }
            await (0, database_js_1.query)('DELETE FROM outage_coordination WHERE id = $1', [id]);
            await (0, auditLogger_js_1.auditLog)(userId, 'delete_outage', {
                outage_id: id,
                title: checkResult.rows[0].title
            });
            res.json({
                success: true,
                message: 'Outage deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting outage:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete outage'
            });
        }
    });
    return router;
}
