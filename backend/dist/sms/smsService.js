"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = sendSMS;
exports.sendEmergencySMS = sendEmergencySMS;
exports.sendEmergencyEmail = sendEmergencyEmail;
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
/**
 * SMS Service for FieldForge
 * Uses Twilio for emergency SMS alerts
 *
 * Setup: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to env
 */
let twilioClient = null;
async function getTwilioClient() {
    if (twilioClient)
        return twilioClient;
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
        return null;
    }
    try {
        const twilio = await import('twilio');
        twilioClient = twilio.default(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        return twilioClient;
    }
    catch (error) {
        console.error('[sms] Failed to initialize Twilio:', error);
        return null;
    }
}
/**
 * Send SMS via Twilio
 */
async function sendSMS(options) {
    const client = await getTwilioClient();
    if (!client || !env.TWILIO_PHONE_NUMBER) {
        console.warn('[sms] Twilio not configured, skipping SMS send to:', options.to);
        return;
    }
    try {
        await client.messages.create({
            body: options.message,
            from: env.TWILIO_PHONE_NUMBER,
            to: options.to
        });
        if (process.env.NODE_ENV === 'development') {
            console.log('[sms] Sent to:', options.to);
        }
    }
    catch (error) {
        console.error('[sms] Failed to send:', error);
        throw error;
    }
}
/**
 * Send emergency SMS alert to safety team
 */
async function sendEmergencySMS(phoneNumbers, alert) {
    const message = `
🚨 EMERGENCY ALERT - FieldForge

Type: ${alert.type}
${alert.location ? `Location: ${alert.location}` : ''}
${alert.description ? `Details: ${alert.description}` : ''}
${alert.reportedBy ? `Reported by: ${alert.reportedBy}` : ''}

Respond immediately. Check FieldForge for full details.
  `.trim();
    for (const phoneNumber of phoneNumbers) {
        try {
            await sendSMS({
                to: phoneNumber,
                message
            });
        }
        catch (error) {
            console.error(`[sms] Failed to send emergency SMS to ${phoneNumber}:`, error);
            // Continue sending to other numbers even if one fails
        }
    }
}
/**
 * Send emergency email alert to safety team
 */
async function sendEmergencyEmail(emails, alert) {
    const { sendEmail } = await import('../email/emailService.js');
    const severityColors = {
        critical: '#dc2626',
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#eab308'
    };
    const severityColor = severityColors[alert.severity || 'high'];
    await sendEmail({
        to: emails,
        subject: `🚨 EMERGENCY ALERT: ${alert.type}`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, ${severityColor} 0%, #991b1b 100%); color: white; padding: 40px 30px; text-align: center; }
            .alert-icon { font-size: 64px; margin-bottom: 10px; animation: pulse 1.5s infinite; }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            .content { background: #fff; padding: 30px; }
            .field { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid ${severityColor}; border-radius: 4px; }
            .label { font-weight: bold; color: #6b7280; margin-bottom: 5px; }
            .value { color: #111827; font-size: 16px; }
            .severity { display: inline-block; padding: 8px 16px; background: ${severityColor}; color: white; border-radius: 20px; font-weight: bold; text-transform: uppercase; margin: 20px 0; }
            .button { display: inline-block; background: ${severityColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="alert-icon">🚨</div>
              <h1 style="margin: 0; font-size: 28px;">EMERGENCY ALERT</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Immediate Response Required</p>
            </div>
            <div class="content">
              <div class="severity">${alert.severity || 'HIGH'} SEVERITY</div>
              
              <div class="field">
                <div class="label">Alert Type:</div>
                <div class="value">${alert.type}</div>
              </div>
              
              ${alert.location ? `
                <div class="field">
                  <div class="label">Location:</div>
                  <div class="value">${alert.location}</div>
                </div>
              ` : ''}
              
              ${alert.description ? `
                <div class="field">
                  <div class="label">Description:</div>
                  <div class="value">${alert.description}</div>
                </div>
              ` : ''}
              
              ${alert.reportedBy ? `
                <div class="field">
                  <div class="label">Reported By:</div>
                  <div class="value">${alert.reportedBy}</div>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://fieldforge.vercel.app/emergency-alerts" class="button">
                  View Full Alert Details
                </a>
              </div>
              
              <p style="margin-top: 30px; padding: 15px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b;">
                <strong>⚠️ This is an automated emergency alert.</strong><br>
                Please respond immediately and coordinate with your safety team.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 FieldForge. All rights reserved.</p>
              <p>Emergency Alert System - Do Not Reply</p>
            </div>
          </div>
        </body>
      </html>
    `
    });
}
