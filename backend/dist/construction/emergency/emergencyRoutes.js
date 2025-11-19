"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmergencyRouter = createEmergencyRouter;
const express_1 = require("express");
const database_js_1 = require("../../database.js");
const zod_1 = require("zod");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
// Validation schemas
const alertSchema = zod_1.z.object({
    alert_type: zod_1.z.enum(['info', 'warning', 'danger', 'evacuation']),
    title: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
    location: zod_1.z.string().optional(),
    affected_zones: zod_1.z.array(zod_1.z.string()).optional(),
    assembly_point: zod_1.z.string().optional(),
    expires_at: zod_1.z.string().optional(),
    requires_acknowledgment: zod_1.z.boolean().default(true),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    delivery_channels: zod_1.z.array(zod_1.z.enum(['app', 'sms', 'email', 'siren'])).default(['app']),
    coordinates: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).optional(),
    affected_crews: zod_1.z.array(zod_1.z.string()).optional(),
    instructions: zod_1.z.array(zod_1.z.string()).optional(),
    contact_number: zod_1.z.string().optional()
});
const acknowledgmentSchema = zod_1.z.object({
    alert_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid().optional(),
    user_location: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).optional(),
    response: zod_1.z.enum(['safe', 'need_help', 'evacuating']).optional(),
    notes: zod_1.z.string().optional()
});
function createEmergencyRouter() {
    const router = (0, express_1.Router)();
    // Get active alerts
    router.get('/alerts/active', async (req, res) => {
        try {
            const result = await (0, database_js_1.query)(`SELECT ea.*, u.email as issued_by_email,
         COUNT(DISTINCT ack.id) as acknowledgment_count,
         COUNT(DISTINCT CASE WHEN ack.response = 'need_help' THEN ack.id END) as need_help_count
         FROM emergency_alerts ea
         LEFT JOIN auth.users u ON ea.issued_by = u.id
         LEFT JOIN emergency_acknowledgments ack ON ea.id = ack.alert_id
         WHERE ea.expires_at > NOW() OR ea.expires_at IS NULL
         GROUP BY ea.id, u.email
         ORDER BY ea.priority = 'critical' DESC, ea.issued_at DESC`);
            res.json({
                success: true,
                alerts: result.rows.map(alert => ({
                    ...alert,
                    affected_zones: alert.affected_zones || [],
                    affected_crews: alert.affected_crews || [],
                    instructions: alert.instructions || [],
                    delivery_channels: alert.delivery_channels || ['app']
                }))
            });
        }
        catch (error) {
            console.error('Error fetching active alerts:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch active alerts' });
        }
    });
    // Get alert history
    router.get('/alerts/history', async (req, res) => {
        try {
            const { limit = 50 } = req.query;
            const result = await (0, database_js_1.query)(`SELECT ea.*, u.email as issued_by_email,
         COUNT(DISTINCT ack.id) as acknowledgment_count
         FROM emergency_alerts ea
         LEFT JOIN auth.users u ON ea.issued_by = u.id
         LEFT JOIN emergency_acknowledgments ack ON ea.id = ack.alert_id
         WHERE ea.expires_at < NOW() OR ea.status = 'resolved'
         GROUP BY ea.id, u.email
         ORDER BY ea.issued_at DESC
         LIMIT $1`, [parseInt(limit) || 50]);
            res.json({
                success: true,
                alerts: result.rows.map(alert => ({
                    ...alert,
                    affected_zones: alert.affected_zones || [],
                    affected_crews: alert.affected_crews || [],
                    instructions: alert.instructions || [],
                    delivery_channels: alert.delivery_channels || ['app']
                }))
            });
        }
        catch (error) {
            console.error('Error fetching alert history:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch alert history' });
        }
    });
    // Get user's acknowledgments
    router.get('/alerts/acknowledgments', async (req, res) => {
        try {
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`SELECT * FROM emergency_acknowledgments
         WHERE user_id = $1
         ORDER BY acknowledged_at DESC`, [userId]);
            res.json({ success: true, acknowledgments: result.rows });
        }
        catch (error) {
            console.error('Error fetching acknowledgments:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch acknowledgments' });
        }
    });
    // Broadcast new alert
    router.post('/alerts', async (req, res) => {
        try {
            const validatedData = alertSchema.parse(req.body);
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`INSERT INTO emergency_alerts (
          alert_type, title, message, location, affected_zones, assembly_point,
          issued_by, expires_at, requires_acknowledgment, priority,
          delivery_channels, coordinates, affected_crews, instructions, contact_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`, [
                validatedData.alert_type,
                validatedData.title,
                validatedData.message,
                validatedData.location || null,
                validatedData.affected_zones || [],
                validatedData.assembly_point || null,
                userId,
                validatedData.expires_at || null,
                validatedData.requires_acknowledgment,
                validatedData.priority,
                validatedData.delivery_channels,
                validatedData.coordinates ? JSON.stringify(validatedData.coordinates) : null,
                validatedData.affected_crews || [],
                validatedData.instructions || [],
                validatedData.contact_number || null
            ]);
            const alert = result.rows[0];
            // Get recipients based on affected zones and crews
            const recipientQuery = await (0, database_js_1.query)(`
        SELECT DISTINCT up.email, up.phone
        FROM user_profiles up
        WHERE up.company_id = $1
        AND (
          up.role IN ('admin', 'safety_manager')
          OR up.id IN (
            SELECT user_id FROM crew_members
            WHERE crew_id = ANY($2::uuid[])
          )
        )
      `, [req.user?.company_id, validatedData.affected_crews || []]);
            const recipients = recipientQuery.rows;
            // Trigger notifications based on delivery channels
            if (validatedData.delivery_channels.includes('sms')) {
                // Send SMS alerts
                const phoneNumbers = recipients
                    .map((r) => r.phone)
                    .filter((phone) => !!phone);
                if (phoneNumbers.length > 0) {
                    try {
                        const { sendEmergencySMS } = await import('../../sms/smsService.js');
                        await sendEmergencySMS(phoneNumbers, {
                            type: validatedData.alert_type,
                            location: validatedData.location,
                            description: validatedData.message,
                            reportedBy: `User ${userId || 'Unknown'}`
                        });
                    }
                    catch (smsError) {
                        console.error('[emergency] Failed to send SMS alerts:', smsError);
                    }
                }
            }
            if (validatedData.delivery_channels.includes('email')) {
                // Send email alerts
                const emails = recipients
                    .map((r) => r.email)
                    .filter((email) => !!email);
                if (emails.length > 0) {
                    try {
                        const { sendEmergencyEmail } = await import('../../sms/smsService.js');
                        await sendEmergencyEmail(emails, {
                            type: validatedData.alert_type,
                            location: validatedData.location,
                            description: validatedData.message,
                            reportedBy: `User ${userId || 'Unknown'}`,
                            severity: validatedData.priority
                        });
                    }
                    catch (emailError) {
                        console.error('[emergency] Failed to send email alerts:', emailError);
                    }
                }
            }
            if (validatedData.delivery_channels.includes('siren')) {
                // Physical siren integration (optional - requires hardware)
                if (process.env.SIREN_API_ENDPOINT) {
                    try {
                        await fetch(process.env.SIREN_API_ENDPOINT, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                alert_type: validatedData.alert_type,
                                location: validatedData.location,
                                priority: validatedData.priority
                            })
                        });
                    }
                    catch (sirenError) {
                        console.error('[emergency] Failed to trigger siren:', sirenError);
                    }
                }
            }
            // Broadcast to real-time subscribers
            // In production, this would use WebSockets or Server-Sent Events
            auditLogger_js_1.auditLogger.log('emergency_alert_broadcast', userId, {
                alert_id: alert.id,
                alert_type: validatedData.alert_type,
                priority: validatedData.priority,
                title: validatedData.title
            });
            res.status(201).json({ success: true, alert });
        }
        catch (error) {
            console.error('Error broadcasting alert:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to broadcast alert' });
        }
    });
    // Acknowledge alert
    router.post('/alerts/acknowledge', async (req, res) => {
        try {
            const validatedData = acknowledgmentSchema.parse(req.body);
            const userId = validatedData.user_id || req.user?.id;
            // Check if already acknowledged
            const existing = await (0, database_js_1.query)('SELECT id FROM emergency_acknowledgments WHERE alert_id = $1 AND user_id = $2', [validatedData.alert_id, userId]);
            if (existing.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Alert already acknowledged'
                });
            }
            const result = await (0, database_js_1.query)(`INSERT INTO emergency_acknowledgments (
          alert_id, user_id, user_location, response, notes
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`, [
                validatedData.alert_id,
                userId,
                validatedData.user_location ? JSON.stringify(validatedData.user_location) : null,
                validatedData.response || null,
                validatedData.notes || null
            ]);
            auditLogger_js_1.auditLogger.log('emergency_alert_acknowledged', userId, {
                alert_id: validatedData.alert_id,
                response: validatedData.response
            });
            res.json({ success: true, acknowledgment: result.rows[0] });
        }
        catch (error) {
            console.error('Error acknowledging alert:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to acknowledge alert' });
        }
    });
    // Update alert status
    router.put('/alerts/:id/status', async (req, res) => {
        try {
            const { id } = req.params;
            const { status, resolution_notes } = req.body;
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`UPDATE emergency_alerts
         SET status = $1,
             resolution_notes = $2,
             resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END,
             resolved_by = CASE WHEN $1 = 'resolved' THEN $3 ELSE resolved_by END,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`, [status, resolution_notes || null, userId, id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Alert not found' });
            }
            auditLogger_js_1.auditLogger.log('emergency_alert_updated', userId, {
                alert_id: id,
                status,
                resolution_notes
            });
            res.json({ success: true, alert: result.rows[0] });
        }
        catch (error) {
            console.error('Error updating alert status:', error);
            res.status(500).json({ success: false, error: 'Failed to update alert' });
        }
    });
    // Get acknowledgment statistics
    router.get('/alerts/:id/stats', async (req, res) => {
        try {
            const { id } = req.params;
            const stats = await (0, database_js_1.query)(`SELECT 
         COUNT(DISTINCT u.id) as total_recipients,
         COUNT(DISTINCT ack.user_id) as acknowledged_count,
         COUNT(DISTINCT CASE WHEN ack.response = 'safe' THEN ack.user_id END) as safe_count,
         COUNT(DISTINCT CASE WHEN ack.response = 'evacuating' THEN ack.user_id END) as evacuating_count,
         COUNT(DISTINCT CASE WHEN ack.response = 'need_help' THEN ack.user_id END) as need_help_count,
         AVG(EXTRACT(EPOCH FROM (ack.acknowledged_at - ea.issued_at))) as avg_response_time_seconds
         FROM emergency_alerts ea
         CROSS JOIN auth.users u
         LEFT JOIN emergency_acknowledgments ack ON ea.id = ack.alert_id AND u.id = ack.user_id
         WHERE ea.id = $1
         GROUP BY ea.id`, [id]);
            res.json({ success: true, stats: stats.rows[0] || {} });
        }
        catch (error) {
            console.error('Error fetching alert stats:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
        }
    });
    // Test alert system (development only)
    if (process.env.NODE_ENV !== 'production') {
        router.post('/alerts/test', async (req, res) => {
            try {
                const testAlert = {
                    alert_type: 'warning',
                    title: 'Test Alert - Please Ignore',
                    message: 'This is a test of the emergency alert system. No action required.',
                    priority: 'low',
                    requires_acknowledgment: false,
                    delivery_channels: ['app'],
                    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
                };
                const validatedData = alertSchema.parse(testAlert);
                const userId = req.user?.id;
                const result = await (0, database_js_1.query)(`INSERT INTO emergency_alerts (
            alert_type, title, message, issued_by, expires_at,
            requires_acknowledgment, priority, delivery_channels
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`, [
                    validatedData.alert_type,
                    validatedData.title,
                    validatedData.message,
                    userId,
                    validatedData.expires_at,
                    validatedData.requires_acknowledgment,
                    validatedData.priority,
                    validatedData.delivery_channels
                ]);
                res.json({ success: true, alert: result.rows[0] });
            }
            catch (error) {
                console.error('Error creating test alert:', error);
                res.status(500).json({ success: false, error: 'Failed to create test alert' });
            }
        });
    }
    return router;
}
