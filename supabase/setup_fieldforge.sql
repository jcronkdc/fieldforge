-- FieldForge Complete Database Setup for Supabase
-- T&D/Substation Construction Management Platform
-- Run this script in Supabase SQL Editor to create all tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE COMPANY AND PROJECT TABLES
-- ============================================

-- Companies table (utilities, contractors, subs)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('utility', 'contractor', 'subcontractor', 'supplier', 'engineering')),
    ein TEXT,
    duns_number TEXT,
    cage_code TEXT,
    primary_contact JSONB,
    address JSONB,
    phone TEXT,
    email TEXT,
    website TEXT,
    prequalifications JSONB[],
    insurance_certificates JSONB[],
    bonding_capacity DECIMAL(15, 2),
    safety_rating JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    project_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT CHECK (project_type IN ('transmission', 'distribution', 'substation', 'mixed')),
    voltage_class TEXT,
    contract_type TEXT CHECK (contract_type IN ('lump_sum', 'unit_price', 'time_materials', 'cost_plus')),
    utility_owner UUID REFERENCES companies(id),
    epc_contractor UUID REFERENCES companies(id),
    contract_value DECIMAL(15, 2),
    contingency DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    substantial_completion_date DATE,
    final_completion_date DATE,
    status TEXT DEFAULT 'planning',
    location JSONB,
    weather_station_id TEXT,
    time_zone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project team members
CREATE TABLE IF NOT EXISTS project_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL,
    company_id UUID REFERENCES companies(id),
    start_date DATE,
    end_date DATE,
    permissions JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- User profiles extension for construction
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    employee_id TEXT,
    company_id UUID REFERENCES companies(id),
    job_title TEXT,
    department TEXT,
    supervisor_id UUID REFERENCES user_profiles(id),
    emergency_contact JSONB,
    photo_url TEXT,
    signature_url TEXT,
    preferences JSONB DEFAULT '{}',
    -- Authentication and authorization columns
    role TEXT DEFAULT 'user' NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    address TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    -- Login tracking columns
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Project locations/areas
CREATE TABLE IF NOT EXISTS project_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    area_code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    area_type TEXT CHECK (area_type IN ('substation', 'line_segment', 'staging_area', 'laydown_yard', 'office')),
    location JSONB,
    parent_area_id UUID REFERENCES project_areas(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, area_code)
);

-- Cost codes for tracking
CREATE TABLE IF NOT EXISTS cost_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit_of_measure TEXT,
    budgeted_quantity DECIMAL(15, 3),
    budgeted_unit_cost DECIMAL(15, 2),
    parent_code_id UUID REFERENCES cost_codes(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, code)
);

-- ============================================
-- SAFETY AND COMPLIANCE TABLES
-- ============================================

-- Safety briefings/tailboards
CREATE TABLE IF NOT EXISTS safety_briefings (
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
    attendees JSONB[],
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Job Safety Analysis (JSA)
CREATE TABLE IF NOT EXISTS job_safety_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    jsa_number TEXT NOT NULL,
    title TEXT NOT NULL,
    work_location TEXT,
    date_prepared DATE,
    prepared_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    job_steps JSONB[],
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
CREATE TABLE IF NOT EXISTS switching_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    request_date TIMESTAMPTZ NOT NULL,
    requested_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    switching_authority TEXT,
    affected_circuits TEXT[],
    isolation_points JSONB[],
    grounds_required JSONB[],
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
CREATE TABLE IF NOT EXISTS arc_flash_boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    equipment_id TEXT NOT NULL,
    equipment_name TEXT,
    location TEXT,
    voltage_level TEXT,
    available_fault_current DECIMAL(10, 2),
    clearing_time DECIMAL(10, 4),
    incident_energy DECIMAL(10, 2),
    arc_flash_boundary DECIMAL(10, 2),
    limited_approach DECIMAL(10, 2),
    restricted_approach DECIMAL(10, 2),
    prohibited_approach DECIMAL(10, 2),
    working_distance DECIMAL(10, 2),
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

-- ============================================
-- EQUIPMENT AND MATERIAL TABLES
-- ============================================

-- Substation equipment tracking
CREATE TABLE IF NOT EXISTS substation_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    area_id UUID REFERENCES project_areas(id),
    equipment_tag TEXT NOT NULL,
    equipment_type TEXT CHECK (equipment_type IN (
        'transformer', 'circuit_breaker', 'disconnect_switch', 'current_transformer',
        'potential_transformer', 'surge_arrester', 'capacitor_bank', 'reactor',
        'relay', 'meter', 'battery_bank', 'battery_charger', 'control_panel',
        'rtu', 'hvac', 'fire_suppression', 'bus', 'insulator', 'cable'
    )),
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    year_manufactured INTEGER,
    voltage_rating TEXT,
    current_rating TEXT,
    interrupting_rating TEXT,
    power_rating TEXT,
    bil_rating TEXT,
    weight_kg DECIMAL(10, 2),
    dimensions JSONB,
    delivery_date DATE,
    installation_date DATE,
    energization_date DATE,
    warranty_expiration DATE,
    nameplate_data JSONB,
    installation_drawings TEXT[],
    test_reports JSONB[],
    commissioning_status TEXT DEFAULT 'pending',
    location_gps JSONB,
    qr_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, equipment_tag)
);

