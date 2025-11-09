-- Scheduling, Daily Reporting and Crew Management Tables for FieldForge T&D/Substation Platform
-- Migration: 005_scheduling_crew_tables.sql

-- Crew members and certifications
CREATE TABLE crew_members (
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
    classification TEXT, -- 'journeyman', 'apprentice_1', 'apprentice_2', etc.
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

-- Crew certifications and qualifications
CREATE TABLE crew_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    certification_type TEXT CHECK (certification_type IN (
        'osha_10', 'osha_30', 'first_aid', 'cpr', 'qualified_electrical_worker',
        'cdl_a', 'cdl_b', 'crane_operator', 'aerial_lift', 'forklift',
        'confined_space', 'fall_protection', 'arc_flash', 'live_line',
        'welder_certified', 'rigger_qualified', 'signal_person', 'competent_person',
        'rubber_glove', 'bucket_rescue', 'pole_top_rescue', 'flagger'
    )),
    certification_number TEXT,
    issuing_authority TEXT,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verification_date DATE,
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drug and alcohol testing records
CREATE TABLE drug_test_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    test_type TEXT CHECK (test_type IN (
        'pre_employment', 'random', 'post_accident', 
        'reasonable_suspicion', 'return_to_duty', 'follow_up'
    )),
    test_date DATE NOT NULL,
    test_provider TEXT,
    specimen_id TEXT,
    test_result TEXT CHECK (test_result IN ('negative', 'positive', 'pending', 'invalid')),
    substances_tested TEXT[],
    mro_review BOOLEAN DEFAULT false,
    mro_name TEXT,
    cleared_for_duty BOOLEAN,
    next_test_due DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training records
CREATE TABLE training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    training_type TEXT NOT NULL,
    training_provider TEXT,
    instructor_name TEXT,
    training_date DATE NOT NULL,
    duration_hours DECIMAL(5, 2),
    location TEXT,
    score DECIMAL(5, 2),
    passed BOOLEAN DEFAULT true,
    certificate_number TEXT,
    expiry_date DATE,
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crew assignments
CREATE TABLE crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    crew_name TEXT,
    role TEXT, -- 'foreman', 'lead', 'member'
    shift TEXT CHECK (shift IN ('day', 'night', 'swing')),
    start_time TIME,
    end_time TIME,
    location_id UUID REFERENCES project_areas(id),
    work_order TEXT,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Master schedule activities
CREATE TABLE schedule_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    activity_type TEXT CHECK (activity_type IN (
        'milestone', 'construction', 'testing', 'commissioning',
        'outage', 'delivery', 'inspection', 'permitting'
    )),
    wbs_code TEXT, -- Work Breakdown Structure code
    cost_code_id UUID REFERENCES cost_codes(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    percent_complete DECIMAL(5, 2) DEFAULT 0,
    budgeted_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    remaining_hours DECIMAL(10, 2),
    predecessors TEXT[], -- Array of activity IDs
    successors TEXT[], -- Array of activity IDs
    lag_days INTEGER DEFAULT 0,
    constraint_type TEXT, -- 'ASAP', 'ALAP', 'Must Start On', 'Must Finish On'
    constraint_date DATE,
    resources_required JSONB[], -- Array of resource requirements
    crew_size INTEGER,
    equipment_required JSONB[],
    material_required JSONB[],
    outage_required BOOLEAN DEFAULT false,
    weather_sensitive BOOLEAN DEFAULT false,
    critical_path BOOLEAN DEFAULT false,
    float_days INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, activity_id)
);

-- Three-week lookahead schedule
CREATE TABLE three_week_lookahead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    week_ending DATE NOT NULL,
    prepared_by UUID REFERENCES auth.users(id),
    prepared_date DATE,
    approved_by UUID REFERENCES auth.users(id),
    activities JSONB[], -- Array of planned activities with details
    constraints JSONB[], -- Array of constraints to resolve
    material_needs JSONB[], -- Materials needed in next 3 weeks
    equipment_needs JSONB[], -- Equipment needed in next 3 weeks
    crew_needs JSONB[], -- Crew requirements
    outage_windows JSONB[], -- Scheduled outages
    weather_contingencies TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, week_ending)
);

-- Plan of Day (POD) / Daily work plans
CREATE TABLE daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    shift TEXT CHECK (shift IN ('day', 'night', 'swing')) DEFAULT 'day',
    prepared_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    weather_forecast JSONB,
    safety_topic TEXT,
    safety_concerns TEXT[],
    work_items JSONB[], -- Array of {activity_id, location, crew, scope, target_quantity}
    crew_assignments JSONB[], -- Array of {crew_member_id, role, location, task}
    equipment_assignments JSONB[], -- Array of {equipment_id, location, operator}
    material_staging JSONB[], -- Array of materials to be staged
    outage_windows JSONB[], -- Array of outage times and affected circuits
    special_instructions TEXT,
    permits_required TEXT[],
    notifications_sent JSONB[], -- Utility and customer notifications
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, plan_date, shift)
);

