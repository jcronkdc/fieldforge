-- Substation 3D Model System
-- Equipment specifications, clearances, and lockout/tagout management

-- Substations Table
CREATE TABLE IF NOT EXISTS substations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Substation Details
  name VARCHAR(100) NOT NULL,
  voltage_primary INTEGER NOT NULL, -- Primary voltage in kV
  voltage_secondary INTEGER NOT NULL, -- Secondary voltage in kV
  capacity NUMERIC NOT NULL, -- MVA rating
  
  -- Location
  location JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Substation Equipment Table
CREATE TABLE IF NOT EXISTS substation_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  substation_id UUID NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  
  -- Equipment Details
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('transformer', 'breaker', 'switch', 'bus', 'insulator', 'arrester')) NOT NULL,
  
  -- 3D Position and Rotation
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  rotation JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  
  -- Specifications
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  rating VARCHAR(100),
  voltage_rating INTEGER, -- kV
  current_rating INTEGER, -- Amps
  
  -- Installation
  install_date DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Status (real-time data)
CREATE TABLE IF NOT EXISTS substation_equipment_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES substation_equipment(id) ON DELETE CASCADE,
  
  -- Electrical Parameters
  status VARCHAR(20) CHECK (status IN ('energized', 'de-energized', 'grounded', 'maintenance')) NOT NULL,
  voltage_actual NUMERIC,
  current_actual NUMERIC,
  power_factor NUMERIC,
  frequency NUMERIC,
  
  -- Environmental
  temperature NUMERIC, -- Celsius
  oil_temperature NUMERIC, -- For transformers
  ambient_temperature NUMERIC,
  humidity NUMERIC,
  
  -- Alarms
  alarm_status JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lockout/Tagout Table
CREATE TABLE IF NOT EXISTS lockout_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES substation_equipment(id) ON DELETE CASCADE,
  
  -- Tag Details
  tag_number VARCHAR(50) UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  work_permit_id VARCHAR(100),
  
  -- Duration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_duration INTEGER, -- hours
  removed_at TIMESTAMP WITH TIME ZONE,
  removed_by UUID REFERENCES auth.users(id),
  
  -- Safety
  isolation_points TEXT[],
  test_points TEXT[],
  
  CONSTRAINT active_tag_unique UNIQUE (equipment_id, user_id, removed_at)
);

-- Clearance Violations Table
CREATE TABLE IF NOT EXISTS clearance_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  substation_id UUID NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  
  -- Violation Details
  equipment1_id UUID NOT NULL REFERENCES substation_equipment(id),
  equipment2_id UUID NOT NULL REFERENCES substation_equipment(id),
  measured_distance NUMERIC NOT NULL,
  required_distance NUMERIC NOT NULL,
  violation_type VARCHAR(50), -- phase-to-phase, phase-to-ground, etc.
  
  -- Status
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  
  CHECK (equipment1_id < equipment2_id) -- Prevent duplicate pairs
);

-- Maintenance Paths Table
CREATE TABLE IF NOT EXISTS maintenance_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  substation_id UUID NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
  
  -- Path Details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  path_points JSONB NOT NULL, -- Array of 3D points
  
  -- Access
  is_accessible BOOLEAN DEFAULT TRUE,
  required_clearance NUMERIC, -- meters
  required_ppe TEXT[],
  
  -- Inspection
  last_inspection DATE,
  next_inspection DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thermal Monitoring Table
CREATE TABLE IF NOT EXISTS thermal_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES substation_equipment(id) ON DELETE CASCADE,
  
  -- Thermal Data
  hot_spot_temp NUMERIC,
  average_temp NUMERIC,
  ambient_temp NUMERIC,
  thermal_image_url TEXT,
  
  -- Analysis
  anomaly_detected BOOLEAN DEFAULT FALSE,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Metadata
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recorded_by UUID REFERENCES auth.users(id)
);

-- Arc Flash Boundaries Table
CREATE TABLE IF NOT EXISTS arc_flash_boundaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES substation_equipment(id) ON DELETE CASCADE,
  
  -- Boundaries (meters)
  limited_approach NUMERIC NOT NULL,
  restricted_approach NUMERIC NOT NULL,
  arc_flash_boundary NUMERIC NOT NULL,
  
  -- PPE Requirements
  incident_energy NUMERIC, -- cal/cm²
  ppe_category INTEGER CHECK (ppe_category BETWEEN 1 AND 4),
  
  -- Study Details
  study_date DATE NOT NULL,
  next_study_date DATE NOT NULL,
  study_by VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_substation_equipment_substation ON substation_equipment(substation_id);
