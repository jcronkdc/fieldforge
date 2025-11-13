"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEquipmentTestingRouter = createEquipmentTestingRouter;
const express_1 = require("express");
const auth_js_1 = require("../../middleware/auth.js");
const database_js_1 = require("../../database.js");
const auditLog_js_1 = require("../../middleware/auditLog.js");
function createEquipmentTestingRouter() {
    const router = (0, express_1.Router)();
    // Apply authentication to all routes
    router.use(auth_js_1.authenticateRequest);
    // GET test results with filtering
    router.get('/', async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            const { range, type } = req.query;
            if (!companyId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            // Calculate date range
            let dateFilter = '';
            const now = new Date();
            if (range === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                dateFilter = `AND et.test_date >= '${weekAgo.toISOString().split('T')[0]}'`;
            }
            else if (range === 'month') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                dateFilter = `AND et.test_date >= '${monthAgo.toISOString().split('T')[0]}'`;
            }
            else if (range === 'quarter') {
                const quarterAgo = new Date(now.setMonth(now.getMonth() - 3));
                dateFilter = `AND et.test_date >= '${quarterAgo.toISOString().split('T')[0]}'`;
            }
            else if (range === 'year') {
                const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                dateFilter = `AND et.test_date >= '${yearAgo.toISOString().split('T')[0]}'`;
            }
            let typeFilter = '';
            if (type && type !== 'all') {
                typeFilter = `AND et.test_type = '${type}'`;
            }
            const queryText = `
        SELECT 
          et.id,
          et.equipment_id,
          e.name as equipment_name,
          e.equipment_code,
          et.test_type,
          et.test_name,
          et.test_date::date as test_date,
          u.raw_user_meta_data->>'full_name' as performed_by,
          et.status,
          et.measurements,
          et.parameters,
          et.notes,
          et.next_test_due::date as next_test_due,
          et.report_url,
          et.created_at
        FROM equipment_tests et
        JOIN equipment e ON et.equipment_id = e.id
        LEFT JOIN auth.users u ON et.performed_by = u.id
        WHERE e.company_id = $1
        ${dateFilter}
        ${typeFilter}
        ORDER BY et.test_date DESC
      `;
            const result = await (0, database_js_1.query)(queryText, [companyId]);
            // Transform data to match frontend expectations
            const transformedResults = result.rows.map(row => ({
                ...row,
                company_id: companyId,
                measurements: row.measurements || [],
                parameters: row.parameters || []
            }));
            res.json(transformedResults);
        }
        catch (error) {
            console.error('[equipment-testing] Error fetching test results:', error);
            res.status(500).json({ error: 'Failed to fetch test results' });
        }
    });
    // GET scheduled tests
    router.get('/schedule', async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            if (!companyId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const queryText = `
        SELECT 
          et.id,
          et.equipment_id,
          e.name as equipment_name,
          et.test_type,
          et.scheduled_date::date as scheduled_date,
          et.frequency,
          et.last_performed::date as last_performed,
          u.raw_user_meta_data->>'full_name' as assigned_to,
          et.priority
        FROM equipment_test_schedule et
        JOIN equipment e ON et.equipment_id = e.id
        LEFT JOIN auth.users u ON et.assigned_to = u.id
        WHERE e.company_id = $1
        AND et.scheduled_date >= CURRENT_DATE
        ORDER BY et.scheduled_date ASC, et.priority DESC
      `;
            const result = await (0, database_js_1.query)(queryText, [companyId]);
            res.json(result.rows);
        }
        catch (error) {
            console.error('[equipment-testing] Error fetching test schedule:', error);
            res.status(500).json({ error: 'Failed to fetch test schedule' });
        }
    });
    // POST new test result
    router.post('/', async (req, res) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            if (!userId || !companyId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { equipment_id, test_type, test_name, test_date, measurements, notes } = req.body;
            // Validate equipment belongs to company
            const equipmentCheck = await (0, database_js_1.query)('SELECT id, name, equipment_code FROM equipment WHERE id = $1 AND company_id = $2', [equipment_id, companyId]);
            if (equipmentCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Equipment not found' });
            }
            const equipment = equipmentCheck.rows[0];
            // Calculate test status based on measurements
            let status = 'pass';
            let hasWarnings = false;
            let hasFails = false;
            if (measurements && Array.isArray(measurements)) {
                measurements.forEach((m) => {
                    if (m.min_acceptable !== null && m.value < m.min_acceptable) {
                        m.status = 'critical';
                        hasFails = true;
                    }
                    else if (m.max_acceptable !== null && m.value > m.max_acceptable) {
                        m.status = 'critical';
                        hasFails = true;
                    }
                    else if ((m.min_acceptable !== null && m.value < m.min_acceptable * 1.1) ||
                        (m.max_acceptable !== null && m.value > m.max_acceptable * 0.9)) {
                        m.status = 'warning';
                        hasWarnings = true;
                    }
                    else {
                        m.status = 'normal';
                    }
                });
                if (hasFails) {
                    status = 'fail';
                }
                else if (hasWarnings) {
                    status = 'warning';
                }
            }
            // Insert test result
            const result = await (0, database_js_1.query)(`INSERT INTO equipment_tests (
          equipment_id, equipment_name, equipment_code,
          test_type, test_name, test_date,
          performed_by, status, measurements,
          notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`, [
                equipment_id,
                equipment.name,
                equipment.equipment_code,
                test_type,
                test_name,
                test_date || new Date().toISOString(),
                userId,
                status,
                JSON.stringify(measurements || []),
                notes,
                userId
            ]);
            // Calculate next test due date based on test type
            const frequencyDays = {
                'daily': 1,
                'weekly': 7,
                'monthly': 30,
                'quarterly': 90,
                'annual': 365
            };
            if (status === 'pass' || status === 'warning') {
                // Schedule next test
                const testFreq = 'monthly'; // Default frequency, should come from equipment config
                const nextDays = frequencyDays[testFreq] || 30;
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + nextDays);
                await (0, database_js_1.query)(`UPDATE equipment_tests 
          SET next_test_due = $1 
          WHERE id = $2`, [nextDate.toISOString(), result.rows[0].id]);
            }
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'test_result_created',
                user_id: userId,
                resource_type: 'equipment_test',
                resource_id: result.rows[0].id,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { equipment_id, test_type, status },
                success: true
            });
            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error('[equipment-testing] Error creating test result:', error);
            res.status(500).json({ error: 'Failed to save test result' });
        }
    });
    // GET test analytics
    router.get('/analytics', async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            const { period = '30' } = req.query;
            if (!companyId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const daysAgo = parseInt(period) || 30;
            const queryText = `
        SELECT 
          COUNT(*) as total_tests,
          COUNT(CASE WHEN status = 'pass' THEN 1 END) as passed,
          COUNT(CASE WHEN status = 'fail' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'warning' THEN 1 END) as warnings,
          test_type,
          DATE_TRUNC('week', test_date) as week
        FROM equipment_tests et
        JOIN equipment e ON et.equipment_id = e.id
        WHERE e.company_id = $1
        AND et.test_date >= CURRENT_DATE - INTERVAL '${daysAgo} days'
        GROUP BY test_type, week
        ORDER BY week DESC
      `;
            const result = await (0, database_js_1.query)(queryText, [companyId]);
            res.json(result.rows);
        }
        catch (error) {
            console.error('[equipment-testing] Error fetching analytics:', error);
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    });
    return router;
}