-- Transmission structures/poles
CREATE TABLE IF NOT EXISTS transmission_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    structure_number TEXT NOT NULL,
    structure_type TEXT CHECK (structure_type IN (
        'lattice_tower', 'monopole', 'h_frame', 'a_frame', 
        'guyed_v', 'wood_pole', 'concrete_pole', 'steel_pole'
    )),
    line_name TEXT,
    mile_point DECIMAL(10, 3),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    elevation_ft DECIMAL(10, 2),
    height_ft DECIMAL(6, 2),
    foundation_type TEXT,
    foundation_complete_date DATE,
    erection_date DATE,
    manufacturer TEXT,
    design_wind_speed_mph INTEGER,
    design_ice_thickness_in DECIMAL(4, 2),
    phases_configuration TEXT,
    shield_wire_count INTEGER DEFAULT 0,
    insulator_type TEXT,
    insulator_count_per_phase INTEGER,
    hardware_type TEXT,
    grounding_installed BOOLEAN DEFAULT false,
    bird_guards_installed BOOLEAN DEFAULT false,
    marker_balls_installed BOOLEAN DEFAULT false,
    aviation_lighting BOOLEAN DEFAULT false,
    climbing_pegs BOOLEAN DEFAULT false,
    anti_climb_installed BOOLEAN DEFAULT false,
    inspection_date DATE,
    photos JSONB[],
    as_built_drawings TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, structure_number)
);

-- Conductor and cable tracking
CREATE TABLE IF NOT EXISTS conductors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    conductor_id TEXT NOT NULL,
    phase TEXT CHECK (phase IN ('A', 'B', 'C', 'N', 'S1', 'S2')),
    conductor_type TEXT,
    conductor_size TEXT,
    reel_number TEXT,
    reel_length_ft DECIMAL(10, 2),
    manufacturer TEXT,
    manufacture_date DATE,
    from_structure_id UUID REFERENCES transmission_structures(id),
    to_structure_id UUID REFERENCES transmission_structures(id),
    installed_length_ft DECIMAL(10, 2),
    pulling_tension_lbs DECIMAL(10, 2),
    sagging_tension_lbs DECIMAL(10, 2),
    sag_at_install_ft DECIMAL(6, 2),
    temperature_at_install_f DECIMAL(5, 2),
    stringing_date DATE,
    sagging_date DATE,
    clipping_date DATE,
    splices JSONB[],
    vibration_dampers_installed INTEGER DEFAULT 0,
    spacers_installed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, conductor_id)
);

-- Material inventory
CREATE TABLE IF NOT EXISTS material_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    material_code TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    manufacturer TEXT,
    model_number TEXT,
    unit_of_measure TEXT,
    quantity_ordered DECIMAL(15, 3),
    quantity_received DECIMAL(15, 3),
    quantity_installed DECIMAL(15, 3),
    quantity_damaged DECIMAL(15, 3),
    quantity_returned DECIMAL(15, 3),
    unit_cost DECIMAL(10, 2),
    storage_location TEXT,
    min_stock_level DECIMAL(10, 3),
    lead_time_days INTEGER,
    supplier_id UUID REFERENCES companies(id),
    purchase_order TEXT,
    packing_list TEXT,
    qr_code TEXT,
    hazmat BOOLEAN DEFAULT false,
    msds_url TEXT,
    shelf_life_days INTEGER,
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, material_code)
);

