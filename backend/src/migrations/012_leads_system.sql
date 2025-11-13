-- Lead Capture System for Sales Pipeline
-- Stores comprehensive business information from demo requests

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  industry_segment VARCHAR(100),
  company_size VARCHAR(50),
  annual_revenue VARCHAR(50),
  current_software TEXT[],
  
  -- Project Information
  avg_project_size VARCHAR(50),
  projects_per_year INTEGER,
  project_duration VARCHAR(50),
  main_challenges TEXT[],
  
  -- Contact Information
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  best_time_to_call VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Additional Details
  source VARCHAR(100),
  interested_features TEXT[],
  timeline VARCHAR(50),
  notes TEXT,
  
  -- Tracking Information
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Lead Management
  status VARCHAR(50) DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  last_contacted TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company ON leads(company_name);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- Add trigger for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE leads IS 'Sales leads from demo request forms';
COMMENT ON COLUMN leads.status IS 'new, qualified, contacted, converted, lost';
COMMENT ON COLUMN leads.industry_segment IS 'Electrical, General, T&D, Solar, etc';
COMMENT ON COLUMN leads.company_size IS '1-10, 11-50, 51-200, 201-500, 500+';
COMMENT ON COLUMN leads.timeline IS 'ASAP, 1 month, 3 months, 6 months, researching';
