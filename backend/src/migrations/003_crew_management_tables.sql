-- COMPLETE CREW MANAGEMENT SYSTEM FOR END-TO-END FUNCTIONALITY

-- Crews table (main crew entity)
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., ELEC-01, MECH-02
  type VARCHAR(100) NOT NULL, -- Electrical, Mechanical, Civil, etc.
  lead_user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break')),
  current_project_id UUID REFERENCES projects(id),
  base_location TEXT,
  max_members INTEGER DEFAULT 10,
  certifications_required TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew Members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(100) NOT NULL, -- Foreman, Journeyman, Apprentice, etc.
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  leave_date DATE,
  is_active BOOLEAN DEFAULT true,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  certifications TEXT[],
  skill_level VARCHAR(50) CHECK (skill_level IN ('apprentice', 'journeyman', 'master', 'specialist')),
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_id, user_id, is_active) -- Can't be active in same crew twice
);

-- Crew Assignments to Projects
CREATE TABLE IF NOT EXISTS crew_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES crews(id),
  project_id UUID REFERENCES projects(id),
  start_date DATE NOT NULL,
  end_date DATE,
  assignment_type VARCHAR(100), -- Primary, Support, Emergency
  work_scope TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew Skills Matrix
CREATE TABLE IF NOT EXISTS crew_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- Electrical, Safety, Equipment Operation, etc.
  description TEXT,
  certification_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Skills (tracking individual skills)
CREATE TABLE IF NOT EXISTS member_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES crew_skills(id),
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  certified BOOLEAN DEFAULT false,
  certification_date DATE,
  certification_expiry DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_member_id, skill_id)
);

-- Crew Productivity Metrics
CREATE TABLE IF NOT EXISTS crew_productivity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES crews(id),
  project_id UUID REFERENCES projects(id),
  date DATE NOT NULL,
  planned_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  tasks_completed INTEGER DEFAULT 0,
  tasks_planned INTEGER DEFAULT 0,
  productivity_score DECIMAL(5,2), -- Percentage
  safety_incidents INTEGER DEFAULT 0,
  weather_impact VARCHAR(50), -- None, Minor, Major
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_productivity ENABLE ROW LEVEL SECURITY;

-- Crews Policies
CREATE POLICY "Users can view crews in their company"
  ON crews FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Managers can create crews"
  ON crews FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'supervisor'))
  );

CREATE POLICY "Managers can update crews"
  ON crews FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'supervisor'))
  );

-- Crew Members Policies
CREATE POLICY "Users can view crew members"
  ON crew_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crews c
      WHERE c.id = crew_members.crew_id
      AND c.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Crew leads can manage members"
  ON crew_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM crews c
      WHERE c.id = crew_members.crew_id
      AND (c.lead_user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
    )
  );

-- Crew Assignments Policies
CREATE POLICY "Users can view crew assignments"
  ON crew_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crews c
      WHERE c.id = crew_assignments.crew_id
      AND c.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Skills Policies (everyone can view skills)
CREATE POLICY "All users can view skills"
  ON crew_skills FOR SELECT
  TO authenticated
  USING (true);

-- Member Skills Policies
CREATE POLICY "Users can view member skills"
  ON member_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crew_members cm
      JOIN crews c ON cm.crew_id = c.id
      WHERE cm.id = member_skills.crew_member_id
      AND c.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Functions for complex operations
CREATE OR REPLACE FUNCTION get_crew_availability(
  p_start_date DATE,
  p_end_date DATE,
  p_crew_type VARCHAR DEFAULT NULL
) RETURNS TABLE (
  crew_id UUID,
  crew_name VARCHAR,
  crew_type VARCHAR,
  total_members BIGINT,
  available_members BIGINT,
  current_project VARCHAR,
  availability_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as crew_id,
    c.name as crew_name,
    c.type as crew_type,
    COUNT(DISTINCT cm.user_id) as total_members,
    COUNT(DISTINCT cm.user_id) FILTER (WHERE cm.is_active = true) as available_members,
    p.name as current_project,
    CASE 
      WHEN COUNT(DISTINCT cm.user_id) > 0 
      THEN ROUND((COUNT(DISTINCT cm.user_id) FILTER (WHERE cm.is_active = true)::NUMERIC / COUNT(DISTINCT cm.user_id)) * 100, 2)
      ELSE 0
    END as availability_percentage
  FROM crews c
  LEFT JOIN crew_members cm ON c.id = cm.crew_id
  LEFT JOIN projects p ON c.current_project_id = p.id
  LEFT JOIN crew_assignments ca ON c.id = ca.crew_id 
    AND ca.status = 'active'
    AND (ca.start_date <= p_end_date AND (ca.end_date IS NULL OR ca.end_date >= p_start_date))
  WHERE c.status = 'active'
    AND (p_crew_type IS NULL OR c.type = p_crew_type)
  GROUP BY c.id, c.name, c.type, p.name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate crew productivity score
CREATE OR REPLACE FUNCTION calculate_crew_productivity(
  p_crew_id UUID,
  p_date DATE
) RETURNS DECIMAL AS $$
DECLARE
  v_productivity DECIMAL;
BEGIN
  SELECT 
    CASE 
      WHEN planned_hours > 0 
      THEN ROUND((actual_hours / planned_hours) * (tasks_completed::NUMERIC / NULLIF(tasks_planned, 0)) * 100, 2)
      ELSE 0
    END INTO v_productivity
  FROM crew_productivity
  WHERE crew_id = p_crew_id AND date = p_date;
  
  RETURN COALESCE(v_productivity, 0);
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_crews_company_status ON crews(company_id, status);
CREATE INDEX idx_crews_type ON crews(type) WHERE status = 'active';
CREATE INDEX idx_crew_members_active ON crew_members(crew_id, user_id) WHERE is_active = true;
CREATE INDEX idx_crew_assignments_active ON crew_assignments(crew_id, project_id) WHERE status = 'active';
CREATE INDEX idx_crew_assignments_dates ON crew_assignments(start_date, end_date);
CREATE INDEX idx_member_skills_member ON member_skills(crew_member_id);
CREATE INDEX idx_crew_productivity_date ON crew_productivity(crew_id, date DESC);

-- Update triggers
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_crew_assignments_updated_at BEFORE UPDATE ON crew_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_member_skills_updated_at BEFORE UPDATE ON member_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();



