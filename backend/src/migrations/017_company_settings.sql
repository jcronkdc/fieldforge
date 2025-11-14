-- Company Settings System
-- Multi-tenant organization configuration and management

-- Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company data stored as JSONB for flexibility
  data JSONB NOT NULL DEFAULT '{
    "name": "My Company",
    "legalName": "",
    "taxId": "",
    "registrationNumber": "",
    "industry": "Construction",
    "founded": "",
    "website": "",
    "description": "",
    "email": "",
    "phone": "",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zipCode": "",
      "country": "USA"
    },
    "branding": {
      "primaryColor": "#f59e0b",
      "secondaryColor": "#1e293b",
      "logoUrl": null,
      "faviconUrl": null,
      "emailHeader": null
    },
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "fiscalYearStart": "01-01",
      "defaultProjectDuration": 90,
      "autoNumberProjects": true,
      "projectPrefix": "PROJ-",
      "requireApprovals": true,
      "approvalThreshold": 10000
    },
    "subscription": {
      "plan": "professional",
      "status": "active",
      "currentPeriodEnd": null,
      "seats": 25,
      "usedSeats": 0
    },
    "features": {
      "advancedAnalytics": true,
      "apiAccess": true,
      "customWorkflows": true,
      "unlimitedProjects": true,
      "prioritySupport": true,
      "whiteLabel": false,
      "ssoEnabled": false
    }
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Company Roles Table
CREATE TABLE IF NOT EXISTS company_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  
  -- Role Details
  name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id, name)
);

-- Workflow Templates Table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  
  -- Template Details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id, name)
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  
  -- Key Details
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(64) NOT NULL,
  key_preview VARCHAR(50) NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  
  UNIQUE(key_hash)
);

-- Company Integrations Table
CREATE TABLE IF NOT EXISTS company_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  
  -- Integration Details
  integration_type VARCHAR(50) NOT NULL,
  integration_name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id, integration_type)
);

-- Company Audit Log Table
CREATE TABLE IF NOT EXISTS company_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- User
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add company_id to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';

-- Create indexes
CREATE INDEX idx_company_settings_updated ON company_settings(updated_at);
CREATE INDEX idx_company_roles_company ON company_roles(company_id);
CREATE INDEX idx_workflow_templates_company ON workflow_templates(company_id);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(company_id, category);
CREATE INDEX idx_api_keys_company ON api_keys(company_id);
CREATE INDEX idx_api_keys_active ON api_keys(company_id, is_active);
CREATE INDEX idx_company_integrations_company ON company_integrations(company_id);
CREATE INDEX idx_company_integrations_type ON company_integrations(company_id, integration_type);
CREATE INDEX idx_company_audit_log_company ON company_audit_log(company_id);
CREATE INDEX idx_company_audit_log_created ON company_audit_log(created_at);
CREATE INDEX idx_company_audit_log_user ON company_audit_log(user_id);
CREATE INDEX idx_users_company ON users(company_id);

-- RLS Policies
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_audit_log ENABLE ROW LEVEL SECURITY;

-- Company settings policies
CREATE POLICY "Users can view their company settings"
  ON company_settings FOR SELECT
  USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can update company settings"
  ON company_settings FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- Role policies
CREATE POLICY "Users can view company roles"
  ON company_roles FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage company roles"
  ON company_roles FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- Workflow policies
CREATE POLICY "Users can view company workflows"
  ON workflow_templates FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Managers can manage workflows"
  ON workflow_templates FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'owner', 'manager')
    )
  );

-- API key policies
CREATE POLICY "Admins can manage API keys"
  ON api_keys FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- Integration policies
CREATE POLICY "Admins can manage integrations"
  ON company_integrations FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- Audit log policies
CREATE POLICY "Users can view company audit logs"
  ON company_audit_log FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_roles_updated_at BEFORE UPDATE ON company_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize default roles for a company
