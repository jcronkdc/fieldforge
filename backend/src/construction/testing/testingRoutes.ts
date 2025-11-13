import { Router, Request, Response } from 'express';
import { authenticateRequest } from '../../middleware/auth.js';
import { query } from '../../database.js';
import { logAuditEvent } from '../../middleware/auditLog.js';

export function createTestingRouter(): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticateRequest);

  // Get equipment tests (main endpoint)
  router.get('/', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { equipment_id, test_type, status, start_date, end_date } = req.query;

      let queryText = `
        SELECT 
          et.*,
          e.name as equipment_name,
          e.equipment_type,
          u.raw_user_meta_data->>'full_name' as technician_name
        FROM equipment_tests et
        LEFT JOIN equipment e ON et.equipment_id = e.id
        LEFT JOIN auth.users u ON et.performed_by = u.id
        WHERE e.company_id = $1
      `;
      const params: any[] = [companyId];

      if (equipment_id) {
        params.push(equipment_id);
        queryText += ` AND et.equipment_id = $${params.length}`;
      }

      if (test_type) {
        params.push(test_type);
        queryText += ` AND et.test_type = $${params.length}`;
      }

      if (status) {
        params.push(status);
        queryText += ` AND et.status = $${params.length}`;
      }

      if (start_date) {
        params.push(start_date);
        queryText += ` AND et.scheduled_date >= $${params.length}`;
      }

      if (end_date) {
        params.push(end_date);
        queryText += ` AND et.scheduled_date <= $${params.length}`;
      }

      queryText += ` ORDER BY et.scheduled_date ASC, et.created_at DESC`;

      const result = await query(queryText, params);

      // Update overdue status for scheduled tests
      const now = new Date();
      const updatedTests = result.rows.map(test => {
        if (test.status === 'scheduled' && new Date(test.scheduled_date) < now) {
          return { ...test, status: 'overdue' };
        }
        return test;
      });

      res.json({
        success: true,
        data: updatedTests
      });
    } catch (error) {
      console.error('[testing] Error fetching tests:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch tests' });
    }
  });

  // Get test templates
  router.get('/templates', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { equipment_type } = req.query;

      let queryText = `
        SELECT * FROM test_templates 
        WHERE company_id = $1 OR company_id IS NULL
      `;
      const params: any[] = [companyId];

      if (equipment_type) {
        params.push(equipment_type);
        queryText += ` AND equipment_type = $${params.length}`;
      }

      queryText += ` ORDER BY name`;

      const result = await query(queryText, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('[testing] Error fetching templates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch templates' });
    }
  });

  // Create test
  router.post('/tests', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const {
        equipment_id,
        test_type,
        test_name,
        scheduled_date,
        compliance_standard,
        template_id
      } = req.body;

      // Validate required fields
      if (!equipment_id || !test_type || !test_name || !scheduled_date) {
        return res.status(400).json({ 
          success: false, 
          error: 'Equipment, test type, name, and scheduled date are required' 
        });
      }

      await query('BEGIN');

      try {
        // Get equipment details
        const equipmentResult = await query(
          'SELECT name, equipment_type FROM equipment WHERE id = $1',
          [equipment_id]
        );

        if (equipmentResult.rows.length === 0) {
          throw new Error('Equipment not found');
        }

        const equipment = equipmentResult.rows[0];

        // Create test
        const result = await query(
          `INSERT INTO equipment_tests (
            equipment_id, equipment_name, equipment_type,
            test_type, test_name, scheduled_date,
            status, compliance_standard, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            equipment_id,
            equipment.name,
            equipment.equipment_type,
            test_type,
            test_name,
            scheduled_date,
            'scheduled',
            compliance_standard,
            userId
          ]
        );

        // Log audit event
        await logAuditEvent({
          action: 'test_scheduled',
          user_id: userId!,
          resource_type: 'equipment_test',
          resource_id: result.rows[0].id,
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] as string,
          metadata: { equipment_id, test_type, scheduled_date },
          success: true
        });

        await query('COMMIT');

        res.status(201).json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('[testing] Error creating test:', error);
      res.status(500).json({ success: false, error: 'Failed to create test' });
    }
  });

  // Update test
  router.put('/tests/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const {
        status,
        completed_date,
        results,
        notes,
        performed_by
      } = req.body;

      const result = await query(
        `UPDATE equipment_tests 
        SET 
          status = COALESCE($2, status),
          completed_date = COALESCE($3, completed_date),
          results = COALESCE($4, results),
          notes = COALESCE($5, notes),
          performed_by = COALESCE($6, performed_by),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [
          id,
          status,
          completed_date,
          results ? JSON.stringify(results) : undefined,
          notes,
          performed_by || userId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Test not found' });
      }

      // If test completed successfully, schedule next test based on template
      if (status === 'passed' && completed_date) {
        const test = result.rows[0];
        const templateResult = await query(
          `SELECT frequency_days FROM test_templates 
          WHERE equipment_type = $1 AND test_type = $2 
          LIMIT 1`,
          [test.equipment_type, test.test_type]
        );

        if (templateResult.rows.length > 0) {
          const frequencyDays = templateResult.rows[0].frequency_days;
          const nextDate = new Date(completed_date);
          nextDate.setDate(nextDate.getDate() + frequencyDays);

          await query(
            `INSERT INTO equipment_tests (
              equipment_id, equipment_name, equipment_type,
              test_type, test_name, scheduled_date,
              status, compliance_standard, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              test.equipment_id,
              test.equipment_name,
              test.equipment_type,
              test.test_type,
              test.test_name,
              nextDate.toISOString().split('T')[0],
              'scheduled',
              test.compliance_standard,
              userId
            ]
          );
        }
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('[testing] Error updating test:', error);
      res.status(500).json({ success: false, error: 'Failed to update test' });
    }
  });

  // Get test analytics
  router.get('/analytics', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const { start_date, end_date } = req.query;

      // Overall metrics
      const metricsQuery = `
        SELECT 
          COUNT(*) as total_tests,
          COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_tests,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_tests,
          COUNT(CASE WHEN status = 'overdue' OR 
            (status = 'scheduled' AND scheduled_date < CURRENT_DATE) THEN 1 END) as overdue_tests,
          COUNT(CASE WHEN status = 'scheduled' AND scheduled_date >= CURRENT_DATE THEN 1 END) as upcoming_tests,
          COUNT(CASE WHEN compliance_standard IS NOT NULL THEN 1 END) as compliance_tests,
          COUNT(CASE WHEN compliance_standard IS NOT NULL AND status = 'passed' THEN 1 END) as passed_compliance_tests
        FROM equipment_tests et
        JOIN equipment e ON et.equipment_id = e.id
        WHERE e.company_id = $1
          ${start_date ? `AND et.scheduled_date >= $2` : ''}
          ${end_date ? `AND et.scheduled_date <= $${end_date && start_date ? 3 : 2}` : ''}
      `;
      
      const metricsParams: any[] = [companyId];
      if (start_date) metricsParams.push(start_date as string);
      if (end_date) metricsParams.push(end_date as string);

      const metricsResult = await query(metricsQuery, metricsParams);
      const metrics = metricsResult.rows[0];

      // Calculate rates
      const completedTests = Number(metrics.passed_tests) + Number(metrics.failed_tests);
      const passRate = completedTests > 0 
        ? (Number(metrics.passed_tests) / completedTests) * 100 
        : 0;
      const complianceRate = Number(metrics.compliance_tests) > 0
        ? (Number(metrics.passed_compliance_tests) / Number(metrics.compliance_tests)) * 100
        : 0;

      // Tests by type
      const typeQuery = `
        SELECT 
          test_type,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM equipment_tests et
        JOIN equipment e ON et.equipment_id = e.id
        WHERE e.company_id = $1
          ${start_date ? `AND et.scheduled_date >= $2` : ''}
          ${end_date ? `AND et.scheduled_date <= $${end_date && start_date ? 3 : 2}` : ''}
        GROUP BY test_type
        ORDER BY total DESC
      `;

      const typeResult = await query(typeQuery, metricsParams);

      res.json({
        success: true,
        data: {
          totalTests: Number(metrics.total_tests),
          passRate,
          overdueCount: Number(metrics.overdue_tests),
          upcomingCount: Number(metrics.upcoming_tests),
          complianceRate,
          testsByType: typeResult.rows.map(row => ({
            type: row.test_type,
            count: Number(row.total),
            passRate: Number(row.total) > 0 
              ? (Number(row.passed) / (Number(row.passed) + Number(row.failed))) * 100 
              : 0
          }))
        }
      });
    } catch (error) {
      console.error('[testing] Error fetching analytics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  });

  // Get equipment test history
  router.get('/equipment/:id/history', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT 
          et.*,
          u.raw_user_meta_data->>'full_name' as technician_name
        FROM equipment_tests et
        LEFT JOIN auth.users u ON et.performed_by = u.id
        WHERE et.equipment_id = $1
        ORDER BY et.scheduled_date DESC, et.created_at DESC
        LIMIT 50`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('[testing] Error fetching equipment history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
  });

  // Create test template
  router.post('/templates', async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.company_id;
      const {
        name,
        equipment_type,
        test_type,
        frequency_days,
        parameters,
        compliance_standard
      } = req.body;

      const result = await query(
        `INSERT INTO test_templates (
          company_id, name, equipment_type, test_type,
          frequency_days, parameters, compliance_standard
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          companyId,
          name,
          equipment_type,
          test_type,
          frequency_days,
          JSON.stringify(parameters || []),
          compliance_standard
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('[testing] Error creating template:', error);
      res.status(500).json({ success: false, error: 'Failed to create template' });
    }
  });

  return router;
}
