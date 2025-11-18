-- FieldForge Demo Accounts Setup
-- Creates all three demo accounts shown on the home page
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  field_worker_id UUID;
  manager_id UUID;
  admin_id UUID;
  demo_company_id UUID;
  demo_project_id UUID;
BEGIN
  -- Ensure demo company exists
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Electric Co' LIMIT 1;

  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, type, email, phone, address)
    VALUES ('Demo Electric Co', 'contractor', 'info@demoelectric.com', '555-0100', '123 Demo Street, Demo City, DC 12345')
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
      status,
      description
    )
    VALUES (
      demo_company_id,
      'DEMO-001',
      'Demo 138kV Substation Upgrade',
      'substation',
      '138kV',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '6 months',
      'active',
      'Complete substation upgrade project for demonstration purposes'
    )
    RETURNING id INTO demo_project_id;
  END IF;

  -- Get user IDs (these need to be created in Supabase Auth first)
  SELECT id INTO field_worker_id FROM auth.users WHERE email = 'demo@fieldforge.com' LIMIT 1;
  SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@fieldforge.com' LIMIT 1;
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@fieldforge.com' LIMIT 1;

  -- Create field worker profile
  IF field_worker_id IS NOT NULL THEN
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
      field_worker_id,
      'demo@fieldforge.com',
      'Demo',
      'Worker',
      'Field Technician',
      '555-0101',
      demo_company_id,
      'user',
      false
    )
    ON CONFLICT (id) DO UPDATE
    SET
      first_name = 'Demo',
      last_name = 'Worker',
      job_title = 'Field Technician',
      company_id = demo_company_id,
      updated_at = now();

    -- Add to demo project
    INSERT INTO project_team (
      project_id,
      user_id,
      role,
      company_id,
      start_date
    )
    VALUES (
      demo_project_id,
      field_worker_id,
      'field_worker',
      demo_company_id,
      CURRENT_DATE
    )
    ON CONFLICT (project_id, user_id) DO UPDATE
    SET role = 'field_worker', updated_at = now();

    RAISE NOTICE 'Field worker demo account setup complete';
  ELSE
    RAISE NOTICE 'Field worker user (demo@fieldforge.com) not found in auth.users. Please create in Supabase Auth first.';
  END IF;

  -- Create manager profile
  IF manager_id IS NOT NULL THEN
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
      manager_id,
      'manager@fieldforge.com',
      'Demo',
      'Manager',
      'Project Manager',
      '555-0102',
      demo_company_id,
      'user',
      false
    )
    ON CONFLICT (id) DO UPDATE
    SET
      first_name = 'Demo',
      last_name = 'Manager',
      job_title = 'Project Manager',
      company_id = demo_company_id,
      updated_at = now();

    -- Add to demo project
    INSERT INTO project_team (
      project_id,
      user_id,
      role,
      company_id,
      start_date
    )
    VALUES (
      demo_project_id,
      manager_id,
      'project_manager',
      demo_company_id,
      CURRENT_DATE
    )
    ON CONFLICT (project_id, user_id) DO UPDATE
    SET role = 'project_manager', updated_at = now();

    RAISE NOTICE 'Manager demo account setup complete';
  ELSE
    RAISE NOTICE 'Manager user (manager@fieldforge.com) not found in auth.users. Please create in Supabase Auth first.';
  END IF;

  -- Create admin profile
  IF admin_id IS NOT NULL THEN
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
      admin_id,
      'admin@fieldforge.com',
      'Demo',
      'Admin',
      'Administrator',
      '555-0103',
      demo_company_id,
      'admin',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET
      first_name = 'Demo',
      last_name = 'Admin',
      job_title = 'Administrator',
      company_id = demo_company_id,
      is_admin = true,
      updated_at = now();

    -- Add to demo project
    INSERT INTO project_team (
      project_id,
      user_id,
      role,
      company_id,
      start_date
    )
    VALUES (
      demo_project_id,
      admin_id,
      'project_admin',
      demo_company_id,
      CURRENT_DATE
    )
    ON CONFLICT (project_id, user_id) DO UPDATE
    SET role = 'project_admin', updated_at = now();

    RAISE NOTICE 'Admin demo account setup complete';
  ELSE
    RAISE NOTICE 'Admin user (admin@fieldforge.com) not found in auth.users. Please create in Supabase Auth first.';
  END IF;

  -- Create some demo data for testing
  IF field_worker_id IS NOT NULL THEN
    -- Add a safety briefing
    INSERT INTO safety_briefings (
      project_id,
      briefing_date,
      shift,
      foreman_id,
      topics,
      weather_conditions,
      created_by,
      attendees
    )
    VALUES (
      demo_project_id,
      CURRENT_DATE,
      'day',
      field_worker_id,
      ARRAY['High voltage safety', 'PPE requirements', 'Emergency procedures', 'Lockout/tagout procedures'],
      '{"temperature": 72, "conditions": "Clear", "wind_speed": 10, "humidity": 45}'::JSONB,
      field_worker_id,
      ARRAY[field_worker_id]
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
      is_active,
      hazards,
      controls
    )
    VALUES (
      demo_project_id,
      'JSA-001',
      'Transformer Installation',
      'Substation Pad 3',
      CURRENT_DATE,
      field_worker_id,
      ARRAY['Hard hat', 'Safety glasses', 'Arc flash suit', 'Safety boots', 'Hearing protection'],
      true,
      ARRAY['Electrical shock', 'Arc flash', 'Falling objects', 'Noise exposure'],
      ARRAY['Lockout/tagout', 'Grounding', 'PPE requirements', 'Fall protection', 'Hearing protection']
    )
    ON CONFLICT (project_id, jsa_number) DO NOTHING;

    RAISE NOTICE 'Demo data created for field worker';
  END IF;

  RAISE NOTICE 'Demo accounts setup script completed!';
  RAISE NOTICE 'Available demo accounts:';
  RAISE NOTICE '  - Field Worker: demo@fieldforge.com / FieldForge2025!Demo';
  RAISE NOTICE '  - Manager: manager@fieldforge.com / FieldForge2025!Demo';
  RAISE NOTICE '  - Admin: admin@fieldforge.com / FieldForge2025!Demo';
END $$;
