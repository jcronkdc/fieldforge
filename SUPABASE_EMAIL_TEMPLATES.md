# 📧 SUPABASE EMAIL TEMPLATES CONFIGURATION

## 🚀 Quick Setup Guide

To enable email confirmation and welcome emails, configure these templates in your Supabase Dashboard:

### 1. **Navigate to Authentication Settings**
```
Supabase Dashboard → Authentication → Email Templates
```

### 2. **Enable Email Confirmations**
```
Authentication → Settings → Enable email confirmations ✅
```

## 📝 EMAIL TEMPLATES

### **1. Confirmation Email (Sign Up)**

**Subject:**
```
Welcome to FieldForge - Confirm Your Email
```

**HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FieldForge</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0a0e27;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e27; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1f3a; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,212,255,0.2);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #00d4ff, #0066ff); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">⚡ FieldForge</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">The Future of Construction Management</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #00d4ff; font-size: 24px;">Welcome to FieldForge!</h2>
              
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                Hi {{.Email}},
              </p>
              
              <p style="margin: 0 0 30px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                Thank you for joining FieldForge! You're just one click away from revolutionizing your construction management workflow with AI-powered tools.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d4ff, #0066ff); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,212,255,0.4);">
                      VERIFY EMAIL ADDRESS
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link in your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 15px; background-color: #0a0e27; border-radius: 6px; color: #00d4ff; font-size: 12px; word-break: break-all; font-family: monospace;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
                <tr>
                  <td style="padding: 20px; background-color: #0a0e27; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px; color: #00d4ff; font-size: 18px;">What's Next?</h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #e0e0e0;">
                      <li style="margin-bottom: 10px;">📱 Install our PWA for mobile access</li>
                      <li style="margin-bottom: 10px;">🎤 Set up voice commands</li>
                      <li style="margin-bottom: 10px;">📄 Try our smart OCR receipt scanner</li>
                      <li style="margin-bottom: 10px;">📊 Explore real-time analytics</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0a0e27; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #a0a0a0; font-size: 14px;">
                Need help? Contact us at support@fieldforge.app
              </p>
              <p style="margin: 0; color: #606060; font-size: 12px;">
                © 2025 FieldForge by Cronk Companies LLC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### **2. Magic Link Email**

**Subject:**
```
Your FieldForge Login Link
```

**HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FieldForge Login</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0a0e27;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e27; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1f3a; border-radius: 12px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🔐 Secure Login</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 16px;">
                Click the button below to log in to your FieldForge account:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .MagicLink }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px;">
                      LOG IN TO FIELDFORGE
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #a0a0a0; font-size: 14px; text-align: center;">
                This link expires in 1 hour and can only be used once.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### **3. Password Reset Email**

**Subject:**
```
Reset Your FieldForge Password
```

**HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0a0e27;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e27; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1f3a; border-radius: 12px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🔑 Password Reset</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 16px;">
                We received a request to reset your password. Click below to create a new password:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px;">
                      RESET PASSWORD
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #a0a0a0; font-size: 14px;">
                If you didn't request this, you can safely ignore this email.
              </p>
              
              <p style="margin: 10px 0 0; color: #a0a0a0; font-size: 14px;">
                This link expires in 1 hour.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### **4. Email Change Confirmation**

**Subject:**
```
Confirm Your New Email Address
```

**HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0a0e27;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e27; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1f3a; border-radius: 12px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">✉️ Email Update</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 16px;">
                Please confirm your new email address:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px;">
                      CONFIRM EMAIL CHANGE
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #a0a0a0; font-size: 14px;">
                Your new email: <strong style="color: #e0e0e0;">{{ .Email }}</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 🔧 CONFIGURATION STEPS

### **1. SMTP Configuration (Production)**

In Supabase Dashboard → Settings → SMTP:

```yaml
Host: smtp.sendgrid.net  # or your provider
Port: 587
Username: apikey
Password: YOUR_SENDGRID_API_KEY
Sender Email: noreply@fieldforge.app
Sender Name: FieldForge
```

### **2. URL Configuration**

In Authentication → URL Configuration:

```yaml
Site URL: https://fieldforge.vercel.app
Redirect URLs:
  - https://fieldforge.vercel.app/welcome
  - https://fieldforge.vercel.app/login
  - https://fieldforge.vercel.app/reset-password
  - http://localhost:5173/*  # for development
```

### **3. Email Settings**

In Authentication → Settings:

```yaml
✅ Enable email confirmations
✅ Enable email change confirmations
✅ Double confirm email changes
✅ Enable signup
✅ Enable email provider

Confirmation expiry: 24 hours
OTP expiry: 60 seconds
Magic link validity: 60 minutes
```

## 📊 TESTING EMAIL TEMPLATES

### **Local Development:**
```bash
# Use Supabase CLI to test emails locally
supabase functions serve send-email --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "template": "welcome"}'
```

### **Preview in Dashboard:**
1. Go to Authentication → Email Templates
2. Select template type
3. Click "Preview" button
4. Check rendered output

## 🎨 CUSTOMIZATION TIPS

### **Brand Colors:**
- Primary: `#00d4ff` (Electric Blue)
- Secondary: `#f59e0b` (Power Amber)
- Accent: `#8b5cf6` (Voltage Purple)
- Success: `#22c55e` (Grid Green)
- Danger: `#ef4444` (Warning Red)

### **Typography:**
- Headers: Bold, 24-32px
- Body: Regular, 16px
- Small: 14px
- Monospace for links/codes

### **Mobile Optimization:**
- Max width: 600px
- Padding: 20-40px
- Button size: 16px minimum
- Single column layout

## 🚀 ADVANCED FEATURES

### **Custom Welcome Flow:**
```sql
-- Create trigger for new user welcome email
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Send welcome email via Edge Function
  PERFORM net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_ANON_KEY'),
    body := jsonb_build_object(
      'email', NEW.email,
      'user_id', NEW.id,
      'metadata', NEW.raw_user_meta_data
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();
```

### **Email Analytics:**
Track email performance with:
- Open rates
- Click rates
- Bounce rates
- Conversion rates

## 📝 COMPLIANCE

### **GDPR Requirements:**
- Include unsubscribe link
- Privacy policy link
- Data processing info
- Contact information

### **CAN-SPAM Requirements:**
- Physical mailing address
- Clear sender identification
- Accurate subject lines
- Opt-out mechanism

## 🔗 USEFUL RESOURCES

- [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- [SendGrid Templates](https://sendgrid.com/solutions/email-api/dynamic-email-templates/)
- [MJML Email Framework](https://mjml.io/)
- [Email Testing with Mailtrap](https://mailtrap.io/)

---

**Remember:** Always test email templates across different email clients (Gmail, Outlook, Apple Mail) and devices (mobile, desktop) before production deployment!