-- ============================================
-- QAQC AND TESTING TABLES
-- ============================================

-- QAQC Inspections
CREATE TABLE IF NOT EXISTS qaqc_inspections (
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
    checklist_items JSONB[],
    deficiencies JSONB[],
    measurements JSONB[],
    overall_status TEXT CHECK (overall_status IN ('passed', 'failed', 'conditional', 'pending')),
    photos JSONB[],
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
CREATE TABLE IF NOT EXISTS test_reports (
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
    test_date DATE NOT NULL,
    test_standard TEXT,
    performed_by UUID REFERENCES auth.users(id),
    testing_company UUID REFERENCES companies(id),
    witnessed_by UUID REFERENCES auth.users(id),
    temperature_f DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    test_equipment JSONB[],
    test_procedure TEXT,
    test_data JSONB,
    acceptance_criteria JSONB,
    test_result TEXT CHECK (test_result IN ('pass', 'fail', 'marginal', 'na')),
    deviations TEXT,
    recommendations TEXT,
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, test_number)
);

-- Non-conformance reports (NCR)
CREATE TABLE IF NOT EXISTS non_conformance_reports (
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

-- ============================================
-- SCHEDULING AND CREW TABLES
-- ============================================

-- Crew members
CREATE TABLE IF NOT EXISTS crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES companies(id),
    employee_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT,
    job_title TEXT,
    craft TEXT CHECK (craft IN (
        'electrician', 'lineman', 'groundman', 'operator', 'foreman',
        'superintendent', 'engineer', 'inspector', 'safety', 'welder',
        'equipment_operator', 'truck_driver', 'laborer', 'apprentice'
    )),
    classification TEXT,
    union_local TEXT,
    hire_date DATE,
    birth_date DATE,
    phone_primary TEXT,
    phone_secondary TEXT,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    home_address JSONB,
    blood_type TEXT,
    medical_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    primary_language TEXT DEFAULT 'English',
    languages_spoken TEXT[],
    shirt_size TEXT,
    pant_size TEXT,
    boot_size TEXT,
    hard_hat_size TEXT,
    glove_size TEXT,
    fall_protection_size TEXT,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily reports / production tracking
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    shift TEXT CHECK (shift IN ('day', 'night', 'swing')) DEFAULT 'day',
    foreman_id UUID REFERENCES auth.users(id),
    superintendent_id UUID REFERENCES auth.users(id),
    weather_am TEXT,
    weather_pm TEXT,
    temp_high_f DECIMAL(5, 2),
    temp_low_f DECIMAL(5, 2),
    wind_speed_mph INTEGER,
    precipitation_inches DECIMAL(5, 2),
    weather_delay_hours DECIMAL(5, 2),
    work_completed JSONB[],
    structures_set INTEGER,
    poles_set INTEGER,
    foundations_poured INTEGER,
    conductor_strung_ft DECIMAL(10, 2),
    cable_pulled_ft DECIMAL(10, 2),
    equipment_installed JSONB[],
    crew_count INTEGER,
    crew_hours DECIMAL(10, 2),
    overtime_hours DECIMAL(10, 2),
    crew_members JSONB[],
    visitors JSONB[],
    equipment_used JSONB[],
    equipment_issues JSONB[],
    materials_received JSONB[],
    materials_installed JSONB[],
    materials_returned JSONB[],
    safety_briefing_held BOOLEAN DEFAULT true,
    safety_topics_covered TEXT[],
    safety_observations INTEGER DEFAULT 0,
    near_misses INTEGER DEFAULT 0,
    first_aid_cases INTEGER DEFAULT 0,
    recordable_incidents INTEGER DEFAULT 0,
    stop_work_events INTEGER DEFAULT 0,
    delays JSONB[],
    rework_required JSONB[],
    change_orders_identified JSONB[],
    inspections_completed JSONB[],
    tests_performed JSONB[],
    ncrs_issued TEXT[],
    accomplishments TEXT,
    issues_concerns TEXT,
    next_shift_priorities TEXT,
    photos JSONB[],
    submitted_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, report_date, shift)
);

