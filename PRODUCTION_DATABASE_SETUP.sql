-- FIELDFORGE PRODUCTION DATABASE SETUP
-- Run these migrations in order in your Supabase SQL editor

-- 1. First ensure necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create equipment_tests table for TestingDashboard
CREATE TABLE IF NOT EXISTS equipment_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performed_by UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pass', 'fail', 'warning', 'pending')) NOT NULL DEFAULT 'pending',
  measurements JSONB DEFAULT '[]',
  parameters JSONB DEFAULT '[]',
  notes TEXT,
  next_test_due DATE,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES equipment_tests(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  measured_value NUMERIC,
  unit TEXT,
  expected_value NUMERIC,
  tolerance NUMERIC,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create test_schedules table
CREATE TABLE IF NOT EXISTS test_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'custom')),
  compliance_standard TEXT,
  last_completed DATE,
  next_due DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create drawings table for DrawingViewer
CREATE TABLE IF NOT EXISTS drawings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  drawing_number TEXT NOT NULL,
  title TEXT NOT NULL,
  discipline TEXT CHECK (discipline IN ('architectural', 'structural', 'electrical', 'mechanical', 'plumbing', 'civil', 'other')),
  revision TEXT DEFAULT 'A',
  status TEXT CHECK (status IN ('draft', 'for_review', 'approved', 'superseded')) DEFAULT 'draft',
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create drawing_annotations table
CREATE TABLE IF NOT EXISTS drawing_annotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  x_position NUMERIC NOT NULL,
  y_position NUMERIC NOT NULL,
  width NUMERIC,
  height NUMERIC,
  type TEXT CHECK (type IN ('note', 'measurement', 'callout', 'markup', 'dimension')) NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#FF0000',
  font_size INTEGER DEFAULT 14,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_tests_equipment_id ON equipment_tests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_tests_test_date ON equipment_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_equipment_tests_status ON equipment_tests(status);
CREATE INDEX IF NOT EXISTS idx_test_schedules_equipment_id ON test_schedules(equipment_id);
CREATE INDEX IF NOT EXISTS idx_test_schedules_scheduled_date ON test_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_drawings_company_id ON drawings(company_id);
CREATE INDEX IF NOT EXISTS idx_drawing_annotations_drawing_id ON drawing_annotations(drawing_id);

-- 8. Enable Row Level Security
ALTER TABLE equipment_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_annotations ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for equipment_tests
CREATE POLICY "Users can view equipment tests in their company" ON equipment_tests
  FOR SELECT USING (
    equipment_id IN (
      SELECT id FROM equipment WHERE company_id = auth.jwt()->>'company_id'
    )
  );

CREATE POLICY "Users can create equipment tests for their company" ON equipment_tests
  FOR INSERT WITH CHECK (
    equipment_id IN (
      SELECT id FROM equipment WHERE company_id = auth.jwt()->>'company_id'
    )
  );

CREATE POLICY "Users can update equipment tests in their company" ON equipment_tests
  FOR UPDATE USING (
    equipment_id IN (
      SELECT id FROM equipment WHERE company_id = auth.jwt()->>'company_id'
    )
  );

-- 10. Create RLS policies for test_schedules
CREATE POLICY "Users can view test schedules in their company" ON test_schedules
  FOR SELECT USING (
    equipment_id IN (
      SELECT id FROM equipment WHERE company_id = auth.jwt()->>'company_id'
    )
  );

CREATE POLICY "Users can manage test schedules for their company" ON test_schedules
  FOR ALL USING (
    equipment_id IN (
      SELECT id FROM equipment WHERE company_id = auth.jwt()->>'company_id'
    )
  );

-- 11. Create RLS policies for drawings
CREATE POLICY "Users can view drawings in their company" ON drawings
  FOR SELECT USING (company_id = auth.jwt()->>'company_id');

CREATE POLICY "Users can create drawings for their company" ON drawings
  FOR INSERT WITH CHECK (company_id = auth.jwt()->>'company_id');

CREATE POLICY "Users can update drawings in their company" ON drawings
  FOR UPDATE USING (company_id = auth.jwt()->>'company_id');

CREATE POLICY "Users can delete drawings in their company" ON drawings
  FOR DELETE USING (company_id = auth.jwt()->>'company_id');

-- 12. Create RLS policies for drawing_annotations
CREATE POLICY "Users can view annotations on company drawings" ON drawing_annotations
  FOR SELECT USING (
    drawing_id IN (
      SELECT id FROM drawings WHERE company_id = auth.jwt()->>'company_id'
    )
  );

CREATE POLICY "Users can create annotations on company drawings" ON drawing_annotations
  FOR INSERT WITH CHECK (
    drawing_id IN (
      SELECT id FROM drawings WHERE company_id = auth.jwt()->>'company_id'
    )
  );

CREATE POLICY "Users can update their own annotations" ON drawing_annotations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own annotations" ON drawing_annotations
  FOR DELETE USING (user_id = auth.uid());

-- 13. Create storage buckets if they don't exist (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('drawings', 'drawings', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('test-reports', 'test-reports', false);

-- 14. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_tests_updated_at BEFORE UPDATE ON equipment_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_schedules_updated_at BEFORE UPDATE ON test_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drawings_updated_at BEFORE UPDATE ON drawings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drawing_annotations_updated_at BEFORE UPDATE ON drawing_annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Insert sample test data (optional - remove for production)
-- INSERT INTO test_schedules (equipment_id, test_type, test_name, scheduled_date, frequency, compliance_standard)
-- SELECT 
--   e.id,
--   'electrical',
--   'Insulation Resistance Test',
--   CURRENT_DATE + INTERVAL '7 days',
--   'quarterly',
--   'IEEE 43-2013'
-- FROM equipment e
-- WHERE e.equipment_type = 'electrical'
-- LIMIT 1;
