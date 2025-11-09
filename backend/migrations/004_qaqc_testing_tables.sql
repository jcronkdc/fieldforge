-- QAQC, Testing and Commissioning Tables for FieldForge T&D/Substation Platform
-- Migration: 004_qaqc_testing_tables.sql

-- QAQC Inspection checklists
CREATE TABLE qaqc_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    inspection_number TEXT NOT NULL,
    inspection_type TEXT CHECK (inspection_type IN (
        'foundation', 'steel_erection', 'grounding', 'conductor_stringing',
        'equipment_receipt', 'equipment_installation', 'cable_pulling',
        'termination', 'wiring', 'pre_energization', 'final'
    )),
    inspection_date DATE NOT NULL,
    inspector_id UUID REFERENCES auth.users(id),
    location_id UUID REFERENCES project_areas(id),
    equipment_id UUID REFERENCES substation_equipment(id),
    structure_id UUID REFERENCES transmission_structures(id),
    weather_conditions JSONB,
    checklist_template TEXT,
    checklist_items JSONB[], -- Array of {item, spec_reference, pass_fail, measurement, notes}
    deficiencies JSONB[], -- Array of {item, severity, description, corrective_action, due_date}
    measurements JSONB[], -- Array of {parameter, specified_value, measured_value, tolerance, pass_fail}
    overall_status TEXT CHECK (overall_status IN ('passed', 'failed', 'conditional', 'pending')),
    photos JSONB[], -- Array of {url, caption, timestamp, gps_coords}
    documents JSONB[],
    reinspection_required BOOLEAN DEFAULT false,
    reinspection_date DATE,
    approved_by UUID REFERENCES auth.users(id),
    approval_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, inspection_number)
);

-- Test reports for equipment
CREATE TABLE test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    test_number TEXT NOT NULL,
    test_type TEXT CHECK (test_type IN (
        'insulation_resistance', 'contact_resistance', 'winding_resistance',
        'turns_ratio', 'power_factor', 'sweep_frequency', 'hipot',
        'vlf', 'partial_discharge', 'dissolved_gas', 'oil_dielectric',
        'relay_calibration', 'ct_saturation', 'ground_grid', 'fall_of_potential',
        'doble', 'sfra', 'breaker_timing', 'breaker_travel', 'sf6_purity'
    )),
    equipment_id UUID REFERENCES substation_equipment(id),
    cable_id UUID REFERENCES cables(id),
    test_date DATE NOT NULL,
    test_standard TEXT, -- IEEE, NETA, IEC standard reference
    performed_by UUID REFERENCES auth.users(id),
    testing_company UUID REFERENCES companies(id),
    witnessed_by UUID REFERENCES auth.users(id),
    temperature_f DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    test_equipment JSONB[], -- Array of {name, model, serial, calibration_date}
    test_procedure TEXT,
    test_data JSONB, -- Structured test results based on test type
    acceptance_criteria JSONB,
    test_result TEXT CHECK (test_result IN ('pass', 'fail', 'marginal', 'na')),
    deviations TEXT,
    recommendations TEXT,
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, test_number)
);

-- Relay settings and testing
CREATE TABLE relay_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES substation_equipment(id) ON DELETE CASCADE,
    relay_function TEXT, -- '50/51', '87T', '21', etc.
    setting_group INTEGER DEFAULT 1,
    pickup_current DECIMAL(10, 3),
    time_dial DECIMAL(10, 3),
    curve_type TEXT,
    instantaneous_pickup DECIMAL(10, 3),
    directional_angle DECIMAL(5, 2),
    zone_reach JSONB, -- For distance relays
    ct_ratio TEXT,
    pt_ratio TEXT,
    enabled BOOLEAN DEFAULT true,
    settings_source TEXT, -- 'Design', 'As-Found', 'As-Left'
    programmed_by UUID REFERENCES auth.users(id),
    programmed_date DATE,
    verified_by UUID REFERENCES auth.users(id),
    verified_date DATE,
    settings_file_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Torque verification records
