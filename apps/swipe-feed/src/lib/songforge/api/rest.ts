/**
 * SongForge REST API
 * RESTful endpoints for song operations, collaboration, and profitability
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { database, db } from '../database/connection';
import { songStructureEngine } from '../songStructureEngine';
import { lyricMelodyEngine } from '../lyricMelodyEngine';
import { collaborationEngine } from '../collaborationEngine';
import { profitabilityEngine } from '../profitabilityEngine';
import { dashboardEngine } from '../dashboardEngine';
import { sparkIntegration } from '../sparkIntegration';
import type { Song, CollaborationSession, Remix } from '../types';

const router = Router();

// Middleware for validation errors
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Authentication middleware (placeholder)
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Validate token and set user
  req.user = { id: 'user_123' }; // Placeholder
  next();
};

// Rate limiting middleware
const rateLimit = (limit: number, window: number) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: window / 1000 
      });
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    next();
  };
};

// =====================================================
// SONG ENDPOINTS
// =====================================================

/**
 * GET /api/songs
 * List user's songs with pagination and filters
 */
router.get('/songs',
  authenticate,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'in_progress', 'completed', 'published', 'archived']),
  query('genre').optional().isString(),
  query('sort').optional().isIn(['created', 'updated', 'title', 'plays']),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      let query = db.selectFrom('songs')
        .where('user_id', '=', req.user.id)
        .where('deleted_at', 'is', null);
      
      if (req.query.status) {
        query = query.where('status', '=', req.query.status as any);
      }
      if (req.query.genre) {
        query = query.where('genre', '=', req.query.genre as string);
      }
      
      // Apply sorting
      const sortField = req.query.sort as string || 'created';
      const sortMap: Record<string, string> = {
        'created': 'created_at',
        'updated': 'updated_at',
        'title': 'title',
        'plays': 'play_count'
      };
      query = query.orderBy(sortMap[sortField], 'desc');
      
      // Execute query with pagination
      const [songs, totalResult] = await Promise.all([
        query.limit(limit).offset(offset).selectAll().execute(),
        db.selectFrom('songs')
          .where('user_id', '=', req.user.id)
          .where('deleted_at', 'is', null)
          .select(db.fn.count('id').as('count'))
          .executeTakeFirst()
      ]);
      
      const total = Number(totalResult?.count || 0);
      
      res.json({
        songs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching songs:', error);
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  }
);

/**
 * POST /api/songs
 * Create a new song
 */
