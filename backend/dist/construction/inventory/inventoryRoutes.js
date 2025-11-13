"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryRouter = createInventoryRouter;
const express_1 = require("express");
const auth_js_1 = require("../../middleware/auth.js");
const database_js_1 = require("../../database.js");
const auditLog_js_1 = require("../../middleware/auditLog.js");
function createInventoryRouter() {
    const router = (0, express_1.Router)();
    // ============================================================================
    // MATERIAL INVENTORY MANAGEMENT ENDPOINTS - COMPLETE E2E
    // ============================================================================
    // GET materials with filters
    router.get('/materials', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            const { category, search, low_stock } = req.query;
            let queryText = `
        SELECT 
          m.*,
          CASE 
            WHEN m.quantity_in_stock = 0 THEN 'out_of_stock'
            WHEN m.quantity_in_stock < m.minimum_stock THEN 'low_stock'
            WHEN m.quantity_in_stock > m.maximum_stock THEN 'overstocked'
            ELSE 'in_stock'
          END as stock_status
        FROM material_inventory m
        WHERE m.company_id = $1
      `;
            const params = [companyId];
            let paramIndex = 2;
            if (category && category !== 'all') {
                queryText += ` AND m.category = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }
            if (search) {
                queryText += ` AND (m.name ILIKE $${paramIndex} OR m.supplier ILIKE $${paramIndex} OR m.supplier_part_number ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }
            if (low_stock === 'true') {
                queryText += ` AND m.quantity_in_stock < m.minimum_stock`;
            }
            queryText += ` ORDER BY m.name`;
            const result = await (0, database_js_1.query)(queryText, params);
            res.json({ materials: result.rows });
        }
        catch (error) {
            console.error('[inventory] Error fetching materials:', error);
            res.status(500).json({ error: 'Failed to fetch materials' });
        }
    });
    // CREATE new material
    router.post('/materials', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            const companyId = req.user?.company_id;
            const { name, category, unit, quantity_in_stock, minimum_stock, maximum_stock, unit_cost, supplier, supplier_part_number, location, notes } = req.body;
            // Validate required fields
            if (!name || !category || !unit || !supplier || !location) {
                return res.status(400).json({
                    error: 'Missing required fields: name, category, unit, supplier, location'
                });
            }
            const result = await (0, database_js_1.query)(`INSERT INTO material_inventory 
         (name, category, unit, quantity_in_stock, minimum_stock, maximum_stock,
          unit_cost, supplier, supplier_part_number, location, notes, company_id,
          last_restocked, last_used)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         RETURNING *`, [name, category, unit, quantity_in_stock || 0, minimum_stock || 0,
                maximum_stock || 0, unit_cost || 0, supplier, supplier_part_number,
                location, notes, companyId]);
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'material_created',
                user_id: userId,
                resource_type: 'material',
                resource_id: result.rows[0].id,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { name, category, initial_stock: quantity_in_stock },
                success: true
            });
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            console.error('[inventory] Error creating material:', error);
            res.status(500).json({ error: 'Failed to create material' });
        }
    });
    // UPDATE material
    router.put('/materials/:id', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const updates = [];
            const values = [];
            let paramIndex = 1;
            // Build dynamic update query
            const allowedUpdates = [
                'name', 'category', 'unit', 'minimum_stock', 'maximum_stock',
                'unit_cost', 'supplier', 'supplier_part_number', 'location', 'notes'
            ];
            for (const field of allowedUpdates) {
                if (req.body[field] !== undefined) {
                    updates.push(`${field} = $${paramIndex}`);
                    values.push(req.body[field]);
                    paramIndex++;
                }
            }
            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            values.push(id);
            const updateQuery = `
        UPDATE material_inventory 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;
            const result = await (0, database_js_1.query)(updateQuery, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Material not found' });
            }
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error('[inventory] Error updating material:', error);
            res.status(500).json({ error: 'Failed to update material' });
        }
    });
    // DELETE material
    router.delete('/materials/:id', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await (0, database_js_1.query)('DELETE FROM material_inventory WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Material not found' });
            }
            res.json({ message: 'Material deleted successfully' });
        }
        catch (error) {
            console.error('[inventory] Error deleting material:', error);
            res.status(500).json({ error: 'Failed to delete material' });
        }
    });
    // GET stock movements
    router.get('/movements', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            const { material_id, type, limit = 50, offset = 0 } = req.query;
            let queryText = `
        SELECT 
          sm.*,
          m.name as material_name,
          u.raw_user_meta_data->>'full_name' as performed_by
        FROM stock_movements sm
        JOIN material_inventory m ON sm.material_id = m.id
        LEFT JOIN auth.users u ON sm.performed_by = u.id
        WHERE m.company_id = $1
      `;
            const params = [companyId];
            let paramIndex = 2;
            if (material_id) {
                queryText += ` AND sm.material_id = $${paramIndex}`;
                params.push(material_id);
                paramIndex++;
            }
            if (type) {
                queryText += ` AND sm.type = $${paramIndex}`;
                params.push(type);
                paramIndex++;
            }
            queryText += ` ORDER BY sm.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);
            const result = await (0, database_js_1.query)(queryText, params);
            res.json({ movements: result.rows });
        }
        catch (error) {
            console.error('[inventory] Error fetching movements:', error);
            res.status(500).json({ error: 'Failed to fetch stock movements' });
        }
    });
    // CREATE stock movement
    router.post('/movements', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            const { material_id, type, quantity, reason, reference_number } = req.body;
            // Validate
            if (!material_id || !type || !quantity || !reason) {
                return res.status(400).json({
                    error: 'Missing required fields: material_id, type, quantity, reason'
                });
            }
            await (0, database_js_1.query)('BEGIN');
            try {
                // Record movement
                const movementResult = await (0, database_js_1.query)(`INSERT INTO stock_movements 
           (material_id, type, quantity, reason, reference_number, performed_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`, [material_id, type, quantity, reason, reference_number, userId]);
                // Update material stock
                let stockUpdateQuery;
                if (type === 'in') {
                    stockUpdateQuery = `
            UPDATE material_inventory 
            SET quantity_in_stock = quantity_in_stock + $1,
                last_restocked = NOW()
            WHERE id = $2
            RETURNING *
          `;
                }
                else if (type === 'out') {
                    stockUpdateQuery = `
            UPDATE material_inventory 
            SET quantity_in_stock = GREATEST(0, quantity_in_stock - $1),
                last_used = NOW()
            WHERE id = $2
            RETURNING *
          `;
                }
                else { // adjustment
                    stockUpdateQuery = `
            UPDATE material_inventory 
            SET quantity_in_stock = GREATEST(0, quantity_in_stock + $1)
            WHERE id = $2
            RETURNING *
          `;
                }
                const materialResult = await (0, database_js_1.query)(stockUpdateQuery, [
                    type === 'out' ? quantity : (type === 'adjustment' ? quantity : quantity),
                    material_id
                ]);
                // Log if low stock
                const material = materialResult.rows[0];
                if (material && material.quantity_in_stock < material.minimum_stock) {
                    await (0, auditLog_js_1.logAuditEvent)({
                        action: 'low_stock_alert',
                        user_id: userId,
                        resource_type: 'material',
                        resource_id: material_id,
                        ip_address: req.ip || '',
                        user_agent: req.headers['user-agent'],
                        metadata: {
                            material_name: material.name,
                            current_stock: material.quantity_in_stock,
                            minimum_stock: material.minimum_stock
                        },
                        success: true
                    });
                }
                await (0, database_js_1.query)('COMMIT');
                res.status(201).json({
                    movement: movementResult.rows[0],
                    material: material
                });
            }
            catch (error) {
                await (0, database_js_1.query)('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('[inventory] Error recording movement:', error);
            res.status(500).json({ error: 'Failed to record stock movement' });
        }
    });
    // GET low stock alert
    router.get('/low-stock', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            const result = await (0, database_js_1.query)(`SELECT 
          m.*,
          (m.quantity_in_stock::float / NULLIF(m.minimum_stock, 0) * 100) as stock_percentage
         FROM material_inventory m
         WHERE m.company_id = $1 
           AND m.quantity_in_stock < m.minimum_stock
         ORDER BY stock_percentage ASC`, [companyId]);
            res.json({
                low_stock_items: result.rows,
                total_count: result.rowCount || 0
            });
        }
        catch (error) {
            console.error('[inventory] Error fetching low stock:', error);
            res.status(500).json({ error: 'Failed to fetch low stock items' });
        }
    });
    // GET inventory value report
    router.get('/value-report', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const companyId = req.user?.company_id;
            const result = await (0, database_js_1.query)(`SELECT 
          category,
          COUNT(*) as item_count,
          SUM(quantity_in_stock) as total_units,
          SUM(quantity_in_stock * unit_cost) as total_value,
          AVG(quantity_in_stock * unit_cost) as avg_value_per_item
         FROM material_inventory
         WHERE company_id = $1
         GROUP BY category
         ORDER BY total_value DESC`, [companyId]);
            const totalValue = result.rows.reduce((sum, row) => sum + parseFloat(row.total_value || 0), 0);
            res.json({
                categories: result.rows,
                total_inventory_value: totalValue,
                report_date: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('[inventory] Error generating value report:', error);
            res.status(500).json({ error: 'Failed to generate value report' });
        }
    });
    return router;
}