CREATE TABLE torque_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    location_id UUID REFERENCES project_areas(id),
    structure_id UUID REFERENCES transmission_structures(id),
    equipment_id UUID REFERENCES substation_equipment(id),
    connection_type TEXT, -- 'bus', 'terminal', 'splice', 'dead-end', 'suspension'
    connection_size TEXT,
    material TEXT, -- 'aluminum', 'copper', 'steel'
    specified_torque_ft_lbs DECIMAL(8, 2),
    measured_torque_ft_lbs DECIMAL(8, 2),
    torque_wrench_id TEXT,
    wrench_calibration_date DATE,
    verification_date DATE,
    verified_by UUID REFERENCES auth.users(id),
    temperature_f DECIMAL(5, 2),
    retorque_required BOOLEAN DEFAULT false,
    retorque_date DATE,
    pass_fail TEXT CHECK (pass_fail IN ('pass', 'fail')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Weld inspection records
CREATE TABLE weld_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    weld_number TEXT NOT NULL,
    structure_id UUID REFERENCES transmission_structures(id),
    location_description TEXT,
    weld_type TEXT, -- 'fillet', 'groove', 'plug'
    weld_process TEXT, -- 'SMAW', 'GMAW', 'FCAW', 'SAW'
    welder_id TEXT,
    welder_certification TEXT,
    weld_date DATE,
    inspection_type TEXT CHECK (inspection_type IN ('visual', 'mt', 'pt', 'ut', 'rt')),
    inspection_date DATE,
    inspector_id UUID REFERENCES auth.users(id),
    inspector_certification TEXT,
    acceptance_criteria TEXT,
    defects_found JSONB[], -- Array of defect details
    repair_required BOOLEAN DEFAULT false,
    repair_completed BOOLEAN DEFAULT false,
    repair_date DATE,
    final_acceptance TEXT CHECK (final_acceptance IN ('accepted', 'rejected', 'repair_required')),
    report_url TEXT,
    photos JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, weld_number)
);

-- Foundation inspection records
CREATE TABLE foundation_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    structure_id UUID REFERENCES transmission_structures(id),
    foundation_type TEXT, -- 'drilled_pier', 'spread_footer', 'pile', 'direct_embed'
    excavation_date DATE,
    excavation_depth_ft DECIMAL(6, 2),
    soil_conditions TEXT,
    water_encountered BOOLEAN DEFAULT false,
    dewatering_required BOOLEAN DEFAULT false,
    rebar_size TEXT,
    rebar_cage_inspected BOOLEAN,
    concrete_supplier TEXT,
    concrete_type TEXT,
    concrete_strength_psi INTEGER,
    slump_inches DECIMAL(4, 2),
    air_content_percent DECIMAL(4, 2),
    concrete_temp_f DECIMAL(5, 2),
    ambient_temp_f DECIMAL(5, 2),
    pour_date TIMESTAMPTZ,
    pour_volume_cy DECIMAL(8, 2),
    vibration_method TEXT,
    curing_method TEXT,
    cylinder_tests JSONB[], -- Array of {test_date, strength_psi}
    grounding_installed BOOLEAN DEFAULT false,
    anchor_bolts_aligned BOOLEAN,
    final_elevation_ft DECIMAL(10, 3),
    inspected_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    photos JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Commissioning checklists
CREATE TABLE commissioning_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES substation_equipment(id),
    checklist_name TEXT NOT NULL,
    checklist_type TEXT CHECK (checklist_type IN (
        'mechanical', 'electrical', 'protection', 'control', 'scada', 'functional'
    )),
    revision TEXT,
    items JSONB[], -- Array of {sequence, description, completed, completed_by, completed_date, notes}
    started_date DATE,
    completed_date DATE,
    lead_commissioner UUID REFERENCES auth.users(id),
    witness_utility UUID REFERENCES auth.users(id),
    witness_owner UUID REFERENCES auth.users(id),
    exceptions JSONB[], -- Array of exceptions found
    punch_list_items JSONB[], -- Array of {item, priority, responsible, due_date, status}
    ready_for_energization BOOLEAN DEFAULT false,
    energization_approval_by UUID REFERENCES auth.users(id),
    energization_approval_date DATE,
    documents JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Non-conformance reports (NCR)
