-- Migration: Fix leads table schema to match route handler expectations
-- Date: 2025-11-20
-- Purpose: Add missing columns to leads table (found via comprehensive testing MF-62)
-- Issue: leadRoutes.ts expects 22+ columns but table only has 11

-- First, check if we need to preserve existing data
-- If leads table has data, this will safely add columns
-- If table doesn't exist, this will create it with full schema

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  industry_segment VARCHAR(100),
  company_size VARCHAR(50),
  annual_revenue VARCHAR(50),
  current_software TEXT[],  -- Array of current software used
  
  -- Project Information
  avg_project_size VARCHAR(100),
  projects_per_year VARCHAR(50),
  project_duration VARCHAR(50),
  main_challenges TEXT[],  -- Array of main challenges
  
  -- Contact Information
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  best_time_to_call VARCHAR(50),
  timezone VARCHAR(100),
  
  -- Lead Details
  source VARCHAR(100),
  interested_features TEXT[],  -- Array of features they're interested in
  timeline VARCHAR(50),
  notes TEXT,
  
  -- Submission Metadata
  submitted_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  
  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table already exists with old schema, add missing columns
DO $$ 
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'company_name') THEN
    ALTER TABLE leads ADD COLUMN company_name VARCHAR(255);
    -- Copy data from old 'company' column if it exists
    UPDATE leads SET company_name = company WHERE company IS NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'industry_segment') THEN
    ALTER TABLE leads ADD COLUMN industry_segment VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'annual_revenue') THEN
    ALTER TABLE leads ADD COLUMN annual_revenue VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'current_software') THEN
    ALTER TABLE leads ADD COLUMN current_software TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'avg_project_size') THEN
    ALTER TABLE leads ADD COLUMN avg_project_size VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'projects_per_year') THEN
    ALTER TABLE leads ADD COLUMN projects_per_year VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'project_duration') THEN
    ALTER TABLE leads ADD COLUMN project_duration VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'main_challenges') THEN
    ALTER TABLE leads ADD COLUMN main_challenges TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'full_name') THEN
    ALTER TABLE leads ADD COLUMN full_name VARCHAR(255);
    -- Copy from old 'name' column if exists
    UPDATE leads SET full_name = name WHERE name IS NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'title') THEN
    ALTER TABLE leads ADD COLUMN title VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'best_time_to_call') THEN
    ALTER TABLE leads ADD COLUMN best_time_to_call VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'timezone') THEN
    ALTER TABLE leads ADD COLUMN timezone VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'source') THEN
    ALTER TABLE leads ADD COLUMN source VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'interested_features') THEN
    ALTER TABLE leads ADD COLUMN interested_features TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'timeline') THEN
    ALTER TABLE leads ADD COLUMN timeline VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'notes') THEN
    ALTER TABLE leads ADD COLUMN notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'submitted_at') THEN
    ALTER TABLE leads ADD COLUMN submitted_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'ip_address') THEN
    ALTER TABLE leads ADD COLUMN ip_address VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'user_agent') THEN
    ALTER TABLE leads ADD COLUMN user_agent TEXT;
  END IF;
  
  -- Make required columns NOT NULL after data migration
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'leads' AND column_name = 'company_name' 
             AND is_nullable = 'YES') THEN
    ALTER TABLE leads ALTER COLUMN company_name SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'leads' AND column_name = 'full_name' 
             AND is_nullable = 'YES') THEN
    ALTER TABLE leads ALTER COLUMN full_name SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'leads' AND column_name = 'email' 
             AND is_nullable = 'YES') THEN
    ALTER TABLE leads ALTER COLUMN email SET NOT NULL;
  END IF;
  
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Comments for documentation
COMMENT ON TABLE leads IS 'Marketing leads from website contact forms and landing pages';
COMMENT ON COLUMN leads.company_name IS 'Name of the company inquiring';
COMMENT ON COLUMN leads.industry_segment IS 'Industry segment: Transmission & Distribution, Substation, etc.';
COMMENT ON COLUMN leads.company_size IS 'Company size: 1-10, 11-50, 51-200, 201-500, 500+';
COMMENT ON COLUMN leads.current_software IS 'Array of current software solutions being used';
COMMENT ON COLUMN leads.main_challenges IS 'Array of main operational challenges';
COMMENT ON COLUMN leads.interested_features IS 'Array of features they are interested in';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, proposal, closed-won, closed-lost';


