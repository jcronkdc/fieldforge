-- COMPLETE SAFETY SYSTEM TABLES FOR END-TO-END FUNCTIONALITY

-- Safety Incidents (if not exists)
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location_description TEXT NOT NULL,
  description TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  immediate_actions TEXT,
  witnesses UUID[],
  reported_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  investigation_notes TEXT,
  corrective_actions TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety Briefings
CREATE TABLE IF NOT EXISTS safety_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  conducted_by UUID REFERENCES auth.users(id),
  topics TEXT[] NOT NULL,
  hazards_identified TEXT[],
  safety_reminders TEXT[],
  date DATE NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefing Attendees with Digital Signatures
CREATE TABLE IF NOT EXISTS safety_briefing_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id UUID REFERENCES safety_briefings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  signature_data TEXT, -- Base64 encoded signature
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(briefing_id, user_id)
);

-- Work Permits
CREATE TABLE IF NOT EXISTS work_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  project_id UUID REFERENCES projects(id),
  work_description TEXT NOT NULL,
  hazards TEXT[] NOT NULL,
  controls TEXT[] NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  authorized_workers UUID[],
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment Inventory (if not exists) 
CREATE TABLE IF NOT EXISTS equipment_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  asset_tag VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  condition VARCHAR(20) CHECK (condition IN ('new', 'good', 'fair', 'poor')),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in use', 'maintenance', 'retired')),
  current_project_id UUID REFERENCES projects(id),
  assigned_to UUID REFERENCES auth.users(id),
  maintenance_interval_days INTEGER,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  usage_hours DECIMAL(10,2) DEFAULT 0,
  location_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment Usage Logs
CREATE TABLE IF NOT EXISTS equipment_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment_inventory(id),
  project_id UUID REFERENCES projects(id),
  checked_out_by UUID REFERENCES auth.users(id),
  checked_out_at TIMESTAMPTZ NOT NULL,
  checked_in_at TIMESTAMPTZ,
  expected_return_date DATE,
  hours_used DECIMAL(10,2),
  condition_out VARCHAR(20),
  condition_in VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment_inventory(id),
  requested_by UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_date DATE,
  completed_date DATE,
  description TEXT,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table (if not exists for safety context)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  safety_contact_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles with Company
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  role VARCHAR(50),
  certifications TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC Functions for Complex Operations

-- Start time entry function
CREATE OR REPLACE FUNCTION start_time_entry(
  p_user_id UUID,
  p_project_id UUID,
  p_task_description TEXT,
  p_location TEXT,
  p_weather_conditions JSONB
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  project_id UUID,
  start_time TIMESTAMPTZ,
  task_description TEXT
) AS $$
BEGIN
  -- Check for active entries
  IF EXISTS (SELECT 1 FROM time_entries WHERE user_id = p_user_id AND end_time IS NULL) THEN
    RAISE EXCEPTION 'User already has an active time entry';
  END IF;
  
  RETURN QUERY
  INSERT INTO time_entries (user_id, project_id, task_description, location, weather_conditions)
  VALUES (p_user_id, p_project_id, p_task_description, p_location::geography, p_weather_conditions)
  RETURNING 
    time_entries.id, 
    time_entries.user_id, 
    time_entries.project_id, 
    time_entries.start_time,
    time_entries.task_description;
END;
$$ LANGUAGE plpgsql;

-- Stop time entry function
CREATE OR REPLACE FUNCTION stop_time_entry(
  p_entry_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  project_id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  hours_worked DECIMAL
) AS $$
BEGIN
  -- Verify ownership if user_id provided
  IF p_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM time_entries WHERE id = p_entry_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Time entry not found or unauthorized';
  END IF;
  
  RETURN QUERY
  UPDATE time_entries 
  SET 
    end_time = NOW(),
    updated_at = NOW()
  WHERE 
    id = p_entry_id 
    AND end_time IS NULL
  RETURNING 
    time_entries.id,
    time_entries.user_id,
    time_entries.project_id,
    time_entries.start_time,
    time_entries.end_time,
    EXTRACT(EPOCH FROM (time_entries.end_time - time_entries.start_time)) / 3600 as hours_worked;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_briefing_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Safety Incidents Policies
CREATE POLICY "Users can view incidents in their company" 
  ON safety_incidents FOR SELECT 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create incidents in their company" 
  ON safety_incidents FOR INSERT 
  WITH CHECK (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their reported incidents" 
  ON safety_incidents FOR UPDATE 
  USING (reported_by = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'safety_manager')
  ));

-- Safety Briefings Policies
CREATE POLICY "Users can view briefings in their company" 
  ON safety_briefings FOR SELECT 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create briefings" 
  ON safety_briefings FOR INSERT 
  WITH CHECK (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

-- Work Permits Policies
CREATE POLICY "Users can view permits in their company" 
  ON work_permits FOR SELECT 
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized users can create permits" 
  ON work_permits FOR INSERT 
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'safety_manager', 'supervisor'))
  );

-- Equipment Policies
CREATE POLICY "Users can view equipment in their company" 
  ON equipment_inventory FOR SELECT 
  USING (TRUE); -- Simplified for now

CREATE POLICY "Users can check out available equipment" 
  ON equipment_inventory FOR UPDATE 
  USING (status = 'available' OR assigned_to = auth.uid());

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_safety_incidents_company_date ON safety_incidents(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_project ON safety_incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_severity ON safety_incidents(severity) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_inventory(status);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned ON equipment_inventory(assigned_to) WHERE status = 'in use';
CREATE INDEX IF NOT EXISTS idx_work_permits_active ON work_permits(company_id, valid_until) WHERE status = 'active';

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_safety_incidents_updated_at BEFORE UPDATE ON safety_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_safety_briefings_updated_at BEFORE UPDATE ON safety_briefings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_work_permits_updated_at BEFORE UPDATE ON work_permits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipment_inventory_updated_at BEFORE UPDATE ON equipment_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();



