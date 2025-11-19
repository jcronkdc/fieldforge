"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAcquisitionRouter = createAcquisitionRouter;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const zod_1 = require("zod");
const acquisitionInquirySchema = zod_1.z.object({
    inquiryType: zod_1.z.enum(['acquire', 'custom']),
    companyName: zod_1.z.string().min(1),
    contactName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(1),
    projectDescription: zod_1.z.string().min(1),
    timeline: zod_1.z.string().optional(),
    budget: zod_1.z.string().optional(),
    submittedAt: zod_1.z.string(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional()
});
function createAcquisitionRouter() {
    const router = (0, express_1.Router)();
    // Create new acquisition inquiry
    router.post('/', async (req, res) => {
        try {
            // Validate input
            const validatedData = acquisitionInquirySchema.parse(req.body);
            // Get IP address
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            // Insert into database
            const result = await (0, database_js_1.query)(`INSERT INTO acquisition_inquiries (
          inquiry_type, company_name, contact_name, email, phone,
          project_description, timeline, budget,
          submitted_at, ip_address, user_agent
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id`, [
                validatedData.inquiryType,
                validatedData.companyName,
                validatedData.contactName,
                validatedData.email,
                validatedData.phone,
                validatedData.projectDescription,
                validatedData.timeline || null,
                validatedData.budget || null,
                validatedData.submittedAt,
                ipAddress.toString(),
                validatedData.userAgent || null
            ]);
            const inquiryId = result.rows[0].id;
            // Log for email notification
            console.log('New acquisition inquiry received:', {
                id: inquiryId,
                type: validatedData.inquiryType,
                company: validatedData.companyName,
                contact: validatedData.contactName,
                email: validatedData.email
            });
            // Send acquisition inquiry notification
            try {
                const { sendAcquisitionInquiry } = await import('../email/emailService.js');
                await sendAcquisitionInquiry({
                    name: validatedData.contactName || 'Unknown',
                    email: validatedData.email || '',
                    company: validatedData.companyName || 'Unknown Company',
                    targetRevenue: validatedData.budget,
                    timeline: validatedData.timeline,
                    message: validatedData.projectDescription
                });
            }
            catch (emailError) {
                console.error('[acquisition] Failed to send email notification:', emailError);
            }
            // await sendAcquisitionInquiryEmail(validatedData, inquiryId);
            res.status(201).json({
                success: true,
                message: 'Inquiry submitted successfully',
                inquiryId
            });
        }
        catch (error) {
            console.error('Error creating acquisition inquiry:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to submit inquiry'
            });
        }
    });
    // Get all inquiries (admin only - add auth middleware)
    router.get('/', async (req, res) => {
        try {
            const result = await (0, database_js_1.query)(`SELECT * FROM acquisition_inquiries 
         ORDER BY created_at DESC 
         LIMIT 100`);
            res.json({
                success: true,
                inquiries: result.rows
            });
        }
        catch (error) {
            console.error('Error fetching acquisition inquiries:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch inquiries'
            });
        }
    });
    // Get single inquiry (admin only)
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await (0, database_js_1.query)('SELECT * FROM acquisition_inquiries WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Inquiry not found'
                });
            }
            res.json({
                success: true,
                inquiry: result.rows[0]
            });
        }
        catch (error) {
            console.error('Error fetching acquisition inquiry:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch inquiry'
            });
        }
    });
    return router;
}
