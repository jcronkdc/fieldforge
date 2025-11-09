-- Safety and Compliance Tables for FieldForge T&D/Substation Platform
-- Migration: 002_safety_compliance_tables.sql

-- Safety briefings/tailboards
CREATE TABLE safety_briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    briefing_date DATE NOT NULL,
    shift TEXT CHECK (shift IN ('day', 'night', 'swing')),
    foreman_id UUID REFERENCES auth.users(id),
    location_id UUID REFERENCES project_areas(id),
    topics TEXT[],
    hazards_identified JSONB[],
    controls_implemented JSONB[],
    weather_conditions JSONB,
    emergency_procedures TEXT,
    nearest_hospital JSONB,
    attendees JSONB[], -- Array of {user_id, name, company, signature_time}
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Job Safety Analysis (JSA) / Job Hazard Analysis (JHA)
CREATE TABLE job_safety_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    jsa_number TEXT NOT NULL,
    title TEXT NOT NULL,
    work_location TEXT,
    date_prepared DATE,
    prepared_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    job_steps JSONB[], -- Array of {sequence, task, hazards[], controls[]}
    required_ppe TEXT[],
    required_training TEXT[],
    required_permits TEXT[],
    emergency_contacts JSONB[],
    revision_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, jsa_number)
);

-- Switching orders and clearances
CREATE TABLE switching_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    request_date TIMESTAMPTZ NOT NULL,
    requested_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    switching_authority TEXT,
    affected_circuits TEXT[],
    isolation_points JSONB[], -- Array of switch positions and tags
    grounds_required JSONB[], -- Grounding locations and equipment
    clearance_boundaries TEXT,
    special_conditions TEXT,
    outage_start TIMESTAMPTZ,
    outage_end TIMESTAMPTZ,
    return_procedure TEXT,
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'active', 'cleared', 'cancelled')),
    clearance_holder_id UUID REFERENCES auth.users(id),
    clearance_issued_time TIMESTAMPTZ,
    clearance_released_time TIMESTAMPTZ,
    test_before_touch BOOLEAN DEFAULT true,
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, order_number)
);

-- Arc flash boundaries and PPE requirements
CREATE TABLE arc_flash_boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    equipment_id TEXT NOT NULL,
    equipment_name TEXT,
    location TEXT,
    voltage_level TEXT,
    available_fault_current DECIMAL(10, 2), -- in kA
    clearing_time DECIMAL(10, 4), -- in seconds
    incident_energy DECIMAL(10, 2), -- cal/cm²
    arc_flash_boundary DECIMAL(10, 2), -- in inches
    limited_approach DECIMAL(10, 2), -- in feet
    restricted_approach DECIMAL(10, 2), -- in feet
    prohibited_approach DECIMAL(10, 2), -- in feet
    working_distance DECIMAL(10, 2), -- in inches
    required_ppe_category INTEGER CHECK (required_ppe_category BETWEEN 1 AND 4),
    required_ppe_description TEXT,
    last_study_date DATE,
    next_study_date DATE,
    study_performed_by TEXT,
    label_installed BOOLEAN DEFAULT false,
    label_installed_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, equipment_id)
);

-- Safety incidents and near misses
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    incident_number TEXT NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME,
    incident_type TEXT CHECK (incident_type IN ('injury', 'near_miss', 'property_damage', 'environmental', 'vehicle')),
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'serious', 'fatal')),
    location_id UUID REFERENCES project_areas(id),
    location_description TEXT,
    weather_conditions JSONB,
    description TEXT NOT NULL,
    immediate_causes TEXT[],
    root_causes TEXT[],
    injured_person JSONB, -- {name, company, job_title, experience}
    injury_description TEXT,
    medical_treatment TEXT,
    lost_time BOOLEAN DEFAULT false,
    osha_recordable BOOLEAN DEFAULT false,
    property_damage_estimate DECIMAL(10, 2),
    witnesses JSONB[],
    immediate_actions_taken TEXT,
    corrective_actions JSONB[], -- Array of {action, responsible_party, due_date, status}
    photos JSONB[],
    reported_by UUID REFERENCES auth.users(id),
    investigated_by UUID REFERENCES auth.users(id),
    investigation_date DATE,
    lessons_learned TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, incident_number)
);

