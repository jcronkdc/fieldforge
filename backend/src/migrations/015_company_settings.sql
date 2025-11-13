-- Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  address JSONB DEFAULT '{"street": "", "city": "", "state": "", "zip": "", "country": "US"}',
  contact JSONB DEFAULT '{"phone": "", "email": "", "website": ""}',
  branding JSONB DEFAULT '{"logo_url": "", "primary_color": "#F59E0B", "secondary_color": "#1F2937"}',
  settings JSONB DEFAULT '{"default_language": "en", "timezone": "America/New_York", "currency": "USD", "fiscal_year_start": 1}',
  subscription JSONB DEFAULT '{"plan": "Professional", "status": "active", "seats": 25, "billing_email": "", "next_billing_date": null}',
  integrations JSONB DEFAULT '{"accounting": {"enabled": false, "provider": ""}, "crm": {"enabled": false, "provider": ""}, "payroll": {"enabled": false, "provider": ""}}',
  data_retention JSONB DEFAULT '{"projects": 24, "documents": 36, "analytics": 12}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Create index on company_id for fast lookups
CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);

-- Create RLS policies
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/update company settings
CREATE POLICY company_settings_admin_policy ON company_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = company_settings.company_id
      AND (users.is_admin = true OR users.role = 'admin')
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_settings_timestamp
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_company_settings_timestamp();

-- Function to get or create company settings
CREATE OR REPLACE FUNCTION get_or_create_company_settings(p_company_id UUID)
RETURNS company_settings AS $$
DECLARE
  v_settings company_settings;
  v_company_name VARCHAR(255);
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings FROM company_settings WHERE company_id = p_company_id;
  
  -- If not found, create new settings with company name
  IF NOT FOUND THEN
    -- Get company name
    SELECT name INTO v_company_name FROM companies WHERE id = p_company_id;
    
    INSERT INTO company_settings (company_id, name, legal_name) 
    VALUES (p_company_id, v_company_name, v_company_name) 
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql;

-- Audit log for company settings changes
CREATE TABLE IF NOT EXISTS company_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_settings_audit_company ON company_settings_audit(company_id);
CREATE INDEX idx_company_settings_audit_user ON company_settings_audit(user_id);
CREATE INDEX idx_company_settings_audit_created ON company_settings_audit(created_at);
