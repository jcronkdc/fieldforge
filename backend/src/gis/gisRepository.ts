/**
 * GIS Repository
 * 
 * Database access layer for geospatial infrastructure data
 * All queries use PostGIS spatial functions for advanced GIS operations
 */

import { getDatabasePool } from '../database.js';
import type { PoolClient } from 'pg';

// Helper to get pool instance
const getPool = () => getDatabasePool();

export interface TransmissionLine {
  id: string;
  projectId: string;
  companyId: string;
  lineName: string;
  lineNumber?: string;
  voltageKv: number;
  circuitCount: number;
  geometry: any; // GeoJSON
  geometryLocal?: any;
  conductorType?: string;
  conductorSize?: string;
  lineLengthFeet?: number;
  lineLengthMiles?: number;
  status: string;
  designStandard?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransmissionStructure {
  id: string;
  projectId: string;
  lineId?: string;
  companyId: string;
  structureNumber: string;
  structureType: string;
  poleType?: string;
  geometry: any;
  geometryLocal?: any;
  elevationFeet?: number;
  heightFeet?: number;
  spanBackFeet?: number;
  spanAheadFeet?: number;
  lineAngleDegrees?: number;
  foundationType?: string;
  foundationDepthFeet?: number;
  installationDate?: Date;
  status: string;
  lastInspectionDate?: Date;
  conditionRating?: number;
  photos?: string[];
  documents?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyControlPoint {
  id: string;
  projectId: string;
  companyId: string;
  pointId: string;
  pointType: string;
  geometry: any;
  geometryLocal?: any;
  northing?: number;
  easting?: number;
  elevation?: number;
  horizontalDatum?: string;
  verticalDatum?: string;
  coordinateSystem?: string;
  epsgCode?: number;
  surveyDate?: Date;
  surveyor?: string;
  surveyMethod?: string;
  accuracyHorizontalFt?: number;
  accuracyVerticalFt?: number;
  monumentType?: string;
  monumentCondition?: string;
  description?: string;
  photos?: string[];
  surveyNotes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteBoundary {
  id: string;
  projectId: string;
  companyId: string;
  siteName: string;
  siteType: string;
  geometry: any;
  geometryLocal?: any;
  areaAcres?: number;
  accessType?: string;
  fencingRequired: boolean;
  environmentalRestrictions?: string;
  permitStatus?: string;
  permitNumber?: string;
  permitExpiryDate?: Date;
  sitePhotos?: string[];
  sitePlanDocuments?: string[];
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all transmission lines for a project
 */
export async function getTransmissionLines(projectId: string): Promise<TransmissionLine[]> {
  const pool = getPool();
  const result = await getPool().query(`
    SELECT 
      id,
      project_id as "projectId",
      company_id as "companyId",
      line_name as "lineName",
      line_number as "lineNumber",
      voltage_kv as "voltageKv",
      circuit_count as "circuitCount",
      ST_AsGeoJSON(geometry)::json as geometry,
      ST_AsGeoJSON(geometry_local)::json as "geometryLocal",
      conductor_type as "conductorType",
      conductor_size as "conductorSize",
      line_length_feet as "lineLengthFeet",
      line_length_miles as "lineLengthMiles",
      status,
      design_standard as "designStandard",
      created_by as "createdBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM transmission_lines
    WHERE project_id = $1
    ORDER BY line_name
  `, [projectId]);
  
  return result.rows;
}

/**
 * Create a new transmission line
 */
export async function createTransmissionLine(
  line: Omit<TransmissionLine, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TransmissionLine> {
  const result = await getPool().query(`
    INSERT INTO transmission_lines (
      project_id, company_id, line_name, line_number, voltage_kv, circuit_count,
      geometry, conductor_type, conductor_size, status, design_standard, created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      ST_GeomFromGeoJSON($7), $8, $9, $10, $11, $12
    )
    RETURNING 
      id, project_id as "projectId", company_id as "companyId",
      line_name as "lineName", voltage_kv as "voltageKv",
      ST_AsGeoJSON(geometry)::json as geometry,
      created_at as "createdAt", updated_at as "updatedAt"
  `, [
    line.projectId, line.companyId, line.lineName, line.lineNumber,
    line.voltageKv, line.circuitCount, JSON.stringify(line.geometry),
    line.conductorType, line.conductorSize, line.status,
    line.designStandard, line.createdBy
  ]);
  
  // Calculate line length
  await getPool().query(`
    UPDATE transmission_lines
    SET 
      line_length_feet = ST_Length(geometry::geography) * 3.28084,
      line_length_miles = ST_Length(geometry::geography) * 0.000621371
    WHERE id = $1
  `, [result.rows[0].id]);
  
  return result.rows[0];
}

/**
 * Get transmission structures for a project or line
 */
export async function getTransmissionStructures(
  projectId: string,
  lineId?: string
): Promise<TransmissionStructure[]> {
  const query = lineId
    ? `SELECT * FROM transmission_structures WHERE project_id = $1 AND line_id = $2 ORDER BY structure_number`
    : `SELECT * FROM transmission_structures WHERE project_id = $1 ORDER BY structure_number`;
  
  const params = lineId ? [projectId, lineId] : [projectId];
  
  const result = await getPool().query(`
    SELECT 
      id, project_id as "projectId", line_id as "lineId", company_id as "companyId",
      structure_number as "structureNumber", structure_type as "structureType",
      pole_type as "poleType",
      ST_AsGeoJSON(geometry)::json as geometry,
      ST_AsGeoJSON(geometry_local)::json as "geometryLocal",
      elevation_feet as "elevationFeet", height_feet as "heightFeet",
      span_back_feet as "spanBackFeet", span_ahead_feet as "spanAheadFeet",
      line_angle_degrees as "lineAngleDegrees",
      foundation_type as "foundationType", foundation_depth_feet as "foundationDepthFeet",
      installation_date as "installationDate", status,
      last_inspection_date as "lastInspectionDate",
      condition_rating as "conditionRating",
      photos, documents,
      created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    FROM transmission_structures
    WHERE ${lineId ? 'project_id = $1 AND line_id = $2' : 'project_id = $1'}
    ORDER BY structure_number
  `, params);
  
  return result.rows;
}

/**
 * Create transmission structure
 */
export async function createTransmissionStructure(
  structure: Omit<TransmissionStructure, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TransmissionStructure> {
  const result = await getPool().query(`
    INSERT INTO transmission_structures (
      project_id, line_id, company_id, structure_number, structure_type, pole_type,
      geometry, elevation_feet, height_feet, foundation_type, foundation_depth_feet,
      installation_date, status, created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, ST_GeomFromGeoJSON($7), $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING 
      id, project_id as "projectId", line_id as "lineId",
      structure_number as "structureNumber",
      ST_AsGeoJSON(geometry)::json as geometry,
      created_at as "createdAt"
  `, [
    structure.projectId, structure.lineId, structure.companyId,
    structure.structureNumber, structure.structureType, structure.poleType,
    JSON.stringify(structure.geometry), structure.elevationFeet, structure.heightFeet,
    structure.foundationType, structure.foundationDepthFeet,
    structure.installationDate, structure.status, structure.createdBy
  ]);
  
  return result.rows[0];
}

/**
 * Calculate structure spacing for a line
 */
export async function calculateStructureSpacing(lineId: string): Promise<Array<{
  structureId: string;
  structureNumber: string;
  spanToNext: number;
  spanToPrevious: number;
}>> {
  const result = await getPool().query(`
    SELECT 
      structure_id as "structureId",
      structure_number as "structureNumber",
      span_to_next as "spanToNext",
      span_to_previous as "spanToPrevious"
    FROM calculate_structure_spacing($1)
  `, [lineId]);
  
  return result.rows;
}

/**
 * Get survey control points for a project
 */
export async function getSurveyControlPoints(projectId: string): Promise<SurveyControlPoint[]> {
  const result = await getPool().query(`
    SELECT 
      id, project_id as "projectId", company_id as "companyId",
      point_id as "pointId", point_type as "pointType",
      ST_AsGeoJSON(geometry)::json as geometry,
      ST_AsGeoJSON(geometry_local)::json as "geometryLocal",
      northing, easting, elevation,
      horizontal_datum as "horizontalDatum", vertical_datum as "verticalDatum",
      coordinate_system as "coordinateSystem", epsg_code as "epsgCode",
      survey_date as "surveyDate", surveyor, survey_method as "surveyMethod",
      accuracy_horizontal_ft as "accuracyHorizontalFt",
      accuracy_vertical_ft as "accuracyVerticalFt",
      monument_type as "monumentType", monument_condition as "monumentCondition",
      description, photos, survey_notes as "surveyNotes",
      created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    FROM survey_control_points
    WHERE project_id = $1
    ORDER BY point_id
  `, [projectId]);
  
  return result.rows;
}

/**
 * Create survey control point
 */
export async function createSurveyControlPoint(
  point: Omit<SurveyControlPoint, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SurveyControlPoint> {
  const result = await getPool().query(`
    INSERT INTO survey_control_points (
      project_id, company_id, point_id, point_type, geometry,
      northing, easting, elevation,
      horizontal_datum, vertical_datum, coordinate_system, epsg_code,
      survey_date, surveyor, survey_method,
      accuracy_horizontal_ft, accuracy_vertical_ft,
      monument_type, monument_condition, description, photos, survey_notes,
      created_by
    ) VALUES (
      $1, $2, $3, $4, ST_GeomFromGeoJSON($5),
      $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
    )
    RETURNING 
      id, project_id as "projectId", point_id as "pointId",
      ST_AsGeoJSON(geometry)::json as geometry,
      created_at as "createdAt"
  `, [
    point.projectId, point.companyId, point.pointId, point.pointType,
    JSON.stringify(point.geometry), point.northing, point.easting, point.elevation,
    point.horizontalDatum, point.verticalDatum, point.coordinateSystem, point.epsgCode,
    point.surveyDate, point.surveyor, point.surveyMethod,
    point.accuracyHorizontalFt, point.accuracyVerticalFt,
    point.monumentType, point.monumentCondition, point.description,
    point.photos, point.surveyNotes, point.createdBy
  ]);
  
  return result.rows[0];
}

/**
 * Find nearest structure to a point
 */
export async function findNearestStructure(
  projectId: string,
  longitude: number,
  latitude: number,
  maxDistanceFeet: number = 5280
): Promise<{
  structureId: string;
  structureNumber: string;
  distanceFeet: number;
} | null> {
  const result = await getPool().query(`
    SELECT 
      structure_id as "structureId",
      structure_number as "structureNumber",
      distance_feet as "distanceFeet"
    FROM find_nearest_structure(
      ST_SetSRID(ST_MakePoint($1, $2), 4326),
      $3,
      $4
    )
  `, [longitude, latitude, projectId, maxDistanceFeet]);
  
  return result.rows[0] || null;
}

/**
 * Get site boundaries for a project
 */
export async function getSiteBoundaries(projectId: string, siteType?: string): Promise<SiteBoundary[]> {
  const query = siteType
    ? `SELECT * FROM site_boundaries WHERE project_id = $1 AND site_type = $2 ORDER BY site_name`
    : `SELECT * FROM site_boundaries WHERE project_id = $1 ORDER BY site_name`;
  
  const params = siteType ? [projectId, siteType] : [projectId];
  
  const result = await getPool().query(`
    SELECT 
      id, project_id as "projectId", company_id as "companyId",
      site_name as "siteName", site_type as "siteType",
      ST_AsGeoJSON(geometry)::json as geometry,
      ST_AsGeoJSON(geometry_local)::json as "geometryLocal",
      area_acres as "areaAcres", access_type as "accessType",
      fencing_required as "fencingRequired",
      environmental_restrictions as "environmentalRestrictions",
      permit_status as "permitStatus", permit_number as "permitNumber",
      permit_expiry_date as "permitExpiryDate",
      site_photos as "sitePhotos", site_plan_documents as "sitePlanDocuments",
      notes, created_by as "createdBy",
      created_at as "createdAt", updated_at as "updatedAt"
    FROM site_boundaries
    WHERE ${siteType ? 'project_id = $1 AND site_type = $2' : 'project_id = $1'}
    ORDER BY site_name
  `, params);
  
  return result.rows;
}

/**
 * Create site boundary
 */
export async function createSiteBoundary(
  site: Omit<SiteBoundary, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SiteBoundary> {
  const result = await getPool().query(`
    INSERT INTO site_boundaries (
      project_id, company_id, site_name, site_type, geometry,
      access_type, fencing_required, environmental_restrictions,
      permit_status, permit_number, permit_expiry_date,
      notes, created_by
    ) VALUES (
      $1, $2, $3, $4, ST_GeomFromGeoJSON($5), $6, $7, $8, $9, $10, $11, $12, $13
    )
    RETURNING 
      id, project_id as "projectId", site_name as "siteName",
      ST_AsGeoJSON(geometry)::json as geometry,
      created_at as "createdAt"
  `, [
    site.projectId, site.companyId, site.siteName, site.siteType,
    JSON.stringify(site.geometry), site.accessType, site.fencingRequired,
    site.environmentalRestrictions, site.permitStatus, site.permitNumber,
    site.permitExpiryDate, site.notes, site.createdBy
  ]);
  
  // Calculate area
  await getPool().query(`
    UPDATE site_boundaries
    SET area_acres = ST_Area(geometry::geography) * 0.000247105
    WHERE id = $1
  `, [result.rows[0].id]);
  
  return result.rows[0];
}

/**
 * Check if point is within ROW
 */
export async function checkPointWithinROW(
  projectId: string,
  longitude: number,
  latitude: number
): Promise<boolean> {
  const result = await getPool().query(`
    SELECT is_within_row(
      ST_SetSRID(ST_MakePoint($1, $2), 4326),
      $3
    ) as within_row
  `, [longitude, latitude, projectId]);
  
  return result.rows[0].within_row;
}

/**
 * Get imported GIS layers for a project
 */
export async function getImportedGISLayers(
  projectId: string,
  layerType?: string
): Promise<any[]> {
  const query = layerType
    ? `SELECT * FROM imported_gis_layers WHERE project_id = $1 AND layer_type = $2 ORDER BY import_date DESC`
    : `SELECT * FROM imported_gis_layers WHERE project_id = $1 ORDER BY import_date DESC`;
  
  const params = layerType ? [projectId, layerType] : [projectId];
  
  const result = await getPool().query(`
    SELECT 
      id, project_id as "projectId", company_id as "companyId",
      layer_name as "layerName", layer_type as "layerType",
      source_file as "sourceFile", source_format as "sourceFormat",
      ST_AsGeoJSON(geometry)::json as geometry,
      attributes, original_crs as "originalCrs", original_epsg as "originalEpsg",
      import_date as "importDate", imported_by as "importedBy",
      import_notes as "importNotes",
      feature_id as "featureId", feature_class as "featureClass", feature_style as "featureStyle",
      created_at as "createdAt", updated_at as "updatedAt"
    FROM imported_gis_layers
    WHERE ${layerType ? 'project_id = $1 AND layer_type = $2' : 'project_id = $1'}
    ORDER BY import_date DESC
    LIMIT 1000
  `, params);
  
  return result.rows;
}

/**
 * Get project coordinate system
 */
export async function getProjectCoordinateSystem(projectId: string): Promise<any | null> {
  const result = await getPool().query(`
    SELECT 
      id, project_id as "projectId",
      working_crs_name as "workingCrsName",
      working_crs_epsg as "workingCrsEpsg",
      working_crs_proj4 as "workingCrsProj4",
      vertical_datum as "verticalDatum",
      display_units as "displayUnits",
      coordinate_format as "coordinateFormat",
      false_northing as "falseNorthing",
      false_easting as "falseEasting",
      scale_factor as "scaleFactor",
      central_meridian as "centralMeridian",
      notes,
      created_by as "createdBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM project_coordinate_systems
    WHERE project_id = $1
  `, [projectId]);
  
  return result.rows[0] || null;
}

/**
 * Set project coordinate system
 */
export async function setProjectCoordinateSystem(
  projectId: string,
  crs: {
    workingCrsName: string;
    workingCrsEpsg: number;
    workingCrsProj4?: string;
    verticalDatum?: string;
    displayUnits?: string;
    coordinateFormat?: string;
    createdBy: string;
  }
): Promise<any> {
  const result = await getPool().query(`
    INSERT INTO project_coordinate_systems (
      project_id, working_crs_name, working_crs_epsg, working_crs_proj4,
      vertical_datum, display_units, coordinate_format, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (project_id) DO UPDATE SET
      working_crs_name = EXCLUDED.working_crs_name,
      working_crs_epsg = EXCLUDED.working_crs_epsg,
      working_crs_proj4 = EXCLUDED.working_crs_proj4,
      vertical_datum = EXCLUDED.vertical_datum,
      display_units = EXCLUDED.display_units,
      coordinate_format = EXCLUDED.coordinate_format,
      updated_at = NOW()
    RETURNING 
      id, project_id as "projectId",
      working_crs_name as "workingCrsName",
      working_crs_epsg as "workingCrsEpsg"
  `, [
    projectId, crs.workingCrsName, crs.workingCrsEpsg, crs.workingCrsProj4,
    crs.verticalDatum, crs.displayUnits, crs.coordinateFormat, crs.createdBy
  ]);
  
  return result.rows[0];
}

