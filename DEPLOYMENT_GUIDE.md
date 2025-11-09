# FieldForge Deployment Guide

## 🚀 Vercel Deployment

### Project Information
- **Vercel Project ID**: `prj_VxsijypjnqozFi6UeKw2uENCN78c`
- **GitHub Repository**: https://github.com/jcronkdc/fieldforge
- **Production URL**: https://fieldforge.vercel.app

## 📋 Prerequisites

### Required Environment Variables in Vercel

Navigate to your [Vercel Project Settings](https://vercel.com/dashboard/project/prj_VxsijypjnqozFi6UeKw2uENCN78c/settings/environment-variables) and configure:

#### Core Variables (Required)
```env
# Supabase Configuration
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Google Places API (for location services)
VITE_GOOGLE_PLACES_API_KEY=<your-google-places-api-key>
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Backend API (when deployed)
VITE_API_BASE_URL=https://fieldforge-api.onrender.com
```

#### Optional Variables
```env
# Weather Service
VITE_WEATHER_API_KEY=<your-weather-api-key>

# Mapbox (for T-line visualization)
VITE_MAPBOX_TOKEN=<your-mapbox-token>

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

## 🗄️ Database Setup (Supabase)

### 1. Run Migrations

Execute the migrations in order from the Supabase SQL editor:

1. `001_core_company_project_tables.sql` - Core entities
2. `002_safety_compliance_tables.sql` - Safety management
3. `003_equipment_material_tables.sql` - Equipment tracking
4. `004_qaqc_testing_tables.sql` - Quality control
5. `005_scheduling_crew_tables.sql` - Scheduling & crew
6. `006_rfi_submittal_document_tables.sql` - Document management
7. `007_messaging_communication_tables.sql` - Communication
8. `008_environmental_row_change_tables.sql` - Environmental & changes

### 2. Enable Required Extensions

```sql
-- Enable PostGIS for location data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 3. Create Initial Data

```sql
-- Create a test company
INSERT INTO companies (name, type, email, phone)
VALUES ('Demo Electric Co', 'contractor', 'demo@fieldforge.com', '555-0100');

-- Create a test project
INSERT INTO projects (
  company_id, 
  project_number, 
  name, 
  project_type, 
  voltage_class,
  start_date,
  end_date
)
SELECT 
  id,
  'DEMO-001',
  'Demo 138kV Substation Upgrade',
  'substation',
  '138kV',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months'
FROM companies 
WHERE name = 'Demo Electric Co';
```

## 🔑 Google Places API Setup

### 1. Enable APIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the following APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API

### 2. Configure API Key Restrictions

1. Navigate to **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **Application restrictions**, select **HTTP referrers**
4. Add allowed referrers:
   ```
   https://fieldforge.vercel.app/*
   https://*.fieldforge.vercel.app/*
   http://localhost:5173/*
   ```
5. Under **API restrictions**, select **Restrict key**
6. Choose the APIs enabled above

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Configure FieldForge for deployment"
git push origin main
```

### 2. Vercel Auto-Deploy

Vercel will automatically deploy when you push to the main branch.

### 3. Verify Deployment

1. Check build logs in Vercel dashboard
2. Test the production URL
3. Verify environment variables are loaded
4. Test location services with Google Places

## 🔧 Backend Deployment (Render)

### 1. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create new **Web Service**
3. Connect GitHub repo: `https://github.com/jcronkdc/fieldforge`
4. Configure:
   - **Name**: `fieldforge-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2. Environment Variables for Backend

```env
# Database
DATABASE_URL=<your-postgres-connection-string>

# Supabase (Service Role)
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-service-role-key>

# JWT
JWT_SECRET=<generate-secure-secret>

# Weather Service
WEATHER_API_KEY=<your-weather-api-key>

# File Storage (S3 or Supabase Storage)
STORAGE_BUCKET=fieldforge-files
STORAGE_ENDPOINT=<your-storage-endpoint>
STORAGE_ACCESS_KEY=<your-access-key>
STORAGE_SECRET_KEY=<your-secret-key>
```

### 3. Update Frontend API URL

Once backend is deployed, update Vercel environment variable:
```env
VITE_API_BASE_URL=https://fieldforge-api.onrender.com
```

## 📱 PWA Configuration

### Enable PWA Features

1. Service worker is configured in `vite.config.ts`
2. Manifest is served at `/manifest.json`
3. Users can install the app via browser prompt

### Test PWA Installation

1. Open site in Chrome/Edge
2. Look for install prompt in address bar
3. Install and test offline functionality

## 🔍 Monitoring & Analytics

### 1. Vercel Analytics

- Automatically enabled for Pro accounts
- View at: https://vercel.com/dashboard/project/prj_VxsijypjnqozFi6UeKw2uENCN78c/analytics

### 2. Error Tracking (Optional)

Add Sentry for error tracking:

```env
VITE_SENTRY_DSN=<your-sentry-dsn>
```

### 3. Google Analytics (Optional)

```env
VITE_GA_TRACKING_ID=<your-ga-tracking-id>
```

## 🏗️ Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test user authentication flow
- [ ] Check Google Places autocomplete
- [ ] Verify location tracking works
- [ ] Test offline mode functionality
- [ ] Confirm database migrations ran successfully
- [ ] Test file upload to storage
- [ ] Verify real-time messaging
- [ ] Check PWA installation
- [ ] Test on mobile devices

## 🆘 Troubleshooting

### Common Issues

1. **Google Places not working**
   - Check API key restrictions
   - Verify billing is enabled on Google Cloud
   - Check browser console for errors

2. **Database connection errors**
   - Verify Supabase URL and keys
   - Check RLS policies are applied
   - Ensure migrations ran in order

3. **Build failures**
   - Check Node.js version (requires 18+)
   - Clear Vercel cache and redeploy
   - Review build logs for specific errors

4. **CORS issues**
   - Verify backend CORS configuration
   - Check API URL environment variable
   - Ensure headers are set in vercel.json

## 📞 Support

For deployment assistance:
- GitHub Issues: https://github.com/jcronkdc/fieldforge/issues
- Email: support@fieldforge.com

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/swipe-feed && npm ci
      - run: cd apps/swipe-feed && npm run build
      - run: cd apps/swipe-feed && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: prj_VxsijypjnqozFi6UeKw2uENCN78c
          vercel-args: '--prod'
```

---

Last Updated: November 2025