-- Daily reports / production tracking
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    shift TEXT CHECK (shift IN ('day', 'night', 'swing')) DEFAULT 'day',
    foreman_id UUID REFERENCES auth.users(id),
    superintendent_id UUID REFERENCES auth.users(id),
    -- Weather conditions
    weather_am TEXT,
    weather_pm TEXT,
    temp_high_f DECIMAL(5, 2),
    temp_low_f DECIMAL(5, 2),
    wind_speed_mph INTEGER,
    precipitation_inches DECIMAL(5, 2),
    weather_delay_hours DECIMAL(5, 2),
    -- Production data
    work_completed JSONB[], -- Array of {activity_id, quantity, unit, location}
    structures_set INTEGER,
    poles_set INTEGER,
    foundations_poured INTEGER,
    conductor_strung_ft DECIMAL(10, 2),
    cable_pulled_ft DECIMAL(10, 2),
    equipment_installed JSONB[],
    -- Crew information
    crew_count INTEGER,
    crew_hours DECIMAL(10, 2),
    overtime_hours DECIMAL(10, 2),
    crew_members JSONB[], -- Array of {crew_member_id, hours, overtime}
    visitors JSONB[], -- Array of visitor details
    -- Equipment utilization
    equipment_used JSONB[], -- Array of {equipment_id, hours, operator}
    equipment_issues JSONB[], -- Array of equipment problems
    -- Materials
    materials_received JSONB[],
    materials_installed JSONB[],
    materials_returned JSONB[],
    -- Safety
    safety_briefing_held BOOLEAN DEFAULT true,
    safety_topics_covered TEXT[],
    safety_observations INTEGER DEFAULT 0,
    near_misses INTEGER DEFAULT 0,
    first_aid_cases INTEGER DEFAULT 0,
    recordable_incidents INTEGER DEFAULT 0,
    stop_work_events INTEGER DEFAULT 0,
    -- Delays and issues
    delays JSONB[], -- Array of {cause, duration_hours, description}
    rework_required JSONB[],
    change_orders_identified JSONB[],
    -- Quality
    inspections_completed JSONB[],
    tests_performed JSONB[],
    ncrs_issued TEXT[],
    -- General notes
    accomplishments TEXT,
    issues_concerns TEXT,
    next_shift_priorities TEXT,
    photos JSONB[],
    -- Submission
    submitted_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, report_date, shift)
);

-- Time entries
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    cost_code_id UUID REFERENCES cost_codes(id),
    regular_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    double_time_hours DECIMAL(5, 2) DEFAULT 0,
    per_diem BOOLEAN DEFAULT false,
    work_description TEXT,
    foreman_approved BOOLEAN DEFAULT false,
    foreman_id UUID REFERENCES auth.users(id),
    approved_date TIMESTAMPTZ,
    payroll_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment time tracking
CREATE TABLE equipment_time (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    equipment_id TEXT NOT NULL,
    equipment_type TEXT,
    work_date DATE NOT NULL,
    operator_id UUID REFERENCES crew_members(id),
    hours_operated DECIMAL(5, 2),
    idle_hours DECIMAL(5, 2),
    down_hours DECIMAL(5, 2),
    meter_reading_start DECIMAL(10, 2),
    meter_reading_end DECIMAL(10, 2),
    fuel_gallons DECIMAL(8, 2),
    cost_code_id UUID REFERENCES cost_codes(id),
    location_id UUID REFERENCES project_areas(id),
    work_performed TEXT,
    maintenance_performed TEXT,
    issues_noted TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_crew_members_company ON crew_members(company_id);
CREATE INDEX idx_crew_members_active ON crew_members(is_active);
CREATE INDEX idx_crew_certifications_member ON crew_certifications(crew_member_id);
CREATE INDEX idx_crew_certifications_type ON crew_certifications(certification_type);
CREATE INDEX idx_crew_certifications_expiry ON crew_certifications(expiry_date);
CREATE INDEX idx_drug_tests_member ON drug_test_records(crew_member_id);
CREATE INDEX idx_training_member ON training_records(crew_member_id);
CREATE INDEX idx_crew_assignments_project_date ON crew_assignments(project_id, assignment_date);
CREATE INDEX idx_crew_assignments_member ON crew_assignments(crew_member_id);
CREATE INDEX idx_schedule_activities_project ON schedule_activities(project_id);
CREATE INDEX idx_schedule_activities_dates ON schedule_activities(start_date, end_date);
CREATE INDEX idx_three_week_project_date ON three_week_lookahead(project_id, week_ending);
CREATE INDEX idx_daily_plans_project_date ON daily_plans(project_id, plan_date);
CREATE INDEX idx_daily_reports_project_date ON daily_reports(project_id, report_date);
CREATE INDEX idx_time_entries_project_date ON time_entries(project_id, work_date);
CREATE INDEX idx_time_entries_member ON time_entries(crew_member_id);
CREATE INDEX idx_equipment_time_project_date ON equipment_time(project_id, work_date);

-- Enable RLS
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE three_week_lookahead ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_time ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Crew members visible to users in same company or on same projects
CREATE POLICY crew_members_access ON crew_members FOR ALL TO authenticated
    USING (
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) OR
        id IN (SELECT crew_member_id FROM crew_assignments WHERE 
            project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()))
    );

CREATE POLICY crew_certifications_access ON crew_certifications FOR ALL TO authenticated
    USING (
        crew_member_id IN (
            SELECT id FROM crew_members WHERE 
            company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) OR
            id IN (SELECT crew_member_id FROM crew_assignments WHERE 
                project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()))
        )
    );

-- Limited access to drug test records (HR and Safety only)
CREATE POLICY drug_test_limited_access ON drug_test_records FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_team 
            WHERE user_id = auth.uid() 
            AND role IN ('safety_manager', 'hr_manager', 'project_manager')
        )
    );

CREATE POLICY training_records_access ON training_records FOR ALL TO authenticated
    USING (
        crew_member_id IN (
            SELECT id FROM crew_members WHERE 
            company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) OR
            id IN (SELECT crew_member_id FROM crew_assignments WHERE 
                project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()))
        )
    );

CREATE POLICY crew_assignments_access ON crew_assignments FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY schedule_activities_access ON schedule_activities FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY three_week_access ON three_week_lookahead FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY daily_plans_access ON daily_plans FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY daily_reports_access ON daily_reports FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY time_entries_access ON time_entries FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY equipment_time_access ON equipment_time FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
