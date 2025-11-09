/**
 * Database Connection Module
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Pool, QueryResult } from 'pg';
import { loadEnv } from './worker/env';

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[], rowCount: number }> {
  const result: QueryResult = await pool.query(text, params);
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? 0
  };
}

export default pool;
