/**
 * Database Connection Module
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Pool, QueryResult } from 'pg';
import { loadEnv } from './worker/env';

const env = loadEnv();

// Lazy pool initialization to prevent crashes on missing DATABASE_URL
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured - database operations unavailable');
    }
    
    pool = new Pool({ 
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

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[], rowCount: number }> {
  const result: QueryResult = await getPool().query(text, params);
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? 0
  };
}

// Export getter function instead of direct pool reference
export function getDatabasePool(): Pool {
  return getPool();
}

// Default export for backward compatibility
export default getPool();
