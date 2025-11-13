-- Enhanced Equipment Testing Tables for TestingDashboard component

-- Modify equipment_tests table to match component expectations
ALTER TABLE equipment_tests 
ADD COLUMN IF NOT EXISTS equipment_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS test_date DATE,
ADD COLUMN IF NOT EXISTS measurements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS report_url TEXT;

-- Update test_type enum if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_type_enum') THEN
    CREATE TYPE test_type_enum AS ENUM (
      'insulation', 'continuity', 'load', 'performance', 
      'safety', 'diagnostic', 'routine', 'certification', 'compliance'
    );
  END IF;
END $$;

-- Update status enum to match component
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_status_enum') THEN
    CREATE TYPE test_status_enum AS ENUM (
      'pass', 'fail', 'warning', 'pending', 
      'scheduled', 'in_progress', 'passed', 'failed', 'overdue'
    );
  END IF;
END $$;

-- Create equipment test schedule table
CREATE TABLE IF NOT EXISTS equipment_test_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  scheduled_date DATE NOT NULL,
  frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')) NOT NULL,
  last_performed DATE,
  assigned_to UUID REFERENCES auth.users(id),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_schedule_equipment ON equipment_test_schedule(equipment_id);
CREATE INDEX IF NOT EXISTS idx_test_schedule_date ON equipment_test_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_test_schedule_assigned ON equipment_test_schedule(assigned_to);

-- Enable RLS
ALTER TABLE equipment_test_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Company users can manage test schedules"
  ON equipment_test_schedule
  FOR ALL USING (
    equipment_id IN (
      SELECT id FROM equipment 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Update equipment_tests to ensure compatibility
ALTER TABLE equipment_tests 
ALTER COLUMN test_type TYPE VARCHAR(50);

-- Drop old constraint if exists
ALTER TABLE equipment_tests 
DROP CONSTRAINT IF EXISTS equipment_tests_test_type_check;

-- Add new constraint
ALTER TABLE equipment_tests 
ADD CONSTRAINT equipment_tests_test_type_check 
CHECK (test_type IN ('insulation', 'continuity', 'load', 'performance', 
                     'safety', 'diagnostic', 'routine', 'certification', 'compliance'));

-- Update status column
ALTER TABLE equipment_tests 
ALTER COLUMN status TYPE VARCHAR(50);

-- Drop old constraint if exists
ALTER TABLE equipment_tests 
DROP CONSTRAINT IF EXISTS equipment_tests_status_check;

-- Add new constraint
ALTER TABLE equipment_tests 
ADD CONSTRAINT equipment_tests_status_check 
CHECK (status IN ('pass', 'fail', 'warning', 'pending', 
                  'scheduled', 'in_progress', 'passed', 'failed', 'overdue'));

-- Add test_date if it doesn't exist (from scheduled_date)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'equipment_tests' 
                 AND column_name = 'test_date') THEN
    -- Copy scheduled_date to test_date for existing records
    UPDATE equipment_tests 
    SET test_date = scheduled_date::date 
    WHERE scheduled_date IS NOT NULL;
  END IF;
END $$;

-- Create view for test results with equipment info
CREATE OR REPLACE VIEW equipment_test_results AS
SELECT 
  et.*,
  e.name as equipment_name,
  e.equipment_code,
  e.location,
  e.equipment_type,
  u.raw_user_meta_data->>'full_name' as performed_by_name
FROM equipment_tests et
JOIN equipment e ON et.equipment_id = e.id
LEFT JOIN auth.users u ON et.performed_by = u.id;

-- Function to auto-schedule next test
CREATE OR REPLACE FUNCTION schedule_next_test()
RETURNS TRIGGER AS $$
DECLARE
  freq_days INTEGER;
  next_date DATE;
BEGIN
  -- Only schedule if test passed or has warning
  IF NEW.status IN ('pass', 'warning', 'passed') THEN
    -- Get frequency from schedule
    SELECT 
      CASE frequency
        WHEN 'daily' THEN 1
        WHEN 'weekly' THEN 7
        WHEN 'monthly' THEN 30
        WHEN 'quarterly' THEN 90
        WHEN 'annual' THEN 365
        ELSE 30
      END INTO freq_days
    FROM equipment_test_schedule
    WHERE equipment_id = NEW.equipment_id
    AND test_type = NEW.test_type
    LIMIT 1;

    IF freq_days IS NOT NULL THEN
      next_date := CURRENT_DATE + freq_days;
      
      -- Update or insert schedule
      INSERT INTO equipment_test_schedule (
        equipment_id, test_type, scheduled_date, 
        frequency, last_performed
      ) VALUES (
        NEW.equipment_id, NEW.test_type, next_date,
        CASE freq_days
          WHEN 1 THEN 'daily'
          WHEN 7 THEN 'weekly'
          WHEN 30 THEN 'monthly'
          WHEN 90 THEN 'quarterly'
          WHEN 365 THEN 'annual'
          ELSE 'monthly'
        END,
        CURRENT_DATE
      )
      ON CONFLICT (equipment_id, test_type) 
      DO UPDATE SET 
        scheduled_date = next_date,
        last_performed = CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-scheduling
DROP TRIGGER IF EXISTS auto_schedule_next_test ON equipment_tests;
CREATE TRIGGER auto_schedule_next_test
  AFTER INSERT OR UPDATE ON equipment_tests
  FOR EACH ROW
  EXECUTE FUNCTION schedule_next_test();

-- Add unique constraint for schedule
ALTER TABLE equipment_test_schedule 
ADD CONSTRAINT unique_equipment_test_schedule 
UNIQUE (equipment_id, test_type);

-- Sample test measurements structure
COMMENT ON COLUMN equipment_tests.measurements IS 
'Array of measurement objects: [{
  "parameter": "Phase A-Ground",
  "value": 1200,
  "unit": "MΩ",
  "min_acceptable": 1000,
  "max_acceptable": null,
  "status": "normal"
}]';
