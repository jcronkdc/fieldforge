"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadRouter = createLeadRouter;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const zod_1 = require("zod");
const leadSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1),
    industrySegment: zod_1.z.string().min(1),
    companySize: zod_1.z.string().min(1),
    annualRevenue: zod_1.z.string().optional(),
    currentSoftware: zod_1.z.array(zod_1.z.string()).optional(),
    avgProjectSize: zod_1.z.string().min(1),
    projectsPerYear: zod_1.z.string().min(1),
    projectDuration: zod_1.z.string().optional(),
    mainChallenges: zod_1.z.array(zod_1.z.string()).optional(),
    fullName: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(1),
    bestTimeToCall: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    interestedFeatures: zod_1.z.array(zod_1.z.string()).optional(),
    timeline: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    submittedAt: zod_1.z.string(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional()
});
function createLeadRouter() {
    const router = (0, express_1.Router)();
    // Create new lead
    router.post('/', async (req, res) => {
        try {
            // Validate input
            const validatedData = leadSchema.parse(req.body);
            // Get IP address
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            // Insert into database
            const result = await (0, database_js_1.query)(`INSERT INTO leads (
          company_name, industry_segment, company_size, annual_revenue,
          current_software, avg_project_size, projects_per_year, project_duration,
          main_challenges, full_name, title, email, phone, best_time_to_call,
          timezone, source, interested_features, timeline, notes,
          submitted_at, ip_address, user_agent
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING id`, [
                validatedData.companyName,
                validatedData.industrySegment,
                validatedData.companySize,
                validatedData.annualRevenue || null,
                validatedData.currentSoftware || [],
                validatedData.avgProjectSize,
                parseInt(validatedData.projectsPerYear),
                validatedData.projectDuration || null,
                validatedData.mainChallenges || [],
                validatedData.fullName,
                validatedData.title,
                validatedData.email,
                validatedData.phone,
                validatedData.bestTimeToCall || null,
                validatedData.timezone || null,
                validatedData.source || null,
                validatedData.interestedFeatures || [],
                validatedData.timeline || null,
                validatedData.notes || null,
                validatedData.submittedAt,
                ipAddress.toString(),
                validatedData.userAgent || null
            ]);
            const leadId = result.rows[0].id;
            // Send email notification (you'll need to set up an email service)
            // For now, just log it
            console.log('New lead received:', {
                id: leadId,
                company: validatedData.companyName,
                contact: validatedData.fullName,
                email: validatedData.email
            });
            // Send lead notification email
            try {
                const { sendLeadNotification } = await import('../email/emailService.js');
                await sendLeadNotification({
                    name: validatedData.fullName || 'Unknown',
                    email: validatedData.email || '',
                    company: validatedData.companyName,
                    phone: validatedData.phone,
                    message: `${validatedData.industrySegment} - ${validatedData.companySize} company, ${validatedData.projectsPerYear} projects/year`
                });
            }
            catch (emailError) {
                console.error('[leads] Failed to send email notification:', emailError);
                // Don't fail the API if email fails
            }
            // await sendLeadNotificationEmail(validatedData, leadId);
            res.status(201).json({
                success: true,
                message: 'Lead submitted successfully',
                leadId
            });
        }
        catch (error) {
            console.error('Error creating lead:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to submit lead'
            });
        }
    });
    // Get all leads (admin only - you'll need to add auth middleware)
    router.get('/', async (req, res) => {
        try {
            const result = await (0, database_js_1.query)(`SELECT * FROM leads 
         ORDER BY created_at DESC 
         LIMIT 100`);
            res.json({
                success: true,
                leads: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching leads:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leads'
            });
        }
    });
    // Get single lead (admin only)
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await (0, database_js_1.query)('SELECT * FROM leads WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Lead not found'
                });
            }
            res.json({
                success: true,
                lead: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error fetching lead:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch lead'
            });
        }
    });
    // Update lead status (admin only)
    router.patch('/:id/status', async (req, res) => {
        try {
            const { id } = req.params;
            const { status, assignedTo, notes } = req.body;
            const result = await (0, database_js_1.query)(`UPDATE leads 
         SET status = $1, 
             assigned_to = $2,
             last_contacted = CASE WHEN $1 = 'contacted' THEN NOW() ELSE last_contacted END,
             notes = COALESCE($3, notes),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`, [status, assignedTo || null, notes || null, id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Lead not found'
                });
            }
            res.json({
                success: true,
                lead: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error updating lead:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update lead'
            });
        }
    });
    return router;
}
