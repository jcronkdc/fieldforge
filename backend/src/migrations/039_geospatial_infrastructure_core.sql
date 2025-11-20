-- ============================================================================
-- GEOSPATIAL INFRASTRUCTURE CORE - PostGIS-Powered T&D Construction
-- ============================================================================
-- This migration creates spatial tables for transmission line routing,
-- substation layouts, survey data, and site infrastructure mapping.
-- Built on PostGIS (already enabled) for open-source GIS capabilities.
-- ============================================================================

-- Ensure PostGIS and extensions are enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================================
-- TRANSMISSION LINE INFRASTRUCTURE
-- ============================================================================

-- Transmission line routes (centerlines)
CREATE TABLE IF NOT EXISTS transmission_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID NOT NULL,
  
  -- Line identification
  line_name VARCHAR(255) NOT NULL,
  line_number VARCHAR(100),
  voltage_kv INTEGER NOT NULL, -- 69, 138, 230, 345, 500, 765
  circuit_count INTEGER DEFAULT 1,
  
  -- Spatial data (LineString for route)
  geometry GEOMETRY(LINESTRING, 4326) NOT NULL, -- WGS84
  geometry_local GEOMETRY(LINESTRING), -- Local projection (UTM, State Plane, etc)
  
  -- Technical specifications
  conductor_type VARCHAR(255),
  conductor_size VARCHAR(100),
  line_length_feet DECIMAL(12,2),
  line_length_miles DECIMAL(10,4),
  
  -- Status
  status VARCHAR(50) DEFAULT 'planned', -- planned, under_construction, energized, decommissioned
  design_standard VARCHAR(255),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Spatial index
  CONSTRAINT check_voltage CHECK (voltage_kv IN (69, 115, 138, 161, 230, 345, 500, 765))
);

CREATE INDEX idx_transmission_lines_geometry ON transmission_lines USING GIST(geometry);
CREATE INDEX idx_transmission_lines_geometry_local ON transmission_lines USING GIST(geometry_local);
CREATE INDEX idx_transmission_lines_project ON transmission_lines(project_id);
CREATE INDEX idx_transmission_lines_company ON transmission_lines(company_id);

-- ============================================================================
-- STRUCTURE/TOWER LOCATIONS
-- ============================================================================

-- Transmission structures (poles, towers, deadends)
CREATE TABLE IF NOT EXISTS transmission_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  line_id UUID REFERENCES transmission_lines(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  
  -- Structure identification
  structure_number VARCHAR(100) NOT NULL,
  structure_type VARCHAR(100) NOT NULL, -- tangent, angle, deadend, transposition, tap
  pole_type VARCHAR(100), -- wood, steel, concrete, lattice_tower
  
  -- Spatial location (Point)
  geometry GEOMETRY(POINT, 4326) NOT NULL, -- WGS84
  geometry_local GEOMETRY(POINT), -- Local projection
  elevation_feet DECIMAL(10,2),
  
  -- Technical specs
  height_feet DECIMAL(8,2),
  span_back_feet DECIMAL(10,2), -- Distance to previous structure
  span_ahead_feet DECIMAL(10,2), -- Distance to next structure
  line_angle_degrees DECIMAL(6,2),
  
  -- Foundation & installation
  foundation_type VARCHAR(100),
  foundation_depth_feet DECIMAL(6,2),
  installation_date DATE,
  
  -- Status & inspection
  status VARCHAR(50) DEFAULT 'planned',
  last_inspection_date DATE,
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
  
  -- Attachments
  photos TEXT[],
  documents TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transmission_structures_geometry ON transmission_structures USING GIST(geometry);
CREATE INDEX idx_transmission_structures_geometry_local ON transmission_structures USING GIST(geometry_local);
CREATE INDEX idx_transmission_structures_project ON transmission_structures(project_id);
CREATE INDEX idx_transmission_structures_line ON transmission_structures(line_id);

-- ============================================================================
-- SURVEY CONTROL POINTS
-- ============================================================================

-- Survey monuments and control points
CREATE TABLE IF NOT EXISTS survey_control_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID NOT NULL,
  
  -- Point identification
  point_id VARCHAR(100) NOT NULL,
  point_type VARCHAR(50) NOT NULL, -- monument, benchmark, control_point, temporary
  
  -- Spatial location
  geometry GEOMETRY(POINT, 4326) NOT NULL,
  geometry_local GEOMETRY(POINT),
  
  -- Survey coordinates (local grid)
  northing DECIMAL(15,6),
  easting DECIMAL(15,6),
  elevation DECIMAL(10,4),
  
  -- Coordinate system metadata
  horizontal_datum VARCHAR(100), -- NAD83, WGS84, etc
  vertical_datum VARCHAR(100), -- NAVD88, NGVD29, etc
  coordinate_system VARCHAR(255), -- UTM Zone 15N, State Plane TX North, etc
  epsg_code INTEGER, -- EPSG spatial reference code
  
  -- Survey metadata
  survey_date DATE,
  surveyor VARCHAR(255),
  survey_method VARCHAR(100), -- GPS, total_station, level
  accuracy_horizontal_ft DECIMAL(8,4),
  accuracy_vertical_ft DECIMAL(8,4),
  
  -- Monument description
  monument_type VARCHAR(100), -- brass_cap, iron_rod, concrete_monument
  monument_condition VARCHAR(50),
  
  -- Documentation
  description TEXT,
  photos TEXT[],
  survey_notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, point_id)
);