router.post('/songs',
  authenticate,
  rateLimit(10, 60000), // 10 requests per minute
  body('title').notEmpty().isString().isLength({ max: 255 }),
  body('genre').optional().isString(),
  body('tempo').optional().isInt({ min: 40, max: 240 }),
  body('key').optional().isString(),
  body('mood').optional().isString(),
  body('maskId').optional().isString(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check Spark balance for song creation
      const sparkCost = await sparkIntegration.calculateSparkCost('song_creation');
      if (!await sparkIntegration.canAfford(req.user.id, sparkCost)) {
        return res.status(402).json({ 
          error: 'Insufficient Sparks',
          required: sparkCost 
        });
      }
      
      // Create song using engine
      const song = await songStructureEngine.createSong({
        title: req.body.title,
        genre: req.body.genre,
        tempo: req.body.tempo,
        key: req.body.key,
        mood: req.body.mood,
        maskId: req.body.maskId
      });
      
      // Save to database
      const [savedSong] = await db.insertInto('songs')
        .values({
          id: song.id,
          user_id: req.user.id,
          title: song.metadata.title,
          status: 'draft',
          genre: song.metadata.genre,
          tempo: song.metadata.tempo,
          key: song.metadata.key,
          mood: song.metadata.mood,
          mask_id: req.body.maskId,
          metadata: song.metadata,
          version: 1,
          profit_tier: 'free',
          compute_cost: 0,
          revenue_generated: 0,
          play_count: 0,
          like_count: 0,
          share_count: 0,
          remix_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .execute();
      
      // Deduct Sparks
      await sparkIntegration.deductSparks(req.user.id, sparkCost, 'song_creation', { songId: song.id });
      
      // Track usage for profitability
      await database.trackUsage(req.user.id, 'song_creation', sparkCost);
      
      res.status(201).json({ song: savedSong, sparkCost });
    } catch (error) {
      console.error('Error creating song:', error);
      res.status(500).json({ error: 'Failed to create song' });
    }
  }
);

/**
 * GET /api/songs/:id
 * Get a specific song
 */
router.get('/songs/:id',
  authenticate,
  param('id').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const song = await db.selectFrom('songs')
        .where('id', '=', req.params.id)
        .where('user_id', '=', req.user.id)
        .selectAll()
        .executeTakeFirst();
      
      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }
      
      // Get sections, lyrics, and melody
      const [sections, lyrics, melodies] = await Promise.all([
        db.selectFrom('song_sections')
          .where('song_id', '=', req.params.id)
          .orderBy('order_index', 'asc')
          .selectAll()
          .execute(),
        db.selectFrom('lyrics')
          .where('song_id', '=', req.params.id)
          .orderBy('line_number', 'asc')
          .selectAll()
          .execute(),
        db.selectFrom('melodies')
          .where('song_id', '=', req.params.id)
          .orderBy('segment_index', 'asc')
          .selectAll()
          .execute()
      ]);
      
      res.json({
        ...song,
        sections,
        lyrics,
        melodies
      });
    } catch (error) {
      console.error('Error fetching song:', error);
      res.status(500).json({ error: 'Failed to fetch song' });
    }
  }
);

/**
 * PUT /api/songs/:id
 * Update a song
 */
router.put('/songs/:id',
  authenticate,
  param('id').isUUID(),
  body('title').optional().isString().isLength({ max: 255 }),
  body('status').optional().isIn(['draft', 'in_progress', 'completed', 'published']),
  body('genre').optional().isString(),
  body('tempo').optional().isInt({ min: 40, max: 240 }),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const updates: any = {
        updated_at: new Date()
      };
      
      // Add allowed updates
      ['title', 'status', 'genre', 'tempo', 'key', 'mood'].forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      // Update published_at if publishing
      if (req.body.status === 'published') {
        updates.published_at = new Date();
      }
      
      const [updatedSong] = await db.updateTable('songs')
        .set(updates)
        .where('id', '=', req.params.id)
        .where('user_id', '=', req.user.id)
        .returningAll()
        .execute();
      
      if (!updatedSong) {
        return res.status(404).json({ error: 'Song not found' });
      }
      
      res.json(updatedSong);
    } catch (error) {
      console.error('Error updating song:', error);
      res.status(500).json({ error: 'Failed to update song' });
    }
  }
);

/**
 * DELETE /api/songs/:id
 * Soft delete a song
 */
router.delete('/songs/:id',
  authenticate,
  param('id').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const [deletedSong] = await db.updateTable('songs')
        .set({ deleted_at: new Date() })
        .where('id', '=', req.params.id)
        .where('user_id', '=', req.user.id)
        .returningAll()
        .execute();
      
      if (!deletedSong) {
        return res.status(404).json({ error: 'Song not found' });
      }
      
      res.json({ message: 'Song deleted successfully' });
    } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).json({ error: 'Failed to delete song' });
    }
  }
);

// =====================================================
// AI GENERATION ENDPOINTS
// =====================================================

/**
 * POST /api/songs/:id/generate-lyrics
 * Generate lyrics for a song section
 */
