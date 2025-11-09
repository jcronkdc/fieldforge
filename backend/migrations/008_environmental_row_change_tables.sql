-- Environmental, ROW, and Change Management Tables for FieldForge T&D/Substation Platform
-- Migration: 008_environmental_row_change_tables.sql

-- Environmental permits and compliance
CREATE TABLE environmental_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    permit_number TEXT NOT NULL,
    permit_type TEXT CHECK (permit_type IN (
        'wetlands', 'stream_crossing', 'endangered_species', 'cultural_resources',
        'air_quality', 'stormwater', 'spcc', 'noise', 'vegetation', 'other'
    )),
    issuing_agency TEXT NOT NULL,
    agency_contact TEXT,
    agency_phone TEXT,
    agency_email TEXT,
    -- Permit details
    application_date DATE,
    issue_date DATE,
    expiry_date DATE,
    renewal_required BOOLEAN DEFAULT false,
    renewal_date DATE,
    -- Compliance requirements
    permit_conditions JSONB[], -- Array of conditions and requirements
    monitoring_requirements JSONB[],
    reporting_requirements JSONB[],
    mitigation_measures JSONB[],
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'conditional', 'expired', 'renewed', 'revoked'
    )),
    compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN (
        'compliant', 'non_compliant', 'corrective_action', 'under_review'
    )),
    -- Inspections
    last_inspection_date DATE,
    next_inspection_date DATE,
    inspection_results JSONB[],
    -- Violations
    violations JSONB[], -- Array of violation details
    corrective_actions JSONB[],
    -- Documentation
    permit_document_url TEXT,
    application_documents JSONB[],
    correspondence JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, permit_number)
);

-- Right of Way parcels and easements
CREATE TABLE row_parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parcel_number TEXT NOT NULL,
    tract_number TEXT,
    tax_id TEXT,
    county TEXT,
    state TEXT,
    -- Owner information
    owner_name TEXT,
    owner_address JSONB,
    owner_phone TEXT,
    owner_email TEXT,
    owner_representative TEXT,
    -- Easement details
    easement_type TEXT CHECK (easement_type IN (
        'permanent', 'temporary', 'access', 'construction', 'maintenance'
    )),
    easement_width_ft DECIMAL(10, 2),
    easement_area_acres DECIMAL(10, 3),
    easement_status TEXT DEFAULT 'negotiating' CHECK (easement_status IN (
        'negotiating', 'option_signed', 'easement_signed', 'condemned', 'released'
    )),
    -- Acquisition
    option_date DATE,
    option_expiry DATE,
    easement_date DATE,
    compensation_amount DECIMAL(12, 2),
    payment_date DATE,
    payment_method TEXT,
    -- Land use
    current_land_use TEXT,
    zoning TEXT,
    crops TEXT,
    structures_present JSONB[],
    environmental_features JSONB[],
    -- Construction requirements
    access_roads JSONB[], -- Array of access points
    gates_required JSONB[],
    clearing_required BOOLEAN DEFAULT false,
    clearing_acres DECIMAL(10, 3),
    clearing_complete BOOLEAN DEFAULT false,
    clearing_date DATE,
    -- Restoration
    restoration_required BOOLEAN DEFAULT false,
    restoration_requirements TEXT,
    restoration_complete BOOLEAN DEFAULT false,
    restoration_date DATE,
    restoration_accepted BOOLEAN DEFAULT false,
    -- Documentation
    survey_plat_url TEXT,
    easement_document_url TEXT,
    title_report_url TEXT,
    photos JSONB[],
    -- GIS data
    geometry JSONB, -- GeoJSON polygon
    centerline_geometry JSONB, -- GeoJSON linestring
    structures_in_parcel UUID[], -- Structure IDs
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, parcel_number)
);

