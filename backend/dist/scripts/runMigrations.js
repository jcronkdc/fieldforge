"use strict";
/**
 * Database Migration Runner
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 *
 * Runs SQL migration files in order from the migrations directory.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const database_js_1 = require("../database.js");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const migrationsDir = (0, path_1.join)(process.cwd(), 'migrations');
async function getExecutedMigrations() {
    try {
        // Check if migrations table exists
        await (0, database_js_1.query)(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        const result = await (0, database_js_1.query)('SELECT name FROM schema_migrations ORDER BY executed_at');
        return new Set(result.rows.map(m => m.name));
    }
    catch (error) {
        console.error('Error checking executed migrations:', error);
        return new Set();
    }
}
async function recordMigration(name) {
    await (0, database_js_1.query)('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
}
async function runMigrations() {
    console.log('🔄 Starting database migrations...');
    console.log(`📁 Migrations directory: ${migrationsDir}`);
    try {
        const executedMigrations = await getExecutedMigrations();
        const files = await (0, promises_1.readdir)(migrationsDir);
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
            const filePath = (0, path_1.join)(migrationsDir, file);
            const sql = await (0, promises_1.readFile)(filePath, 'utf-8');
            try {
                await (0, database_js_1.query)(sql);
                await recordMigration(file);
                console.log(`✅ Migration ${file} completed successfully`);
            }
            catch (error) {
                console.error(`❌ Error running migration ${file}:`, error);
                throw error;
            }
        }
        console.log('\n✅ All migrations completed successfully!');
    }
    catch (error) {
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