CREATE INDEX idx_survey_control_points_geometry ON survey_control_points USING GIST(geometry);
CREATE INDEX idx_survey_control_points_project ON survey_control_points(project_id);

-- ============================================================================
-- RIGHT-OF-WAY (ROW) BOUNDARIES
-- ============================================================================

-- Right-of-way corridors and easements
CREATE TABLE IF NOT EXISTS right_of_way_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  line_id UUID REFERENCES transmission_lines(id),
  company_id UUID NOT NULL,
  
  -- ROW identification
  row_name VARCHAR(255),
  row_number VARCHAR(100),
  
  -- Spatial boundary (Polygon or MultiPolygon)
  geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  geometry_local GEOMETRY(MULTIPOLYGON),
  
  -- ROW specifications
  row_width_feet DECIMAL(8,2),
  total_acres DECIMAL(12,4),
  
  -- Legal
  easement_type VARCHAR(100), -- permanent, temporary, fee_simple
  landowner VARCHAR(255),
  parcel_id VARCHAR(100),
  acquisition_status VARCHAR(50), -- pending, acquired, rejected
  acquisition_date DATE,
  
  -- Documentation
  legal_description TEXT,
  deed_reference VARCHAR(255),
  documents TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_row_boundaries_geometry ON right_of_way_boundaries USING GIST(geometry);
CREATE INDEX idx_row_boundaries_project ON right_of_way_boundaries(project_id);

-- ============================================================================
-- SITE BOUNDARIES & WORK AREAS
-- ============================================================================

-- Construction site boundaries, staging areas, access roads
CREATE TABLE IF NOT EXISTS site_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID NOT NULL,
  
  -- Site identification
  site_name VARCHAR(255) NOT NULL,
  site_type VARCHAR(100) NOT NULL, -- substation, staging_area, laydown_yard, access_road, work_zone
  
  -- Spatial boundary
  geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  geometry_local GEOMETRY(MULTIPOLYGON),
  area_acres DECIMAL(12,4),
  
  -- Site specifications
  access_type VARCHAR(100), -- public_road, private_road, new_access
  fencing_required BOOLEAN DEFAULT false,
  environmental_restrictions TEXT,
  
  -- Permits & approvals
  permit_status VARCHAR(50), -- pending, approved, active, closed
  permit_number VARCHAR(100),
  permit_expiry_date DATE,
  
  -- Documentation
  site_photos TEXT[],
  site_plan_documents TEXT[],
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_boundaries_geometry ON site_boundaries USING GIST(geometry);
CREATE INDEX idx_site_boundaries_project ON site_boundaries(project_id);
CREATE INDEX idx_site_boundaries_type ON site_boundaries(site_type);

