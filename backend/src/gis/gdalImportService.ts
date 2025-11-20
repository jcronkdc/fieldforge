/**
 * GDAL/OGR Import Service
 * 
 * Handles importing geospatial data from various formats:
 * - DXF/DWG (CAD drawings from engineers/surveyors)
 * - Shapefile (GIS data from utilities/agencies)
 * - GeoPackage (modern OGC standard)
 * - GeoTIFF (raster imagery)
 * - KML/KMZ (field data from mobile apps)
 * - CSV with coordinates
 * 
 * Uses GDAL/OGR libraries for format conversion and coordinate transformation.
 * All data is transformed to WGS84 (EPSG:4326) for storage in PostGIS.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { getDatabasePool } from '../database.js';

const execAsync = promisify(exec);

export interface ImportedFeature {
  geometry: any; // GeoJSON geometry
  attributes: Record<string, any>;
  featureId?: string;
  featureClass?: string;
  style?: Record<string, any>;
}

export interface ImportResult {
  success: boolean;
  layerName: string;
  featureCount: number;
  features: ImportedFeature[];
  sourceFormat: string;
  sourceCRS?: string;
  sourceEPSG?: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Check if GDAL/OGR tools are available
 */
export async function checkGDALAvailability(): Promise<boolean> {
  try {
    await execAsync('ogrinfo --version');
    return true;
  } catch (error) {
    console.warn('[GDAL] GDAL/OGR not found on system. Install with: apt-get install gdal-bin');
    return false;
  }
}

/**
 * Get information about a geospatial file without importing
 */
export async function inspectGeoFile(filePath: string): Promise<{
  format: string;
  layerCount: number;
  layers: Array<{
    name: string;
    featureCount: number;
    geometryType: string;
    extent: number[];
    crs: string;
  }>;
}> {
  try {
    const { stdout } = await execAsync(`ogrinfo -al -so "${filePath}"`);
    
    // Parse ogrinfo output
    const lines = stdout.split('\n');
    const layers: any[] = [];
    let currentLayer: any = null;
    
    for (const line of lines) {
      if (line.startsWith('Layer name:')) {
        if (currentLayer) layers.push(currentLayer);
        currentLayer = {
          name: line.split(':')[1].trim(),
          featureCount: 0,
          geometryType: 'Unknown',
          extent: [],
          crs: 'Unknown'
        };
      } else if (currentLayer) {
        if (line.includes('Feature Count:')) {
          currentLayer.featureCount = parseInt(line.split(':')[1].trim());
        } else if (line.includes('Geometry:')) {
          currentLayer.geometryType = line.split(':')[1].trim();
        } else if (line.includes('Extent:')) {
          // Parse extent coordinates
          const extentMatch = line.match(/\(([-\d.]+),\s*([-\d.]+)\)\s*-\s*\(([-\d.]+),\s*([-\d.]+)\)/);
          if (extentMatch) {
            currentLayer.extent = [
              parseFloat(extentMatch[1]),
              parseFloat(extentMatch[2]),
              parseFloat(extentMatch[3]),
              parseFloat(extentMatch[4])
            ];
          }
        } else if (line.includes('Layer SRS WKT:') || line.includes('PROJCS') || line.includes('GEOGCS')) {
          // Extract CRS info
          currentLayer.crs = line.trim();
        }
      }
    }
    
    if (currentLayer) layers.push(currentLayer);
    
    const format = detectFormat(filePath);
    
    return {
      format,
      layerCount: layers.length,
      layers
    };
  } catch (error: any) {
    throw new Error(`Failed to inspect file: ${error.message}`);
  }
}

/**
 * Import geospatial file into PostGIS
 * Converts to WGS84 and stores in imported_gis_layers table
 */
