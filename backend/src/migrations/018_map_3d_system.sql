-- 3D Map System
-- Real-time tracking of equipment, crew, and safety zones

-- Equipment Positions Table (current position)
CREATE TABLE IF NOT EXISTS equipment_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  
  -- 3D Position
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Ensure one current position per equipment
  UNIQUE(equipment_id, created_at)
);

-- Equipment Position History Table
CREATE TABLE IF NOT EXISTS equipment_position_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  
  -- 3D Position
  position JSONB NOT NULL,
  
  -- Tracking
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recorded_by UUID REFERENCES auth.users(id)
);

-- Crew Locations Table
CREATE TABLE IF NOT EXISTS crew_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 3D Position
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  
  -- Status
  zone VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('active', 'break', 'offline')) DEFAULT 'active',
  heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety Zones Table
CREATE TABLE IF NOT EXISTS safety_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Zone Details
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('restricted', 'caution', 'safe')) NOT NULL,
  
  -- 3D Boundaries
  bounds JSONB NOT NULL DEFAULT '{"x": 0, "z": 0, "width": 10, "depth": 10}',
  height NUMERIC NOT NULL DEFAULT 5,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drone Imagery Table
CREATE TABLE IF NOT EXISTS drone_imagery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Imagery Data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Georeferencing
  bounds JSONB NOT NULL, -- Lat/lng corners
  altitude NUMERIC,
  bearing NUMERIC,
  
  -- Metadata
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Weather Overlays Table
CREATE TABLE IF NOT EXISTS weather_overlays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Weather Data
  data JSONB NOT NULL, -- Temperature, wind, precipitation, etc.
  overlay_type VARCHAR(50) NOT NULL, -- temperature, wind, precipitation
  
  -- Timestamps
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Visualization Table
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Progress Data
  snapshot_data JSONB NOT NULL, -- 3D model state, completed areas, etc.
  completion_percentage NUMERIC(5,2) CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Metadata
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geofence Alerts Table
CREATE TABLE IF NOT EXISTS geofence_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Alert Details
  zone_id UUID NOT NULL REFERENCES safety_zones(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  equipment_id UUID REFERENCES equipment(id),
  
  -- Violation Details
  alert_type VARCHAR(50) NOT NULL, -- entry, exit, dwell
  position JSONB NOT NULL,
  
  -- Status
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_equipment_positions_equipment ON equipment_positions(equipment_id);
CREATE INDEX idx_equipment_positions_created ON equipment_positions(created_at DESC);
CREATE INDEX idx_equipment_position_history_equipment ON equipment_position_history(equipment_id);
CREATE INDEX idx_equipment_position_history_recorded ON equipment_position_history(recorded_at DESC);
CREATE INDEX idx_crew_locations_user ON crew_locations(user_id);
CREATE INDEX idx_crew_locations_updated ON crew_locations(updated_at DESC);
CREATE INDEX idx_crew_locations_status ON crew_locations(status);
CREATE INDEX idx_safety_zones_project ON safety_zones(project_id);
CREATE INDEX idx_safety_zones_active ON safety_zones(active);
CREATE INDEX idx_drone_imagery_project ON drone_imagery(project_id);
CREATE INDEX idx_drone_imagery_captured ON drone_imagery(captured_at DESC);
CREATE INDEX idx_weather_overlays_project ON weather_overlays(project_id);
CREATE INDEX idx_weather_overlays_valid ON weather_overlays(valid_from, valid_to);
CREATE INDEX idx_progress_snapshots_project ON progress_snapshots(project_id);
CREATE INDEX idx_progress_snapshots_captured ON progress_snapshots(captured_at DESC);
CREATE INDEX idx_geofence_alerts_zone ON geofence_alerts(zone_id);
CREATE INDEX idx_geofence_alerts_user ON geofence_alerts(user_id);
CREATE INDEX idx_geofence_alerts_triggered ON geofence_alerts(triggered_at DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_crew_locations_updated_at BEFORE UPDATE ON crew_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_zones_updated_at BEFORE UPDATE ON safety_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check geofence violations
CREATE OR REPLACE FUNCTION check_geofence_violation(
  p_position JSONB,
  p_user_id UUID DEFAULT NULL,
  p_equipment_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_zone RECORD;
  v_inside BOOLEAN;
BEGIN
  -- Check each active safety zone
  FOR v_zone IN 
    SELECT * FROM safety_zones 
    WHERE active = TRUE 
      AND type IN ('restricted', 'caution')
  LOOP
    -- Simple rectangular boundary check
    v_inside := (
      (p_position->>'x')::numeric >= (v_zone.bounds->>'x')::numeric - (v_zone.bounds->>'width')::numeric / 2 AND
      (p_position->>'x')::numeric <= (v_zone.bounds->>'x')::numeric + (v_zone.bounds->>'width')::numeric / 2 AND
      (p_position->>'z')::numeric >= (v_zone.bounds->>'z')::numeric - (v_zone.bounds->>'depth')::numeric / 2 AND
      (p_position->>'z')::numeric <= (v_zone.bounds->>'z')::numeric + (v_zone.bounds->>'depth')::numeric / 2
    );
    
    IF v_inside AND v_zone.type = 'restricted' THEN
      -- Create alert for restricted zone violation
      INSERT INTO geofence_alerts (zone_id, user_id, equipment_id, alert_type, position)
      VALUES (v_zone.id, p_user_id, p_equipment_id, 'entry', p_position);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get current equipment positions with paths
CREATE OR REPLACE FUNCTION get_equipment_with_paths(
  p_project_id UUID,
  p_time_window INTERVAL DEFAULT INTERVAL '1 hour'
) RETURNS TABLE (
  equipment_id UUID,
  equipment_name VARCHAR,
  equipment_type VARCHAR,
  current_position JSONB,
  status VARCHAR,
  operator_name VARCHAR,
  path JSONB[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.type,
    COALESCE(ep.position, '{"x": 0, "y": 0, "z": 0}'::jsonb),
    e.status,
    u.name,
    ARRAY_AGG(
      eph.position ORDER BY eph.recorded_at
    ) FILTER (WHERE eph.recorded_at > NOW() - p_time_window)
  FROM equipment e
  LEFT JOIN LATERAL (
    SELECT position 
    FROM equipment_positions 
    WHERE equipment_id = e.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) ep ON true
  LEFT JOIN users u ON e.assigned_to = u.id
  LEFT JOIN equipment_position_history eph ON e.id = eph.equipment_id
  WHERE e.project_id = p_project_id
  GROUP BY e.id, e.name, e.type, e.status, ep.position, u.name;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE equipment_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_imagery ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_alerts ENABLE ROW LEVEL SECURITY;

-- Equipment position policies
CREATE POLICY "Users can view equipment positions in their projects"
  ON equipment_positions FOR SELECT
  USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN project_members pm ON e.project_id = pm.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Equipment operators can update positions"
  ON equipment_positions FOR INSERT
  WITH CHECK (
    equipment_id IN (
      SELECT id FROM equipment
      WHERE assigned_to = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT user_id FROM users
      WHERE role IN ('admin', 'supervisor')
    )
  );

-- Crew location policies
CREATE POLICY "Users can view crew locations in their projects"
  ON crew_locations FOR SELECT
  USING (
    user_id IN (
      SELECT pm.user_id 
      FROM project_members pm
      WHERE pm.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own location"
  ON crew_locations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Safety zone policies
CREATE POLICY "All project members can view safety zones"
  ON safety_zones FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Safety officers can manage safety zones"
  ON safety_zones FOR ALL
  USING (
    project_id IN (
      SELECT pm.project_id FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'safety_officer', 'supervisor')
    )
  );

-- Comments
COMMENT ON TABLE equipment_positions IS 'Current positions of equipment on site';
COMMENT ON TABLE equipment_position_history IS 'Historical tracking of equipment movements';
COMMENT ON TABLE crew_locations IS 'Real-time crew member locations and status';
COMMENT ON TABLE safety_zones IS 'Geofenced areas for safety management';
COMMENT ON TABLE drone_imagery IS 'Aerial imagery from drone surveys';
COMMENT ON TABLE weather_overlays IS 'Weather data for map visualization';
COMMENT ON TABLE progress_snapshots IS '3D progress tracking over time';
COMMENT ON TABLE geofence_alerts IS 'Alerts for safety zone violations';