router.post('/songs/:id/generate-lyrics',
  authenticate,
  rateLimit(20, 60000), // 20 requests per minute
  param('id').isUUID(),
  body('sectionId').optional().isUUID(),
  body('prompt').optional().isString(),
  body('style').optional().isString(),
  body('mood').optional().isString(),
  body('maskId').optional().isString(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check Spark balance
      const sparkCost = await sparkIntegration.calculateSparkCost('ai_generation', { 
        quality: req.body.quality || 'standard' 
      });
      
      if (!await sparkIntegration.canAfford(req.user.id, sparkCost)) {
        return res.status(402).json({ 
          error: 'Insufficient Sparks',
          required: sparkCost 
        });
      }
      
      // Generate lyrics
      const lyrics = await lyricMelodyEngine.generateLyrics({
        songId: req.params.id,
        sectionId: req.body.sectionId,
        prompt: req.body.prompt,
        style: req.body.style,
        mood: req.body.mood,
        maskId: req.body.maskId
      });
      
      // Save lyrics to database
      const savedLyrics = [];
      for (const lyric of lyrics) {
        const [saved] = await db.insertInto('lyrics')
          .values({
            id: lyric.id,
            song_id: req.params.id,
            section_id: req.body.sectionId,
            line_number: lyric.lineNumber,
            text: lyric.text,
            syllable_count: lyric.syllableCount,
            rhyme_scheme: lyric.rhymeScheme,
            emphasis_pattern: lyric.emphasisPattern,
            metadata: lyric.metadata,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returningAll()
          .execute();
        savedLyrics.push(saved);
      }
      
      // Deduct Sparks
      await sparkIntegration.deductSparks(req.user.id, sparkCost, 'lyric_generation', { 
        songId: req.params.id 
      });
      
      // Track usage
      await database.trackUsage(req.user.id, 'lyric_generation', sparkCost);
      
      res.json({ lyrics: savedLyrics, sparkCost });
    } catch (error) {
      console.error('Error generating lyrics:', error);
      res.status(500).json({ error: 'Failed to generate lyrics' });
    }
  }
);

/**
 * POST /api/songs/:id/generate-melody
 * Generate melody for a song section
 */
router.post('/songs/:id/generate-melody',
  authenticate,
  rateLimit(20, 60000),
  param('id').isUUID(),
  body('sectionId').optional().isUUID(),
  body('style').optional().isString(),
  body('tempo').optional().isInt({ min: 40, max: 240 }),
  body('key').optional().isString(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check Spark balance
      const sparkCost = await sparkIntegration.calculateSparkCost('ai_generation', {
        quality: req.body.quality || 'standard'
      });
      
      if (!await sparkIntegration.canAfford(req.user.id, sparkCost)) {
        return res.status(402).json({ 
          error: 'Insufficient Sparks',
          required: sparkCost 
        });
      }
      
      // Generate melody
      const melody = await lyricMelodyEngine.generateMelody({
        songId: req.params.id,
        sectionId: req.body.sectionId,
        style: req.body.style,
        tempo: req.body.tempo,
        key: req.body.key
      });
      
      // Save melody to database
      const [savedMelody] = await db.insertInto('melodies')
        .values({
          id: melody.id,
          song_id: req.params.id,
          section_id: req.body.sectionId,
          segment_index: melody.segmentIndex,
          pitch_sequence: melody.pitchSequence,
          rhythm_pattern: melody.rhythmPattern,
          chord_progression: melody.chordProgression,
          dynamics: melody.dynamics,
          articulation: melody.articulation,
          metadata: melody.metadata,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .execute();
      
      // Deduct Sparks
      await sparkIntegration.deductSparks(req.user.id, sparkCost, 'melody_generation', {
        songId: req.params.id
      });
      
      // Track usage
      await database.trackUsage(req.user.id, 'melody_generation', sparkCost);
      
      res.json({ melody: savedMelody, sparkCost });
    } catch (error) {
      console.error('Error generating melody:', error);
      res.status(500).json({ error: 'Failed to generate melody' });
    }
  }
);

// =====================================================
// COLLABORATION ENDPOINTS
// =====================================================

/**
 * POST /api/collaborations
 * Create a new collaboration session
 */
router.post('/collaborations',
  authenticate,
  body('songId').isUUID(),
  body('maxCollaborators').optional().isInt({ min: 1, max: 50 }),
  body('allowSpectators').optional().isBoolean(),
  body('requireApproval').optional().isBoolean(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const session = await collaborationEngine.createSession(
        req.body.songId,
        req.user.id,
        {
          maxCollaborators: req.body.maxCollaborators,
          allowSpectators: req.body.allowSpectators,
          requireApproval: req.body.requireApproval
        }
      );
      
      // Save to database
      await db.insertInto('collaboration_sessions')
        .values({
          id: session.id,
          song_id: req.body.songId,
          host_id: req.user.id,
          session_code: session.id.substr(-8), // Last 8 chars as code
          status: 'active',
          max_collaborators: session.settings.maxCollaborators,
          allow_spectators: session.settings.allowSpectators,
          auto_save: session.settings.autoSave,
          require_approval: session.settings.requireApproval,
          conflict_resolution: session.settings.conflictResolution,
          version_interval: session.settings.versionInterval,
          current_version: session.currentVersion,
          started_at: new Date()
        })
        .execute();
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating collaboration:', error);
      res.status(500).json({ error: 'Failed to create collaboration session' });
    }
  }
);

/**
 * POST /api/collaborations/:id/join
 * Join a collaboration session
 */
router.post('/collaborations/:id/join',
  authenticate,
  param('id').isString(),
  body('inviteCode').optional().isString(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const session = await collaborationEngine.joinSession(
        req.params.id,
        req.user.id,
        req.body.inviteCode
      );
      
      res.json(session);
    } catch (error: any) {
      console.error('Error joining collaboration:', error);
      res.status(error.message.includes('not found') ? 404 : 400)
        .json({ error: error.message });
    }
  }
);

