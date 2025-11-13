-- Equipment Tests Table
CREATE TABLE IF NOT EXISTS equipment_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  equipment_name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100) NOT NULL,
  test_type VARCHAR(50) CHECK (test_type IN ('routine', 'certification', 'safety', 'performance', 'compliance')) NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  performed_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) CHECK (status IN ('scheduled', 'in_progress', 'passed', 'failed', 'overdue')) DEFAULT 'scheduled',
  results JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  next_due_date DATE,
  compliance_standard VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_equipment_tests_equipment_id ON equipment_tests(equipment_id);
CREATE INDEX idx_equipment_tests_scheduled_date ON equipment_tests(scheduled_date);
CREATE INDEX idx_equipment_tests_status ON equipment_tests(status);
CREATE INDEX idx_equipment_tests_test_type ON equipment_tests(test_type);
CREATE INDEX idx_equipment_tests_compliance ON equipment_tests(compliance_standard) WHERE compliance_standard IS NOT NULL;

-- Enable RLS
ALTER TABLE equipment_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view tests for equipment in their company"
  ON equipment_tests
  FOR SELECT
  USING (
    equipment_id IN (
      SELECT id FROM equipment 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tests for their company equipment"
  ON equipment_tests
  FOR INSERT
  WITH CHECK (
    equipment_id IN (
      SELECT id FROM equipment 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update tests they created or performed"
  ON equipment_tests
  FOR UPDATE
  USING (
    created_by = auth.uid() 
    OR performed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Test Templates Table
CREATE TABLE IF NOT EXISTS test_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100) NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  frequency_days INTEGER NOT NULL,
  parameters JSONB DEFAULT '[]'::jsonb,
  compliance_standard VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_test_templates_company ON test_templates(company_id);
CREATE INDEX idx_test_templates_equipment_type ON test_templates(equipment_type);
CREATE INDEX idx_test_templates_active ON test_templates(is_active);

-- Enable RLS
ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Users can view templates for their company or global templates"
  ON test_templates
  FOR SELECT
  USING (
    company_id IS NULL 
    OR company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their company"
  ON test_templates
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update company templates"
  ON test_templates
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_equipment_tests_updated_at 
  BEFORE UPDATE ON equipment_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_test_templates_updated_at 
  BEFORE UPDATE ON test_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to check and create overdue tests
CREATE OR REPLACE FUNCTION update_overdue_tests()
RETURNS void AS $$
BEGIN
  UPDATE equipment_tests 
  SET status = 'overdue'
  WHERE status = 'scheduled' 
    AND scheduled_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Test Results Archive Table (for historical data)
CREATE TABLE IF NOT EXISTS test_results_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES equipment_tests(id),
  equipment_id UUID REFERENCES equipment(id),
  test_date DATE NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  passed BOOLEAN NOT NULL,
  results JSONB NOT NULL,
  technician_id UUID REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_results_archive_equipment ON test_results_archive(equipment_id);
CREATE INDEX idx_test_results_archive_date ON test_results_archive(test_date);

-- Default test templates
INSERT INTO test_templates (company_id, name, equipment_type, test_type, frequency_days, parameters, compliance_standard) VALUES
(NULL, 'Monthly Safety Inspection', 'crane', 'safety', 30, '[{"name": "Wire Rope Condition", "expected_value": "Good", "unit": "condition"}, {"name": "Hook Condition", "expected_value": "Good", "unit": "condition"}, {"name": "Load Test", "expected_value": "Pass", "unit": "pass/fail"}]', 'OSHA 1926.1413'),
(NULL, 'Annual Certification', 'crane', 'certification', 365, '[{"name": "Load Test 125%", "expected_value": "Pass", "unit": "pass/fail"}, {"name": "NDT Inspection", "expected_value": "Pass", "unit": "pass/fail"}]', 'ANSI B30.5'),
(NULL, 'Transformer Oil Test', 'transformer', 'routine', 90, '[{"name": "Dielectric Strength", "expected_value": ">30", "unit": "kV", "tolerance": 5}, {"name": "Water Content", "expected_value": "<50", "unit": "ppm", "tolerance": 10}]', 'IEEE C57.106'),
(NULL, 'Generator Insulation Test', 'generator', 'routine', 180, '[{"name": "Insulation Resistance", "expected_value": ">100", "unit": "MΩ", "tolerance": 10}, {"name": "Polarization Index", "expected_value": ">2.0", "unit": "ratio", "tolerance": 0.2}]', 'IEEE 43-2013');

-- Enable RLS on archive table
ALTER TABLE test_results_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view archived results for their equipment"
  ON test_results_archive
  FOR SELECT
  USING (
    equipment_id IN (
      SELECT id FROM equipment 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- View for upcoming tests
CREATE OR REPLACE VIEW upcoming_equipment_tests AS
SELECT 
  et.*,
  e.name as equipment_name,
  e.equipment_type,
  e.location,
  CASE 
    WHEN et.scheduled_date < CURRENT_DATE THEN 'overdue'
    WHEN et.scheduled_date = CURRENT_DATE THEN 'due_today'
    WHEN et.scheduled_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_this_week'
    ELSE 'upcoming'
  END as urgency
FROM equipment_tests et
JOIN equipment e ON et.equipment_id = e.id
WHERE et.status IN ('scheduled', 'overdue')
  AND (et.status = 'scheduled' OR et.scheduled_date < CURRENT_DATE)
ORDER BY et.scheduled_date ASC;
