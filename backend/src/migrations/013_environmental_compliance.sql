-- Environmental Compliance System
-- Tracks environmental metrics, incidents, permits, and regulatory compliance

-- Environmental Readings Table
CREATE TABLE IF NOT EXISTS environmental_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Measurement Details
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
    'air_quality', 'noise_level', 'dust_level', 
    'water_quality', 'temperature', 'humidity'
  )),
  value DECIMAL(10, 4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  location VARCHAR(255) NOT NULL,
  
  -- Status and Compliance
  status VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'violation')),
  notes TEXT,
  
  -- Recording Information
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Environmental Incidents Table  
CREATE TABLE IF NOT EXISTS environmental_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Incident Details
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  
  -- Response and Resolution
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  corrective_actions TEXT,
  resolution_notes TEXT,
  resolution_date TIMESTAMP WITH TIME ZONE,
  
  -- Reporting Information
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Environmental Permits Table
CREATE TABLE IF NOT EXISTS environmental_permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Permit Details
  permit_type VARCHAR(100) NOT NULL,
  permit_number VARCHAR(50) NOT NULL UNIQUE,
  issuing_authority VARCHAR(255) NOT NULL,
  
  -- Validity Period
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired')),
  
  -- Compliance Requirements
  conditions TEXT[] DEFAULT '{}',
  compliance_status VARCHAR(20) NOT NULL DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_review')),
  
  -- Documentation
  document_urls TEXT[],
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Environmental Compliance Tasks Table
CREATE TABLE IF NOT EXISTS environmental_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  permit_id UUID REFERENCES environmental_permits(id) ON DELETE CASCADE,
  
  -- Task Details
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'as_needed')),
  
  -- Assignment and Status
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_env_readings_project ON environmental_readings(project_id);
CREATE INDEX idx_env_readings_metric ON environmental_readings(metric_type);
CREATE INDEX idx_env_readings_status ON environmental_readings(status);
CREATE INDEX idx_env_readings_recorded ON environmental_readings(recorded_at);

CREATE INDEX idx_env_incidents_project ON environmental_incidents(project_id);
CREATE INDEX idx_env_incidents_status ON environmental_incidents(status);
CREATE INDEX idx_env_incidents_severity ON environmental_incidents(severity);

CREATE INDEX idx_env_permits_project ON environmental_permits(project_id);
CREATE INDEX idx_env_permits_expiry ON environmental_permits(expiry_date);
CREATE INDEX idx_env_permits_status ON environmental_permits(status);

CREATE INDEX idx_env_tasks_project ON environmental_tasks(project_id);
CREATE INDEX idx_env_tasks_assigned ON environmental_tasks(assigned_to);
CREATE INDEX idx_env_tasks_due ON environmental_tasks(due_date);

-- Add triggers for updated_at
CREATE TRIGGER update_environmental_readings_updated_at BEFORE UPDATE ON environmental_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environmental_incidents_updated_at BEFORE UPDATE ON environmental_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environmental_permits_updated_at BEFORE UPDATE ON environmental_permits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environmental_tasks_updated_at BEFORE UPDATE ON environmental_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE environmental_readings IS 'Tracks environmental measurements and compliance status';
COMMENT ON TABLE environmental_incidents IS 'Records environmental incidents and corrective actions';
COMMENT ON TABLE environmental_permits IS 'Manages environmental permits and compliance requirements';
COMMENT ON TABLE environmental_tasks IS 'Tracks compliance tasks and inspections';

COMMENT ON COLUMN environmental_readings.metric_type IS 'Type of environmental measurement';
COMMENT ON COLUMN environmental_readings.status IS 'Compliance status based on thresholds';
COMMENT ON COLUMN environmental_incidents.severity IS 'Impact level of the incident';
COMMENT ON COLUMN environmental_permits.compliance_status IS 'Current compliance status with permit conditions';
