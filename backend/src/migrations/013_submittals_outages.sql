-- Submittals System - Platform's MEMORY
CREATE TABLE IF NOT EXISTS submittals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  submittal_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  spec_section VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- Dates
  submitted_by UUID REFERENCES auth.users(id),
  submitted_date TIMESTAMP WITH TIME ZONE,
  required_date TIMESTAMP WITH TIME ZONE,
  approved_date TIMESTAMP WITH TIME ZONE,
  
  -- Review information
  reviewer_comments TEXT,
  revision_number INTEGER DEFAULT 1,
  attachments TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outage Coordination System - Platform's PLANNING
CREATE TABLE IF NOT EXISTS outage_coordination (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outage_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status and impact
  status VARCHAR(50) DEFAULT 'planned',
  impact_level VARCHAR(20) DEFAULT 'medium',
  
  -- Affected systems
  affected_circuits TEXT[],
  affected_customers INTEGER DEFAULT 0,
  crews_required INTEGER DEFAULT 1,
  
  -- Switching steps stored as JSONB
  switching_steps JSONB DEFAULT '[]'::JSONB,
  
  -- Safety
  safety_requirements TEXT[],
  notifications_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_submittals_project ON submittals(project_id);
CREATE INDEX idx_submittals_status ON submittals(status);
CREATE INDEX idx_submittals_submitted_date ON submittals(submitted_date);

CREATE INDEX idx_outages_status ON outage_coordination(status);
CREATE INDEX idx_outages_start_time ON outage_coordination(start_time);
CREATE INDEX idx_outages_impact ON outage_coordination(impact_level);

-- Add update triggers
CREATE TRIGGER update_submittals_updated_at BEFORE UPDATE ON submittals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outages_updated_at BEFORE UPDATE ON outage_coordination
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE outage_coordination ENABLE ROW LEVEL SECURITY;

-- Submittals policies
CREATE POLICY "Users can view submittals in their projects" ON submittals
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_team WHERE project_id = submittals.project_id
    )
  );

CREATE POLICY "Users can create submittals in their projects" ON submittals
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM project_team WHERE project_id = project_id
    )
  );

CREATE POLICY "Users can update submittals in their projects" ON submittals
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM project_team WHERE project_id = submittals.project_id
    )
  );

-- Outage coordination policies (more open for demo)
CREATE POLICY "Authenticated users can view outages" ON outage_coordination
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create outages" ON outage_coordination
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update outages" ON outage_coordination
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE submittals IS 'Project submittal tracking system for specs, drawings, and approvals';
COMMENT ON TABLE outage_coordination IS 'Electrical outage planning and coordination system';
COMMENT ON COLUMN submittals.status IS 'draft, submitted, under_review, approved, rejected, revise_resubmit';
COMMENT ON COLUMN outage_coordination.status IS 'planned, active, completed, cancelled';
COMMENT ON COLUMN outage_coordination.impact_level IS 'low, medium, high, critical';
COMMENT ON COLUMN outage_coordination.switching_steps IS 'JSON array of switching procedure steps';
