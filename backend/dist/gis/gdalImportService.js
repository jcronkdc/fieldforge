"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGDALAvailability = checkGDALAvailability;
exports.inspectGeoFile = inspectGeoFile;
exports.importGeoFile = importGeoFile;
exports.importCSVWithCoordinates = importCSVWithCoordinates;
exports.exportGISLayer = exportGISLayer;
exports.transformCoordinates = transformCoordinates;
const child_process_1 = require("child_process");
const util_1 = require("util");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const database_js_1 = require("../database.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Check if GDAL/OGR tools are available
 */
async function checkGDALAvailability() {
    try {
        await execAsync('ogrinfo --version');
        return true;
    }
    catch (error) {
        console.warn('[GDAL] GDAL/OGR not found on system. Install with: apt-get install gdal-bin');
        return false;
    }
}
/**
 * Get information about a geospatial file without importing
 */
async function inspectGeoFile(filePath) {
    try {
        const { stdout } = await execAsync(`ogrinfo -al -so "${filePath}"`);
        // Parse ogrinfo output
        const lines = stdout.split('\n');
        const layers = [];
        let currentLayer = null;
        for (const line of lines) {
            if (line.startsWith('Layer name:')) {
                if (currentLayer)
                    layers.push(currentLayer);
                currentLayer = {
                    name: line.split(':')[1].trim(),
                    featureCount: 0,
                    geometryType: 'Unknown',
                    extent: [],
                    crs: 'Unknown'
                };
            }
            else if (currentLayer) {
                if (line.includes('Feature Count:')) {
                    currentLayer.featureCount = parseInt(line.split(':')[1].trim());
                }
                else if (line.includes('Geometry:')) {
                    currentLayer.geometryType = line.split(':')[1].trim();
                }
                else if (line.includes('Extent:')) {
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
                }
                else if (line.includes('Layer SRS WKT:') || line.includes('PROJCS') || line.includes('GEOGCS')) {
                    // Extract CRS info
                    currentLayer.crs = line.trim();
                }
            }
        }
        if (currentLayer)
            layers.push(currentLayer);
        const format = detectFormat(filePath);
        return {
            format,
            layerCount: layers.length,
            layers
        };
    }
    catch (error) {
        throw new Error(`Failed to inspect file: ${error.message}`);
    }
}
/**
 * Import geospatial file into PostGIS
 * Converts to WGS84 and stores in imported_gis_layers table
 */
async function importGeoFile(filePath, projectId, companyId, userId, options = {}) {
    const errors = [];
    const warnings = [];
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
        const tempGeoJSON = `/tmp/${path_1.default.basename(filePath)}_${Date.now()}.geojson`;
        const targetEPSG = options.targetEPSG || 4326; // WGS84 default
        let cmd = `ogr2ogr -f "GeoJSON" -t_srs EPSG:${targetEPSG} "${tempGeoJSON}" "${filePath}"`;
        if (options.layerFilter) {
            cmd += ` "${options.layerFilter}"`;
        }
        await execAsync(cmd);
        // Read GeoJSON
        const geoJSONContent = await promises_1.default.readFile(tempGeoJSON, 'utf-8');
        const geoJSON = JSON.parse(geoJSONContent);
        // Clean up temp file
        await promises_1.default.unlink(tempGeoJSON);
        if (!geoJSON.features || geoJSON.features.length === 0) {
            warnings.push('File converted successfully but contains no features');
        }
        // Import features into database
        const pool = (0, database_js_1.getDatabasePool)();
        const features = [];
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
                    path_1.default.basename(filePath),
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
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
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
    }
    catch (error) {
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
async function importCSVWithCoordinates(filePath, projectId, companyId, userId, options) {
    const errors = [];
    const warnings = [];
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
        const vrtPath = `/tmp/${path_1.default.basename(filePath)}_${Date.now()}.vrt`;
        await promises_1.default.writeFile(vrtPath, vrtContent);
        // Use the VRT file to import
        const result = await importGeoFile(vrtPath, projectId, companyId, userId, {
            layerName: options.layerName
        });
        // Clean up VRT
        await promises_1.default.unlink(vrtPath);
        return result;
    }
    catch (error) {
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
async function exportGISLayer(layerIds, outputFormat, outputPath) {
    try {
        // Query features from database
        const pool = (0, database_js_1.getDatabasePool)();
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
                features: result.rows.map((row) => ({
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
            await promises_1.default.writeFile(tempGeoJSON, JSON.stringify(geoJSON));
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
            await promises_1.default.unlink(tempGeoJSON);
            return { success: true, filePath: finalPath };
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Helper: Detect file format from extension
 */
function detectFormat(filePath) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    const formatMap = {
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
function geoJSONToWKT(geometry) {
    const type = geometry.type;
    const coords = geometry.coordinates;
    switch (type) {
        case 'Point':
            return `POINT(${coords[0]} ${coords[1]})`;
        case 'LineString':
            return `LINESTRING(${coords.map((c) => `${c[0]} ${c[1]}`).join(',')})`;
        case 'Polygon':
            return `POLYGON((${coords[0].map((c) => `${c[0]} ${c[1]}`).join(',')}))`;
        case 'MultiPoint':
            return `MULTIPOINT(${coords.map((c) => `${c[0]} ${c[1]}`).join(',')})`;
        case 'MultiLineString':
            return `MULTILINESTRING(${coords.map((line) => `(${line.map(c => `${c[0]} ${c[1]}`).join(',')})`).join(',')})`;
        case 'MultiPolygon':
            return `MULTIPOLYGON(${coords.map((poly) => `((${poly[0].map(c => `${c[0]} ${c[1]}`).join(',')}))`).join(',')})`;
        default:
            throw new Error(`Unsupported geometry type: ${type}`);
    }
}
/**
 * Transform coordinates between different CRS using PROJ
 */
async function transformCoordinates(points, sourceCRS, targetCRS) {
    // Use PostGIS ST_Transform for coordinate transformation
    const pool = (0, database_js_1.getDatabasePool)();
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
    }
    finally {
        client.release();
    }
}
