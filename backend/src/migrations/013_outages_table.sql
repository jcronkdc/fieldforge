-- Outage Coordination Tables

-- Outages table for planning and tracking power outages
CREATE TABLE IF NOT EXISTS outages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outage_number VARCHAR(100) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Outage details
  outage_type VARCHAR(50) NOT NULL CHECK (outage_type IN ('planned', 'emergency', 'rolling', 'maintenance')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER NOT NULL,
  
  -- Affected infrastructure
  affected_circuits TEXT[] DEFAULT ARRAY[]::TEXT[],
  affected_customers INTEGER DEFAULT 0,
  affected_area TEXT,
  
  -- Switching procedures stored as JSONB
  switching_steps JSONB DEFAULT '[]'::JSONB,
  
  -- Crew requirements stored as JSONB
  crew_requirements JSONB DEFAULT '{
    "switching_crew": 2,
    "construction_crew": 4,
    "safety_observers": 1
  }'::JSONB,
  
  -- Safety requirements
  safety_requirements TEXT[] DEFAULT ARRAY[
    'Safety briefing completed',
    'LOTO procedures reviewed',
    'Arc flash boundaries established',
    'Grounding installed',
    'Barriers in place'
  ]::TEXT[],
  
  -- Notification tracking as JSONB
  notification_status JSONB DEFAULT '{
    "customers": false,
    "dispatch": false,
    "field_crews": false,
    "management": false
  }'::JSONB,
  
  -- Approval workflow
  approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'completed')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_outages_project_id ON outages(project_id);
CREATE INDEX idx_outages_start_datetime ON outages(start_datetime);
CREATE INDEX idx_outages_approval_status ON outages(approval_status);
CREATE INDEX idx_outages_outage_type ON outages(outage_type);

-- Row Level Security
ALTER TABLE outages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view outages" ON outages
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create outages" ON outages
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update outages" ON outages
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_outages_updated_at
  BEFORE UPDATE ON outages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