// =====================================================
// REMIX ENDPOINTS
// =====================================================

/**
 * POST /api/remixes
 * Create a remix of a song
 */
router.post('/remixes',
  authenticate,
  body('originalSongId').isUUID(),
  body('visibility').optional().isIn(['public', 'private', 'unlisted']),
  body('allowFurtherRemix').optional().isBoolean(),
  body('splitRevenue').optional().isBoolean(),
  body('revenueShare').optional().isFloat({ min: 0, max: 1 }),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check Spark balance
      const sparkCost = await sparkIntegration.calculateSparkCost('remix_creation');
      
      if (!await sparkIntegration.canAfford(req.user.id, sparkCost)) {
        return res.status(402).json({ 
          error: 'Insufficient Sparks',
          required: sparkCost 
        });
      }
      
      const remix = await collaborationEngine.createRemix(
        req.body.originalSongId,
        req.user.id,
        {
          visibility: req.body.visibility,
          allowFurtherRemix: req.body.allowFurtherRemix,
          creditOriginal: true,
          splitRevenue: req.body.splitRevenue,
          revenueShare: req.body.revenueShare
        }
      );
      
      // Deduct Sparks
      await sparkIntegration.deductSparks(req.user.id, sparkCost, 'remix_creation', {
        remixId: remix.id
      });
      
      res.status(201).json({ remix, sparkCost });
    } catch (error) {
      console.error('Error creating remix:', error);
      res.status(500).json({ error: 'Failed to create remix' });
    }
  }
);

/**
 * GET /api/remixes/feed
 * Get public remix feed
 */
router.get('/remixes/feed',
  query('genre').optional().isString(),
  query('timeRange').optional().isIn(['day', 'week', 'month', 'all']),
  query('sortBy').optional().isIn(['trending', 'recent', 'popular']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const feed = await collaborationEngine.getPublicRemixFeed({
        genre: req.query.genre as string,
        timeRange: req.query.timeRange as any,
        sortBy: req.query.sortBy as any,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      });
      
      res.json(feed);
    } catch (error) {
      console.error('Error fetching remix feed:', error);
      res.status(500).json({ error: 'Failed to fetch remix feed' });
    }
  }
);

