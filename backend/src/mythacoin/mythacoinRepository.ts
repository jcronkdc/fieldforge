import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

export interface MythacoinTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MythacoinSummary {
  balance: number;
  transactions: MythacoinTransaction[];
}

// Alias for compatibility with creative engines
export const recordTransaction = recordMythacoinTransaction;

export async function recordMythacoinTransaction(input: {
  userId: string;
  amount: number;
  transactionType: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<MythacoinTransaction> {
  const { userId, amount, transactionType, description, metadata } = input;

  const result = await pool.query(
    `
      insert into public.mythacoin_transactions (user_id, amount, transaction_type, description, metadata)
      values ($1, $2, $3, $4, $5)
      returning *
    `,
    [userId, amount, transactionType, description ?? null, metadata ?? {}]
  );

  return mapTransactionRow(result.rows[0]);
}

export async function fetchMythacoinSummary(userId: string, limit = 10): Promise<MythacoinSummary> {
  const [balanceResult, transactionsResult] = await Promise.all([
    pool.query(`select coalesce(sum(amount), 0) as balance from public.mythacoin_transactions where user_id = $1`, [userId]),
    pool.query(
      `
        select *
        from public.mythacoin_transactions
        where user_id = $1
        order by created_at desc
        limit $2
      `,
      [userId, Math.max(1, Math.min(limit, 50))]
    ),
  ]);

  const balance = Number(balanceResult.rows[0]?.balance ?? 0);
  const transactions = transactionsResult.rows.map(mapTransactionRow);

  return { balance, transactions };
}

export async function fetchMythacoinTransactions(userId: string, limit = 25, offset = 0): Promise<MythacoinTransaction[]> {
  const { rows } = await pool.query(
    `
      select *
      from public.mythacoin_transactions
      where user_id = $1
      order by created_at desc
      limit $2 offset $3
    `,
    [userId, Math.max(1, Math.min(limit, 100)), Math.max(0, offset)]
  );

  return rows.map(mapTransactionRow);
}

function mapTransactionRow(row: any): MythacoinTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount ?? 0),
    transactionType: row.transaction_type,
    description: row.description ?? null,
    metadata: row.metadata ?? {},
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}