CREATE OR REPLACE FUNCTION initialize_company_roles(p_company_id UUID) RETURNS void AS $$
BEGIN
  INSERT INTO company_roles (company_id, name, description, permissions, is_system) VALUES
  (p_company_id, 'owner', 'Company owner with full access', 
   ARRAY['all_permissions'], TRUE),
  (p_company_id, 'admin', 'Administrator with full system access', 
   ARRAY['manage_users', 'manage_roles', 'manage_company', 'view_audit_logs', 'manage_integrations',
         'view_projects', 'create_projects', 'edit_projects', 'delete_projects', 'manage_project_members',
         'view_equipment', 'manage_equipment', 'view_documents', 'upload_documents', 'edit_documents', 
         'delete_documents', 'share_documents', 'view_safety', 'create_incidents', 'manage_safety',
         'approve_permits', 'view_analytics', 'export_reports', 'create_dashboards'], TRUE),
  (p_company_id, 'manager', 'Project manager with team management',
   ARRAY['view_projects', 'create_projects', 'edit_projects', 'manage_project_members',
         'view_equipment', 'request_equipment', 'view_documents', 'upload_documents', 
         'view_safety', 'create_incidents', 'view_analytics'], TRUE),
  (p_company_id, 'member', 'Team member with basic access',
   ARRAY['view_projects', 'view_equipment', 'view_documents', 'view_safety', 'create_incidents'], TRUE);
END;
$$ LANGUAGE plpgsql;

-- Function to create default workflow template
CREATE OR REPLACE FUNCTION create_default_workflow(p_company_id UUID, p_created_by UUID) RETURNS void AS $$
BEGIN
  INSERT INTO workflow_templates (company_id, name, description, category, steps, is_default, created_by)
  VALUES (
    p_company_id,
    'Standard Construction Workflow',
    'Default workflow for construction projects',
    'construction',
    '[
      {"id": "1", "name": "Planning & Design", "assignee": "Project Manager", "duration": 14, "dependencies": []},
      {"id": "2", "name": "Permits & Approvals", "assignee": "Compliance Officer", "duration": 21, "dependencies": ["1"]},
      {"id": "3", "name": "Site Preparation", "assignee": "Site Manager", "duration": 7, "dependencies": ["2"]},
      {"id": "4", "name": "Foundation", "assignee": "Site Manager", "duration": 14, "dependencies": ["3"]},
      {"id": "5", "name": "Structure", "assignee": "Site Manager", "duration": 30, "dependencies": ["4"]},
      {"id": "6", "name": "MEP Installation", "assignee": "MEP Lead", "duration": 21, "dependencies": ["5"]},
      {"id": "7", "name": "Finishing", "assignee": "Site Manager", "duration": 21, "dependencies": ["6"]},
      {"id": "8", "name": "Inspection & Testing", "assignee": "QA Manager", "duration": 7, "dependencies": ["7"]},
      {"id": "9", "name": "Project Closeout", "assignee": "Project Manager", "duration": 7, "dependencies": ["8"]}
    ]'::jsonb,
    TRUE,
    p_created_by
  );
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE company_settings IS 'Company-wide settings and configuration';
COMMENT ON TABLE company_roles IS 'Role definitions and permissions for company users';
COMMENT ON TABLE workflow_templates IS 'Reusable workflow templates for projects';
COMMENT ON TABLE api_keys IS 'API keys for external integrations';
COMMENT ON TABLE company_integrations IS 'Third-party integration configurations';
COMMENT ON TABLE company_audit_log IS 'Audit trail of all company-related actions';

COMMENT ON COLUMN company_settings.data IS 'JSONB storage for flexible company configuration';
COMMENT ON COLUMN company_roles.permissions IS 'Array of permission strings';
COMMENT ON COLUMN workflow_templates.steps IS 'JSONB array of workflow steps with dependencies';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA256 hash of the actual API key';
COMMENT ON COLUMN api_keys.key_preview IS 'Partial view of key for identification';
