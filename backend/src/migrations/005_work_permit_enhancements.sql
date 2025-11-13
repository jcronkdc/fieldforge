-- WORK PERMIT ENHANCEMENTS FOR COMPLETE FUNCTIONALITY

-- Add missing columns to work_permits table
ALTER TABLE work_permits 
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS valid_start TIMESTAMPTZ DEFAULT NOW();

-- Rename columns if they exist with old names
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_permits' AND column_name = 'valid_from') THEN
    ALTER TABLE work_permits RENAME COLUMN valid_from TO valid_start;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_permits' AND column_name = 'valid_to') THEN
    ALTER TABLE work_permits RENAME COLUMN valid_to TO valid_until;
  END IF;
END $$;

-- Modify authorized_workers to be TEXT array for names (not UUID)
ALTER TABLE work_permits 
ALTER COLUMN authorized_workers TYPE TEXT[] USING authorized_workers::TEXT[];

-- Add status check constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'work_permits_status_check' 
    AND conrelid = 'work_permits'::regclass
  ) THEN
    ALTER TABLE work_permits 
    ADD CONSTRAINT work_permits_status_check 
    CHECK (status IN ('draft', 'pending', 'active', 'expired', 'cancelled'));
  END IF;
END $$;

-- Add missing columns to safety_incidents
ALTER TABLE safety_incidents
ADD COLUMN IF NOT EXISTS injured_persons TEXT[],
ADD COLUMN IF NOT EXISTS medical_treatment_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS work_stopped BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supervisor_notified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weather_conditions TEXT,
ADD COLUMN IF NOT EXISTS time_of_incident TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_permits_status ON work_permits(status) WHERE status IN ('active', 'pending');
CREATE INDEX IF NOT EXISTS idx_work_permits_company_date ON work_permits(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_permits_valid_dates ON work_permits(valid_start, valid_until);

-- Update trigger for work_permits
CREATE OR REPLACE FUNCTION update_work_permit_status() 
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-expire permits past their valid_until date
  IF NEW.status = 'active' AND NEW.valid_until < NOW() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_expire_work_permits
  BEFORE UPDATE ON work_permits
  FOR EACH ROW
  EXECUTE FUNCTION update_work_permit_status();

-- Function to check active permits for a worker
CREATE OR REPLACE FUNCTION get_worker_active_permits(worker_name TEXT)
RETURNS TABLE (
  permit_id UUID,
  permit_type VARCHAR,
  work_description TEXT,
  project_name VARCHAR,
  valid_until TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wp.id,
    wp.type,
    wp.work_description,
    p.name,
    wp.valid_until
  FROM work_permits wp
  LEFT JOIN projects p ON wp.project_id = p.id
  WHERE wp.status = 'active'
    AND wp.valid_until > NOW()
    AND worker_name = ANY(wp.authorized_workers)
  ORDER BY wp.valid_until;
END;
$$ LANGUAGE plpgsql;