-- Environmental inspections and monitoring
CREATE TABLE environmental_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    inspection_type TEXT CHECK (inspection_type IN (
        'swppp', 'erosion_control', 'spill_prevention', 'dust_control',
        'noise_monitoring', 'water_quality', 'wildlife', 'restoration'
    )),
    inspection_date DATE NOT NULL,
    inspector_id UUID REFERENCES auth.users(id),
    inspector_company TEXT,
    weather_conditions JSONB,
    -- Inspection items
    checklist_items JSONB[], -- Array of inspection points
    deficiencies JSONB[], -- Array of issues found
    corrective_actions JSONB[], -- Required corrections
    -- Specific measurements
    turbidity_ntu DECIMAL(10, 2),
    ph_level DECIMAL(4, 2),
    noise_level_db DECIMAL(6, 2),
    dust_level TEXT,
    -- Results
    compliant BOOLEAN,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    -- Documentation
    photos JSONB[],
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stormwater management
CREATE TABLE stormwater_bmps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    bmp_id TEXT NOT NULL,
    bmp_type TEXT CHECK (bmp_type IN (
        'silt_fence', 'straw_wattle', 'check_dam', 'sediment_trap',
        'detention_pond', 'inlet_protection', 'concrete_washout',
        'vehicle_tracking_pad', 'dust_control', 'dewatering'
    )),
    location_id UUID REFERENCES project_areas(id),
    location_description TEXT,
    installation_date DATE,
    installed_by UUID REFERENCES auth.users(id),
    -- Maintenance
    maintenance_frequency TEXT,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_log JSONB[],
    -- Inspection
    last_inspection_date DATE,
    inspection_status TEXT,
    deficiencies_noted TEXT,
    -- Removal
    removal_date DATE,
    removed_by UUID REFERENCES auth.users(id),
    disposal_method TEXT,
    -- Documentation
    installation_photos JSONB[],
    maintenance_photos JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, bmp_id)
);

-- Change orders
CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    change_order_number TEXT NOT NULL,
    revision TEXT DEFAULT '0',
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'submitted', 'under_review', 'approved', 
        'rejected', 'withdrawn', 'executed'
    )),
    -- Classification
    change_type TEXT CHECK (change_type IN (
        'scope_add', 'scope_delete', 'design_change', 'differing_conditions',
        'delay', 'acceleration', 'suspension', 'force_majeure'
    )),
    initiated_by TEXT CHECK (initiated_by IN ('owner', 'contractor', 'engineer')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    -- Description
    description TEXT NOT NULL,
    justification TEXT,
    scope_of_work TEXT,
    affected_areas UUID[], -- Project area IDs
    affected_schedule_activities TEXT[],
    -- Cost impact
    estimated_cost DECIMAL(12, 2),
    labor_cost DECIMAL(12, 2),
    material_cost DECIMAL(12, 2),
    equipment_cost DECIMAL(12, 2),
    subcontractor_cost DECIMAL(12, 2),
    markup_percent DECIMAL(5, 2),
    total_cost DECIMAL(12, 2),
    -- Schedule impact
    schedule_impact_days INTEGER,
    time_extension_requested BOOLEAN DEFAULT false,
    new_completion_date DATE,
    -- Submission and approval
    submitted_by UUID REFERENCES auth.users(id),
    submitted_date DATE,
    reviewed_by UUID REFERENCES auth.users(id),
    review_date DATE,
    review_comments TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approval_date DATE,
    approval_comments TEXT,
    -- Execution
    executed_date DATE,
    executed_by UUID REFERENCES auth.users(id),
    contract_modification_number TEXT,
    -- Supporting documentation
    backup_documentation JSONB[],
    cost_breakdown_url TEXT,
    schedule_analysis_url TEXT,
    rfis_referenced TEXT[],
    -- Workflow
    workflow_history JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, change_order_number, revision)
);

-- Budget tracking
CREATE TABLE budget_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    cost_code_id UUID REFERENCES cost_codes(id),
    period_ending DATE NOT NULL,
    -- Original budget
    original_budget DECIMAL(12, 2),
    approved_changes DECIMAL(12, 2),
    pending_changes DECIMAL(12, 2),
    revised_budget DECIMAL(12, 2),
    -- Committed costs
    purchase_orders DECIMAL(12, 2),
    subcontracts DECIMAL(12, 2),
    total_committed DECIMAL(12, 2),
    -- Actual costs
    labor_actual DECIMAL(12, 2),
    material_actual DECIMAL(12, 2),
    equipment_actual DECIMAL(12, 2),
    subcontractor_actual DECIMAL(12, 2),
    other_actual DECIMAL(12, 2),
    total_actual DECIMAL(12, 2),
    -- Projections
    estimate_to_complete DECIMAL(12, 2),
    estimate_at_completion DECIMAL(12, 2),
    variance DECIMAL(12, 2),
    variance_percent DECIMAL(5, 2),
    -- Earned value
    percent_complete DECIMAL(5, 2),
    earned_value DECIMAL(12, 2),
    cost_performance_index DECIMAL(5, 3),
    schedule_performance_index DECIMAL(5, 3),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, cost_code_id, period_ending)
);