-- ============================================
-- RFI AND DOCUMENT MANAGEMENT TABLES
-- ============================================

-- Request for Information (RFI)
CREATE TABLE IF NOT EXISTS rfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    rfi_number TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'design', 'specification', 'material', 'construction_method',
        'schedule', 'safety', 'testing', 'commissioning', 'other'
    )),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT DEFAULT 'open' CHECK (status IN (
        'draft', 'open', 'in_review', 'responded', 'closed', 'void'
    )),
    question TEXT NOT NULL,
    background TEXT,
    suggested_solution TEXT,
    spec_section TEXT,
    drawing_references TEXT[],
    submitted_by UUID REFERENCES auth.users(id),
    submitted_date TIMESTAMPTZ,
    submitted_to UUID REFERENCES auth.users(id),
    company_from UUID REFERENCES companies(id),
    company_to UUID REFERENCES companies(id),
    response TEXT,
    response_by UUID REFERENCES auth.users(id),
    response_date TIMESTAMPTZ,
    response_reviewed_by UUID REFERENCES auth.users(id),
    cost_impact DECIMAL(10, 2),
    schedule_impact_days INTEGER,
    change_order_required BOOLEAN DEFAULT false,
    change_order_number TEXT,
    required_response_date DATE,
    days_outstanding INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN status IN ('open', 'in_review') AND submitted_date IS NOT NULL 
            THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - submitted_date))::INTEGER
            ELSE NULL
        END
    ) STORED,
    ball_in_court TEXT,
    question_attachments JSONB[],
    response_attachments JSONB[],
    workflow_history JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, rfi_number)
);

-- Submittals
CREATE TABLE IF NOT EXISTS submittals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    submittal_number TEXT NOT NULL,
    revision TEXT DEFAULT 'A',
    title TEXT NOT NULL,
    spec_section TEXT NOT NULL,
    spec_paragraph TEXT,
    submittal_type TEXT CHECK (submittal_type IN (
        'product_data', 'shop_drawing', 'sample', 'test_report',
        'certificate', 'manual', 'warranty', 'closeout'
    )),
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'submitted', 'in_review', 'approved', 
        'approved_as_noted', 'revise_resubmit', 'rejected', 'for_information'
    )),
    submitted_by UUID REFERENCES auth.users(id),
    submitted_date TIMESTAMPTZ,
    contractor_id UUID REFERENCES companies(id),
    supplier TEXT,
    manufacturer TEXT,
    product_model TEXT,
    reviewer_id UUID REFERENCES auth.users(id),
    review_date TIMESTAMPTZ,
    reviewer_comments TEXT,
    approval_stamps JSONB[],
    required_onsite_date DATE,
    lead_time_days INTEGER,
    required_approval_date DATE,
    actual_approval_date DATE,
    days_in_review INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN status = 'in_review' AND submitted_date IS NOT NULL 
            THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - submitted_date))::INTEGER
            ELSE NULL
        END
    ) STORED,
    is_resubmittal BOOLEAN DEFAULT false,
    previous_submittal_id UUID REFERENCES submittals(id),
    resubmittal_count INTEGER DEFAULT 0,
    distribution_list JSONB[],
    attachments JSONB[],
    marked_up_drawings JSONB[],
    workflow_history JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, submittal_number, revision)
);

-- ============================================
-- MESSAGING AND COMMUNICATION TABLES
-- ============================================

