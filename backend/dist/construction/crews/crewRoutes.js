"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCrewRouter = createCrewRouter;
const express_1 = require("express");
const auth_js_1 = require("../../middleware/auth.js");
const database_js_1 = require("../../database.js");
const auditLog_js_1 = require("../../middleware/auditLog.js");
function createCrewRouter() {
    const router = (0, express_1.Router)();
    // ============================================================================
    // CREW MANAGEMENT - COMPLETE E2E FUNCTIONALITY
    // ============================================================================
    // GET all crews with members and certifications
    router.get('/', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const companyId = req.user?.company_id || req.headers['x-company-id'];
            const { status, project_id, certification_type } = req.query;
            let queryText = `
        SELECT 
          c.*,
          p.name as current_project_name,
          COUNT(DISTINCT cm.user_id) as member_count,
          STRING_AGG(DISTINCT cert.certification_type, ', ') as certifications
        FROM crews c
        LEFT JOIN projects p ON c.current_project_id = p.id
        LEFT JOIN crew_members cm ON cm.crew_id = c.id AND cm.status = 'active'
        LEFT JOIN user_certifications cert ON cert.user_id = cm.user_id AND cert.is_valid = true
        WHERE c.company_id = $1
      `;
            const params = [companyId];
            let paramIndex = 2;
            if (status) {
                queryText += ` AND c.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }
            if (project_id) {
                queryText += ` AND c.current_project_id = $${paramIndex}`;
                params.push(project_id);
                paramIndex++;
            }
            queryText += ` GROUP BY c.id, p.name ORDER BY c.name`;
            const result = await (0, database_js_1.query)(queryText, params);
            res.json({
                crews: result.rows,
                total: result.rowCount || 0
            });
        }
        catch (error) {
            console.error('[crews] Error fetching crews:', error);
            res.status(500).json({ error: 'Failed to fetch crews' });
        }
    });
    // CREATE new crew
    router.post('/', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id || req.headers['x-company-id'];
            const { name, crew_type, description, lead_user_id, current_project_id } = req.body;
            if (!name || !crew_type) {
                return res.status(400).json({
                    error: 'Missing required fields: name, crew_type'
                });
            }
            await (0, database_js_1.query)('BEGIN');
            try {
                // Create crew
                const crewResult = await (0, database_js_1.query)(`INSERT INTO crews 
           (name, crew_type, description, lead_user_id, current_project_id, 
            company_id, created_by, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
           RETURNING *`, [name, crew_type, description, lead_user_id, current_project_id,
                    companyId, userId]);
                const crew = crewResult.rows[0];
                // Add lead as first member if specified
                if (lead_user_id) {
                    await (0, database_js_1.query)(`INSERT INTO crew_members 
             (crew_id, user_id, role, joined_date, status)
             VALUES ($1, $2, 'lead', NOW(), 'active')`, [crew.id, lead_user_id]);
                }
                await (0, auditLog_js_1.logAuditEvent)({
                    action: 'crew_created',
                    user_id: userId,
                    resource_type: 'crew',
                    resource_id: crew.id,
                    ip_address: req.ip || '',
                    user_agent: req.headers['user-agent'],
                    metadata: { name, crew_type },
                    success: true
                });
                await (0, database_js_1.query)('COMMIT');
                res.status(201).json(crew);
            }
            catch (error) {
                await (0, database_js_1.query)('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('[crews] Error creating crew:', error);
            res.status(500).json({ error: 'Failed to create crew' });
        }
    });
    // GET crew members with certifications
    router.get('/:id/members', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const membersQuery = `
        SELECT 
          cm.*,
          u.email,
          u.raw_user_meta_data->>'full_name' as full_name,
          u.raw_user_meta_data->>'phone' as phone,
          u.raw_user_meta_data->>'emergency_contact' as emergency_contact,
          array_agg(
            DISTINCT jsonb_build_object(
              'type', uc.certification_type,
              'number', uc.certification_number,
              'issued_date', uc.issued_date,
              'expiry_date', uc.expiry_date,
              'is_valid', uc.is_valid
            )
          ) FILTER (WHERE uc.certification_type IS NOT NULL) as certifications,
          COALESCE(te.hours_today, 0) as hours_today,
          COALESCE(te.hours_week, 0) as hours_this_week
        FROM crew_members cm
        JOIN auth.users u ON cm.user_id = u.id
        LEFT JOIN user_certifications uc ON uc.user_id = cm.user_id
        LEFT JOIN LATERAL (
          SELECT 
            SUM(CASE WHEN date = CURRENT_DATE THEN hours_regular + hours_overtime ELSE 0 END) as hours_today,
            SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN hours_regular + hours_overtime ELSE 0 END) as hours_week
          FROM time_entries
          WHERE user_id = cm.user_id
        ) te ON true
        WHERE cm.crew_id = $1 AND cm.status = 'active'
        GROUP BY cm.id, cm.crew_id, cm.user_id, cm.role, cm.joined_date, 
                 cm.status, u.email, u.raw_user_meta_data, te.hours_today, te.hours_week
        ORDER BY cm.role = 'lead' DESC, cm.joined_date
      `;
            const result = await (0, database_js_1.query)(membersQuery, [id]);
            res.json({
                members: result.rows,
                total: result.rowCount || 0
            });
        }
        catch (error) {
            console.error('[crews] Error fetching crew members:', error);
            res.status(500).json({ error: 'Failed to fetch crew members' });
        }
    });
    // ADD member to crew
    router.post('/:id/members', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const { user_id, role = 'member' } = req.body;
            if (!user_id) {
                return res.status(400).json({ error: 'user_id is required' });
            }
            // Check if already a member
            const existing = await (0, database_js_1.query)('SELECT id FROM crew_members WHERE crew_id = $1 AND user_id = $2 AND status = $3', [id, user_id, 'active']);
            if (existing.rowCount > 0) {
                return res.status(409).json({ error: 'User is already a member of this crew' });
            }
            const result = await (0, database_js_1.query)(`INSERT INTO crew_members 
         (crew_id, user_id, role, joined_date, status)
         VALUES ($1, $2, $3, NOW(), 'active')
         RETURNING *`, [id, user_id, role]);
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            console.error('[crews] Error adding crew member:', error);
            res.status(500).json({ error: 'Failed to add crew member' });
        }
    });
    // GET crew availability/schedule
    router.get('/:id/availability', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const { date_from = new Date(), date_to } = req.query;
            const endDate = date_to || new Date(new Date(date_from).getTime() + 30 * 24 * 60 * 60 * 1000);
            const availabilityQuery = `
        WITH crew_schedule AS (
          SELECT 
            cm.user_id,
            u.raw_user_meta_data->>'full_name' as member_name,
            ps.project_id,
            p.name as project_name,
            ps.start_date,
            ps.end_date
          FROM crew_members cm
          JOIN auth.users u ON cm.user_id = u.id
          LEFT JOIN project_schedule ps ON ps.crew_id = cm.crew_id
          LEFT JOIN projects p ON ps.project_id = p.id
          WHERE cm.crew_id = $1 
          AND cm.status = 'active'
          AND ps.start_date <= $3
          AND ps.end_date >= $2
        )
        SELECT * FROM crew_schedule
        ORDER BY start_date
      `;
            const result = await (0, database_js_1.query)(availabilityQuery, [id, date_from, endDate]);
            // Calculate availability percentages
            const totalMembers = await (0, database_js_1.query)('SELECT COUNT(*) as total FROM crew_members WHERE crew_id = $1 AND status = $2', [id, 'active']);
            res.json({
                schedule: result.rows,
                availability: {
                    total_members: parseInt(totalMembers.rows[0].total),
                    scheduled: result.rowCount || 0,
                    available: parseInt(totalMembers.rows[0].total) - (result.rowCount || 0)
                }
            });
        }
        catch (error) {
            console.error('[crews] Error fetching crew availability:', error);
            res.status(500).json({ error: 'Failed to fetch crew availability' });
        }
    });
    // GET crew certifications summary
    router.get('/:id/certifications', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const certQuery = `
        SELECT 
          uc.certification_type,
          COUNT(DISTINCT uc.user_id) as certified_count,
          COUNT(DISTINCT CASE WHEN uc.expiry_date < NOW() + INTERVAL '30 days' THEN uc.user_id END) as expiring_soon,
          COUNT(DISTINCT CASE WHEN uc.expiry_date < NOW() THEN uc.user_id END) as expired,
          MIN(uc.expiry_date) as earliest_expiry
        FROM crew_members cm
        JOIN user_certifications uc ON uc.user_id = cm.user_id
        WHERE cm.crew_id = $1 AND cm.status = 'active'
        GROUP BY uc.certification_type
        ORDER BY certified_count DESC
      `;
            const result = await (0, database_js_1.query)(certQuery, [id]);
            const totalMembers = await (0, database_js_1.query)('SELECT COUNT(*) as total FROM crew_members WHERE crew_id = $1 AND status = $2', [id, 'active']);
            res.json({
                certifications: result.rows,
                crew_size: parseInt(totalMembers.rows[0].total),
                summary: {
                    total_cert_types: result.rowCount || 0,
                    members_with_expired: result.rows.reduce((sum, r) => sum + parseInt(r.expired), 0),
                    members_expiring_soon: result.rows.reduce((sum, r) => sum + parseInt(r.expiring_soon), 0)
                }
            });
        }
        catch (error) {
            console.error('[crews] Error fetching crew certifications:', error);
            res.status(500).json({ error: 'Failed to fetch crew certifications' });
        }
    });
    // ASSIGN crew to project
    router.post('/:id/assign', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const { project_id, start_date, end_date } = req.body;
            if (!project_id || !start_date) {
                return res.status(400).json({
                    error: 'Missing required fields: project_id, start_date'
                });
            }
            await (0, database_js_1.query)('BEGIN');
            try {
                // Update crew's current project
                await (0, database_js_1.query)(`UPDATE crews 
           SET current_project_id = $1, updated_at = NOW()
           WHERE id = $2`, [project_id, id]);
                // Create schedule entry
                await (0, database_js_1.query)(`INSERT INTO project_schedule
           (project_id, crew_id, start_date, end_date, created_by)
           VALUES ($1, $2, $3, $4, $5)`, [project_id, id, start_date, end_date || null, req.user?.id]);
                await (0, database_js_1.query)('COMMIT');
                res.json({
                    message: 'Crew assigned successfully',
                    crew_id: id,
                    project_id
                });
            }
            catch (error) {
                await (0, database_js_1.query)('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('[crews] Error assigning crew:', error);
            res.status(500).json({ error: 'Failed to assign crew to project' });
        }
    });
    // UPDATE crew details
    router.put('/:id', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, lead_user_id, status } = req.body;
            const updates = [];
            const values = [];
            let paramIndex = 1;
            if (name !== undefined) {
                updates.push(`name = $${paramIndex}`);
                values.push(name);
                paramIndex++;
            }
            if (description !== undefined) {
                updates.push(`description = $${paramIndex}`);
                values.push(description);
                paramIndex++;
            }
            if (lead_user_id !== undefined) {
                updates.push(`lead_user_id = $${paramIndex}`);
                values.push(lead_user_id);
                paramIndex++;
            }
            if (status !== undefined) {
                updates.push(`status = $${paramIndex}`);
                values.push(status);
                paramIndex++;
            }
            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            updates.push('updated_at = NOW()');
            values.push(id);
            const result = await (0, database_js_1.query)(`UPDATE crews SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Crew not found' });
            }
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error('[crews] Error updating crew:', error);
            res.status(500).json({ error: 'Failed to update crew' });
        }
    });
    return router;
}
