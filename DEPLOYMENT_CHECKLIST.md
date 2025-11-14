# FieldForge Production Deployment Checklist

## 🚀 Pre-Deployment Verification

### 1. Environment Variables

#### Backend Environment Variables (Required)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-secure-jwt-secret-minimum-32-chars

# Server
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://fieldforge.com

# CORS
ALLOWED_ORIGINS=https://fieldforge.com,https://www.fieldforge.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Pre-configured Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# Email (Optional but recommended)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@fieldforge.com
```

#### Frontend Environment Variables (Required)
```env
# API
VITE_API_URL=https://fieldforge.com/api

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# Feature Flags
VITE_ENABLE_DEMO_MODE=false
VITE_ENABLE_OFFLINE_MODE=true
```

### 2. Database Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save connection details

2. **Run Database Migrations**
   ```sql
   -- Execute complete-schema.sql in Supabase SQL editor
   -- This creates all tables, indexes, and RLS policies
   ```

3. **Create Initial Admin User**
   ```sql
   -- In Supabase Authentication
   -- Create user with email/password
   -- Then run:
   INSERT INTO user_profiles (user_id, display_name, role)
   VALUES ('user-uuid-here', 'Admin User', 'admin');
   ```

### 3. Vercel Configuration

1. **Connect GitHub Repository**
   - Link your GitHub repo to Vercel
   - Set up automatic deployments from main branch

2. **Configure Build Settings**
   - Framework Preset: Other
   - Build Command: (already in vercel.json)
   - Output Directory: apps/swipe-feed/dist

3. **Add Environment Variables**
   - Add all backend and frontend variables
   - Ensure proper scoping (Production/Preview/Development)

4. **Configure Custom Domain**
   - Add your domain in Vercel settings
   - Update DNS records
   - Enable SSL (automatic)

### 4. Stripe Configuration

1. **Switch to Live Mode**
   - Get live API keys from Stripe Dashboard
   - Update environment variables

2. **Configure Webhook Endpoint**
   ```
   Endpoint URL: https://fieldforge.com/api/webhook/stripe/webhook
   Events to listen:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   ```

3. **Create Products/Prices** (Optional)
   - Create products in Stripe Dashboard
   - Update Price IDs in environment variables

### 5. Post-Deployment Testing

#### Critical User Flows
- [ ] User Registration → Email Confirmation → Login
- [ ] Create Project → Invite Team → Assign Roles
- [ ] Clock In → Track Time → Clock Out → View Report
- [ ] Create Safety Report → Upload Photos → Submit
- [ ] Subscribe to Plan → Complete Payment → Access Features
- [ ] Work Offline → Sync When Online
- [ ] Upload Document → Share → Download
- [ ] Create Emergency Alert → Broadcast → Receive

#### Performance Checks
- [ ] Page Load Time < 3 seconds
- [ ] API Response Time < 200ms
- [ ] Mobile Responsiveness
- [ ] Offline Functionality
- [ ] Real-time Updates

#### Security Verification
- [ ] HTTPS enforced
- [ ] Authentication required for protected routes
- [ ] API rate limiting working
- [ ] Input validation on all forms
- [ ] File upload restrictions

### 6. Monitoring Setup

1. **Error Tracking** (Recommended: Sentry)
   ```javascript
   // Add to frontend and backend
   SENTRY_DSN=your-sentry-dsn
   ```

2. **Analytics** (Recommended: PostHog/Mixpanel)
   ```javascript
   // Add tracking code
   VITE_ANALYTICS_KEY=your-analytics-key
   ```

3. **Uptime Monitoring** (Recommended: UptimeRobot)
   - Monitor: https://fieldforge.com
   - Monitor: https://fieldforge.com/api/health
   - Alert threshold: 5 minutes

4. **Database Monitoring**
   - Enable Supabase metrics
   - Set up slow query alerts
   - Monitor connection pool

### 7. Backup Strategy

1. **Database Backups**
   - Enable Supabase automatic backups
   - Schedule: Daily at 2 AM
   - Retention: 30 days

2. **Code Backups**
   - GitHub repository (already in place)
   - Enable branch protection for main

3. **Environment Backup**
   - Document all environment variables
   - Store securely in password manager

### 8. Documentation

1. **Admin Guide**
   - How to manage users
   - How to view analytics
   - How to handle support requests

2. **User Guide**
   - Getting started tutorial
   - Feature documentation
   - Video walkthroughs

3. **Developer Guide**
   - Architecture overview
   - API documentation
   - Deployment process

### 9. Launch Preparation

- [ ] Prepare launch announcement
- [ ] Set up support email
- [ ] Create demo accounts
- [ ] Prepare marketing materials
- [ ] Schedule user training
- [ ] Set up feedback collection

### 10. Go-Live Checklist

#### 24 Hours Before
- [ ] Final testing on staging
- [ ] Backup current data
- [ ] Notify team of launch time
- [ ] Prepare rollback plan

#### Launch Day
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Test critical paths
- [ ] Monitor error logs
- [ ] Send launch announcement

#### Post-Launch (First 48 Hours)
- [ ] Monitor performance metrics
- [ ] Address any critical issues
- [ ] Collect user feedback
- [ ] Optimize based on real usage

## 🎯 Success Criteria

- Zero critical errors in first 48 hours
- < 3 second page load times
- 99.9% uptime
- Successful payment processing
- Positive user feedback

## 🚨 Rollback Plan

If critical issues arise:
1. Revert to previous Vercel deployment
2. Restore database from backup
3. Communicate with users
4. Fix issues in staging
5. Re-deploy when stable

---

**FieldForge is ready to transform construction management.**

🍄🚀🏗️