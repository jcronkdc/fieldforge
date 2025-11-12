-- FieldForge Construction Management Tables
-- This migration creates all tables needed for construction field operations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- TIME TRACKING TABLES
-- ============================================================================

-- Time entries table for tracking work hours
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  crew_id UUID REFERENCES crew_assignments(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  break_duration INTEGER DEFAULT 0, -- in minutes
  task_description TEXT NOT NULL,
  location GEOGRAPHY(POINT), -- PostGIS point for GPS location
  weather_conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);

-- ============================================================================
-- CREW MANAGEMENT TABLES
-- ============================================================================

-- Crew members table
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  trade VARCHAR(100) NOT NULL,
  skill_level VARCHAR(50), -- apprentice, journeyman, master
  certifications JSONB,
  emergency_contact JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew assignments to projects
CREATE TABLE IF NOT EXISTS crew_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  daily_rate DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_member_id, project_id, start_date)
);

-- ============================================================================
-- DAILY OPERATIONS TABLES
-- ============================================================================

-- Daily reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  report_date DATE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  weather JSONB,
  crew_count INTEGER,
  work_performed TEXT,
  materials_used JSONB,
  equipment_used JSONB,
  safety_issues TEXT,
  delays JSONB,
  photos TEXT[],
  status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, approved
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, report_date)
);

-- Weather logs table
CREATE TABLE IF NOT EXISTS weather_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID REFERENCES auth.users(id) NOT NULL,
  temperature DECIMAL(5,2),
  conditions VARCHAR(100),
  wind_speed INTEGER,
  precipitation DECIMAL(5,2),
  visibility DECIMAL(5,2),
  work_impact VARCHAR(50), -- none, minor, major, stop work
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather delays table
CREATE TABLE IF NOT EXISTS weather_delays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  weather_log_id UUID REFERENCES weather_logs(id) ON DELETE CASCADE,
  delay_start TIMESTAMPTZ NOT NULL,
  delay_end TIMESTAMPTZ,
  delay_reason TEXT NOT NULL,
  estimated_cost_impact DECIMAL(10,2),
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAFETY MANAGEMENT TABLES
-- ============================================================================

-- Safety incidents table
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  incident_type VARCHAR(50) NOT NULL, -- near miss, minor injury, major injury, property damage
  severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
  description TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  location_description TEXT,
  witnesses UUID[],
  injuries JSONB,
  property_damage JSONB,
  immediate_actions TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  photos TEXT[],
  investigation_status VARCHAR(20) DEFAULT 'open',
  investigated_by UUID REFERENCES auth.users(id),
  investigation_notes TEXT,
  status VARCHAR(20) DEFAULT 'open', -- open, investigating, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety trainings table
CREATE TABLE IF NOT EXISTS safety_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  training_type VARCHAR(50), -- toolbox talk, certification, refresher
  duration_minutes INTEGER,
  required_for_trades VARCHAR(100)[],
  expires_after_days INTEGER,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety training completions
CREATE TABLE IF NOT EXISTS safety_training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES safety_trainings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  certificate_url TEXT,
  score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(training_id, user_id, completed_at::date)
);

-- Work permits table
CREATE TABLE IF NOT EXISTS work_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  permit_type VARCHAR(50) NOT NULL, -- hot work, confined space, heights, electrical
  permit_number VARCHAR(100) UNIQUE,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,
  hazards JSONB,
  precautions JSONB,
  required_ppe VARCHAR(50)[],
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, expired, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EQUIPMENT & MATERIALS TABLES
-- ============================================================================

-- Equipment inventory table
CREATE TABLE IF NOT EXISTS equipment_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  asset_tag VARCHAR(50) UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  condition VARCHAR(20), -- new, good, fair, poor
  current_project_id UUID REFERENCES projects(id),
  assigned_to UUID REFERENCES auth.users(id),
  location GEOGRAPHY(POINT),
  location_description TEXT,
  status VARCHAR(20) DEFAULT 'available', -- available, in use, maintenance, retired
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER,
  usage_hours DECIMAL(10,2) DEFAULT 0,
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment usage logs
CREATE TABLE IF NOT EXISTS equipment_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment_inventory(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  checked_out_by UUID REFERENCES auth.users(id) NOT NULL,
  checked_out_at TIMESTAMPTZ NOT NULL,
  checked_in_at TIMESTAMPTZ,
  hours_used DECIMAL(10,2),
  condition_out VARCHAR(20),
  condition_in VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material inventory table
CREATE TABLE IF NOT EXISTS material_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type VARCHAR(100) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(50) NOT NULL,
  quantity_on_hand DECIMAL(15,3) DEFAULT 0,
  minimum_stock DECIMAL(15,3) DEFAULT 0,
  location VARCHAR(200),
  supplier VARCHAR(200),
  unit_cost DECIMAL(10,2),
  total_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity_on_hand * unit_cost) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material usage logs
CREATE TABLE IF NOT EXISTS material_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES material_inventory(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  used_by UUID REFERENCES auth.users(id) NOT NULL,
  quantity_used DECIMAL(15,3) NOT NULL,
  purpose TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_delays ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usage_logs ENABLE ROW LEVEL SECURITY;

-- Time entries policies
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily reports policies
CREATE POLICY "Project members can view daily reports" ON daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_team pt 
      WHERE pt.project_id = daily_reports.project_id 
      AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create daily reports" ON daily_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_team pt 
      WHERE pt.project_id = daily_reports.project_id 
      AND pt.user_id = auth.uid()
    )
  );

-- Add more RLS policies as needed...

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_members_updated_at BEFORE UPDATE ON crew_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_incidents_updated_at BEFORE UPDATE ON safety_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_inventory_updated_at BEFORE UPDATE ON equipment_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_inventory_updated_at BEFORE UPDATE ON material_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
