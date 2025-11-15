import { Router, Request, Response } from 'express';
import { query } from '../database.js';
import { z } from 'zod';

const acquisitionInquirySchema = z.object({
  inquiryType: z.enum(['acquire', 'custom']),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  projectDescription: z.string().min(1),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  submittedAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

export function createAcquisitionRouter(): Router {
  const router = Router();

  // Create new acquisition inquiry
  router.post('/', async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = acquisitionInquirySchema.parse(req.body);
      
      // Get IP address
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      
      // Insert into database
      const result = await query(
        `INSERT INTO acquisition_inquiries (
          inquiry_type, company_name, contact_name, email, phone,
          project_description, timeline, budget,
          submitted_at, ip_address, user_agent
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id`,
        [
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
        ]
      );

      const inquiryId = result.rows[0].id;

      // Log for email notification
      console.log('New acquisition inquiry received:', {
        id: inquiryId,
        type: validatedData.inquiryType,
        company: validatedData.companyName,
        contact: validatedData.contactName,
        email: validatedData.email
      });

      // TODO: Implement email sending with SendGrid/Postmark
      // await sendAcquisitionInquiryEmail(validatedData, inquiryId);

      res.status(201).json({
        success: true,
        message: 'Inquiry submitted successfully',
        inquiryId
      });
      
    } catch (error) {
      console.error('Error creating acquisition inquiry:', error);
      
      if (error instanceof z.ZodError) {
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
  router.get('/', async (req: Request, res: Response) => {
    try {
      const result = await query(
        `SELECT * FROM acquisition_inquiries 
         ORDER BY created_at DESC 
         LIMIT 100`
      );
      
      res.json({
        success: true,
        inquiries: result.rows
      });
      
    } catch (error) {
      console.error('Error fetching acquisition inquiries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch inquiries'
      });
    }
  });

  // Get single inquiry (admin only)
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'SELECT * FROM acquisition_inquiries WHERE id = $1',
        [id]
      );
      
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
      
    } catch (error) {
      console.error('Error fetching acquisition inquiry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch inquiry'
      });
    }
  });

  return router;
}