CREATE INDEX idx_substation_equipment_type ON substation_equipment(type);
CREATE INDEX idx_equipment_status_equipment ON substation_equipment_status(equipment_id);
CREATE INDEX idx_equipment_status_created ON substation_equipment_status(created_at DESC);
CREATE INDEX idx_lockout_tags_equipment ON lockout_tags(equipment_id);
CREATE INDEX idx_lockout_tags_user ON lockout_tags(user_id);
CREATE INDEX idx_lockout_tags_active ON lockout_tags(equipment_id) WHERE removed_at IS NULL;
CREATE INDEX idx_clearance_violations_substation ON clearance_violations(substation_id);
CREATE INDEX idx_clearance_violations_unresolved ON clearance_violations(substation_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_maintenance_paths_substation ON maintenance_paths(substation_id);
CREATE INDEX idx_thermal_readings_equipment ON thermal_readings(equipment_id);
CREATE INDEX idx_thermal_readings_anomaly ON thermal_readings(equipment_id) WHERE anomaly_detected = TRUE;
CREATE INDEX idx_arc_flash_boundaries_equipment ON arc_flash_boundaries(equipment_id);

-- Add triggers for updated_at
CREATE TRIGGER update_substations_updated_at BEFORE UPDATE ON substations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_substation_equipment_updated_at BEFORE UPDATE ON substation_equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_paths_updated_at BEFORE UPDATE ON maintenance_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arc_flash_boundaries_updated_at BEFORE UPDATE ON arc_flash_boundaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check equipment clearances
CREATE OR REPLACE FUNCTION check_equipment_clearances(p_substation_id UUID) RETURNS void AS $$
DECLARE
  v_equipment RECORD;
  v_other RECORD;
  v_distance NUMERIC;
  v_required NUMERIC;
BEGIN
  -- Check all equipment pairs
  FOR v_equipment IN SELECT * FROM substation_equipment WHERE substation_id = p_substation_id
  LOOP
    FOR v_other IN SELECT * FROM substation_equipment 
                   WHERE substation_id = p_substation_id 
                   AND id > v_equipment.id
    LOOP
      -- Calculate 3D distance
      v_distance := sqrt(
        power((v_equipment.position->>'x')::numeric - (v_other.position->>'x')::numeric, 2) +
        power((v_equipment.position->>'y')::numeric - (v_other.position->>'y')::numeric, 2) +
        power((v_equipment.position->>'z')::numeric - (v_other.position->>'z')::numeric, 2)
      );
      
      -- Get required clearance (simplified)
      v_required := GREATEST(
        get_clearance_requirement(v_equipment.voltage_rating),
        get_clearance_requirement(v_other.voltage_rating)
      );
      
      -- Log violation if clearance is insufficient
      IF v_distance < v_required THEN
        INSERT INTO clearance_violations (
          substation_id, equipment1_id, equipment2_id, 
          measured_distance, required_distance
        ) VALUES (
          p_substation_id, v_equipment.id, v_other.id,
          v_distance, v_required
        ) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper function for clearance requirements
CREATE OR REPLACE FUNCTION get_clearance_requirement(p_voltage_kv INTEGER) RETURNS NUMERIC AS $$
BEGIN
  -- Simplified clearance calculation
  RETURN CASE
    WHEN p_voltage_kv <= 15 THEN 0.31
    WHEN p_voltage_kv <= 35 THEN 0.63
    WHEN p_voltage_kv <= 46 THEN 0.74
    WHEN p_voltage_kv <= 72 THEN 1.00
    WHEN p_voltage_kv <= 121 THEN 1.40
    WHEN p_voltage_kv <= 145 THEN 1.70
    WHEN p_voltage_kv <= 169 THEN 2.00
    WHEN p_voltage_kv <= 242 THEN 2.59
    WHEN p_voltage_kv <= 362 THEN 3.20
    WHEN p_voltage_kv <= 550 THEN 4.88
    ELSE 6.71
  END;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE substations ENABLE ROW LEVEL SECURITY;
ALTER TABLE substation_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE substation_equipment_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE lockout_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE clearance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE thermal_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_flash_boundaries ENABLE ROW LEVEL SECURITY;

-- Substation policies
CREATE POLICY "Users can view substations in their projects"
  ON substations FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Equipment policies
CREATE POLICY "Project members can view equipment"
  ON substation_equipment FOR SELECT
  USING (
    substation_id IN (
      SELECT s.id FROM substations s
      JOIN project_members pm ON s.project_id = pm.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

-- Lockout tag policies
CREATE POLICY "Users can view lockout tags"
  ON lockout_tags FOR SELECT
  USING (
    equipment_id IN (
      SELECT se.id FROM substation_equipment se
      JOIN substations s ON se.substation_id = s.id
      JOIN project_members pm ON s.project_id = pm.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own lockout tags"
  ON lockout_tags FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own tags or supervisors can remove any"
  ON lockout_tags FOR UPDATE
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'supervisor'))
  );

-- Comments
COMMENT ON TABLE substations IS '3D substation models and specifications';
COMMENT ON TABLE substation_equipment IS 'Individual equipment within substations';
COMMENT ON TABLE substation_equipment_status IS 'Real-time equipment status and measurements';
COMMENT ON TABLE lockout_tags IS 'Safety lockout/tagout tracking';
COMMENT ON TABLE clearance_violations IS 'Equipment clearance safety violations';
COMMENT ON TABLE maintenance_paths IS 'Safe access routes for maintenance';
COMMENT ON TABLE thermal_readings IS 'Thermal monitoring and hot spot detection';
COMMENT ON TABLE arc_flash_boundaries IS 'Arc flash study results and PPE requirements';
