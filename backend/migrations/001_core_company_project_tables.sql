-- Core Company and Project Tables for FieldForge T&D/Substation Platform
-- Migration: 001_core_company_project_tables.sql

-- Companies table (utilities, contractors, subs)
CREATE TABLE companies (
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
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    project_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT CHECK (project_type IN ('transmission', 'distribution', 'substation', 'mixed')),
    voltage_class TEXT, -- e.g., '69kV', '138kV', '345kV', '500kV', '765kV'
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
    location JSONB, -- GeoJSON for project boundaries
    weather_station_id TEXT,
    time_zone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project team members
CREATE TABLE project_team (
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
CREATE TABLE user_profiles (
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

-- Project locations/areas (for organizing work)
CREATE TABLE project_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    area_code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    area_type TEXT CHECK (area_type IN ('substation', 'line_segment', 'staging_area', 'laydown_yard', 'office')),
    location JSONB, -- GeoJSON
    parent_area_id UUID REFERENCES project_areas(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, area_code)
);

-- Cost codes for tracking
CREATE TABLE cost_codes (
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

-- Create indexes
CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_project_team_project ON project_team(project_id);
CREATE INDEX idx_project_team_user ON project_team(user_id);
CREATE INDEX idx_project_areas_project ON project_areas(project_id);
CREATE INDEX idx_cost_codes_project ON cost_codes(project_id);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;

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

-- Project team: Users can see team members on their projects
CREATE POLICY project_team_select ON project_team FOR SELECT TO authenticated
    USING (
        project_id IN (
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

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
