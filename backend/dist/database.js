"use strict";
/**
 * Database Connection Module
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getDatabasePool = getDatabasePool;
const pg_1 = require("pg");
const env_1 = require("./worker/env");
const env = (0, env_1.loadEnv)();
// Lazy pool initialization to prevent crashes on missing DATABASE_URL
let pool = null;
function getPool() {
    if (!pool) {
        if (!env.DATABASE_URL) {
            throw new Error('DATABASE_URL not configured - database operations unavailable');
        }
        pool = new pg_1.Pool({
            connectionString: env.DATABASE_URL,
            // Connection pool settings
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
        });
        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle database client', err);
            if (process.env.NODE_ENV === 'production') {
                process.exit(-1);
            }
        });
    }
    return pool;
}
async function query(text, params) {
    const result = await getPool().query(text, params);
    return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0
    };
}
// Export getter function instead of direct pool reference
function getDatabasePool() {
    return getPool();
}
// Default export for backward compatibility
exports.default = getPool();
