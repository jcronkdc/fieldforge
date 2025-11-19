import { Resend } from 'resend';
import { loadEnv } from '../worker/env.js';

const env = loadEnv();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Email Service for FieldForge
 * Uses Resend for transactional emails
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!resend) {
    console.warn('[email] Resend not configured, skipping email send:', options.subject);
    return;
  }

  try {
    await resend.emails.send({
      from: options.from || 'FieldForge <noreply@fieldforge.app>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[email] Sent:', options.subject, 'to', options.to);
    }
  } catch (error) {
    console.error('[email] Failed to send:', error);
    throw error;
  }
}

/**
 * Send Stripe receipt email after successful payment
 */
export async function sendStripeReceipt(
  customerEmail: string,
  amount: number,
  currency: string,
  receiptUrl?: string
): Promise<void> {
  const formattedAmount = (amount / 100).toFixed(2);
  
  await sendEmail({
    to: customerEmail,
    subject: 'Payment Receipt - FieldForge',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 32px; font-weight: bold; color: #3b82f6; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍄 FieldForge</h1>
              <p>Payment Successful</p>
            </div>
            <div class="content">
              <p>Thank you for your payment!</p>
              <div class="amount">$${formattedAmount} ${currency.toUpperCase()}</div>
              <p>Your payment has been processed successfully.</p>
              ${receiptUrl ? `<a href="${receiptUrl}" class="button">View Receipt</a>` : ''}
              <p>If you have any questions, please contact support@fieldforge.app</p>
            </div>
            <div class="footer">
              <p>© 2025 FieldForge. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

/**
 * Send payment failure notification
 */
export async function sendPaymentFailure(
  customerEmail: string,
  amount: number,
  currency: string,
  reason?: string
): Promise<void> {
  const formattedAmount = (amount / 100).toFixed(2);
  
  await sendEmail({
    to: customerEmail,
    subject: 'Payment Failed - FieldForge',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍄 FieldForge</h1>
              <p>Payment Failed</p>
            </div>
            <div class="content">
              <p>We were unable to process your payment of <strong>$${formattedAmount} ${currency.toUpperCase()}</strong>.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>Please update your payment method and try again.</p>
              <a href="https://fieldforge.vercel.app/settings/billing" class="button">Update Payment Method</a>
              <p>If you continue to experience issues, contact support@fieldforge.app</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

/**
 * Send lead capture notification to sales team
 */
export async function sendLeadNotification(
  lead: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
  }
): Promise<void> {
  await sendEmail({
    to: 'sales@fieldforge.app', // TODO: Update with actual sales email
    subject: `New Lead: ${lead.name} from ${lead.company || 'Unknown Company'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #10b981; }
            .label { font-weight: bold; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Lead Captured</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div>${lead.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div><a href="mailto:${lead.email}">${lead.email}</a></div>
              </div>
              ${lead.company ? `
                <div class="field">
                  <div class="label">Company:</div>
                  <div>${lead.company}</div>
                </div>
              ` : ''}
              ${lead.phone ? `
                <div class="field">
                  <div class="label">Phone:</div>
                  <div><a href="tel:${lead.phone}">${lead.phone}</a></div>
                </div>
              ` : ''}
              ${lead.message ? `
                <div class="field">
                  <div class="label">Message:</div>
                  <div>${lead.message}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `
  });
}

/**
 * Send acquisition inquiry notification
 */
export async function sendAcquisitionInquiry(
  inquiry: {
    name: string;
    email: string;
    company: string;
    targetRevenue?: string;
    timeline?: string;
    message?: string;
  }
): Promise<void> {
  await sendEmail({
    to: 'acquisitions@fieldforge.app', // TODO: Update with actual acquisitions email
    subject: `Acquisition Inquiry: ${inquiry.company} (${inquiry.targetRevenue || 'Revenue TBD'})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #8b5cf6; }
            .label { font-weight: bold; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💼 Acquisition Inquiry</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Company:</div>
                <div>${inquiry.company}</div>
              </div>
              <div class="field">
                <div class="label">Contact Name:</div>
                <div>${inquiry.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div><a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
              </div>
              ${inquiry.targetRevenue ? `
                <div class="field">
                  <div class="label">Target Revenue:</div>
                  <div>${inquiry.targetRevenue}</div>
                </div>
              ` : ''}
              ${inquiry.timeline ? `
                <div class="field">
                  <div class="label">Timeline:</div>
                  <div>${inquiry.timeline}</div>
                </div>
              ` : ''}
              ${inquiry.message ? `
                <div class="field">
                  <div class="label">Message:</div>
                  <div>${inquiry.message}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `
  });
}

