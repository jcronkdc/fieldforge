/**
 * Database Migration Runner
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Runs SQL migration files in order from the migrations directory.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { query } from '../database.js';
import { loadEnv } from '../worker/env.js';

const env = loadEnv();
const migrationsDir = join(process.cwd(), 'migrations');

interface MigrationRecord {
  id: string;
  name: string;
  executed_at: Date;
}

async function getExecutedMigrations(): Promise<Set<string>> {
  try {
    // Check if migrations table exists
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await query<MigrationRecord>('SELECT name FROM schema_migrations ORDER BY executed_at');
    return new Set(result.rows.map(m => m.name));
  } catch (error) {
    console.error('Error checking executed migrations:', error);
    return new Set();
  }
}

async function recordMigration(name: string): Promise<void> {
  await query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
}

async function runMigrations(): Promise<void> {
  console.log('🔄 Starting database migrations...');
  console.log(`📁 Migrations directory: ${migrationsDir}`);

  try {
    const executedMigrations = await getExecutedMigrations();
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort()
      .filter(f => !executedMigrations.has(f));

    if (migrationFiles.length === 0) {
      console.log('✅ All migrations are already executed.');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} new migration(s) to run`);

    for (const file of migrationFiles) {
      console.log(`\n▶️  Running migration: ${file}`);
      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf-8');

      try {
        await query(sql);
        await recordMigration(file);
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`❌ Error running migration ${file}:`, error);
        throw error;
      }
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module || process.argv[1]?.endsWith('runMigrations.ts') || process.argv[1]?.endsWith('runMigrations.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runMigrations };

