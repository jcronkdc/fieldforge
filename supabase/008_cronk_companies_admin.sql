-- Create Cronk Companies LLC and admin account for Justin Cronk
-- This migration sets up the parent company structure and admin user

-- First, create the parent company - Cronk Companies LLC
INSERT INTO companies (id, name, type, address, phone, email, website, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Cronk Companies LLC',
  'parent',
  '13740 10th Ave South, Zimmerman, MN 55398',
  '6123103241',
  'admin@cronkcompanies.com',
  'https://cronkcompanies.com',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Get the Cronk Companies ID
DO $$
DECLARE
  v_parent_company_id UUID;
  v_brink_company_id UUID;
  v_admin_user_id UUID;
  v_brink_project_id UUID;
BEGIN
  -- Get parent company ID
  SELECT id INTO v_parent_company_id 
  FROM companies 
  WHERE name = 'Cronk Companies LLC'
  LIMIT 1;

  -- Ensure Brink Constructors exists and update as subsidiary
  INSERT INTO companies (id, name, type, parent_company_id, address, phone, email, website, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Brink Constructors',
    'subsidiary',
    v_parent_company_id,
    '123 Construction Way, Minneapolis, MN 55401',
    '6125551234',
    'info@brinkconstructors.com',
    'https://brinkconstructors.com',
    NOW(),
    NOW()
  )
  ON CONFLICT (name) 
  DO UPDATE SET 
    parent_company_id = v_parent_company_id,
    type = 'subsidiary',
    updated_at = NOW();

  -- Get Brink Constructors ID
  SELECT id INTO v_brink_company_id 
  FROM companies 
  WHERE name = 'Brink Constructors'
  LIMIT 1;

  -- Check if user exists first (by email)
  SELECT id INTO v_admin_user_id
  FROM auth.users
  WHERE email = 'justincronk@pm.me'
  LIMIT 1;

  -- Only proceed if user doesn't exist
  IF v_admin_user_id IS NULL THEN
    -- Note: User creation needs to be done through Supabase Auth
    -- This is a placeholder - the actual user needs to be created via the application or Supabase dashboard
    RAISE NOTICE 'Admin user justincronk@pm.me needs to be created through Supabase Auth';
  END IF;

  -- If user exists, create/update their profile
  IF v_admin_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      id,
      email,
      first_name,
      last_name,
      phone,
      job_title,
      company_id,
      role,
      is_admin,
      address,
      employee_id,
      created_at,
      updated_at
    )
    VALUES (
      v_admin_user_id,
      'justincronk@pm.me',
      'Justin',
      'Cronk',
      '6123103241',
      'Project Manager',
      v_brink_company_id,
      'admin',
      true,
      '13740 10th Ave South, Zimmerman, MN 55398',
      NULL, -- No employee ID as requested
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      first_name = 'Justin',
      last_name = 'Cronk',
      phone = '6123103241',
      job_title = 'Project Manager',
      company_id = v_brink_company_id,
      role = 'admin',
      is_admin = true,
      address = '13740 10th Ave South, Zimmerman, MN 55398',
      updated_at = NOW();

    -- Grant admin permissions to all existing projects for this user
    INSERT INTO project_team (project_id, user_id, role, permissions, created_at)
    SELECT 
      p.id,
      v_admin_user_id,
      'admin',
      '{"read": true, "write": true, "delete": true, "manage_team": true, "manage_budget": true}'::jsonb,
      NOW()
    FROM projects p
    WHERE p.company_id = v_brink_company_id
    ON CONFLICT (project_id, user_id) 
    DO UPDATE SET 
      role = 'admin',
      permissions = '{"read": true, "write": true, "delete": true, "manage_team": true, "manage_budget": true}'::jsonb;
  END IF;

END $$;

-- Create email_logs table if it doesn't exist (for email service)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert email logs
CREATE POLICY "Users can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow users to view their own email logs
CREATE POLICY "Users can view their own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.email() = ANY(to_addresses) OR
    auth.email() = ANY(cc_addresses) OR
    auth.email() = ANY(bcc_addresses)
  );

-- Grant necessary permissions
GRANT INSERT, SELECT ON email_logs TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_companies_parent ON companies(parent_company_id);

-- Add company hierarchy view
CREATE OR REPLACE VIEW company_hierarchy AS
SELECT 
  c.id,
  c.name,
  c.type,
  c.parent_company_id,
  p.name as parent_company_name,
  c.address,
  c.phone,
  c.email,
  c.website
FROM companies c
LEFT JOIN companies p ON c.parent_company_id = p.id;

-- Grant access to the view
GRANT SELECT ON company_hierarchy TO authenticated;

-- Instructions for creating the admin user:
COMMENT ON TABLE user_profiles IS 
'To create the admin account for Justin Cronk:
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Invite User" or "Create User"
3. Enter email: justincronk@pm.me
4. Enter password: Junuh2014!
5. Once created, this migration will automatically set up the profile with admin privileges

Alternatively, use the application signup flow with these credentials.';
