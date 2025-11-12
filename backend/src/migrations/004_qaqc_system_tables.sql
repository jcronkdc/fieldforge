-- COMPLETE QAQC SYSTEM FOR END-TO-END FUNCTIONALITY

-- Inspection Types
CREATE TABLE IF NOT EXISTS inspection_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- Electrical, Structural, Safety, Quality
  description TEXT,
  checklist_template JSONB, -- Standard checklist items
  frequency VARCHAR(50), -- Daily, Weekly, Monthly, Milestone
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_type_id UUID REFERENCES inspection_types(id),
  project_id UUID REFERENCES projects(id),
  location TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  inspector_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'requires_followup')),
  overall_rating VARCHAR(20) CHECK (overall_rating IN ('pass', 'fail', 'conditional', 'not_applicable')),
  weather_conditions VARCHAR(100),
  temperature DECIMAL(5,2),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Items (checklist)
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('pass', 'fail', 'not_applicable', 'needs_attention')),
  severity VARCHAR(20) CHECK (severity IN ('critical', 'major', 'minor', 'observation')),
  notes TEXT,
  corrective_action TEXT,
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Non-Conformance Reports (NCRs)
CREATE TABLE IF NOT EXISTS non_conformance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ncr_number VARCHAR(100) UNIQUE NOT NULL,
  inspection_id UUID REFERENCES inspections(id),
  project_id UUID REFERENCES projects(id),
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  severity VARCHAR(20) CHECK (severity IN ('critical', 'major', 'minor')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'corrective_action', 'verification', 'closed')),
  due_date DATE,
  closed_date DATE,
  photos TEXT[],
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Records
CREATE TABLE IF NOT EXISTS test_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type VARCHAR(100) NOT NULL, -- Insulation, Continuity, Load, Pressure, etc.
  project_id UUID REFERENCES projects(id),
  equipment_id UUID REFERENCES equipment_inventory(id),
  tested_by UUID REFERENCES auth.users(id),
  witnessed_by UUID REFERENCES auth.users(id),
  test_date DATE NOT NULL,
  test_procedure TEXT,
  specifications TEXT,
  results JSONB NOT NULL, -- Flexible structure for different test types
  pass_fail VARCHAR(20) CHECK (pass_fail IN ('pass', 'fail', 'conditional')),
  certificate_number VARCHAR(100),
  next_test_due DATE,
  attachments TEXT[],
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality Metrics (for analytics)
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  metric_date DATE NOT NULL,
  total_inspections INTEGER DEFAULT 0,
  passed_inspections INTEGER DEFAULT 0,
  failed_inspections INTEGER DEFAULT 0,
  open_ncrs INTEGER DEFAULT 0,
  closed_ncrs INTEGER DEFAULT 0,
  defect_rate DECIMAL(5,2), -- Percentage
  first_time_quality DECIMAL(5,2), -- Percentage
  rework_hours DECIMAL(10,2),
  quality_score DECIMAL(5,2), -- Overall score out of 100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, metric_date)
);

-- Row Level Security
ALTER TABLE inspection_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

-- Inspection Types - Everyone can view
CREATE POLICY "All users can view inspection types"
  ON inspection_types FOR SELECT
  TO authenticated
  USING (true);

-- Inspections Policies
CREATE POLICY "Users can view inspections in their company"
  ON inspections FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Inspectors can create inspections"
  ON inspections FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'inspector', 'supervisor', 'manager'))
  );

CREATE POLICY "Inspectors can update their inspections"
  ON inspections FOR UPDATE
  USING (
    inspector_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Inspection Items Policies
CREATE POLICY "Users can view inspection items"
  ON inspection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_items.inspection_id
      AND i.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Inspectors can manage inspection items"
  ON inspection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_items.inspection_id
      AND (i.inspector_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
    )
  );

-- NCR Policies
CREATE POLICY "Users can view NCRs in their company"
  ON non_conformance_reports FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create NCRs"
  ON non_conformance_reports FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Assigned users can update NCRs"
  ON non_conformance_reports FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    reported_by = auth.uid() OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'inspector'))
  );

-- Test Records Policies
CREATE POLICY "Users can view test records in their company"
  ON test_records FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Testers can create test records"
  ON test_records FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    tested_by = auth.uid()
  );

-- Functions for complex operations
CREATE OR REPLACE FUNCTION generate_ncr_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NCR-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(NEXTVAL('ncr_sequence')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for NCR numbers
CREATE SEQUENCE IF NOT EXISTS ncr_sequence START WITH 1;

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(
  p_project_id UUID,
  p_date DATE
) RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
  v_inspection_rate DECIMAL;
  v_ncr_closure_rate DECIMAL;
  v_defect_penalty DECIMAL;
BEGIN
  SELECT 
    CASE 
      WHEN total_inspections > 0 
      THEN (passed_inspections::DECIMAL / total_inspections * 50) -- 50% weight
      ELSE 50
    END +
    CASE 
      WHEN (open_ncrs + closed_ncrs) > 0
      THEN (closed_ncrs::DECIMAL / (open_ncrs + closed_ncrs) * 30) -- 30% weight
      ELSE 30
    END +
    CASE
      WHEN defect_rate IS NOT NULL
      THEN GREATEST(0, 20 - defect_rate) -- 20% weight, penalty for defects
      ELSE 20
    END
  INTO v_score
  FROM quality_metrics
  WHERE project_id = p_project_id AND metric_date = p_date;
  
  RETURN COALESCE(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_inspections_project_date ON inspections(project_id, scheduled_date DESC);
CREATE INDEX idx_inspections_status ON inspections(status) WHERE status != 'completed';
CREATE INDEX idx_inspection_items_status ON inspection_items(inspection_id, status);
CREATE INDEX idx_ncr_status ON non_conformance_reports(status) WHERE status != 'closed';
CREATE INDEX idx_ncr_assigned ON non_conformance_reports(assigned_to) WHERE status != 'closed';
CREATE INDEX idx_test_records_project ON test_records(project_id, test_date DESC);
CREATE INDEX idx_quality_metrics_project ON quality_metrics(project_id, metric_date DESC);

-- Update triggers
CREATE TRIGGER update_inspection_types_updated_at BEFORE UPDATE ON inspection_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ncr_updated_at BEFORE UPDATE ON non_conformance_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
