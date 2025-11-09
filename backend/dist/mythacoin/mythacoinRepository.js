"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordTransaction = void 0;
exports.recordMythacoinTransaction = recordMythacoinTransaction;
exports.fetchMythacoinSummary = fetchMythacoinSummary;
exports.fetchMythacoinTransactions = fetchMythacoinTransactions;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
// Alias for compatibility with creative engines
exports.recordTransaction = recordMythacoinTransaction;
async function recordMythacoinTransaction(input) {
    const { userId, amount, transactionType, description, metadata } = input;
    const result = await pool.query(`
      insert into public.mythacoin_transactions (user_id, amount, transaction_type, description, metadata)
      values ($1, $2, $3, $4, $5)
      returning *
    `, [userId, amount, transactionType, description ?? null, metadata ?? {}]);
    return mapTransactionRow(result.rows[0]);
}
async function fetchMythacoinSummary(userId, limit = 10) {
    const [balanceResult, transactionsResult] = await Promise.all([
        pool.query(`select coalesce(sum(amount), 0) as balance from public.mythacoin_transactions where user_id = $1`, [userId]),
        pool.query(`
        select *
        from public.mythacoin_transactions
        where user_id = $1
        order by created_at desc
        limit $2
      `, [userId, Math.max(1, Math.min(limit, 50))]),
    ]);
    const balance = Number(balanceResult.rows[0]?.balance ?? 0);
    const transactions = transactionsResult.rows.map(mapTransactionRow);
    return { balance, transactions };
}
async function fetchMythacoinTransactions(userId, limit = 25, offset = 0) {
    const { rows } = await pool.query(`
      select *
      from public.mythacoin_transactions
      where user_id = $1
      order by created_at desc
      limit $2 offset $3
    `, [userId, Math.max(1, Math.min(limit, 100)), Math.max(0, offset)]);
    return rows.map(mapTransactionRow);
}
function mapTransactionRow(row) {
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