-- ============================================================================
-- UNDERGROUND UTILITIES & OBSTRUCTIONS
-- ============================================================================

-- Underground utility crossings and existing infrastructure
CREATE TABLE IF NOT EXISTS underground_utilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID NOT NULL,
  
  -- Utility identification
  utility_type VARCHAR(100) NOT NULL, -- electric, gas, water, sewer, telecom, fiber
  utility_owner VARCHAR(255),
  utility_size VARCHAR(100),
  
  -- Spatial location (LineString for pipes/cables, Point for poles/markers)
  geometry GEOMETRY(GEOMETRY, 4326) NOT NULL, -- Can be Point, LineString, or Polygon
  geometry_local GEOMETRY(GEOMETRY),
  
  -- Depth information
  depth_feet DECIMAL(8,2),
  depth_verification_method VARCHAR(100), -- potholing, as_built, estimated
  
  -- Status
  status VARCHAR(50), -- existing, relocated, abandoned, new
  locate_date DATE,
  locate_ticket_number VARCHAR(100),
  
  -- Conflict management
  conflict_with_design BOOLEAN DEFAULT false,
  resolution_required BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  
  -- Documentation
  photos TEXT[],
  documents TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_underground_utilities_geometry ON underground_utilities USING GIST(geometry);
CREATE INDEX idx_underground_utilities_project ON underground_utilities(project_id);
CREATE INDEX idx_underground_utilities_type ON underground_utilities(utility_type);

-- ============================================================================
-- IMPORTED GIS LAYERS (from CAD, Shapefile, etc)
-- ============================================================================

-- Generic table for imported GIS data layers
CREATE TABLE IF NOT EXISTS imported_gis_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID NOT NULL,
  
  -- Layer identification
  layer_name VARCHAR(255) NOT NULL,
  layer_type VARCHAR(100), -- point, line, polygon, raster
  source_file VARCHAR(500),
  source_format VARCHAR(50), -- shapefile, dxf, dwg, geotiff, kml, geopackage
  
  -- Spatial data (flexible geometry type)
  geometry GEOMETRY(GEOMETRY, 4326),
  geometry_local GEOMETRY(GEOMETRY),
  
  -- Attribute data (store all imported attributes as JSONB)
  attributes JSONB,
  
  -- Coordinate system
  original_crs VARCHAR(255),
  original_epsg INTEGER,
  
  -- Import metadata
  import_date TIMESTAMPTZ DEFAULT NOW(),
  imported_by UUID REFERENCES auth.users(id),
  import_notes TEXT,
  
  -- Feature metadata (from original file)
  feature_id VARCHAR(255),
  feature_class VARCHAR(255),
  feature_style JSONB, -- Colors, line weights, etc from CAD
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_imported_gis_layers_geometry ON imported_gis_layers USING GIST(geometry);
CREATE INDEX idx_imported_gis_layers_project ON imported_gis_layers(project_id);
CREATE INDEX idx_imported_gis_layers_type ON imported_gis_layers(layer_type);
CREATE INDEX idx_imported_gis_layers_attributes ON imported_gis_layers USING GIN(attributes);

-- ============================================================================
-- COORDINATE SYSTEM DEFINITIONS
-- ============================================================================

-- Store project coordinate system preferences
CREATE TABLE IF NOT EXISTS project_coordinate_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Primary working coordinate system (local grid)
  working_crs_name VARCHAR(255) NOT NULL,
  working_crs_epsg INTEGER NOT NULL,
  working_crs_proj4 TEXT, -- PROJ.4 string for complex systems
  
  -- Vertical datum
  vertical_datum VARCHAR(100) DEFAULT 'NAVD88',
  
  -- Display preferences
  display_units VARCHAR(20) DEFAULT 'feet', -- feet, meters
  coordinate_format VARCHAR(50) DEFAULT 'northing_easting', -- northing_easting, lat_lon, x_y
  
  -- Transformation parameters (if custom local grid)
  false_northing DECIMAL(15,6),
  false_easting DECIMAL(15,6),
  scale_factor DECIMAL(12,10),
  central_meridian DECIMAL(10,6),
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SPATIAL ANALYSIS HELPERS
-- ============================================================================