-- Safety observations (positive and negative)
CREATE TABLE safety_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    observer_id UUID REFERENCES auth.users(id),
    location_id UUID REFERENCES project_areas(id),
    observation_type TEXT CHECK (observation_type IN ('positive', 'at_risk', 'stop_work')),
    category TEXT, -- PPE, housekeeping, procedures, equipment, etc.
    description TEXT NOT NULL,
    persons_involved JSONB[],
    immediate_action_taken TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_action TEXT,
    follow_up_responsible UUID REFERENCES auth.users(id),
    follow_up_due_date DATE,
    follow_up_completed BOOLEAN DEFAULT false,
    photos JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permits (hot work, confined space, excavation, etc.)
CREATE TABLE safety_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    permit_number TEXT NOT NULL,
    permit_type TEXT CHECK (permit_type IN ('hot_work', 'confined_space', 'excavation', 'energized_work', 'critical_lift')),
    work_description TEXT NOT NULL,
    location_id UUID REFERENCES project_areas(id),
    location_description TEXT,
    jsa_id UUID REFERENCES job_safety_analyses(id),
    permit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    requested_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    fire_watch_required BOOLEAN DEFAULT false,
    fire_watch_name TEXT,
    atmospheric_testing JSONB, -- For confined space
    precautions JSONB[],
    equipment_required TEXT[],
    emergency_procedures TEXT,
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'active', 'completed', 'cancelled')),
    closed_by UUID REFERENCES auth.users(id),
    closed_time TIMESTAMPTZ,
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, permit_number)
);

-- Lock Out Tag Out (LOTO) procedures
CREATE TABLE loto_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    loto_number TEXT NOT NULL,
    equipment_id TEXT NOT NULL,
    equipment_description TEXT,
    location_id UUID REFERENCES project_areas(id),
    energy_sources JSONB[], -- Array of {type, location, isolation_method}
    lockout_points JSONB[], -- Array of {point, lock_type, tag_number}
    verification_steps TEXT[],
    authorized_employees JSONB[], -- Array of {user_id, name, lock_number}
    date_applied TIMESTAMPTZ,
    applied_by UUID REFERENCES auth.users(id),
    date_removed TIMESTAMPTZ,
    removed_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'removed')),
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, loto_number)
);

-- Create indexes
CREATE INDEX idx_safety_briefings_project_date ON safety_briefings(project_id, briefing_date);
CREATE INDEX idx_jsa_project ON job_safety_analyses(project_id);
CREATE INDEX idx_switching_orders_project_status ON switching_orders(project_id, status);
CREATE INDEX idx_arc_flash_project ON arc_flash_boundaries(project_id);
CREATE INDEX idx_safety_incidents_project_date ON safety_incidents(project_id, incident_date);
CREATE INDEX idx_safety_observations_project_date ON safety_observations(project_id, observation_date);
CREATE INDEX idx_safety_permits_project_status ON safety_permits(project_id, status);
CREATE INDEX idx_loto_procedures_project_status ON loto_procedures(project_id, status);

-- Enable RLS
ALTER TABLE safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_safety_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE switching_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_flash_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE loto_procedures ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can access safety data for their projects)
CREATE POLICY safety_project_access ON safety_briefings FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY jsa_project_access ON job_safety_analyses FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY switching_project_access ON switching_orders FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY arc_flash_project_access ON arc_flash_boundaries FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY incidents_project_access ON safety_incidents FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY observations_project_access ON safety_observations FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY permits_project_access ON safety_permits FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY loto_project_access ON loto_procedures FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
