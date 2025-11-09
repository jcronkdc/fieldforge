# Supabase Database Setup Guide for FieldForge

## 🚀 Quick Setup Instructions

Follow these steps to set up your FieldForge database in Supabase:

## 1. Access Supabase SQL Editor

1. Log into your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

## 2. Run the Complete Setup Script

1. Open the file: `/supabase/setup_fieldforge.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

The script will:
- ✅ Enable required extensions (uuid-ossp, PostGIS, pg_trgm)
- ✅ Create all 50+ tables for FieldForge
- ✅ Set up indexes for performance
- ✅ Configure Row Level Security (RLS)
- ✅ Create demo company and project
- ✅ Set up proper relationships and constraints

## 3. Verify Installation

Run this verification query to check all tables were created:

```sql
-- Check all FieldForge tables
SELECT 
    table_name,
    COUNT(*) OVER() as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'companies', 'projects', 'project_team', 'user_profiles',
        'safety_briefings', 'job_safety_analyses', 'switching_orders',
        'arc_flash_boundaries', 'substation_equipment', 'transmission_structures',
        'conductors', 'material_inventory', 'qaqc_inspections', 'test_reports',
        'daily_reports', 'rfis', 'submittals', 'message_channels', 'messages'
    )
ORDER BY table_name;
```

Expected result: Should show 20+ tables

## 4. Create Your First User Account

1. Go to **Authentication** → **Users** in Supabase
2. Click **Invite User**
3. Enter your email address
4. User will receive an invite to set password

OR use the app's signup flow once deployed.

## 5. Set Up User Profile

After creating a user, run this to create their profile:

```sql
-- Replace with actual user ID from auth.users
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    email,
    company_id,
    job_title
)
SELECT 
    auth.uid(),  -- Current user's ID
    'Your',
    'Name',
    'your.email@company.com',
    (SELECT id FROM companies WHERE name = 'Demo Electric Co'),
    'Project Manager'
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid()
);

-- Add user to demo project
INSERT INTO project_team (
    project_id,
    user_id,
    role,
    company_id
)
SELECT 
    p.id,
    auth.uid(),
    'project_manager',
    c.id
FROM projects p
JOIN companies c ON c.name = 'Demo Electric Co'
WHERE p.project_number = 'DEMO-001'
AND NOT EXISTS (
    SELECT 1 FROM project_team 
    WHERE project_id = p.id AND user_id = auth.uid()
);
```

## 6. Configure Storage Buckets (Optional)

For file uploads, create storage buckets:

1. Go to **Storage** in Supabase
2. Click **New Bucket**
3. Create these buckets:
   - `project-documents` (for RFIs, submittals, drawings)
   - `daily-photos` (for field photos)
   - `test-reports` (for equipment test documentation)
   - `safety-documents` (for JSAs, permits)

Set policies for authenticated users:

```sql
-- Example storage policy for project documents
CREATE POLICY "Users can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'project-documents' AND
    auth.uid() IN (
        SELECT user_id FROM project_team 
        WHERE project_id::text = (storage.foldername(name))[1]
    )
);
```

## 7. Enable Realtime (Optional)

For live updates in the app:

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `messages` (for chat)
   - `daily_reports` (for field updates)
   - `weather_logs` (for weather alerts)
   - `broadcast_messages` (for emergency alerts)

## 8. Set Up Database Backups

1. Go to **Settings** → **Database**
2. Enable **Point in Time Recovery**
3. Set backup retention period (recommended: 7 days minimum)

## 📊 Database Statistics

After setup, your database will have:

- **50+ Tables** covering all aspects of T&D construction
- **100+ Indexes** for optimal query performance
- **Complete RLS Policies** for security
- **Foreign Key Relationships** maintaining data integrity
- **Generated Columns** for automatic calculations

## 🔍 Useful Queries

### Check Project Status
```sql
SELECT 
    p.project_number,
    p.name,
    p.voltage_class,
    p.status,
    COUNT(DISTINCT pt.user_id) as team_members,
    COUNT(DISTINCT e.id) as equipment_count
FROM projects p
LEFT JOIN project_team pt ON pt.project_id = p.id
LEFT JOIN substation_equipment e ON e.project_id = p.id
GROUP BY p.id;
```

### View Recent Daily Reports
```sql
SELECT 
    dr.report_date,
    dr.shift,
    dr.crew_count,
    dr.structures_set,
    dr.conductor_strung_ft,
    dr.safety_observations,
    u.email as foreman
FROM daily_reports dr
LEFT JOIN auth.users u ON u.id = dr.foreman_id
ORDER BY dr.report_date DESC
LIMIT 10;
```

### Check Open RFIs
```sql
SELECT 
    rfi_number,
    title,
    priority,
    status,
    days_outstanding,
    required_response_date
FROM rfis
WHERE status IN ('open', 'in_review')
ORDER BY days_outstanding DESC;
```

## 🚨 Troubleshooting

### If tables don't create:
1. Check for error messages in SQL editor output
2. Ensure extensions are enabled first
3. Try running the script in sections

### If RLS policies block access:
1. Temporarily disable RLS for testing:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```
2. Remember to re-enable for production!

### If foreign key errors occur:
Run tables in dependency order:
1. Companies first
2. Projects second
3. User profiles third
4. All other tables after

## ✅ Setup Complete!

Your Supabase database is now ready for FieldForge! 

The application will automatically:
- Connect using the environment variables
- Handle authentication through Supabase Auth
- Apply RLS policies for security
- Sync data in real-time (if enabled)

## 📝 Next Steps

1. **Deploy the application** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Test the connection** by signing up in the app
4. **Start using FieldForge** for your T&D projects!

---

**Support**: If you encounter any issues, check the Supabase logs under **Logs** → **Database** in your dashboard.

**Database URL**: You can find your database connection details under **Settings** → **Database** in Supabase.