-- Message channels
CREATE TABLE IF NOT EXISTS message_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL,
    channel_type TEXT CHECK (channel_type IN (
        'general', 'safety', 'emergency', 'engineering', 'foreman',
        'inspection', 'commissioning', 'outage', 'weather', 'custom'
    )),
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    emergency_channel BOOLEAN DEFAULT false,
    allow_guests BOOLEAN DEFAULT false,
    mute_notifications BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 90,
    created_by UUID REFERENCES auth.users(id),
    admins UUID[],
    members UUID[],
    read_only_members UUID[],
    pinned_messages UUID[],
    pinned_documents UUID[],
    message_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, channel_name)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES message_channels(id) ON DELETE CASCADE,
    parent_message_id UUID REFERENCES messages(id),
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN (
        'text', 'alert', 'safety', 'weather', 'system', 'broadcast'
    )) DEFAULT 'text',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
    mentions UUID[],
    tags TEXT[],
    location_id UUID REFERENCES project_areas(id),
    gps_coords JSONB,
    related_equipment UUID[],
    related_structures UUID[],
    related_documents UUID[],
    attachments JSONB[],
    voice_memo_url TEXT,
    delivered_to UUID[],
    read_by JSONB[],
    reactions JSONB[],
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    edited_by UUID REFERENCES auth.users(id),
    edit_history JSONB[],
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id),
    requires_acknowledgment BOOLEAN DEFAULT false,
    acknowledgments JSONB[],
    sent_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Broadcast messages
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    broadcast_type TEXT CHECK (broadcast_type IN (
        'safety', 'weather', 'emergency', 'schedule', 'general'
    )),
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    target_all BOOLEAN DEFAULT true,
    target_companies UUID[],
    target_roles TEXT[],
    target_locations UUID[],
    target_users UUID[],
    send_immediately BOOLEAN DEFAULT true,
    scheduled_time TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ,
    delivery_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    acknowledgment_required BOOLEAN DEFAULT false,
    acknowledgments JSONB[],
    attachments JSONB[],
    action_required TEXT,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_user ON project_team(user_id);

-- Safety indexes
CREATE INDEX IF NOT EXISTS idx_safety_briefings_project_date ON safety_briefings(project_id, briefing_date);
CREATE INDEX IF NOT EXISTS idx_jsa_project ON job_safety_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_switching_orders_project_status ON switching_orders(project_id, status);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_substation_equipment_project ON substation_equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_transmission_structures_project ON transmission_structures(project_id);

-- QAQC indexes
CREATE INDEX IF NOT EXISTS idx_qaqc_inspections_project_date ON qaqc_inspections(project_id, inspection_date);
CREATE INDEX IF NOT EXISTS idx_test_reports_project_date ON test_reports(project_id, test_date);
CREATE INDEX IF NOT EXISTS idx_ncr_project_status ON non_conformance_reports(project_id, status);

-- Daily reports indexes
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_date ON daily_reports(project_id, report_date);

-- RFI indexes
CREATE INDEX IF NOT EXISTS idx_rfis_project_status ON rfis(project_id, status);
CREATE INDEX IF NOT EXISTS idx_submittals_project_status ON submittals(project_id, status);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_safety_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE switching_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_flash_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE substation_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE qaqc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Companies: Users can see companies they belong to or work with
CREATE POLICY companies_select ON companies FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
            UNION
            SELECT company_id FROM project_team WHERE user_id = auth.uid()
        )
    );

-- Projects: Users can see projects they're assigned to
CREATE POLICY projects_select ON projects FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT project_id FROM project_team WHERE user_id = auth.uid()
        )
    );

-- User profiles: Users can see profiles of people on their projects
CREATE POLICY user_profiles_select ON user_profiles FOR SELECT TO authenticated
    USING (
        id = auth.uid() OR
        id IN (
            SELECT user_id FROM project_team WHERE project_id IN (
                SELECT project_id FROM project_team WHERE user_id = auth.uid()
            )
        )
    );

-- User can update their own profile
CREATE POLICY user_profiles_update ON user_profiles FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Generic project-based access policy for most tables
CREATE POLICY safety_project_access ON safety_briefings FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY equipment_project_access ON substation_equipment FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY daily_reports_access ON daily_reports FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY rfis_project_access ON rfis FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- INITIAL DEMO DATA (Optional)
-- ============================================

-- Insert demo company
INSERT INTO companies (name, type, email, phone) 
VALUES ('Demo Electric Co', 'contractor', 'demo@fieldforge.com', '555-0100')
ON CONFLICT DO NOTHING;

-- Insert demo project
INSERT INTO projects (
    company_id,
    project_number,
    name,
    project_type,
    voltage_class,
    start_date,
    end_date,
    status
)
SELECT 
    id,
    'DEMO-001',
    'Demo 138kV Substation Upgrade',
    'substation',
    '138kV',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '6 months',
    'active'
FROM companies 
WHERE name = 'Demo Electric Co'
ON CONFLICT DO NOTHING;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'FieldForge database setup complete!';
    RAISE NOTICE 'All tables, indexes, and RLS policies have been created.';
    RAISE NOTICE 'Demo company and project have been added.';
END $$;
