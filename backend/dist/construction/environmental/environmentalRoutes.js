"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironmentalRouter = createEnvironmentalRouter;
const express_1 = require("express");
const database_js_1 = require("../../database.js");
const zod_1 = require("zod");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
// Validation schemas
const readingSchema = zod_1.z.object({
    metric_type: zod_1.z.enum(['air_quality', 'noise_level', 'dust_level', 'water_quality', 'temperature', 'humidity']),
    value: zod_1.z.number(),
    unit: zod_1.z.string(),
    location: zod_1.z.string(),
    notes: zod_1.z.string().optional()
});
const incidentSchema = zod_1.z.object({
    incident_type: zod_1.z.string(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    corrective_actions: zod_1.z.string().optional()
});
function createEnvironmentalRouter() {
    const router = (0, express_1.Router)();
    // Get environmental metrics summary
    router.get('/metrics', async (req, res) => {
        try {
            const { project_id } = req.query;
            // Get total readings
            const readingsResult = await (0, database_js_1.query)(`SELECT COUNT(*) as total,
         COUNT(CASE WHEN status = 'violation' AND created_at > NOW() - INTERVAL '30 days' THEN 1 END) as violations_this_month
         FROM environmental_readings
         WHERE ($1::uuid IS NULL OR project_id = $1)`, [project_id || null]);
            // Get permit counts
            const permitsResult = await (0, database_js_1.query)(`SELECT 
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_permits,
         COUNT(CASE WHEN status = 'expiring_soon' THEN 1 END) as expiring_permits
         FROM environmental_permits
         WHERE ($1::uuid IS NULL OR project_id = $1)`, [project_id || null]);
            // Get open incidents
            const incidentsResult = await (0, database_js_1.query)(`SELECT COUNT(*) as open_incidents
         FROM environmental_incidents
         WHERE status IN ('open', 'investigating')
         AND ($1::uuid IS NULL OR project_id = $1)`, [project_id || null]);
            const metrics = {
                total_readings: parseInt(readingsResult.rows[0].total),
                violations_this_month: parseInt(readingsResult.rows[0].violations_this_month),
                active_permits: parseInt(permitsResult.rows[0].active_permits),
                expiring_permits: parseInt(permitsResult.rows[0].expiring_permits),
                open_incidents: parseInt(incidentsResult.rows[0].open_incidents),
                compliance_rate: 94.5 // Calculate based on actual data
            };
            res.json({ success: true, metrics });
        }
        catch (error) {
            console.error('Error fetching environmental metrics:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
        }
    });
    // Get environmental readings
    router.get('/readings', async (req, res) => {
        try {
            const { project_id, metric_type, start_date, end_date } = req.query;
            let queryText = `
        SELECT er.*, u.email as recorded_by_email
        FROM environmental_readings er
        LEFT JOIN auth.users u ON er.recorded_by = u.id
        WHERE 1=1
      `;
            const params = [];
            if (project_id) {
                params.push(project_id);
                queryText += ` AND er.project_id = $${params.length}`;
            }
            if (metric_type && metric_type !== 'all') {
                params.push(metric_type);
                queryText += ` AND er.metric_type = $${params.length}`;
            }
            if (start_date) {
                params.push(start_date);
                queryText += ` AND er.recorded_at >= $${params.length}`;
            }
            if (end_date) {
                params.push(end_date);
                queryText += ` AND er.recorded_at <= $${params.length}`;
            }
            queryText += ' ORDER BY er.recorded_at DESC LIMIT 100';
            const result = await (0, database_js_1.query)(queryText, params);
            res.json({ success: true, readings: result.rows });
        }
        catch (error) {
            console.error('Error fetching environmental readings:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch readings' });
        }
    });
    // Submit new reading
    router.post('/readings', async (req, res) => {
        try {
            const validatedData = readingSchema.parse(req.body);
            const userId = req.user?.id;
            const { project_id } = req.body;
            // Determine status based on thresholds
            let status = 'normal';
            if (validatedData.metric_type === 'air_quality' && validatedData.value > 100)
                status = 'violation';
            else if (validatedData.metric_type === 'air_quality' && validatedData.value > 50)
                status = 'warning';
            else if (validatedData.metric_type === 'noise_level' && validatedData.value > 85)
                status = 'violation';
            else if (validatedData.metric_type === 'noise_level' && validatedData.value > 75)
                status = 'warning';
            else if (validatedData.metric_type === 'dust_level' && validatedData.value > 0.15)
                status = 'violation';
            else if (validatedData.metric_type === 'dust_level' && validatedData.value > 0.1)
                status = 'warning';
            const result = await (0, database_js_1.query)(`INSERT INTO environmental_readings 
         (project_id, metric_type, value, unit, location, status, notes, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`, [
                project_id,
                validatedData.metric_type,
                validatedData.value,
                validatedData.unit,
                validatedData.location,
                status,
                validatedData.notes || null,
                userId
            ]);
            auditLogger_js_1.auditLogger.log('environmental_reading_created', userId, {
                reading_id: result.rows[0].id,
                metric_type: validatedData.metric_type,
                value: validatedData.value,
                status
            });
            res.status(201).json({ success: true, reading: result.rows[0] });
        }
        catch (error) {
            console.error('Error creating environmental reading:', error);
            res.status(500).json({ success: false, error: 'Failed to create reading' });
        }
    });
    // Get incidents
    router.get('/incidents', async (req, res) => {
        try {
            const { project_id, status } = req.query;
            let queryText = `
        SELECT ei.*, u.email as reported_by_email
        FROM environmental_incidents ei
        LEFT JOIN auth.users u ON ei.reported_by = u.id
        WHERE 1=1
      `;
            const params = [];
            if (project_id) {
                params.push(project_id);
                queryText += ` AND ei.project_id = $${params.length}`;
            }
            if (status) {
                params.push(status);
                queryText += ` AND ei.status = $${params.length}`;
            }
            queryText += ' ORDER BY ei.reported_at DESC';
            const result = await (0, database_js_1.query)(queryText, params);
            res.json({ success: true, incidents: result.rows });
        }
        catch (error) {
            console.error('Error fetching environmental incidents:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch incidents' });
        }
    });
    // Create incident
    router.post('/incidents', async (req, res) => {
        try {
            const validatedData = incidentSchema.parse(req.body);
            const userId = req.user?.id;
            const { project_id } = req.body;
            const result = await (0, database_js_1.query)(`INSERT INTO environmental_incidents 
         (project_id, incident_type, severity, description, location, corrective_actions, reported_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [
                project_id,
                validatedData.incident_type,
                validatedData.severity,
                validatedData.description,
                validatedData.location,
                validatedData.corrective_actions || null,
                userId
            ]);
            auditLogger_js_1.auditLogger.log('environmental_incident_created', userId, {
                incident_id: result.rows[0].id,
                incident_type: validatedData.incident_type,
                severity: validatedData.severity
            });
            res.status(201).json({ success: true, incident: result.rows[0] });
        }
        catch (error) {
            console.error('Error creating environmental incident:', error);
            res.status(500).json({ success: false, error: 'Failed to create incident' });
        }
    });
    // Update incident status
    router.put('/incidents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { status, corrective_actions, resolution_notes } = req.body;
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`UPDATE environmental_incidents
         SET status = $1, 
             corrective_actions = COALESCE($2, corrective_actions),
             resolution_notes = COALESCE($3, resolution_notes),
             resolution_date = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolution_date END,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`, [status, corrective_actions || null, resolution_notes || null, id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Incident not found' });
            }
            auditLogger_js_1.auditLogger.log('environmental_incident_updated', userId, {
                incident_id: id,
                status,
                corrective_actions
            });
            res.json({ success: true, incident: result.rows[0] });
        }
        catch (error) {
            console.error('Error updating environmental incident:', error);
            res.status(500).json({ success: false, error: 'Failed to update incident' });
        }
    });
    // Get permits
    router.get('/permits', async (req, res) => {
        try {
            const { project_id } = req.query;
            let queryText = `
        SELECT * FROM environmental_permits
        WHERE 1=1
      `;
            const params = [];
            if (project_id) {
                params.push(project_id);
                queryText += ` AND project_id = $${params.length}`;
            }
            // Update status based on expiry date
            queryText = `
        WITH updated_permits AS (
          UPDATE environmental_permits
          SET status = CASE 
            WHEN expiry_date < NOW() THEN 'expired'
            WHEN expiry_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
            ELSE 'active'
          END
          WHERE 1=1
          RETURNING *
        )
        SELECT * FROM updated_permits WHERE 1=1
      `;
            if (project_id) {
                queryText += ` AND project_id = $1`;
            }
            queryText += ' ORDER BY expiry_date ASC';
            const result = await (0, database_js_1.query)(queryText, params);
            res.json({ success: true, permits: result.rows });
        }
        catch (error) {
            console.error('Error fetching environmental permits:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch permits' });
        }
    });
    // Generate compliance report
    router.get('/reports/compliance', async (req, res) => {
        try {
            const { project_id, start_date, end_date } = req.query;
            // Get readings summary
            const readingsResult = await (0, database_js_1.query)(`SELECT 
         metric_type,
         COUNT(*) as total_readings,
         AVG(value) as avg_value,
         MAX(value) as max_value,
         MIN(value) as min_value,
         COUNT(CASE WHEN status = 'violation' THEN 1 END) as violations,
         COUNT(CASE WHEN status = 'warning' THEN 1 END) as warnings
         FROM environmental_readings
         WHERE ($1::uuid IS NULL OR project_id = $1)
         AND recorded_at BETWEEN COALESCE($2::date, NOW() - INTERVAL '30 days') AND COALESCE($3::date, NOW())
         GROUP BY metric_type`, [project_id || null, start_date || null, end_date || null]);
            // Get incidents summary
            const incidentsResult = await (0, database_js_1.query)(`SELECT 
         severity,
         COUNT(*) as count,
         COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
         FROM environmental_incidents
         WHERE ($1::uuid IS NULL OR project_id = $1)
         AND reported_at BETWEEN COALESCE($2::date, NOW() - INTERVAL '30 days') AND COALESCE($3::date, NOW())
         GROUP BY severity`, [project_id || null, start_date || null, end_date || null]);
            const report = {
                period: {
                    start: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    end: end_date || new Date().toISOString()
                },
                readings_summary: readingsResult.rows,
                incidents_summary: incidentsResult.rows,
                generated_at: new Date().toISOString()
            };
            res.json({ success: true, report });
        }
        catch (error) {
            console.error('Error generating compliance report:', error);
            res.status(500).json({ success: false, error: 'Failed to generate report' });
        }
    });
    return router;
}