// =====================================================
// DASHBOARD ENDPOINTS
// =====================================================

/**
 * GET /api/dashboard
 * Get user dashboard data
 */
router.get('/dashboard',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const dashboard = await dashboardEngine.getDashboard(req.user.id);
      res.json(dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }
);

/**
 * GET /api/dashboard/revenue
 * Get revenue analytics
 */
router.get('/dashboard/revenue',
  authenticate,
  query('days').optional().isInt({ min: 1, max: 365 }),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const [snapshot, history, projections] = await Promise.all([
        dashboardEngine.updateRevenueSnapshot(req.user.id),
        dashboardEngine.getRevenueHistory(req.user.id, days),
        dashboardEngine.getRevenueProjections(req.user.id)
      ]);
      
      res.json({
        current: snapshot,
        history,
        projections
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
  }
);

// =====================================================
// SPARK ENDPOINTS
// =====================================================

/**
 * GET /api/sparks/balance
 * Get user's Spark balance
 */
router.get('/sparks/balance',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const balance = await db.selectFrom('spark_balances')
        .where('user_id', '=', req.user.id)
        .selectAll()
        .executeTakeFirst();
      
      if (!balance) {
        // Create initial balance
        const newBalance = {
          user_id: req.user.id,
          available: 100, // Initial free Sparks
          pending: 0,
          lifetime: 100,
          last_updated: new Date()
        };
        
        await db.insertInto('spark_balances')
          .values(newBalance)
          .execute();
        
        return res.json(newBalance);
      }
      
      res.json(balance);
    } catch (error) {
      console.error('Error fetching Spark balance:', error);
      res.status(500).json({ error: 'Failed to fetch Spark balance' });
    }
  }
);

/**
 * POST /api/sparks/purchase
 * Purchase Sparks
 */
router.post('/sparks/purchase',
  authenticate,
  body('packageId').isString(),
  body('paymentMethod').isString(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const result = await sparkIntegration.purchaseSparks(
        req.user.id,
        req.body.packageId,
        req.body.paymentMethod
      );
      
      if (!result.success) {
        return res.status(400).json({ error: 'Purchase failed' });
      }
      
      // Track revenue
      const sparkPackage = await db.selectFrom('spark_packages')
        .where('id', '=', req.body.packageId)
        .selectAll()
        .executeTakeFirst();
      
      if (sparkPackage) {
        await database.trackRevenue(
          req.user.id,
          'spark_purchase',
          sparkPackage.price,
          { packageId: req.body.packageId }
        );
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error purchasing Sparks:', error);
      res.status(500).json({ error: 'Failed to purchase Sparks' });
    }
  }
);

// =====================================================
// PROFITABILITY ENDPOINTS
// =====================================================

/**
 * GET /api/profitability/report
 * Get profitability report (admin only)
 */
router.get('/profitability/report',
  authenticate,
  // Add admin check middleware here
  async (req: Request, res: Response) => {
    try {
      const report = await profitabilityEngine.generateProfitabilityReport();
      res.json(report);
    } catch (error) {
      console.error('Error generating profitability report:', error);
      res.status(500).json({ error: 'Failed to generate profitability report' });
    }
  }
);

/**
 * GET /api/profitability/metrics
 * Get current profitability metrics
 */
router.get('/profitability/metrics',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const metrics = await db.selectFrom('profitability_metrics')
        .where('time', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        .orderBy('time', 'desc')
        .limit(100)
        .selectAll()
        .execute();
      
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching profitability metrics:', error);
      res.status(500).json({ error: 'Failed to fetch profitability metrics' });
    }
  }
);

// =====================================================
// HEALTH CHECK
// =====================================================

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await database.healthCheck();
    const stats = await database.getStats();
    
    res.json({
      status: dbHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      stats
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Service unavailable'
    });
  }
});

// Export router
export default router;

// Export for testing
export { authenticate, rateLimit, handleValidationErrors };
