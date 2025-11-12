-- COMPLETE QAQC AND DOCUMENT MANAGEMENT SYSTEMS FOR DEPLOYMENT

-- ============================================================================
-- QAQC INSPECTION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS qaqc_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_type VARCHAR(100) NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMPTZ,
  project_id UUID REFERENCES projects(id),
  inspector_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  summary TEXT,
  notes TEXT,
  checklist_template_id UUID,
  photos TEXT[],
  report_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qaqc_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES qaqc_inspections(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'verified', 'closed')),
  location TEXT,
  corrective_action TEXT,
  resolution_date TIMESTAMPTZ,
  resolution_notes TEXT,
  photos TEXT[],
  resolution_photos TEXT[],
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qaqc_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  inspection_type VARCHAR(100) NOT NULL,
  company_id UUID REFERENCES companies(id),
  checklist_items JSONB NOT NULL, -- Array of {item, description, category, required}
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENT MANAGEMENT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES document_folders(id),
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('drawing', 'report', 'permit', 'spec', 'photo', 'other')),
  file_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  project_id UUID REFERENCES projects(id),
  folder_id UUID REFERENCES document_folders(id),
  uploaded_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  share_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  change_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL, -- view, download, share, edit
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MISSING TABLES FOR VERCEL DEPLOYMENT
-- ============================================================================

-- Analytics table (referenced in code but not created)
CREATE TABLE IF NOT EXISTS construction_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimension_1 VARCHAR(255),
  dimension_2 VARCHAR(255),
  dimension_3 VARCHAR(255),
  metadata JSONB,
  project_id UUID REFERENCES projects(id),
  company_id UUID REFERENCES companies(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User certifications (referenced in crew routes)
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  certification_type VARCHAR(100) NOT NULL,
  certification_number VARCHAR(100),
  issued_date DATE NOT NULL,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  is_valid BOOLEAN DEFAULT true,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- QAQC Policies
ALTER TABLE qaqc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE qaqc_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE qaqc_checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspections in their company"
  ON qaqc_inspections FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create inspections"
  ON qaqc_inspections FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Inspectors can update their inspections"
  ON qaqc_inspections FOR UPDATE
  USING (inspector_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can view findings for their company"
  ON qaqc_findings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM qaqc_inspections i 
    WHERE i.id = qaqc_findings.inspection_id 
    AND i.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  ));

-- Document Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their company"
  ON documents FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) 
    OR is_public = true);

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their documents"
  ON documents FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their documents"
  ON documents FOR DELETE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view folders in their company"
  ON document_folders FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create folders"
  ON document_folders FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- QAQC Indexes
CREATE INDEX idx_qaqc_inspections_company_date ON qaqc_inspections(company_id, scheduled_date DESC);
CREATE INDEX idx_qaqc_inspections_project ON qaqc_inspections(project_id);
CREATE INDEX idx_qaqc_inspections_status ON qaqc_inspections(status) WHERE status IN ('scheduled', 'in_progress');
CREATE INDEX idx_qaqc_findings_inspection ON qaqc_findings(inspection_id);
CREATE INDEX idx_qaqc_findings_status ON qaqc_findings(status) WHERE status = 'open';

-- Document Indexes
CREATE INDEX idx_documents_company_folder ON documents(company_id, folder_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_tags ON documents USING gin(tags);
CREATE INDEX idx_document_shares_token ON document_shares(share_token);
CREATE INDEX idx_document_shares_expiry ON document_shares(expires_at) WHERE expires_at > NOW();

-- Analytics Indexes
CREATE INDEX idx_construction_analytics_type ON construction_analytics(metric_type, recorded_at DESC);
CREATE INDEX idx_construction_analytics_project ON construction_analytics(project_id, recorded_at DESC);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_qaqc_inspections_updated_at BEFORE UPDATE ON qaqc_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_qaqc_findings_updated_at BEFORE UPDATE ON qaqc_findings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_document_folders_updated_at BEFORE UPDATE ON document_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
