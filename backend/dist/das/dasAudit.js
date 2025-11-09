"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDasAuditEntry = createDasAuditEntry;
exports.verifyAuditChain = verifyAuditChain;
exports.getAuditLog = getAuditLog;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
async function query(text, params) {
    return pool.query(text, params);
}
const crypto_1 = require("crypto");
async function createDasAuditEntry(data) {
    // Get previous hash for chain
    const previousResult = await query(`SELECT event_hash FROM das_audit_log 
     ORDER BY created_at DESC 
     LIMIT 1`);
    const previousHash = previousResult.rows[0]?.event_hash || '';
    // Create hash input
    const hashInput = [
        previousHash,
        data.eventType,
        data.actorId || '',
        JSON.stringify(data.eventData)
    ].join('');
    // Generate hash
    const currentHash = (0, crypto_1.createHash)('sha256').update(hashInput).digest('hex');
    // Insert audit entry
    const result = await query(`INSERT INTO das_audit_log (
      event_type, event_category, actor_id,
      affected_entity_type, affected_entity_id,
      event_data, event_hash, previous_hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`, [
        data.eventType,
        data.eventCategory,
        data.actorId,
        data.entityType,
        data.entityId,
        JSON.stringify(data.eventData),
        currentHash,
        previousHash
    ]);
    return result.rows[0].id;
}
async function verifyAuditChain(startDate, endDate) {
    let sql = `
    SELECT id, event_hash, previous_hash, event_type, 
           actor_id, event_data, created_at
    FROM das_audit_log
  `;
    const params = [];
    if (startDate && endDate) {
        sql += ` WHERE created_at BETWEEN $1 AND $2`;
        params.push(startDate, endDate);
    }
    sql += ` ORDER BY created_at ASC`;
    const result = await query(sql, params);
    const entries = result.rows;
    const verificationResults = [];
    let isChainValid = true;
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const expectedPreviousHash = i === 0 ? '' : entries[i - 1].event_hash;
        // Verify previous hash matches
        const previousHashValid = entry.previous_hash === expectedPreviousHash;
        // Recalculate hash
        const hashInput = [
            entry.previous_hash || '',
            entry.event_type,
            entry.actor_id || '',
            JSON.stringify(entry.event_data)
        ].join('');
        const calculatedHash = (0, crypto_1.createHash)('sha256').update(hashInput).digest('hex');
        const hashValid = calculatedHash === entry.event_hash;
        verificationResults.push({
            id: entry.id,
            created_at: entry.created_at,
            previousHashValid,
            hashValid,
            isValid: previousHashValid && hashValid
        });
        if (!previousHashValid || !hashValid) {
            isChainValid = false;
        }
    }
    return {
        isChainValid,
        totalEntries: entries.length,
        invalidEntries: verificationResults.filter(r => !r.isValid).length,
        results: verificationResults
    };
}
async function getAuditLog(filters) {
    let sql = `
    SELECT al.*, u.username as actor_username
    FROM das_audit_log al
    LEFT JOIN user_profiles u ON al.actor_id = u.user_id
    WHERE 1=1
  `;
    const params = [];
    let paramIndex = 1;
    if (filters?.eventType) {
        sql += ` AND al.event_type = $${paramIndex++}`;
        params.push(filters.eventType);
    }
    if (filters?.eventCategory) {
        sql += ` AND al.event_category = $${paramIndex++}`;
        params.push(filters.eventCategory);
    }
    if (filters?.actorId) {
        sql += ` AND al.actor_id = $${paramIndex++}`;
        params.push(filters.actorId);
    }
    if (filters?.entityType) {
        sql += ` AND al.affected_entity_type = $${paramIndex++}`;
        params.push(filters.entityType);
    }
    if (filters?.entityId) {
        sql += ` AND al.affected_entity_id = $${paramIndex++}`;
        params.push(filters.entityId);
    }
    if (filters?.startDate && filters?.endDate) {
        sql += ` AND al.created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(filters.startDate, filters.endDate);
    }
    sql += ` ORDER BY al.created_at DESC`;
    if (filters?.limit) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
    }
    const result = await query(sql, params);
    return result.rows;
}
