"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchedulingRouter = createSchedulingRouter;
const express_1 = require("express");
const auth_js_1 = require("../../middleware/auth.js");
const database_js_1 = require("../../database.js");
const auditLog_js_1 = require("../../middleware/auditLog.js");
function createSchedulingRouter() {
    const router = (0, express_1.Router)();
    // ============================================================================
    // PROJECT SCHEDULING - GANTT CHARTS & CALENDARS
    // ============================================================================
    // GET project schedule with tasks and milestones
    router.get('/projects/:projectId/schedule', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { projectId } = req.params;
            // Get project details for date range
            const projectResult = await (0, database_js_1.query)('SELECT name, start_date, end_date FROM projects WHERE id = $1', [projectId]);
            if (projectResult.rowCount === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }
            const project = projectResult.rows[0];
            // Get all schedule tasks
            const tasksResult = await (0, database_js_1.query)(`SELECT 
          st.*,
          parent.name as parent_task_name,
          array_agg(DISTINCT dep.depends_on_task_id) FILTER (WHERE dep.depends_on_task_id IS NOT NULL) as dependencies,
          array_agg(DISTINCT cr.name) FILTER (WHERE cr.name IS NOT NULL) as assigned_crews
        FROM schedule_tasks st
        LEFT JOIN schedule_tasks parent ON st.parent_task_id = parent.id
        LEFT JOIN task_dependencies dep ON st.id = dep.task_id
        LEFT JOIN task_assignments ta ON st.id = ta.task_id
        LEFT JOIN crews cr ON ta.crew_id = cr.id
        WHERE st.project_id = $1
        GROUP BY st.id, parent.name
        ORDER BY st.start_date, st.sort_order`, [projectId]);
            // Get milestones
            const milestonesResult = await (0, database_js_1.query)(`SELECT * FROM project_milestones 
         WHERE project_id = $1 
         ORDER BY milestone_date`, [projectId]);
            // Calculate critical path
            const criticalPath = calculateCriticalPath(tasksResult.rows);
            res.json({
                project: {
                    id: projectId,
                    name: project.name,
                    start_date: project.start_date,
                    end_date: project.end_date
                },
                tasks: tasksResult.rows,
                milestones: milestonesResult.rows,
                critical_path: criticalPath,
                stats: {
                    total_tasks: tasksResult.rowCount,
                    completed_tasks: tasksResult.rows.filter(t => t.status === 'completed').length,
                    overdue_tasks: tasksResult.rows.filter(t => t.status !== 'completed' && new Date(t.end_date) < new Date()).length
                }
            });
        }
        catch (error) {
            console.error('[scheduling] Error fetching schedule:', error);
            res.status(500).json({ error: 'Failed to fetch project schedule' });
        }
    });
    // CREATE schedule task
    router.post('/tasks', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            const { project_id, parent_task_id, name, description, task_type, start_date, end_date, duration_days, progress_percentage, assigned_crews, dependencies } = req.body;
            if (!project_id || !name || !start_date || !end_date) {
                return res.status(400).json({
                    error: 'Missing required fields: project_id, name, start_date, end_date'
                });
            }
            await (0, database_js_1.query)('BEGIN');
            try {
                // Create task
                const taskResult = await (0, database_js_1.query)(`INSERT INTO schedule_tasks 
           (project_id, parent_task_id, name, description, task_type,
            start_date, end_date, duration_days, progress_percentage,
            created_by, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'planned')
           RETURNING *`, [project_id, parent_task_id, name, description, task_type || 'task',
                    start_date, end_date, duration_days, progress_percentage || 0, userId]);
                const task = taskResult.rows[0];
                // Add crew assignments
                if (assigned_crews && Array.isArray(assigned_crews)) {
                    for (const crewId of assigned_crews) {
                        await (0, database_js_1.query)(`INSERT INTO task_assignments (task_id, crew_id, assigned_by)
               VALUES ($1, $2, $3)`, [task.id, crewId, userId]);
                    }
                }
                // Add dependencies
                if (dependencies && Array.isArray(dependencies)) {
                    for (const depTaskId of dependencies) {
                        await (0, database_js_1.query)(`INSERT INTO task_dependencies (task_id, depends_on_task_id)
               VALUES ($1, $2)`, [task.id, depTaskId]);
                    }
                }
                await (0, database_js_1.query)('COMMIT');
                res.status(201).json(task);
            }
            catch (error) {
                await (0, database_js_1.query)('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('[scheduling] Error creating task:', error);
            res.status(500).json({ error: 'Failed to create schedule task' });
        }
    });
    // UPDATE task progress
    router.put('/tasks/:taskId/progress', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { taskId } = req.params;
            const { progress_percentage, notes } = req.body;
            if (progress_percentage === undefined || progress_percentage < 0 || progress_percentage > 100) {
                return res.status(400).json({ error: 'Invalid progress percentage (0-100)' });
            }
            const status = progress_percentage === 100 ? 'completed' :
                progress_percentage > 0 ? 'in_progress' : 'planned';
            const result = await (0, database_js_1.query)(`UPDATE schedule_tasks 
         SET progress_percentage = $1,
             status = $2,
             notes = COALESCE($3, notes),
             updated_at = NOW(),
             completed_date = CASE WHEN $2 = 'completed' THEN NOW() ELSE NULL END
         WHERE id = $4
         RETURNING *`, [progress_percentage, status, notes, taskId]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            // Log progress update
            await (0, auditLog_js_1.logAuditEvent)({
                action: 'task_progress_updated',
                user_id: req.user?.id,
                resource_type: 'schedule_task',
                resource_id: taskId,
                ip_address: req.ip || '',
                user_agent: req.headers['user-agent'],
                metadata: { progress_percentage, status },
                success: true
            });
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error('[scheduling] Error updating progress:', error);
            res.status(500).json({ error: 'Failed to update task progress' });
        }
    });
    // GET three-week lookahead
    router.get('/lookahead/:projectId', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { projectId } = req.params;
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 21); // 3 weeks
            const tasksResult = await (0, database_js_1.query)(`SELECT 
          st.*,
          array_agg(DISTINCT cr.name) FILTER (WHERE cr.name IS NOT NULL) as assigned_crews,
          array_agg(DISTINCT u.raw_user_meta_data->>'full_name') FILTER (WHERE u.id IS NOT NULL) as crew_leads
        FROM schedule_tasks st
        LEFT JOIN task_assignments ta ON st.id = ta.task_id
        LEFT JOIN crews cr ON ta.crew_id = cr.id
        LEFT JOIN auth.users u ON cr.lead_user_id = u.id
        WHERE st.project_id = $1
        AND st.start_date <= $2
        AND st.end_date >= $3
        AND st.status != 'completed'
        GROUP BY st.id
        ORDER BY st.start_date`, [projectId, endDate, startDate]);
            // Group by week
            const weeklyTasks = {
                week1: [],
                week2: [],
                week3: []
            };
            const week1End = new Date(startDate);
            week1End.setDate(week1End.getDate() + 7);
            const week2End = new Date(startDate);
            week2End.setDate(week2End.getDate() + 14);
            tasksResult.rows.forEach(task => {
                const taskStart = new Date(task.start_date);
                if (taskStart <= week1End) {
                    weeklyTasks.week1.push(task);
                }
                else if (taskStart <= week2End) {
                    weeklyTasks.week2.push(task);
                }
                else {
                    weeklyTasks.week3.push(task);
                }
            });
            res.json({
                start_date: startDate,
                end_date: endDate,
                weekly_tasks: weeklyTasks,
                summary: {
                    total_tasks: tasksResult.rowCount,
                    critical_tasks: tasksResult.rows.filter(t => t.is_critical).length,
                    at_risk_tasks: tasksResult.rows.filter(t => t.progress_percentage < 50).length
                }
            });
        }
        catch (error) {
            console.error('[scheduling] Error fetching lookahead:', error);
            res.status(500).json({ error: 'Failed to fetch three-week lookahead' });
        }
    });
    // CREATE milestone
    router.post('/milestones', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            const { project_id, name, description, milestone_date, milestone_type } = req.body;
            if (!project_id || !name || !milestone_date) {
                return res.status(400).json({
                    error: 'Missing required fields: project_id, name, milestone_date'
                });
            }
            const result = await (0, database_js_1.query)(`INSERT INTO project_milestones 
         (project_id, name, description, milestone_date, milestone_type,
          created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`, [project_id, name, description, milestone_date,
                milestone_type || 'deliverable', userId]);
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            console.error('[scheduling] Error creating milestone:', error);
            res.status(500).json({ error: 'Failed to create milestone' });
        }
    });
    // GET resource allocation
    router.get('/resources/:projectId', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { start_date, end_date } = req.query;
            // Get crew allocations
            const crewResult = await (0, database_js_1.query)(`SELECT 
          c.id, c.name, c.crew_type,
          COUNT(DISTINCT ta.task_id) as assigned_tasks,
          MIN(st.start_date) as first_task_date,
          MAX(st.end_date) as last_task_date,
          SUM(st.duration_days) as total_task_days
        FROM crews c
        JOIN task_assignments ta ON c.id = ta.crew_id
        JOIN schedule_tasks st ON ta.task_id = st.id
        WHERE st.project_id = $1
        ${start_date ? 'AND st.start_date >= $2' : ''}
        ${end_date ? 'AND st.end_date <= $3' : ''}
        GROUP BY c.id, c.name, c.crew_type
        ORDER BY c.name`, start_date && end_date ? [projectId, start_date, end_date] :
                start_date ? [projectId, start_date] : [projectId]);
            // Get equipment allocations
            const equipmentResult = await (0, database_js_1.query)(`SELECT 
          e.id, e.name, e.equipment_type,
          COUNT(DISTINCT ter.task_id) as assigned_tasks,
          SUM(ter.duration_hours) as total_hours
        FROM equipment_inventory e
        JOIN task_equipment_reservations ter ON e.id = ter.equipment_id
        JOIN schedule_tasks st ON ter.task_id = st.id
        WHERE st.project_id = $1
        GROUP BY e.id, e.name, e.equipment_type`, [projectId]);
            res.json({
                crews: crewResult.rows,
                equipment: equipmentResult.rows,
                summary: {
                    total_crews: crewResult.rowCount,
                    total_equipment: equipmentResult.rowCount,
                    crew_utilization: calculateUtilization(crewResult.rows),
                    equipment_utilization: calculateUtilization(equipmentResult.rows)
                }
            });
        }
        catch (error) {
            console.error('[scheduling] Error fetching resources:', error);
            res.status(500).json({ error: 'Failed to fetch resource allocation' });
        }
    });
    // UPDATE task dates (with dependency cascade)
    router.put('/tasks/:taskId/reschedule', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { taskId } = req.params;
            const { start_date, end_date } = req.body;
            if (!start_date || !end_date) {
                return res.status(400).json({ error: 'Both start_date and end_date required' });
            }
            await (0, database_js_1.query)('BEGIN');
            try {
                // Update main task
                const taskResult = await (0, database_js_1.query)(`UPDATE schedule_tasks 
           SET start_date = $1, 
               end_date = $2,
               duration_days = DATE_PART('day', $2::timestamp - $1::timestamp),
               updated_at = NOW()
           WHERE id = $3
           RETURNING *`, [start_date, end_date, taskId]);
                if (taskResult.rowCount === 0) {
                    throw new Error('Task not found');
                }
                const task = taskResult.rows[0];
                const daysDiff = Math.floor((new Date(start_date).getTime() - new Date(task.start_date).getTime()) /
                    (1000 * 60 * 60 * 24));
                // Cascade update to dependent tasks
                if (daysDiff !== 0) {
                    await (0, database_js_1.query)(`UPDATE schedule_tasks 
             SET start_date = start_date + INTERVAL '${daysDiff} days',
                 end_date = end_date + INTERVAL '${daysDiff} days',
                 updated_at = NOW()
             WHERE id IN (
               SELECT task_id FROM task_dependencies WHERE depends_on_task_id = $1
             )`, [taskId]);
                }
                await (0, database_js_1.query)('COMMIT');
                res.json(task);
            }
            catch (error) {
                await (0, database_js_1.query)('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('[scheduling] Error rescheduling task:', error);
            res.status(500).json({ error: 'Failed to reschedule task' });
        }
    });
    // GET schedule conflicts
    router.get('/conflicts/:projectId', auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const { projectId } = req.params;
            // Find crew conflicts (double-booked)
            const crewConflicts = await (0, database_js_1.query)(`WITH crew_tasks AS (
          SELECT 
            ta.crew_id,
            c.name as crew_name,
            st.id as task_id,
            st.name as task_name,
            st.start_date,
            st.end_date
          FROM task_assignments ta
          JOIN schedule_tasks st ON ta.task_id = st.id
          JOIN crews c ON ta.crew_id = c.id
          WHERE st.project_id = $1
          AND st.status != 'completed'
        )
        SELECT 
          ct1.crew_name,
          ct1.task_name as task1_name,
          ct2.task_name as task2_name,
          ct1.start_date as task1_start,
          ct1.end_date as task1_end,
          ct2.start_date as task2_start,
          ct2.end_date as task2_end
        FROM crew_tasks ct1
        JOIN crew_tasks ct2 ON ct1.crew_id = ct2.crew_id
        WHERE ct1.task_id < ct2.task_id
        AND ct1.start_date <= ct2.end_date
        AND ct1.end_date >= ct2.start_date`, [projectId]);
            // Find dependency conflicts (task starts before dependency completes)
            const dependencyConflicts = await (0, database_js_1.query)(`SELECT 
          t1.name as dependent_task,
          t2.name as dependency_task,
          t1.start_date as dependent_start,
          t2.end_date as dependency_end
        FROM task_dependencies td
        JOIN schedule_tasks t1 ON td.task_id = t1.id
        JOIN schedule_tasks t2 ON td.depends_on_task_id = t2.id
        WHERE t1.project_id = $1
        AND t1.start_date < t2.end_date`, [projectId]);
            res.json({
                crew_conflicts: crewConflicts.rows,
                dependency_conflicts: dependencyConflicts.rows,
                total_conflicts: crewConflicts.rowCount + dependencyConflicts.rowCount
            });
        }
        catch (error) {
            console.error('[scheduling] Error checking conflicts:', error);
            res.status(500).json({ error: 'Failed to check schedule conflicts' });
        }
    });
    return router;
}
// Helper function to calculate critical path
function calculateCriticalPath(tasks) {
    // Simple critical path - tasks with no float time
    const criticalTasks = tasks
        .filter(task => task.is_critical ||
        (task.dependencies && task.dependencies.length > 0))
        .map(task => task.id);
    return criticalTasks;
}
// Helper function to calculate utilization
function calculateUtilization(resources) {
    if (resources.length === 0)
        return 0;
    const totalAvailable = resources.reduce((sum, r) => sum + (r.total_task_days || 0), 0);
    const totalUsed = resources.reduce((sum, r) => sum + (r.assigned_tasks || 0), 0);
    return totalUsed > 0 ? Math.round((totalUsed / totalAvailable) * 100) : 0;
}
