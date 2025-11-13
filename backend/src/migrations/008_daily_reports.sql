-- Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  project_id UUID REFERENCES projects(id),
  supervisor_id UUID REFERENCES auth.users(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  
  -- Weather Information
  weather_conditions JSONB DEFAULT '{}'::jsonb,
  
  -- Work Information
  work_summary TEXT NOT NULL,
  crew_count INTEGER DEFAULT 0,
  crew_details JSONB DEFAULT '[]'::jsonb,
  activities_completed JSONB DEFAULT '[]'::jsonb,
  equipment_used JSONB DEFAULT '[]'::jsonb,
  materials_used JSONB DEFAULT '[]'::jsonb,
  
  -- Safety Information
  safety_incidents INTEGER DEFAULT 0,
  safety_notes TEXT,
  
  -- Other Information
  delays JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  tomorrow_plan TEXT,
  additional_notes TEXT,
  
  -- Status and Workflow
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'approved')) DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_project_id ON daily_reports(project_id);
CREATE INDEX idx_daily_reports_supervisor_id ON daily_reports(supervisor_id);
CREATE INDEX idx_daily_reports_company_id ON daily_reports(company_id);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE INDEX idx_daily_reports_safety_incidents ON daily_reports(safety_incidents) WHERE safety_incidents > 0;

-- Enable RLS
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reports in their company"
  ON daily_reports
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create reports for their company"
  ON daily_reports
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    AND supervisor_id = auth.uid()
  );

CREATE POLICY "Users can update their own draft reports"
  ON daily_reports
  FOR UPDATE
  USING (
    supervisor_id = auth.uid() 
    AND status = 'draft'
  );

CREATE POLICY "Admins can approve reports"
  ON daily_reports
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
CREATE TRIGGER update_daily_reports_updated_at 
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Crew Performance Summary View
CREATE OR REPLACE VIEW crew_performance_summary AS
SELECT 
  dr.company_id,
  dr.project_id,
  p.name as project_name,
  DATE_TRUNC('week', dr.report_date) as week_start,
  COUNT(DISTINCT dr.id) as reports_count,
  SUM(dr.crew_count) as total_crew_members,
  AVG(dr.crew_count) as avg_daily_crew,
  SUM(jsonb_array_length(dr.activities_completed)) as total_activities,
  SUM(dr.safety_incidents) as total_safety_incidents,
  COUNT(CASE WHEN dr.weather_conditions->>'work_impact' IN ('moderate', 'severe') THEN 1 END) as weather_impact_days
FROM daily_reports dr
LEFT JOIN projects p ON dr.project_id = p.id
WHERE dr.status = 'approved'
GROUP BY dr.company_id, dr.project_id, p.name, DATE_TRUNC('week', dr.report_date);

-- Equipment Usage Summary Table
CREATE TABLE IF NOT EXISTS equipment_usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  equipment_name VARCHAR(255) NOT NULL,
  report_date DATE NOT NULL,
  hours_used DECIMAL(10, 2) NOT NULL,
  issues_reported TEXT,
  created_from_report UUID REFERENCES daily_reports(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_usage_company ON equipment_usage_summary(company_id);
CREATE INDEX idx_equipment_usage_date ON equipment_usage_summary(report_date);
CREATE INDEX idx_equipment_usage_name ON equipment_usage_summary(equipment_name);

-- Function to extract equipment usage from daily reports
CREATE OR REPLACE FUNCTION extract_equipment_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process approved reports
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Insert equipment usage records
    INSERT INTO equipment_usage_summary (
      company_id,
      equipment_name,
      report_date,
      hours_used,
      issues_reported,
      created_from_report
    )
    SELECT 
      NEW.company_id,
      equipment->>'name',
      NEW.report_date,
      (equipment->>'hours_used')::decimal,
      equipment->>'issues',
      NEW.id
    FROM jsonb_array_elements(NEW.equipment_used) as equipment
    WHERE equipment->>'name' IS NOT NULL
      AND (equipment->>'hours_used')::decimal > 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to extract equipment usage
CREATE TRIGGER extract_equipment_usage_trigger
  AFTER UPDATE ON daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION extract_equipment_usage();

-- Daily report attachments table
CREATE TABLE IF NOT EXISTS daily_report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_attachments_report ON daily_report_attachments(report_id);

-- Enable RLS on attachments
ALTER TABLE daily_report_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for reports they can view"
  ON daily_report_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports dr
      WHERE dr.id = daily_report_attachments.report_id
      AND dr.company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Report creators can add attachments"
  ON daily_report_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports dr
      WHERE dr.id = daily_report_attachments.report_id
      AND dr.supervisor_id = auth.uid()
      AND dr.status = 'draft'
    )
  );
