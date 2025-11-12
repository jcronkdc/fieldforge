-- FieldForge Demo Account Setup
-- Run this AFTER creating the demo user in Supabase Auth dashboard

-- First, create the demo user via Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: demo@fieldforge.com
-- 4. Password: FieldForge2025!Demo
-- 5. Check "Auto Confirm Email"
-- 6. Click "Create user"

-- Then run this script to set up the profile:

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
  demo_project_id UUID;
BEGIN
  -- Get the demo user ID
  SELECT id INTO demo_user_id 
  FROM auth.users 
  WHERE email = 'demo@fieldforge.com'
  LIMIT 1;
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found. Please create demo@fieldforge.com in Supabase Auth first.';
  END IF;
  
  -- Ensure demo company exists
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Electric Co' LIMIT 1;
  
  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, type, email, phone)
    VALUES ('Demo Electric Co', 'contractor', 'demo@fieldforge.com', '555-0100')
    RETURNING id INTO demo_company_id;
  END IF;
  
  -- Ensure demo project exists
  SELECT id INTO demo_project_id FROM projects WHERE project_number = 'DEMO-001' LIMIT 1;
  
  IF demo_project_id IS NULL THEN
    INSERT INTO projects (
      company_id,
      project_number,
      name,
      project_type,
      voltage_class,
      start_date,
      end_date,
      status
    )
    VALUES (
      demo_company_id,
      'DEMO-001',
      'Demo 138kV Substation Upgrade',
      'substation',
      '138kV',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '6 months',
      'active'
    )
    RETURNING id INTO demo_project_id;
  END IF;
  
  -- Create or update user profile
  INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    job_title,
    phone,
    company_id,
    role,
    is_admin
  )
  VALUES (
    demo_user_id,
    'demo@fieldforge.com',
    'Demo',
    'User',
    'Project Manager',
    '555-0100',
    demo_company_id,
    'user',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    first_name = 'Demo',
    last_name = 'User',
    job_title = 'Project Manager',
    company_id = demo_company_id,
    role = COALESCE(user_profiles.role, 'user'),
    is_admin = COALESCE(user_profiles.is_admin, false),
    updated_at = now();
  
  -- Add to demo project as project manager
  INSERT INTO project_team (
    project_id,
    user_id,
    role,
    company_id,
    start_date
  )
  VALUES (
    demo_project_id,
    demo_user_id,
    'project_manager',
    demo_company_id,
    CURRENT_DATE
  )
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET 
    role = 'project_manager',
    updated_at = now();
  
  -- Create some demo data for the user
  
  -- Add a safety briefing
  INSERT INTO safety_briefings (
    project_id,
    briefing_date,
    shift,
    foreman_id,
    topics,
    weather_conditions,
    created_by
  )
  VALUES (
    demo_project_id,
    CURRENT_DATE,
    'day',
    demo_user_id,
    ARRAY['High voltage safety', 'PPE requirements', 'Emergency procedures'],
    '{"temperature": 72, "conditions": "Clear", "wind_speed": 10}'::JSONB,
    demo_user_id
  )
  ON CONFLICT DO NOTHING;
  
  -- Add a JSA
  INSERT INTO job_safety_analyses (
    project_id,
    jsa_number,
    title,
    work_location,
    date_prepared,
    prepared_by,
    required_ppe,
    is_active
  )
  VALUES (
    demo_project_id,
    'JSA-001',
    'Transformer Installation',
    'Substation Pad 3',
    CURRENT_DATE,
    demo_user_id,
    ARRAY['Hard hat', 'Safety glasses', 'Arc flash suit', 'Safety boots'],
    true
  )
  ON CONFLICT (project_id, jsa_number) DO NOTHING;
  
  RAISE NOTICE 'Demo account setup complete!';
  RAISE NOTICE 'Email: demo@fieldforge.com';
  RAISE NOTICE 'Password: FieldForge2025!Demo';
  RAISE NOTICE 'Profile, project, and demo data created successfully.';
END $$;
