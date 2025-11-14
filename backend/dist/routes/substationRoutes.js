"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubstationRouter = createSubstationRouter;
const express_1 = require("express");
const zod_1 = require("zod");
const database_js_1 = require("../database.js");
const auditLogger_js_1 = require("../middleware/auditLogger.js");
// Validation schemas
const positionSchema = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    z: zod_1.z.number()
});
const equipmentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['transformer', 'breaker', 'switch', 'bus', 'insulator', 'arrester']),
    position: positionSchema,
    rotation: positionSchema,
    voltage: zod_1.z.number(),
    manufacturer: zod_1.z.string(),
    model: zod_1.z.string(),
    rating: zod_1.z.string(),
    install_date: zod_1.z.string()
});
const lockoutSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid(),
    reason: zod_1.z.string(),
    expected_duration: zod_1.z.number().optional()
});
function createSubstationRouter() {
    const router = (0, express_1.Router)();
    // Get substation equipment
    router.get('/equipment', async (req, res) => {
        try {
            const { substation_id } = req.query;
            if (!substation_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Substation ID is required'
                });
            }
            // Get equipment with current status and temperature
            const equipmentResult = await (0, database_js_1.query)(`SELECT 
          se.*,
          ses.temperature,
          ses.status,
          ses.voltage_actual,
          ses.current_actual,
          ses.updated_at as last_reading,
          array_agg(
            json_build_object(
              'tag_id', lt.id,
              'user_name', u.name,
              'reason', lt.reason,
              'created_at', lt.created_at
            )
          ) FILTER (WHERE lt.removed_at IS NULL) as lockout_tags
         FROM substation_equipment se
         LEFT JOIN substation_equipment_status ses ON se.id = ses.equipment_id
           AND ses.created_at = (
             SELECT MAX(created_at) 
             FROM substation_equipment_status 
             WHERE equipment_id = se.id
           )
         LEFT JOIN lockout_tags lt ON se.id = lt.equipment_id AND lt.removed_at IS NULL
         LEFT JOIN users u ON lt.user_id = u.id
         WHERE se.substation_id = $1
         GROUP BY se.id, ses.temperature, ses.status, ses.voltage_actual, 
                  ses.current_actual, ses.updated_at`, [substation_id]);
            const equipment = equipmentResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                type: row.type,
                position: row.position,
                rotation: row.rotation || { x: 0, y: 0, z: 0 },
                voltage: row.voltage_rating,
                temperature: row.temperature || 20,
                status: row.status || 'de-energized',
                specifications: {
                    manufacturer: row.manufacturer,
                    model: row.model,
                    rating: row.rating,
                    installDate: row.install_date
                },
                lockoutTags: row.lockout_tags || []
            }));
            res.json({ success: true, equipment });
        }
        catch (error) {
            console.error('Error fetching substation equipment:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch equipment'
            });
        }
    });
    // Get clearance calculations
    router.get('/clearances', async (req, res) => {
        try {
            const { substation_id } = req.query;
            if (!substation_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Substation ID is required'
                });
            }
            // Get all equipment positions
            const equipmentResult = await (0, database_js_1.query)('SELECT id, name, position, voltage_rating FROM substation_equipment WHERE substation_id = $1', [substation_id]);
            const clearances = [];
            const equipment = equipmentResult.rows;
            // Calculate distances between all equipment pairs
            for (let i = 0; i < equipment.length; i++) {
                for (let j = i + 1; j < equipment.length; j++) {
                    const eq1 = equipment[i];
                    const eq2 = equipment[j];
                    // Calculate 3D distance
                    const dx = eq1.position.x - eq2.position.x;
                    const dy = eq1.position.y - eq2.position.y;
                    const dz = eq1.position.z - eq2.position.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    // Get required clearance based on voltage (simplified)
                    const maxVoltage = Math.max(eq1.voltage_rating, eq2.voltage_rating);
                    const required = getRequiredClearance(maxVoltage);
                    clearances.push({
                        equipment1: eq1.id,
                        equipment1Name: eq1.name,
                        equipment2: eq2.id,
                        equipment2Name: eq2.name,
                        distance: distance,
                        required: required,
                        safe: distance >= required
                    });
                }
            }
            res.json({ success: true, clearances });
        }
        catch (error) {
            console.error('Error calculating clearances:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to calculate clearances'
            });
        }
    });
    // Get equipment temperature history
    router.get('/equipment/:equipmentId/temperature', async (req, res) => {
        try {
            const { equipmentId } = req.params;
            const { hours = 24 } = req.query;
            const result = await (0, database_js_1.query)(`SELECT temperature, created_at 
         FROM substation_equipment_status 
         WHERE equipment_id = $1 
           AND created_at > NOW() - INTERVAL $2
         ORDER BY created_at DESC`, [equipmentId, `${hours} hours`]);
            res.json({
                success: true,
                history: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching temperature history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch temperature history'
            });
        }
    });
    // Create lockout tag
    router.post('/lockout', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = lockoutSchema.parse(req.body);
            // Verify user has permission
            const userRole = await (0, database_js_1.query)('SELECT role FROM users WHERE id = $1', [userId]);
            const canLockout = ['admin', 'supervisor', 'electrician', 'operator'].includes(userRole.rows[0]?.role);
            if (!canLockout) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions for lockout operations'
                });
            }
            // Create lockout tag
            const result = await (0, database_js_1.query)(`INSERT INTO lockout_tags 
         (equipment_id, user_id, reason, expected_duration)
         VALUES ($1, $2, $3, $4)
         RETURNING id`, [
                validatedData.equipment_id,
                userId,
                validatedData.reason,
                validatedData.expected_duration
            ]);
            // Update equipment status
            await (0, database_js_1.query)(`UPDATE substation_equipment_status 
         SET status = 'maintenance' 
         WHERE equipment_id = $1`, [validatedData.equipment_id]);
            auditLogger_js_1.auditLogger.log('lockout_tag_created', userId, {
                equipment_id: validatedData.equipment_id,
                tag_id: result.rows[0].id
            });
            res.json({
                success: true,
                tagId: result.rows[0].id
            });
        }
        catch (error) {
            console.error('Error creating lockout tag:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid lockout data',
                    details: error.format()
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to create lockout tag'
            });
        }
    });
    // Remove lockout tag
    router.delete('/lockout/:tagId', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { tagId } = req.params;
            // Verify tag exists and user has permission
            const tagResult = await (0, database_js_1.query)('SELECT * FROM lockout_tags WHERE id = $1 AND removed_at IS NULL', [tagId]);
            if (!tagResult.rows.length) {
                return res.status(404).json({
                    success: false,
                    error: 'Lockout tag not found'
                });
            }
            const tag = tagResult.rows[0];
            // Only the person who placed the tag or a supervisor can remove it
            const userRole = await (0, database_js_1.query)('SELECT role FROM users WHERE id = $1', [userId]);
            const canRemove = tag.user_id === userId ||
                ['admin', 'supervisor'].includes(userRole.rows[0]?.role);
            if (!canRemove) {
                return res.status(403).json({
                    success: false,
                    error: 'Only tag owner or supervisor can remove lockout tag'
                });
            }
            // Mark tag as removed
            await (0, database_js_1.query)('UPDATE lockout_tags SET removed_at = NOW(), removed_by = $2 WHERE id = $1', [tagId, userId]);
            // Check if equipment can be re-energized
            const remainingTags = await (0, database_js_1.query)(`SELECT COUNT(*) as count 
         FROM lockout_tags 
         WHERE equipment_id = $1 AND removed_at IS NULL`, [tag.equipment_id]);
            if (parseInt(remainingTags.rows[0].count) === 0) {
                // No more tags, equipment can potentially be re-energized
                await (0, database_js_1.query)(`UPDATE substation_equipment_status 
           SET status = 'de-energized' 
           WHERE equipment_id = $1`, [tag.equipment_id]);
            }
            auditLogger_js_1.auditLogger.log('lockout_tag_removed', userId, {
                tag_id: tagId,
                equipment_id: tag.equipment_id
            });
            res.json({
                success: true,
                message: 'Lockout tag removed'
            });
        }
        catch (error) {
            console.error('Error removing lockout tag:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove lockout tag'
            });
        }
    });
    // Get maintenance paths
    router.get('/maintenance-paths', async (req, res) => {
        try {
            const { substation_id } = req.query;
            if (!substation_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Substation ID is required'
                });
            }
            const pathsResult = await (0, database_js_1.query)('SELECT * FROM maintenance_paths WHERE substation_id = $1', [substation_id]);
            const paths = pathsResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                points: row.path_points,
                accessible: row.is_accessible,
                lastInspection: row.last_inspection
            }));
            res.json({ success: true, paths });
        }
        catch (error) {
            console.error('Error fetching maintenance paths:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch maintenance paths'
            });
        }
    });
    // Export 3D model
    router.get('/export', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { substation_id, format = 'gltf' } = req.query;
            if (!substation_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Substation ID is required'
                });
            }
            // In production, this would generate actual 3D file
            // For now, log the export request
            auditLogger_js_1.auditLogger.log('substation_model_exported', userId, {
                substation_id,
                format
            });
            res.json({
                success: true,
                message: `3D model exported in ${format} format`,
                downloadUrl: `/api/downloads/substation-${substation_id}.${format}`
            });
        }
        catch (error) {
            console.error('Error exporting model:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to export model'
            });
        }
    });
    return router;
}
// Helper function to get required clearance based on voltage
function getRequiredClearance(voltageKV) {
    // Simplified clearance calculation based on IEEE/NESC standards
    // In production, this would use detailed tables
    if (voltageKV <= 15)
        return 0.31;
    if (voltageKV <= 35)
        return 0.63;
    if (voltageKV <= 46)
        return 0.74;
    if (voltageKV <= 72.5)
        return 1.00;
    if (voltageKV <= 121)
        return 1.40;
    if (voltageKV <= 145)
        return 1.70;
    if (voltageKV <= 169)
        return 2.00;
    if (voltageKV <= 242)
        return 2.59;
    if (voltageKV <= 362)
        return 3.20;
    if (voltageKV <= 550)
        return 4.88;
    if (voltageKV <= 800)
        return 6.71;
    return 8.84; // >800kV
}