export async function importGeoFile(
  filePath: string,
  projectId: string,
  companyId: string,
  userId: string,
  options: {
    layerName?: string;
    targetEPSG?: number;
    layerFilter?: string; // Filter specific layers from multi-layer files
  } = {}
): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Detect source format
    const sourceFormat = detectFormat(filePath);
    
    // Inspect file to get layer info
    const fileInfo = await inspectGeoFile(filePath);
    
    if (fileInfo.layerCount === 0) {
      throw new Error('No spatial layers found in file');
    }
    
    // Use first layer if not specified
    const targetLayer = options.layerFilter || fileInfo.layers[0].name;
    const layerInfo = fileInfo.layers.find(l => l.name === targetLayer) || fileInfo.layers[0];
    
    // Extract EPSG code from CRS if possible
    const epsgMatch = layerInfo.crs.match(/EPSG[":,]*(\d+)/i);
    const sourceEPSG = epsgMatch ? parseInt(epsgMatch[1]) : undefined;
    
    // Convert to GeoJSON (always WGS84) using ogr2ogr
    const tempGeoJSON = `/tmp/${path.basename(filePath)}_${Date.now()}.geojson`;
    const targetEPSG = options.targetEPSG || 4326; // WGS84 default
    
    let cmd = `ogr2ogr -f "GeoJSON" -t_srs EPSG:${targetEPSG} "${tempGeoJSON}" "${filePath}"`;
    
    if (options.layerFilter) {
      cmd += ` "${options.layerFilter}"`;
    }
    
    await execAsync(cmd);
    
    // Read GeoJSON
    const geoJSONContent = await fs.readFile(tempGeoJSON, 'utf-8');
    const geoJSON = JSON.parse(geoJSONContent);
    
    // Clean up temp file
    await fs.unlink(tempGeoJSON);
    
    if (!geoJSON.features || geoJSON.features.length === 0) {
      warnings.push('File converted successfully but contains no features');
    }
    
    // Import features into database
    const pool = getDatabasePool();
    const features: ImportedFeature[] = [];
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const feature of geoJSON.features || []) {
        const geometry = feature.geometry;
        const properties = feature.properties || {};
        
        // Convert GeoJSON geometry to WKT for PostGIS
        const geomWKT = geoJSONToWKT(geometry);
        
        const result = await client.query(`
          INSERT INTO imported_gis_layers (
            project_id,
            company_id,
            layer_name,
            layer_type,
            source_file,
            source_format,
            geometry,
            attributes,
            original_crs,
            original_epsg,
            imported_by,
            feature_id,
            feature_class
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            ST_GeomFromText($7, 4326),
            $8, $9, $10, $11, $12, $13
          ) RETURNING id
        `, [
          projectId,
          companyId,
          options.layerName || targetLayer,
          geometry.type,
          path.basename(filePath),
          sourceFormat,
          geomWKT,
          JSON.stringify(properties),
          layerInfo.crs,
          sourceEPSG,
          userId,
          properties.id || properties.FID || properties.OBJECTID,
          properties.class || properties.layer || properties.type
        ]);
        
        features.push({
          geometry,
          attributes: properties,
          featureId: properties.id || properties.FID,
          featureClass: properties.class || properties.layer
        });
      }
      
      await client.query('COMMIT');
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return {
      success: true,
      layerName: options.layerName || targetLayer,
      featureCount: features.length,
      features,
      sourceFormat,
      sourceCRS: layerInfo.crs,
      sourceEPSG,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error: any) {
    errors.push(error.message);
    return {
      success: false,
      layerName: options.layerName || 'unknown',
      featureCount: 0,
      features: [],
      sourceFormat: detectFormat(filePath),
      errors
    };
  }
}

/**
 * Import CSV with coordinate columns
 */
export async function importCSVWithCoordinates(
  filePath: string,
  projectId: string,
  companyId: string,
  userId: string,
  options: {
    layerName: string;
    latColumn: string;
    lonColumn: string;
    elevationColumn?: string;
    sourceEPSG?: number;
  }
): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Create VRT file to tell GDAL about coordinate columns
    const vrtContent = `
<OGRVRTDataSource>
  <OGRVRTLayer name="${options.layerName}">
    <SrcDataSource>${filePath}</SrcDataSource>
    <GeometryType>wkbPoint</GeometryType>
    <LayerSRS>EPSG:${options.sourceEPSG || 4326}</LayerSRS>
    <GeometryField encoding="PointFromColumns" x="${options.lonColumn}" y="${options.latColumn}"${options.elevationColumn ? ` z="${options.elevationColumn}"` : ''}/>
  </OGRVRTLayer>
</OGRVRTDataSource>
    `.trim();
    
    const vrtPath = `/tmp/${path.basename(filePath)}_${Date.now()}.vrt`;
    await fs.writeFile(vrtPath, vrtContent);
    
    // Use the VRT file to import
    const result = await importGeoFile(vrtPath, projectId, companyId, userId, {
      layerName: options.layerName
    });
    
    // Clean up VRT
    await fs.unlink(vrtPath);
    
    return result;
    
  } catch (error: any) {
    errors.push(error.message);
    return {
      success: false,
      layerName: options.layerName,
      featureCount: 0,
      features: [],
      sourceFormat: 'csv',
      errors
    };
  }
}

/**
 * Export PostGIS data to various formats
 */
