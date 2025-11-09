/**
 * Database Connection and Management
 * Versioned PostgreSQL with TimescaleDB for time-series data
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { migrate } from './migrations';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'songforge',
  user: process.env.DB_USER || 'songforge_user',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

// Create connection pool
const pool = new Pool(dbConfig);

// Kysely instance for type-safe queries
const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool
  })
});

// Database types
export interface Database {
  songs: SongsTable;
  song_sections: SongSectionsTable;
  lyrics: LyricsTable;
  melodies: MelodiesTable;
  collaboration_sessions: CollaborationSessionsTable;
  session_collaborators: SessionCollaboratorsTable;
  edit_history: EditHistoryTable;
  remixes: RemixesTable;
  remix_lineage: RemixLineageTable;
  pricing_tiers: PricingTiersTable;
  feature_costs: FeatureCostsTable;
  usage_tracking: UsageTrackingTable;
  revenue_tracking: RevenueTrackingTable;
  profitability_metrics: ProfitabilityMetricsTable;
  spark_balances: SparkBalancesTable;
  spark_transactions: SparkTransactionsTable;
  notifications: NotificationsTable;
  activity_feed: ActivityFeedTable;
  private_vaults: PrivateVaultsTable;
  vault_members: VaultMembersTable;
  collaboration_groups: CollaborationGroupsTable;
}

// Table interfaces
interface SongsTable {
  id: string;
  user_id: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived';
  genre?: string;
  tempo?: number;
  key?: string;
  time_signature?: string;
  mood?: string;
  mask_id?: string;
  tone_profile?: any;
  metadata?: any;
  version: number;
  parent_version_id?: string;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  deleted_at?: Date;
  profit_tier: 'free' | 'creator' | 'pro' | 'studio';
  compute_cost: number;
  revenue_generated: number;
  play_count: number;
  like_count: number;
  share_count: number;
  remix_count: number;
}

interface SongSectionsTable {
  id: string;
  song_id: string;
  section_type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'pre_chorus' | 'post_chorus' | 'instrumental' | 'custom';
  order_index: number;
  name?: string;
  duration_ms?: number;
  repeat_count: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

interface LyricsTable {
  id: string;
  song_id: string;
  section_id?: string;
  line_number: number;
  text: string;
  syllable_count?: number;
  rhyme_scheme?: string;
  emphasis_pattern?: string;
  timing_ms?: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

interface MelodiesTable {
  id: string;
  song_id: string;
  section_id?: string;
  segment_index: number;
  pitch_sequence: any;
  rhythm_pattern: any;
  chord_progression?: string;
  dynamics?: any;
  articulation?: any;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

interface CollaborationSessionsTable {
  id: string;
  song_id: string;
  host_id: string;
  session_code?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  max_collaborators: number;
  allow_spectators: boolean;
  auto_save: boolean;
  require_approval: boolean;
  conflict_resolution: string;
  version_interval: number;
  current_version: number;
  started_at: Date;
  ended_at?: Date;
  metadata?: any;
}

interface SessionCollaboratorsTable {
  id: string;
  session_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'spectator';
  permissions: any;
  color?: string;
  joined_at: Date;
  left_at?: Date;
  is_active: boolean;
  edit_count: number;
}

interface EditHistoryTable {
  id: string;
  session_id?: string;
  song_id: string;
  user_id: string;
  action_type: string;
  target_type: string;
  target_id?: string;
  operation: 'add' | 'update' | 'delete' | 'move';
  previous_value?: any;
  new_value?: any;
  version?: number;
  timestamp: Date;
}

interface RemixesTable {
  id: string;
  original_song_id: string;
  remix_song_id: string;
  remixer_id: string;
  status: 'draft' | 'in_progress' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  allow_further_remix: boolean;
  credit_original: boolean;
  split_revenue: boolean;
  revenue_share: number;
  lineage_depth: number;
  created_at: Date;
  published_at?: Date;
  play_count: number;
  like_count: number;
  share_count: number;
  further_remix_count: number;
}

interface RemixLineageTable {
  id: string;
  remix_id: string;
  ancestor_song_id: string;
  generation: number;
  path_to_ancestor: string[];
  created_at: Date;
}

interface PricingTiersTable {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  features: any;
  limits: any;
  margin: number;
  cvi?: number;
  churn_rate?: number;
  user_count: number;
  created_at: Date;
  updated_at: Date;
}

interface FeatureCostsTable {
  id: string;
  feature_id: string;
  feature_name: string;
  base_cost: number;
  token_cost?: number;
  compute_cost?: number;
  storage_cost?: number;
  bandwidth_cost?: number;
  overhead_allocation: number;
  last_calculated: Date;
}

interface UsageTrackingTable {
  time: Date;
  user_id: string;
  feature_id: string;
  tier_id?: string;
  usage_count: number;
  tokens_used?: number;
  compute_hours?: number;
  storage_gb?: number;
  bandwidth_gb?: number;
  cost?: number;
  revenue?: number;
  margin?: number;
}

interface RevenueTrackingTable {
  time: Date;
  user_id: string;
  source: string;
  amount: number;
  currency: string;
  tier_id?: string;
  transaction_id?: string;
  metadata?: any;
}

interface ProfitabilityMetricsTable {
  time: Date;
  metric_type: string;
  tier_id?: string;
  value: number;
  target_value?: number;
  variance?: number;
  metadata?: any;
}

interface SparkBalancesTable {
  user_id: string;
  available: number;
  pending: number;
  lifetime: number;
  tier?: string;
  last_updated: Date;
}

interface SparkTransactionsTable {
  id: string;
  user_id: string;
  type: 'earned' | 'spent' | 'bonus' | 'refund' | 'purchase';
  amount: number;
  balance_after: number;
  source: string;
  description?: string;
  metadata?: any;
  timestamp: Date;
}

interface NotificationsTable {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_label?: string;
  metadata?: any;
  read: boolean;
  read_at?: Date;
  created_at: Date;
  expires_at?: Date;
}

interface ActivityFeedTable {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  entity_id?: string;
  entity_type?: string;
  actors?: any;
  metadata?: any;
  read: boolean;
  archived: boolean;
  timestamp: Date;
}

interface PrivateVaultsTable {
  id: string;
  name: string;
  owner_id: string;
  max_members: number;
  require_invite: boolean;
  allow_export: boolean;
  encrypt_content: boolean;
  created_at: Date;
}

interface VaultMembersTable {
  vault_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
  joined_at: Date;
  invited_by?: string;
}

interface CollaborationGroupsTable {
  id: string;
  name: string;
  creator_id: string;
  max_members: number;
  allow_remix: boolean;
  share_revenue: boolean;
  visibility: string;
  require_invite: boolean;
  created_at: Date;
}

/**
 * Database connection manager
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize database connection and run migrations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test connection
      await pool.query('SELECT 1');
      console.log('✅ Database connected successfully');

      // Run migrations
      await this.runMigrations();

      // Initialize TimescaleDB
      await this.initializeTimescaleDB();

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    try {
      await migrate(db);
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Initialize TimescaleDB extensions
   */
  private async initializeTimescaleDB(): Promise<void> {
    const client = await pool.connect();
    try {
      // Enable TimescaleDB
      await client.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE');
      
      // Create hypertables for time-series data
      const hypertables = [
        'usage_tracking',
        'revenue_tracking',
        'profitability_metrics'
      ];

      for (const table of hypertables) {
        try {
          await client.query(`SELECT create_hypertable('${table}', 'time', if_not_exists => TRUE)`);
        } catch (error: any) {
          if (!error.message.includes('already a hypertable')) {
            throw error;
          }
        }
      }

      console.log('✅ TimescaleDB initialized successfully');
    } finally {
      client.release();
    }
  }

  /**
   * Get database connection pool
   */
  getPool(): Pool {
    return pool;
  }

  /**
   * Get Kysely query builder
   */
  getQueryBuilder(): Kysely<Database> {
    return db;
  }

  /**
   * Execute a query
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return pool.connect();
  }

  /**
   * Begin a transaction
   */
  async beginTransaction(client: PoolClient): Promise<void> {
    await client.query('BEGIN');
  }

  /**
   * Commit a transaction
   */
  async commitTransaction(client: PoolClient): Promise<void> {
    await client.query('COMMIT');
  }

  /**
   * Rollback a transaction
   */
  async rollbackTransaction(client: PoolClient): Promise<void> {
    await client.query('ROLLBACK');
  }

  /**
   * Execute a transaction with automatic rollback on error
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await this.beginTransaction(client);
      const result = await callback(client);
      await this.commitTransaction(client);
      return result;
    } catch (error) {
      await this.rollbackTransaction(client);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    await pool.end();
    console.log('✅ Database connections closed');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT 1');
      return result.rows.length === 1;
    } catch {
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    const stats = {
      pool: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      },
      database: {}
    };

    // Get database size
    const sizeResult = await pool.query(`
      SELECT pg_database_size(current_database()) as size
    `);
    stats.database.size = sizeResult.rows[0].size;

    // Get table sizes
    const tableResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `);
    stats.database.tables = tableResult.rows;

    return stats;
  }
}

// Export singleton instance
export const database = DatabaseConnection.getInstance();

// Export query builder
export { db };

// Export types
export type { Database };

// Helper functions
export async function withTransaction<T>(
  callback: (trx: Kysely<Database>) => Promise<T>
): Promise<T> {
  return db.transaction().execute(callback);
}

export async function trackUsage(
  userId: string,
  featureId: string,
  cost: number,
  metadata?: any
): Promise<void> {
  await db.insertInto('usage_tracking').values({
    time: new Date(),
    user_id: userId,
    feature_id: featureId,
    usage_count: 1,
    cost,
    margin: 0.65 // Default target margin
  }).execute();
}

export async function trackRevenue(
  userId: string,
  source: string,
  amount: number,
  metadata?: any
): Promise<void> {
  await db.insertInto('revenue_tracking').values({
    time: new Date(),
    user_id: userId,
    source,
    amount,
    currency: 'USD',
    metadata
  }).execute();
}

export async function recordProfitabilityMetric(
  metricType: string,
  value: number,
  targetValue?: number,
  metadata?: any
): Promise<void> {
  await db.insertInto('profitability_metrics').values({
    time: new Date(),
    metric_type: metricType,
    value,
    target_value: targetValue,
    variance: targetValue ? Math.abs(value - targetValue) : undefined,
    metadata
  }).execute();
}
