-- Equipment and Material Management Tables for FieldForge T&D/Substation Platform
-- Migration: 003_equipment_material_tables.sql

-- Substation equipment tracking
CREATE TABLE substation_equipment (
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
    voltage_rating TEXT, -- e.g., '138kV'
    current_rating TEXT, -- e.g., '2000A'
    interrupting_rating TEXT, -- For breakers
    power_rating TEXT, -- For transformers (MVA)
    bil_rating TEXT, -- Basic Insulation Level
    weight_kg DECIMAL(10, 2),
    dimensions JSONB, -- {length, width, height, units}
    delivery_date DATE,
    installation_date DATE,
    energization_date DATE,
    warranty_expiration DATE,
    nameplate_data JSONB,
    installation_drawings TEXT[],
    test_reports JSONB[],
    commissioning_status TEXT DEFAULT 'pending',
    location_gps JSONB, -- {lat, lon}
    qr_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, equipment_tag)
);

-- Transformer specific data
CREATE TABLE transformer_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES substation_equipment(id) ON DELETE CASCADE,
    winding_configuration TEXT, -- 'delta-wye', 'wye-wye', etc.
    vector_group TEXT, -- 'Dyn11', etc.
    tap_changer_type TEXT, -- 'OLTC', 'NLTC', 'None'
    tap_positions INTEGER,
    current_tap_position INTEGER,
    impedance_percent DECIMAL(5, 2),
    no_load_losses_kw DECIMAL(10, 2),
    load_losses_kw DECIMAL(10, 2),
    oil_type TEXT,
    oil_volume_gallons DECIMAL(10, 2),
    cooling_type TEXT, -- 'ONAN', 'ONAF', 'OFAF', etc.
    gas_pressure_psi DECIMAL(6, 2),
    last_oil_test_date DATE,
    dga_results JSONB[], -- Dissolved Gas Analysis
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Circuit breaker specific data
CREATE TABLE circuit_breaker_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES substation_equipment(id) ON DELETE CASCADE,
    breaker_type TEXT, -- 'SF6', 'Oil', 'Vacuum', 'Air'
    mechanism_type TEXT, -- 'Spring', 'Hydraulic', 'Pneumatic'
    sf6_pressure_psi DECIMAL(6, 2),
    sf6_alarm_pressure DECIMAL(6, 2),
    sf6_lockout_pressure DECIMAL(6, 2),
    operation_counter INTEGER DEFAULT 0,
    trip_coil_1_resistance DECIMAL(10, 3),
    trip_coil_2_resistance DECIMAL(10, 3),
    close_coil_resistance DECIMAL(10, 3),
    timing_test_results JSONB[], -- Contact timing tests
    travel_curve JSONB,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transmission structures/poles
CREATE TABLE transmission_structures (
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
    phases_configuration TEXT, -- 'vertical', 'horizontal', 'delta'
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
CREATE TABLE conductors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    conductor_id TEXT NOT NULL,
    phase TEXT CHECK (phase IN ('A', 'B', 'C', 'N', 'S1', 'S2')), -- S for shield wire
    conductor_type TEXT, -- 'ACSR', 'ACSS', 'AAC', 'AAAC', 'OPGW'
    conductor_size TEXT, -- '795 Drake', '1033.5 Curlew', etc.
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
    splices JSONB[], -- Array of splice locations and types
    vibration_dampers_installed INTEGER DEFAULT 0,
    spacers_installed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, conductor_id)
);

-- Cable tracking (for underground/substation)
CREATE TABLE cables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    cable_id TEXT NOT NULL,
    cable_type TEXT, -- 'XLPE', 'PILC', 'EPR', 'Control', 'Fiber'
    voltage_rating TEXT,
    conductor_size TEXT,
    conductor_material TEXT, -- 'Copper', 'Aluminum'
    insulation_type TEXT,
    shield_type TEXT,
    jacket_type TEXT,
    manufacturer TEXT,
    reel_number TEXT,
    reel_length_ft DECIMAL(10, 2),
    from_equipment TEXT,
    to_equipment TEXT,
    routing_path TEXT,
    installed_length_ft DECIMAL(10, 2),
    pulling_tension_lbs DECIMAL(10, 2),
    sidewall_pressure_psi DECIMAL(10, 2),
    bend_radius_ft DECIMAL(6, 2),
    installation_date DATE,
    termination_type TEXT,
    termination_date DATE,
    hipot_test_kv DECIMAL(6, 2),
    hipot_test_date DATE,
    hipot_test_passed BOOLEAN,
    vlf_test_results JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, cable_id)
);