export async function exportGISLayer(
  layerIds: string[],
  outputFormat: 'shapefile' | 'dxf' | 'kml' | 'geopackage' | 'geojson',
  outputPath: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Query features from database
    const pool = getDatabasePool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          ST_AsGeoJSON(geometry) as geom_json,
          attributes,
          layer_name,
          feature_id,
          feature_class
        FROM imported_gis_layers
        WHERE id = ANY($1)
      `, [layerIds]);
      
      if (result.rows.length === 0) {
        return { success: false, error: 'No features found' };
      }
      
      // Create GeoJSON
      const geoJSON = {
        type: 'FeatureCollection',
        features: result.rows.map((row: any) => ({
          type: 'Feature',
          geometry: JSON.parse(row.geom_json),
          properties: {
            ...row.attributes,
            layer_name: row.layer_name,
            feature_id: row.feature_id,
            feature_class: row.feature_class
          }
        }))
      };
      
      const tempGeoJSON = `/tmp/export_${Date.now()}.geojson`;
      await fs.writeFile(tempGeoJSON, JSON.stringify(geoJSON));
      
      // Convert using ogr2ogr
      let driver = 'GeoJSON';
      let extension = 'geojson';
      
      switch (outputFormat) {
        case 'shapefile':
          driver = 'ESRI Shapefile';
          extension = 'shp';
          break;
        case 'dxf':
          driver = 'DXF';
          extension = 'dxf';
          break;
        case 'kml':
          driver = 'KML';
          extension = 'kml';
          break;
        case 'geopackage':
          driver = 'GPKG';
          extension = 'gpkg';
          break;
      }
      
      const finalPath = outputPath || `/tmp/export_${Date.now()}.${extension}`;
      
      await execAsync(`ogr2ogr -f "${driver}" "${finalPath}" "${tempGeoJSON}"`);
      
      // Clean up
      await fs.unlink(tempGeoJSON);
      
      return { success: true, filePath: finalPath };
      
    } finally {
      client.release();
    }
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Detect file format from extension
 */
function detectFormat(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  const formatMap: Record<string, string> = {
    '.shp': 'shapefile',
    '.dxf': 'dxf',
    '.dwg': 'dwg',
    '.kml': 'kml',
    '.kmz': 'kmz',
    '.gpkg': 'geopackage',
    '.geojson': 'geojson',
    '.json': 'geojson',
    '.tif': 'geotiff',
    '.tiff': 'geotiff',
    '.csv': 'csv',
    '.gml': 'gml',
    '.gdb': 'filegdb'
  };
  
  return formatMap[ext] || 'unknown';
}

/**
 * Helper: Convert GeoJSON geometry to WKT
 */
function geoJSONToWKT(geometry: any): string {
  const type = geometry.type;
  const coords = geometry.coordinates;
  
  switch (type) {
    case 'Point':
      return `POINT(${coords[0]} ${coords[1]})`;
      
    case 'LineString':
      return `LINESTRING(${coords.map((c: number[]) => `${c[0]} ${c[1]}`).join(',')})`;
      
    case 'Polygon':
      return `POLYGON((${coords[0].map((c: number[]) => `${c[0]} ${c[1]}`).join(',')}))`;
      
    case 'MultiPoint':
      return `MULTIPOINT(${coords.map((c: number[]) => `${c[0]} ${c[1]}`).join(',')})`;
      
    case 'MultiLineString':
      return `MULTILINESTRING(${coords.map((line: number[][]) => 
        `(${line.map(c => `${c[0]} ${c[1]}`).join(',')})`
      ).join(',')})`;
      
    case 'MultiPolygon':
      return `MULTIPOLYGON(${coords.map((poly: number[][][]) => 
        `((${poly[0].map(c => `${c[0]} ${c[1]}`).join(',')}))`
      ).join(',')})`;
      
    default:
      throw new Error(`Unsupported geometry type: ${type}`);
  }
}

/**
 * Transform coordinates between different CRS using PROJ
 */
export async function transformCoordinates(
  points: Array<{ x: number; y: number; z?: number }>,
  sourceCRS: string | number,
  targetCRS: string | number
): Promise<Array<{ x: number; y: number; z?: number }>> {
  // Use PostGIS ST_Transform for coordinate transformation
  const pool = getDatabasePool();
  const client = await pool.connect();
  
  try {
    const sourceEPSG = typeof sourceCRS === 'number' ? sourceCRS : parseInt(sourceCRS);
    const targetEPSG = typeof targetCRS === 'number' ? targetCRS : parseInt(targetCRS);
    
    const transformedPoints = [];
    
    for (const point of points) {
      const result = await client.query(`
        SELECT 
          ST_X(ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), $3), $4)) as x,
          ST_Y(ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), $3), $4)) as y
      `, [point.x, point.y, sourceEPSG, targetEPSG]);
      
      transformedPoints.push({
        x: result.rows[0].x,
        y: result.rows[0].y,
        z: point.z
      });
    }
    
    return transformedPoints;
    
  } finally {
    client.release();
  }
}