CREATE TABLE non_conformance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ncr_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    identified_by UUID REFERENCES auth.users(id),
    location_id UUID REFERENCES project_areas(id),
    equipment_id UUID REFERENCES substation_equipment(id),
    structure_id UUID REFERENCES transmission_structures(id),
    category TEXT CHECK (category IN (
        'materials', 'workmanship', 'documentation', 'safety', 
        'environmental', 'design', 'procedure'
    )),
    severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
    description TEXT NOT NULL,
    specification_reference TEXT,
    root_cause TEXT,
    immediate_action TEXT,
    corrective_action_plan TEXT,
    preventive_action TEXT,
    responsible_party UUID REFERENCES auth.users(id),
    target_close_date DATE,
    actual_close_date DATE,
    verified_by UUID REFERENCES auth.users(id),
    verification_date DATE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'void')),
    cost_impact DECIMAL(10, 2),
    schedule_impact_days INTEGER,
    customer_notification_required BOOLEAN DEFAULT false,
    customer_notified_date DATE,
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, ncr_number)
);

-- Ground grid testing
CREATE TABLE ground_grid_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    test_location TEXT NOT NULL,
    test_date DATE NOT NULL,
    test_type TEXT CHECK (test_type IN (
        'fall_of_potential', 'wenner_method', 'soil_resistivity', 
        'continuity', 'step_potential', 'touch_potential'
    )),
    performed_by UUID REFERENCES auth.users(id),
    witnessed_by UUID REFERENCES auth.users(id),
    weather_conditions TEXT,
    soil_moisture TEXT,
    test_equipment JSONB,
    electrode_spacing_ft DECIMAL(6, 2),
    injection_current_a DECIMAL(10, 3),
    measured_resistance_ohms DECIMAL(10, 3),
    calculated_resistivity_ohm_m DECIMAL(10, 3),
    design_value_ohms DECIMAL(10, 3),
    acceptance_criteria TEXT,
    test_result TEXT CHECK (test_result IN ('pass', 'fail', 'retest')),
    grid_potential_rise_v DECIMAL(10, 2),
    step_voltage_v DECIMAL(10, 2),
    touch_voltage_v DECIMAL(10, 2),
    test_points JSONB[], -- Array of test point measurements
    recommendations TEXT,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_qaqc_inspections_project_date ON qaqc_inspections(project_id, inspection_date);
CREATE INDEX idx_qaqc_inspections_type ON qaqc_inspections(inspection_type);
CREATE INDEX idx_test_reports_project_date ON test_reports(project_id, test_date);
CREATE INDEX idx_test_reports_type ON test_reports(test_type);
CREATE INDEX idx_test_reports_equipment ON test_reports(equipment_id);
CREATE INDEX idx_relay_settings_equipment ON relay_settings(equipment_id);
CREATE INDEX idx_torque_records_project ON torque_records(project_id);
CREATE INDEX idx_weld_inspections_project ON weld_inspections(project_id);
CREATE INDEX idx_foundation_inspections_structure ON foundation_inspections(structure_id);
CREATE INDEX idx_commissioning_equipment ON commissioning_checklists(equipment_id);
CREATE INDEX idx_ncr_project_status ON non_conformance_reports(project_id, status);
CREATE INDEX idx_ground_grid_project ON ground_grid_tests(project_id);

-- Enable RLS
ALTER TABLE qaqc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE torque_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weld_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE foundation_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissioning_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ground_grid_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY qaqc_project_access ON qaqc_inspections FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY test_project_access ON test_reports FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY relay_project_access ON relay_settings FOR ALL TO authenticated
    USING (equipment_id IN (
        SELECT id FROM substation_equipment 
        WHERE project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
    ));

CREATE POLICY torque_project_access ON torque_records FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY weld_project_access ON weld_inspections FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY foundation_project_access ON foundation_inspections FOR ALL TO authenticated
    USING (structure_id IN (
        SELECT id FROM transmission_structures 
        WHERE project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
    ));

CREATE POLICY commissioning_project_access ON commissioning_checklists FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY ncr_project_access ON non_conformance_reports FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY ground_grid_project_access ON ground_grid_tests FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