-- Material inventory and tracking
CREATE TABLE material_inventory (
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

-- Material deliveries
CREATE TABLE material_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    delivery_ticket TEXT NOT NULL,
    delivery_date TIMESTAMPTZ NOT NULL,
    supplier_id UUID REFERENCES companies(id),
    purchase_order TEXT,
    packing_list TEXT,
    received_by UUID REFERENCES auth.users(id),
    storage_location TEXT,
    items JSONB[], -- Array of {material_code, quantity, unit_cost, condition}
    inspection_status TEXT DEFAULT 'pending',
    inspection_notes TEXT,
    photos JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Material transfers between locations
CREATE TABLE material_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    transfer_number TEXT NOT NULL,
    transfer_date TIMESTAMPTZ NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    transferred_by UUID REFERENCES auth.users(id),
    received_by UUID REFERENCES auth.users(id),
    items JSONB[], -- Array of {material_code, quantity}
    transport_method TEXT,
    vehicle_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, transfer_number)
);

-- Material requisitions
CREATE TABLE material_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    requisition_number TEXT NOT NULL,
    requested_date DATE NOT NULL,
    requested_by UUID REFERENCES auth.users(id),
    needed_date DATE,
    work_order TEXT,
    cost_code_id UUID REFERENCES cost_codes(id),
    items JSONB[], -- Array of {material_code, quantity_requested, quantity_issued}
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete', 'cancelled')),
    approved_by UUID REFERENCES auth.users(id),
    approved_date DATE,
    issued_by UUID REFERENCES auth.users(id),
    issued_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, requisition_number)
);

-- Create indexes
CREATE INDEX idx_substation_equipment_project ON substation_equipment(project_id);
CREATE INDEX idx_substation_equipment_type ON substation_equipment(equipment_type);
CREATE INDEX idx_transmission_structures_project ON transmission_structures(project_id);
CREATE INDEX idx_transmission_structures_number ON transmission_structures(structure_number);
CREATE INDEX idx_conductors_project ON conductors(project_id);
CREATE INDEX idx_conductors_structures ON conductors(from_structure_id, to_structure_id);
CREATE INDEX idx_cables_project ON cables(project_id);
CREATE INDEX idx_material_inventory_project ON material_inventory(project_id);
CREATE INDEX idx_material_inventory_code ON material_inventory(material_code);
CREATE INDEX idx_material_deliveries_project_date ON material_deliveries(project_id, delivery_date);
CREATE INDEX idx_material_transfers_project ON material_transfers(project_id);
CREATE INDEX idx_material_requisitions_project_status ON material_requisitions(project_id, status);

-- Enable RLS
ALTER TABLE substation_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_breaker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cables ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requisitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY equipment_project_access ON substation_equipment FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY transformer_project_access ON transformer_data FOR ALL TO authenticated
    USING (equipment_id IN (
        SELECT id FROM substation_equipment 
        WHERE project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
    ));

CREATE POLICY breaker_project_access ON circuit_breaker_data FOR ALL TO authenticated
    USING (equipment_id IN (
        SELECT id FROM substation_equipment 
        WHERE project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
    ));

CREATE POLICY structures_project_access ON transmission_structures FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY conductors_project_access ON conductors FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY cables_project_access ON cables FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY inventory_project_access ON material_inventory FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY deliveries_project_access ON material_deliveries FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY transfers_project_access ON material_transfers FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY requisitions_project_access ON material_requisitions FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
