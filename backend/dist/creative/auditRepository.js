"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuditEvent = recordAuditEvent;
exports.enqueueCoherenceEvent = enqueueCoherenceEvent;
exports.fetchAuditEvents = fetchAuditEvents;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const env = (0, env_js_1.loadEnv)();
async function recordAuditEvent({ entityType, entityId, action, actorId, metadata, }) {
    await (0, database_js_1.query)(`
      insert into public.creative_audit_events
        (entity_type, entity_id, action, actor_id, metadata)
      values ($1, $2, $3, $4, $5)
    `, [entityType, entityId, action, actorId ?? "system", metadata ?? {}]);
}
async function enqueueCoherenceEvent({ entityType, entityId, scope, payload, }) {
    await (0, database_js_1.query)(`
      insert into public.creative_coherence_events
        (entity_type, entity_id, scope, payload)
      values ($1, $2, $3, $4)
    `, [entityType, entityId, scope, payload ?? {}]);
}
async function fetchAuditEvents({ entityType, entityId, limit = 50 }) {
    const result = await (0, database_js_1.query)(`
      select id, entity_type, entity_id, action, actor_id, metadata, created_at
      from public.creative_audit_events
      where entity_type = $1 and entity_id = $2
      order by created_at desc
      limit $3
    `, [entityType, entityId, Math.max(1, Math.min(limit, 200))]);
    return result.rows.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        actorId: row.actor_id,
        metadata: row.metadata ?? {},
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    }));
}