-- Function to calculate structure spacing
CREATE OR REPLACE FUNCTION calculate_structure_spacing(p_line_id UUID)
RETURNS TABLE(
  structure_id UUID,
  structure_number VARCHAR,
  span_to_next DECIMAL,
  span_to_previous DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH ordered_structures AS (
    SELECT 
      id,
      structure_number,
      geometry,
      ROW_NUMBER() OVER (ORDER BY structure_number) as seq
    FROM transmission_structures
    WHERE line_id = p_line_id
    AND geometry IS NOT NULL
    ORDER BY structure_number
  )
  SELECT 
    s1.id,
    s1.structure_number,
    CASE 
      WHEN s2.geometry IS NOT NULL 
      THEN ROUND(ST_Distance(s1.geometry::geography, s2.geometry::geography) * 3.28084, 2) -- meters to feet
      ELSE NULL
    END as span_to_next,
    CASE 
      WHEN s0.geometry IS NOT NULL 
      THEN ROUND(ST_Distance(s1.geometry::geography, s0.geometry::geography) * 3.28084, 2)
      ELSE NULL
    END as span_to_previous
  FROM ordered_structures s1
  LEFT JOIN ordered_structures s0 ON s0.seq = s1.seq - 1
  LEFT JOIN ordered_structures s2 ON s2.seq = s1.seq + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if point is within ROW
CREATE OR REPLACE FUNCTION is_within_row(
  p_point GEOMETRY,
  p_project_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM right_of_way_boundaries
  WHERE project_id = p_project_id
  AND ST_Within(p_point, geometry);
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest structure to a point
CREATE OR REPLACE FUNCTION find_nearest_structure(
  p_point GEOMETRY,
  p_project_id UUID,
  p_max_distance_feet DECIMAL DEFAULT 5280 -- 1 mile default
) RETURNS TABLE(
  structure_id UUID,
  structure_number VARCHAR,
  distance_feet DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.structure_number,
    ROUND(ST_Distance(p_point::geography, s.geometry::geography) * 3.28084, 2) as distance_feet
  FROM transmission_structures s
  WHERE s.project_id = p_project_id
  AND s.geometry IS NOT NULL
  AND ST_DWithin(p_point::geography, s.geometry::geography, p_max_distance_feet / 3.28084)
  ORDER BY s.geometry <-> p_point
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE transmission_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE right_of_way_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE underground_utilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_gis_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_coordinate_systems ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can access data for projects they're members of)
CREATE POLICY transmission_lines_access ON transmission_lines
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY transmission_structures_access ON transmission_structures
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY survey_control_points_access ON survey_control_points
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY row_boundaries_access ON right_of_way_boundaries
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY site_boundaries_access ON site_boundaries
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY underground_utilities_access ON underground_utilities
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY imported_gis_layers_access ON imported_gis_layers
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY project_coordinate_systems_access ON project_coordinate_systems
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE transmission_lines IS 'Transmission line centerline routes with voltage and conductor specs';
COMMENT ON TABLE transmission_structures IS 'Transmission poles/towers with precise GPS locations and spans';
COMMENT ON TABLE survey_control_points IS 'Survey monuments and benchmarks for accurate site positioning';
COMMENT ON TABLE right_of_way_boundaries IS 'ROW easement boundaries and land acquisition tracking';
COMMENT ON TABLE site_boundaries IS 'Construction sites, staging areas, and work zones';
COMMENT ON TABLE underground_utilities IS 'Existing underground infrastructure and utility crossings';
COMMENT ON TABLE imported_gis_layers IS 'Generic container for GIS data imported from CAD, Shapefile, etc';
COMMENT ON TABLE project_coordinate_systems IS 'Project-specific coordinate system definitions and preferences';

