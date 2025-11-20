/**
 * GIS Infrastructure Routes
 * 
 * REST API for geospatial data management:
 * - Transmission lines and structures
 * - Survey control points
 * - Site boundaries and work areas
 * - GIS file import/export (DXF, Shapefile, etc)
 * - Coordinate transformations
 * - Spatial queries and analysis
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import * as gisRepo from '../gis/gisRepository.js';
import * as gdalService from '../gis/gdalImportService.js';

const upload = multer({ dest: '/tmp/gis_uploads/' });

export function createGISRouter() {
  const router = Router();

  // ========================================================================
  // TRANSMISSION LINES
  // ========================================================================

  /**
   * GET /api/gis/projects/:projectId/transmission-lines
   * Get all transmission lines for a project
   */
  router.get('/projects/:projectId/transmission-lines', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const lines = await gisRepo.getTransmissionLines(projectId);
      res.json(lines);
    } catch (error: any) {
      console.error('[GIS] Error fetching transmission lines:', error);
      res.status(500).json({ error: 'Failed to fetch transmission lines' });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/transmission-lines
   * Create a new transmission line
   */
  router.post('/projects/:projectId/transmission-lines', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;

      const line = await gisRepo.createTransmissionLine({
        projectId,
        companyId,
        ...req.body,
        createdBy: userId
      });

      res.status(201).json(line);
    } catch (error: any) {
      console.error('[GIS] Error creating transmission line:', error);
      res.status(500).json({ error: 'Failed to create transmission line' });
    }
  });

  // ========================================================================
  // TRANSMISSION STRUCTURES
  // ========================================================================

  /**
   * GET /api/gis/projects/:projectId/structures
   * Get transmission structures for a project
   * Query params: ?lineId=xxx (optional - filter by line)
   */
  router.get('/projects/:projectId/structures', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { lineId } = req.query;

      const structures = await gisRepo.getTransmissionStructures(
        projectId,
        lineId as string | undefined
      );

      res.json(structures);
    } catch (error: any) {
      console.error('[GIS] Error fetching structures:', error);
      res.status(500).json({ error: 'Failed to fetch structures' });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/structures
   * Create a new transmission structure
   */
  router.post('/projects/:projectId/structures', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;

      const structure = await gisRepo.createTransmissionStructure({
        projectId,
        companyId,
        ...req.body,
        createdBy: userId
      });

      res.status(201).json(structure);
    } catch (error: any) {
      console.error('[GIS] Error creating structure:', error);
      res.status(500).json({ error: 'Failed to create structure' });
    }
  });

  /**
   * GET /api/gis/lines/:lineId/structure-spacing
   * Calculate structure spacing for a line
   */
  router.get('/lines/:lineId/structure-spacing', async (req: Request, res: Response) => {
    try {
      const { lineId } = req.params;
      const spacing = await gisRepo.calculateStructureSpacing(lineId);
      res.json(spacing);
    } catch (error: any) {
      console.error('[GIS] Error calculating spacing:', error);
      res.status(500).json({ error: 'Failed to calculate structure spacing' });
    }
  });

  // ========================================================================
  // SURVEY CONTROL POINTS
  // ========================================================================

  /**
   * GET /api/gis/projects/:projectId/survey-points
   * Get survey control points for a project
   */
  router.get('/projects/:projectId/survey-points', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const points = await gisRepo.getSurveyControlPoints(projectId);
      res.json(points);
    } catch (error: any) {
      console.error('[GIS] Error fetching survey points:', error);
      res.status(500).json({ error: 'Failed to fetch survey points' });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/survey-points
   * Create a new survey control point
   */
  router.post('/projects/:projectId/survey-points', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;

      const point = await gisRepo.createSurveyControlPoint({
        projectId,
        companyId,
        ...req.body,
        createdBy: userId
      });

      res.status(201).json(point);
    } catch (error: any) {
      console.error('[GIS] Error creating survey point:', error);
      res.status(500).json({ error: 'Failed to create survey point' });
    }
  });

  // ========================================================================
  // SITE BOUNDARIES
  // ========================================================================

  /**
   * GET /api/gis/projects/:projectId/site-boundaries
   * Get site boundaries for a project
   * Query params: ?type=xxx (optional - filter by site type)
   */
  router.get('/projects/:projectId/site-boundaries', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { type } = req.query;

      const sites = await gisRepo.getSiteBoundaries(
        projectId,
        type as string | undefined
      );

      res.json(sites);
    } catch (error: any) {
      console.error('[GIS] Error fetching site boundaries:', error);
      res.status(500).json({ error: 'Failed to fetch site boundaries' });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/site-boundaries
   * Create a new site boundary
   */
  router.post('/projects/:projectId/site-boundaries', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;

      const site = await gisRepo.createSiteBoundary({
        projectId,
        companyId,
        ...req.body,
        createdBy: userId
      });

      res.status(201).json(site);
    } catch (error: any) {
      console.error('[GIS] Error creating site boundary:', error);
      res.status(500).json({ error: 'Failed to create site boundary' });
    }
  });

  // ========================================================================
  // SPATIAL QUERIES
  // ========================================================================

  /**
   * POST /api/gis/projects/:projectId/find-nearest-structure
   * Find nearest structure to a point
   * Body: { longitude, latitude, maxDistanceFeet }
   */
  router.post('/projects/:projectId/find-nearest-structure', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { longitude, latitude, maxDistanceFeet } = req.body;

      const result = await gisRepo.findNearestStructure(
        projectId,
        longitude,
        latitude,
        maxDistanceFeet
      );

      if (!result) {
        res.json({ found: false, message: 'No structures found within range' });
      } else {
        res.json({ found: true, ...result });
      }
    } catch (error: any) {
      console.error('[GIS] Error finding nearest structure:', error);
      res.status(500).json({ error: 'Failed to find nearest structure' });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/check-within-row
   * Check if a point is within ROW boundaries
   * Body: { longitude, latitude }
   */
  router.post('/projects/:projectId/check-within-row', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { longitude, latitude } = req.body;

      const withinRow = await gisRepo.checkPointWithinROW(projectId, longitude, latitude);

      res.json({ withinRow });
    } catch (error: any) {
      console.error('[GIS] Error checking ROW:', error);
      res.status(500).json({ error: 'Failed to check ROW' });
    }
  });

  // ========================================================================
  // GIS FILE IMPORT/EXPORT
  // ========================================================================

  /**
   * GET /api/gis/gdal/check
   * Check if GDAL/OGR is available
   */
  router.get('/gdal/check', async (req: Request, res: Response) => {
    try {
      const available = await gdalService.checkGDALAvailability();
      res.json({ 
        available,
        message: available 
          ? 'GDAL/OGR is installed and ready' 
          : 'GDAL/OGR not found. Install with: apt-get install gdal-bin'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/import
   * Import GIS file (DXF, Shapefile, GeoPackage, KML, CSV)
   * Multipart form with file upload
   */
  router.post('/projects/:projectId/import', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const options = {
        layerName: req.body.layerName,
        targetEPSG: req.body.targetEPSG ? parseInt(req.body.targetEPSG) : undefined,
        layerFilter: req.body.layerFilter
      };

      // Check if it's a CSV with coordinates
      if (req.file.originalname.toLowerCase().endsWith('.csv') && req.body.latColumn && req.body.lonColumn) {
        const result = await gdalService.importCSVWithCoordinates(
          filePath,
          projectId,
          companyId,
          userId,
          {
            layerName: req.body.layerName || 'Imported Points',
            latColumn: req.body.latColumn,
            lonColumn: req.body.lonColumn,
            elevationColumn: req.body.elevationColumn,
            sourceEPSG: req.body.sourceEPSG ? parseInt(req.body.sourceEPSG) : 4326
          }
        );

        // Clean up uploaded file
        await fs.unlink(filePath);

        res.json(result);
      } else {
        // Import as regular GIS file
        const result = await gdalService.importGeoFile(
          filePath,
          projectId,
          companyId,
          userId,
          options
        );

        // Clean up uploaded file
        await fs.unlink(filePath);

        res.json(result);
      }
    } catch (error: any) {
      console.error('[GIS] Error importing file:', error);
      res.status(500).json({ error: `Import failed: ${error.message}` });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/inspect
   * Inspect a GIS file without importing
   * Multipart form with file upload
   */
  router.post('/projects/:projectId/inspect', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const info = await gdalService.inspectGeoFile(filePath);

      // Clean up uploaded file
      await fs.unlink(filePath);

      res.json(info);
    } catch (error: any) {
      console.error('[GIS] Error inspecting file:', error);
      res.status(500).json({ error: `Inspection failed: ${error.message}` });
    }
  });

  /**
   * GET /api/gis/projects/:projectId/imported-layers
   * Get imported GIS layers for a project
   * Query params: ?type=xxx (optional - filter by layer type)
   */
  router.get('/projects/:projectId/imported-layers', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { type } = req.query;

      const layers = await gisRepo.getImportedGISLayers(
        projectId,
        type as string | undefined
      );

      res.json(layers);
    } catch (error: any) {
      console.error('[GIS] Error fetching imported layers:', error);
      res.status(500).json({ error: 'Failed to fetch imported layers' });
    }
  });

  /**
   * POST /api/gis/export
   * Export GIS layers to file
   * Body: { layerIds: string[], format: 'shapefile' | 'dxf' | 'kml' | 'geopackage' | 'geojson' }
   */
  router.post('/export', async (req: Request, res: Response) => {
    try {
      const { layerIds, format } = req.body;

      if (!layerIds || !Array.isArray(layerIds) || layerIds.length === 0) {
        return res.status(400).json({ error: 'layerIds array required' });
      }

      if (!['shapefile', 'dxf', 'kml', 'geopackage', 'geojson'].includes(format)) {
        return res.status(400).json({ error: 'Invalid format' });
      }

      const result = await gdalService.exportGISLayer(
        layerIds,
        format,
        `/tmp/export_${Date.now()}`
      );

      if (!result.success || !result.filePath) {
        return res.status(500).json({ error: result.error || 'Export failed' });
      }

      // Send file as download
      res.download(result.filePath, path.basename(result.filePath), async (err) => {
        // Clean up temp file after download
        if (result.filePath) {
          await fs.unlink(result.filePath).catch(() => {});
        }
      });
    } catch (error: any) {
      console.error('[GIS] Error exporting:', error);
      res.status(500).json({ error: `Export failed: ${error.message}` });
    }
  });

  // ========================================================================
  // COORDINATE SYSTEMS
  // ========================================================================

  /**
   * GET /api/gis/projects/:projectId/coordinate-system
   * Get project coordinate system configuration
   */
  router.get('/projects/:projectId/coordinate-system', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const crs = await gisRepo.getProjectCoordinateSystem(projectId);

      if (!crs) {
        return res.json({ 
          configured: false, 
          message: 'No coordinate system configured for this project' 
        });
      }

      res.json({ configured: true, ...crs });
    } catch (error: any) {
      console.error('[GIS] Error fetching coordinate system:', error);
      res.status(500).json({ error: 'Failed to fetch coordinate system' });
    }
  });

  /**
   * POST /api/gis/projects/:projectId/coordinate-system
   * Set project coordinate system
   */
  router.post('/projects/:projectId/coordinate-system', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;

      const crs = await gisRepo.setProjectCoordinateSystem(projectId, {
        ...req.body,
        createdBy: userId
      });

      res.json(crs);
    } catch (error: any) {
      console.error('[GIS] Error setting coordinate system:', error);
      res.status(500).json({ error: 'Failed to set coordinate system' });
    }
  });

  /**
   * POST /api/gis/transform-coordinates
   * Transform coordinates between CRS
   * Body: { points: [{x, y, z?}], sourceCRS: number, targetCRS: number }
   */
  router.post('/transform-coordinates', async (req: Request, res: Response) => {
    try {
      const { points, sourceCRS, targetCRS } = req.body;

      if (!points || !Array.isArray(points)) {
        return res.status(400).json({ error: 'points array required' });
      }

      if (!sourceCRS || !targetCRS) {
        return res.status(400).json({ error: 'sourceCRS and targetCRS required (EPSG codes)' });
      }

      const transformed = await gdalService.transformCoordinates(
        points,
        sourceCRS,
        targetCRS
      );

      res.json({ transformed });
    } catch (error: any) {
      console.error('[GIS] Error transforming coordinates:', error);
      res.status(500).json({ error: `Transformation failed: ${error.message}` });
    }
  });

  // ========================================================================
  // COLLABORATION INTEGRATION
  // ========================================================================

  /**
   * POST /api/gis/projects/:projectId/create-review-room
   * Create a Daily.co video room for team GIS review
   */
  router.post('/projects/:projectId/create-review-room', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).user?.id;
      const { roomName, enableCursorSync } = req.body;

      // Check if Daily.co API key is configured
      if (!process.env.DAILY_API_KEY) {
        return res.status(503).json({
          error: "Video collaboration not configured. Daily.co API key missing."
        });
      }

      // Create Daily.co room
      const roomConfig = {
        name: `gis-review-${projectId}-${Date.now()}`,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: true, // Invite-only
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60) // 4 hour expiry
        }
      };

      const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomConfig)
      });

      if (!dailyResponse.ok) {
        throw new Error(`Daily.co API error: ${dailyResponse.status}`);
      }

      const room = await dailyResponse.json();

      // Store in database (reuse collaboration_rooms table)
      const { getDatabasePool } = await import('../database.js');
      const pool = getDatabasePool();
      const result = await pool.query(`
        INSERT INTO collaboration_rooms (
          project_id,
          room_name,
          room_type,
          daily_room_id,
          daily_room_url,
          enable_cursor_sync,
          status,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, room_name as "roomName", daily_room_url as "roomUrl"
      `, [
        projectId,
        roomName || 'GIS Review Session',
        'gis_review',
        room.name,
        room.url,
        enableCursorSync !== false, // Default true
        'active',
        userId
      ]);

      res.status(201).json({
        room: result.rows[0],
        message: 'GIS review room created. Team can collaborate on map data with video + cursor sync.'
      });
    } catch (error: any) {
      console.error('[GIS] Error creating review room:', error);
      res.status(500).json({ error: 'Failed to create GIS review room' });
    }
  });

  /**
   * GET /api/gis/projects/:projectId/review-rooms
   * Get active GIS review rooms for a project
   */
  router.get('/projects/:projectId/review-rooms', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      const { getDatabasePool } = await import('../database.js');
      const pool = getDatabasePool();
      const result = await pool.query(`
        SELECT 
          id,
          room_name as "roomName",
          daily_room_url as "roomUrl",
          enable_cursor_sync as "enableCursorSync",
          status,
          created_at as "createdAt"
        FROM collaboration_rooms
        WHERE project_id = $1
          AND room_type = 'gis_review'
          AND status = 'active'
        ORDER BY created_at DESC
      `, [projectId]);

      res.json(result.rows);
    } catch (error: any) {
      console.error('[GIS] Error fetching review rooms:', error);
      res.status(500).json({ error: 'Failed to fetch GIS review rooms' });
    }
  });

  return router;
}

