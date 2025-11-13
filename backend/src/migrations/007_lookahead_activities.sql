-- 3-Week Lookahead Activities Table
CREATE TABLE IF NOT EXISTS lookahead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(255) NOT NULL,
  project_name VARCHAR(255),
  activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  crew_size INTEGER DEFAULT 0,
  crew_assigned JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')) DEFAULT 'planned',
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  weather_dependent BOOLEAN DEFAULT false,
  dependencies JSONB DEFAULT '[]'::jsonb,
  equipment_needed JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_lookahead_activities_project_id ON lookahead_activities(project_id);
CREATE INDEX idx_lookahead_activities_scheduled_date ON lookahead_activities(scheduled_date);
CREATE INDEX idx_lookahead_activities_status ON lookahead_activities(status);
CREATE INDEX idx_lookahead_activities_priority ON lookahead_activities(priority);
CREATE INDEX idx_lookahead_activities_created_by ON lookahead_activities(created_by);

-- Enable RLS
ALTER TABLE lookahead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view activities in their company"
  ON lookahead_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id IN (
        SELECT p.company_id FROM projects p 
        WHERE p.id = lookahead_activities.project_id::uuid
      )
    )
  );

CREATE POLICY "Users can create activities in their company projects"
  ON lookahead_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id IN (
        SELECT p.company_id FROM projects p 
        WHERE p.id = lookahead_activities.project_id::uuid
      )
    )
  );

CREATE POLICY "Users can update activities in their company"
  ON lookahead_activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id IN (
        SELECT p.company_id FROM projects p 
        WHERE p.id = lookahead_activities.project_id::uuid
      )
    )
  );

CREATE POLICY "Users can delete activities they created"
  ON lookahead_activities
  FOR DELETE
  USING (created_by = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_lookahead_activities_updated_at 
  BEFORE UPDATE ON lookahead_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Activity Dependencies Table (for tracking task dependencies)
CREATE TABLE IF NOT EXISTS activity_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES lookahead_activities(id) ON DELETE CASCADE,
  depends_on_id UUID REFERENCES lookahead_activities(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) CHECK (dependency_type IN ('start_to_start', 'start_to_finish', 'finish_to_start', 'finish_to_finish')) DEFAULT 'finish_to_start',
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_dependencies_activity_id ON activity_dependencies(activity_id);
CREATE INDEX idx_activity_dependencies_depends_on_id ON activity_dependencies(depends_on_id);

-- Enable RLS
ALTER TABLE activity_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dependencies
CREATE POLICY "Users can view dependencies in their company"
  ON activity_dependencies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lookahead_activities la
      JOIN user_profiles up ON up.id = auth.uid()
      JOIN projects p ON p.id = la.project_id::uuid
      WHERE la.id = activity_dependencies.activity_id
      AND p.company_id = up.company_id
    )
  );
