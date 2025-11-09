# Admin Account Setup for FieldForge

## Admin User Credentials

**Email:** justincronk@pm.me  
**Password:** Junuh2014!  
**Phone:** 612-310-3241  
**Address:** 13740 10th Ave South, Zimmerman, MN 55398  
**Company:** Brink Constructors (subsidiary of Cronk Companies LLC)  
**Role:** Project Manager / System Admin

## Company Structure

- **Parent Company:** Cronk Companies LLC
- **Subsidiary:** Brink Constructors
- **FieldForge:** Product developed by Cronk Companies LLC

## Setting Up the Admin Account

### Method 1: Through the Application (Recommended)

1. Start the development server:
```bash
cd apps/swipe-feed
npm run dev
```

2. Navigate to http://localhost:5173/signup

3. Create account with these details:
   - Email: justincronk@pm.me
   - Password: Junuh2014!
   - First Name: Justin
   - Last Name: Cronk
   - Phone: 6123103241
   - Job Title: Project Manager
   - Company: Brink Constructors

### Method 2: Through Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Invite User"
4. Enter email: justincronk@pm.me
5. Set password: Junuh2014!
6. Click "Send Invite"

### Method 3: Using the Setup Script

1. First, set your environment variables in `.env`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Run the setup script:
```bash
cd apps/swipe-feed
npx tsx src/scripts/createAdminAccount.ts
```

### Method 4: Direct Database Migration

1. Apply the migration to your Supabase database:
```bash
cd supabase
npx supabase db push
```

2. Run the specific migration:
```sql
-- Run the contents of supabase/008_cronk_companies_admin.sql
```

## Admin Privileges

The admin account has the following privileges:

- **System Admin:** Full access to all features
- **Project Access:** Automatic admin role on all Brink Constructors projects
- **Company Management:** Can manage company settings and users
- **Receipt Management:** Full access to receipt scanning and approval
- **Email Notifications:** Primary recipient for all receipt emails
- **Cost Code Management:** Can manage and modify cost codes

## Receipt Email Configuration

All receipts are automatically sent to:
- **Primary:** justincronk@pm.me
- **CC:** The user who submitted the receipt

Email format includes:
- User name
- Job number
- Transaction date
- Cost code
- Enhanced and stamped receipt image attachment

## Features Available to Admin

1. **Receipt Management**
   - Automatic email notifications
   - Enhanced image processing
   - Digital stamping with project info
   - Cost code mapping from Brink Constructors database

2. **Project Management**
   - Create/archive projects
   - Assign team members
   - Manage crews
   - Send invitations

3. **Social Features**
   - Access to construction feed
   - AI assistant integration
   - Real-time analytics dashboard

4. **System Features**
   - Push notifications
   - Offline support (PWA)
   - Weather integration
   - 3D visualizations

## Troubleshooting

If you encounter issues:

1. **Email not sending:** 
   - Check console for email logs
   - Emails are currently logged but not sent (requires email service integration)

2. **User already exists:**
   - Sign in with existing credentials
   - Or reset password through "Forgot Password"

3. **Profile not created:**
   - The system automatically creates profiles on first sign-in
   - Check user_profiles table in Supabase

4. **Company not found:**
   - Run the migration script to create company structure
   - Verify companies table has Cronk Companies LLC and Brink Constructors

## Production Setup

For production deployment:

1. **Email Service:** Configure actual email service (SendGrid, Resend, or SMTP)
2. **OCR Service:** Replace mock OCR with Tesseract.js or cloud service
3. **Security:** Update password and enable 2FA
4. **Backup:** Regular database backups
5. **Monitoring:** Set up error tracking and analytics

## Support

For issues or questions about the admin account, contact:
- Email: justincronk@pm.me
- Company: Cronk Companies LLC
- Product: FieldForge Construction Management System
