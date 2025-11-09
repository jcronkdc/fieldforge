import { supabase } from '../supabase';

interface EmailOptions {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

interface EmailAttachment {
  filename: string;
  content: string | Blob;
  contentType: string;
}

class EmailService {
  private readonly defaultRecipient = 'justincronk@pm.me';
  
  /**
   * Send receipt notification email
   */
  async sendReceiptEmail(
    receiptData: {
      userName: string;
      userEmail: string;
      jobNumber: string;
      transactionDate: string;
      costCode: string;
      vendorName: string;
      amount: number;
      receiptImage: Blob | string;
      enhancedImage?: Blob | string;
    }
  ): Promise<boolean> {
    try {
      // Prepare email content
      const subject = `${receiptData.userName}, ${receiptData.jobNumber} - Pcard Receipt`;
      
      const body = `
Name: ${receiptData.userName}
Date of Transaction: ${receiptData.transactionDate}
Cost Code: ${receiptData.costCode}
Job Number: ${receiptData.jobNumber}
Vendor: ${receiptData.vendorName}
Amount: $${receiptData.amount.toFixed(2)}

---
This is an automated receipt submission from FieldForge by Cronk Companies LLC.
      `.trim();
      
      // Prepare attachments
      const attachments: EmailAttachment[] = [];
      
      // Add the enhanced/stamped receipt as attachment
      if (receiptData.enhancedImage) {
        attachments.push({
          filename: `receipt_${receiptData.jobNumber}_${Date.now()}.jpg`,
          content: receiptData.enhancedImage,
          contentType: 'image/jpeg'
        });
      } else {
        attachments.push({
          filename: `receipt_${receiptData.jobNumber}_${Date.now()}.jpg`,
          content: receiptData.receiptImage,
          contentType: 'image/jpeg'
        });
      }
      
      // Send email with CC to user
      const emailOptions: EmailOptions = {
        to: [this.defaultRecipient],
        cc: receiptData.userEmail ? [receiptData.userEmail] : [],
        subject,
        body,
        attachments
      };
      
      return await this.sendEmail(emailOptions);
    } catch (error) {
      console.error('Failed to send receipt email:', error);
      return false;
    }
  }
  
  /**
   * Core email sending function
   * In production, this would integrate with SendGrid, Resend, or SMTP
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For development/demo, we'll log the email and store in database
      console.log('📧 Email would be sent:', {
        to: options.to,
        cc: options.cc,
        subject: options.subject,
        attachmentCount: options.attachments?.length || 0
      });
      
      // Store email record in database
      const { error } = await supabase
        .from('email_logs')
        .insert({
          to_addresses: options.to,
          cc_addresses: options.cc || [],
          subject: options.subject,
          body: options.body,
          status: 'pending', // In production, this would be 'sent'
          sent_at: new Date().toISOString(),
          metadata: {
            attachments: options.attachments?.map(a => ({
              filename: a.filename,
              contentType: a.contentType,
              size: a.content instanceof Blob ? a.content.size : a.content.length
            }))
          }
        });
      
      if (error) {
        console.error('Failed to log email:', error);
        return false;
      }
      
      // In production, integrate with email service:
      // - SendGrid: Use @sendgrid/mail package
      // - Resend: Use resend package
      // - SMTP: Use nodemailer
      // - Supabase Edge Functions: Deploy function to handle emails
      
      // For now, simulate success
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
  
  /**
   * Configure email service with API keys
   * In production, these would come from environment variables
   */
  configure(config: {
    provider?: 'sendgrid' | 'resend' | 'smtp' | 'supabase';
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
  }) {
    // Store configuration for production email service
    console.log('Email service configured:', config.provider);
  }
}

export const emailService = new EmailService();