-- Weather monitoring
CREATE TABLE weather_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    log_time TIME,
    location_id UUID REFERENCES project_areas(id),
    -- Current conditions
    temperature_f DECIMAL(5, 2),
    feels_like_f DECIMAL(5, 2),
    humidity_percent INTEGER,
    barometric_pressure DECIMAL(6, 2),
    wind_speed_mph INTEGER,
    wind_direction TEXT,
    wind_gust_mph INTEGER,
    visibility_miles DECIMAL(5, 2),
    -- Precipitation
    precipitation_type TEXT,
    precipitation_inches DECIMAL(5, 2),
    snow_inches DECIMAL(5, 2),
    -- Sky conditions
    cloud_cover_percent INTEGER,
    conditions TEXT,
    -- Lightning
    lightning_detected BOOLEAN DEFAULT false,
    lightning_distance_miles DECIMAL(5, 2),
    -- Work impacts
    work_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    suspension_duration_hours DECIMAL(5, 2),
    -- Restrictions
    crane_restrictions BOOLEAN DEFAULT false,
    aerial_lift_restrictions BOOLEAN DEFAULT false,
    concrete_restrictions BOOLEAN DEFAULT false,
    welding_restrictions BOOLEAN DEFAULT false,
    -- Forecast
    forecast_24hr TEXT,
    forecast_48hr TEXT,
    -- Source
    data_source TEXT, -- 'manual', 'weather_station', 'api'
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, log_date, log_time)
);

-- Outage tracking
CREATE TABLE outage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    outage_number TEXT NOT NULL,
    outage_type TEXT CHECK (outage_type IN (
        'planned', 'emergency', 'forced', 'maintenance'
    )),
    -- Affected equipment
    affected_circuits TEXT[],
    affected_substations TEXT[],
    affected_lines TEXT[],
    customers_affected INTEGER,
    load_affected_mw DECIMAL(10, 2),
    -- Schedule
    requested_start TIMESTAMPTZ,
    requested_end TIMESTAMPTZ,
    approved_start TIMESTAMPTZ,
    approved_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    duration_hours DECIMAL(8, 2),
    -- Coordination
    utility_coordinator TEXT,
    utility_approval_number TEXT,
    switching_order_id UUID REFERENCES switching_orders(id),
    clearance_number TEXT,
    -- Work performed
    work_description TEXT,
    crews_assigned JSONB[],
    equipment_worked_on JSONB[],
    -- Status
    status TEXT DEFAULT 'requested' CHECK (status IN (
        'requested', 'approved', 'active', 'completed', 'cancelled'
    )),
    cancellation_reason TEXT,
    -- Return to service
    return_procedure TEXT,
    test_requirements TEXT,
    energization_checklist JSONB[],
    -- Documentation
    outage_request_form_url TEXT,
    post_outage_report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, outage_number)
);

-- Create indexes
CREATE INDEX idx_environmental_permits_project ON environmental_permits(project_id);
CREATE INDEX idx_environmental_permits_status ON environmental_permits(status);
CREATE INDEX idx_row_parcels_project ON row_parcels(project_id);
CREATE INDEX idx_row_parcels_status ON row_parcels(easement_status);
CREATE INDEX idx_environmental_inspections_project_date ON environmental_inspections(project_id, inspection_date);
CREATE INDEX idx_stormwater_bmps_project ON stormwater_bmps(project_id);
CREATE INDEX idx_change_orders_project_status ON change_orders(project_id, status);
CREATE INDEX idx_budget_tracking_project_period ON budget_tracking(project_id, period_ending);
CREATE INDEX idx_weather_logs_project_date ON weather_logs(project_id, log_date);
CREATE INDEX idx_outage_tracking_project_status ON outage_tracking(project_id, status);

-- Enable RLS
ALTER TABLE environmental_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE row_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE stormwater_bmps ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY environmental_permits_access ON environmental_permits FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY row_parcels_access ON row_parcels FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY environmental_inspections_access ON environmental_inspections FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY stormwater_bmps_access ON stormwater_bmps FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY change_orders_access ON change_orders FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY budget_tracking_access ON budget_tracking FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY weather_logs_access ON weather_logs FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY outage_tracking_access ON outage_tracking FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
