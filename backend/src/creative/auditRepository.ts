import { loadEnv } from "../worker/env.js";
import { query } from "../database.js";

const env = loadEnv();

export interface AuditEventInput {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function recordAuditEvent({
  entityType,
  entityId,
  action,
  actorId,
  metadata,
}: AuditEventInput): Promise<void> {
  await query(
    `
      insert into public.creative_audit_events
        (entity_type, entity_id, action, actor_id, metadata)
      values ($1, $2, $3, $4, $5)
    `,
    [entityType, entityId, action, actorId ?? "system", metadata ?? {}]
  );
}

export interface CoherenceEventInput {
  entityType: string;
  entityId: string;
  scope: string;
  payload?: Record<string, unknown>;
}

export async function enqueueCoherenceEvent({
  entityType,
  entityId,
  scope,
  payload,
}: CoherenceEventInput): Promise<void> {
  await query(
    `
      insert into public.creative_coherence_events
        (entity_type, entity_id, scope, payload)
      values ($1, $2, $3, $4)
    `,
    [entityType, entityId, scope, payload ?? {}]
  );
}

export interface AuditQueryOptions {
  entityType: string;
  entityId: string;
  limit?: number;
}

export async function fetchAuditEvents({ entityType, entityId, limit = 50 }: AuditQueryOptions) {
  const result = await query<{
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    actor_id: string;
    metadata: Record<string, unknown>;
    created_at: Date;
  }>(
    `
      select id, entity_type, entity_id, action, actor_id, metadata, created_at
      from public.creative_audit_events
      where entity_type = $1 and entity_id = $2
      order by created_at desc
      limit $3
    `,
    [entityType, entityId, Math.max(1, Math.min(limit, 200))]
  );

  return result.rows.map(
    (row: {
      id: string;
      entity_type: string;
      entity_id: string;
      action: string;
      actor_id: string;
      metadata: Record<string, unknown>;
      created_at: Date;
    }): AuditEvent => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      actorId: row.actor_id,
      metadata: row.metadata ?? {},
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    })
  );
}

