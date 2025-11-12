import { loadEnv } from "../worker/env.js";
import { query } from "../database.js";
import pool from "../database.js";
import { recordAuditEvent, enqueueCoherenceEvent } from "./auditRepository.js";

const env = loadEnv();

export interface CharacterSummary {
  id: string;
  worldId: string;
  displayName: string;
  tagline: string | null;
  summary: string | null;
  tags: string[];
  canonicalVersionId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface CharacterVersion {
  id: string;
  characterId: string;
  title: string | null;
  summary: string | null;
  traits: Record<string, unknown>;
  notes: unknown[];
  createdBy: string | null;
  createdAt: string;
}

export interface CharacterRelationship {
  id: string;
  characterId: string;
  targetCharacterId: string;
  relationshipType: string;
  strength: number | null;
  context: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface CharacterDetail extends CharacterSummary {
  versions: CharacterVersion[];
  relationships: CharacterRelationship[];
}

export interface CreateCharacterInput {
  worldId: string;
  displayName: string;
  summary?: string;
  tagline?: string;
  tags?: string[];
  createdBy?: string;
  initialVersion?: {
    title?: string;
    summary?: string;
    traits?: Record<string, unknown>;
    notes?: unknown[];
  };
}

export interface CreateVersionInput {
  characterId: string;
  title?: string;
  summary?: string;
  traits?: Record<string, unknown>;
  notes?: unknown[];
  createdBy?: string;
  setCanonical?: boolean;
}

export interface UpsertRelationshipInput {
  characterId: string;
  targetCharacterId: string;
  relationshipType: string;
  strength?: number | null;
  context?: string | null;
  createdBy?: string;
}

function mapCharacterRow(row: any): CharacterSummary {
  return {
    id: row.id,
    worldId: row.world_id,
    displayName: row.display_name,
    tagline: row.tagline ?? null,
    summary: row.summary ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    canonicalVersionId: row.canonical_version_id ?? null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapVersionRow(row: any): CharacterVersion {
  return {
    id: row.id,
    characterId: row.character_id,
    title: row.title ?? null,
    summary: row.summary ?? null,
    traits: row.traits ?? {},
    notes: row.notes ?? [],
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapRelationshipRow(row: any): CharacterRelationship {
  return {
    id: row.id,
    characterId: row.character_id,
    targetCharacterId: row.target_character_id,
    relationshipType: row.relationship_type,
    strength: typeof row.strength === "number" ? row.strength : null,
    context: row.context ?? null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function listCharacters(worldId: string, limit = 50): Promise<CharacterSummary[]> {
  const result = await query<{
    id: string;
    world_id: string;
    display_name: string;
    tagline: string | null;
    summary: string | null;
    tags: string[];
    canonical_version_id: string | null;
    created_by: string | null;
    created_at: Date;
  }>(
    `
      select id, world_id, display_name, tagline, summary, tags, canonical_version_id, created_by, created_at
      from public.characters
      where world_id = $1
      order by created_at desc
      limit $2
    `,
    [worldId, Math.max(1, Math.min(limit, 200))]
  );
  return result.rows.map(mapCharacterRow);
}

export async function getCharacter(characterId: string): Promise<CharacterDetail | null> {
  const characterResult = await query<{
    id: string;
    world_id: string;
    display_name: string;
    tagline: string | null;
    summary: string | null;
    tags: string[];
    canonical_version_id: string | null;
    created_by: string | null;
    created_at: Date;
  }>(
    `
      select id, world_id, display_name, tagline, summary, tags, canonical_version_id, created_by, created_at
      from public.characters
      where id = $1
    `,
    [characterId]
  );
  if (characterResult.rowCount === 0) return null;

  const versionsResult = await query<{
    id: string;
    character_id: string;
    title: string;
    summary: string | null;
    traits: Record<string, unknown>;
    notes: string | null;
    created_by: string | null;
    created_at: Date;
  }>(
    `
      select id, character_id, title, summary, traits, notes, created_by, created_at
      from public.character_versions
      where character_id = $1
      order by created_at desc
    `,
    [characterId]
  );

  const relationshipsResult = await query<{
    id: string;
    character_id: string;
    target_character_id: string;
    relationship_type: string;
    strength: number;
    context: string | null;
    created_by: string | null;
    created_at: Date;
  }>(
    `
      select id, character_id, target_character_id, relationship_type, strength, context, created_by, created_at
      from public.character_relationships
      where character_id = $1
      order by created_at desc
    `,
    [characterId]
  );

  return {
    ...mapCharacterRow(characterResult.rows[0]),
    versions: versionsResult.rows.map(mapVersionRow),
    relationships: relationshipsResult.rows.map(mapRelationshipRow),
  };
}

export async function createCharacter({
  worldId,
  displayName,
  summary,
  tagline,
  tags,
  createdBy,
  initialVersion,
}: CreateCharacterInput): Promise<CharacterDetail> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const characterResult = await client.query(
      `
        insert into public.characters
          (world_id, display_name, summary, tagline, tags, created_by)
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `,
      [worldId, displayName, summary ?? null, tagline ?? null, tags ?? [], createdBy ?? null]
    );
    const characterRow = mapCharacterRow(characterResult.rows[0]);

    let versionRow: CharacterVersion | null = null;
    if (initialVersion) {
      const versionResult = await client.query(
        `
          insert into public.character_versions
            (character_id, title, summary, traits, notes, created_by)
          values ($1, $2, $3, $4, $5, $6)
          returning *
        `,
        [
          characterRow.id,
          initialVersion.title ?? `${displayName} – Prime`,
          initialVersion.summary ?? summary ?? null,
          initialVersion.traits ?? {},
          initialVersion.notes ?? [],
          createdBy ?? null,
        ]
      );
      versionRow = mapVersionRow(versionResult.rows[0]);

      await client.query(
        `update public.characters set canonical_version_id = $1, updated_at = now() where id = $2`,
        [versionRow.id, characterRow.id]
      );
      characterRow.canonicalVersionId = versionRow.id;
    }

    await client.query("COMMIT");

    await recordAuditEvent({
      entityType: "character",
      entityId: characterRow.id,
      action: "character_created",
      actorId: createdBy,
      metadata: {
        displayName,
        worldId,
        canonicalVersionId: characterRow.canonicalVersionId,
      },
    });

    await enqueueCoherenceEvent({
      entityType: "character",
      entityId: characterRow.id,
      scope: "character_creation",
      payload: { displayName, worldId },
    });

    return {
      ...characterRow,
      versions: versionRow ? [versionRow] : [],
      relationships: [],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function addCharacterVersion({
  characterId,
  title,
  summary,
  traits,
  notes,
  createdBy,
  setCanonical,
}: CreateVersionInput): Promise<CharacterVersion> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const versionResult = await client.query(
      `
        insert into public.character_versions
          (character_id, title, summary, traits, notes, created_by)
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `,
      [characterId, title ?? null, summary ?? null, traits ?? {}, notes ?? [], createdBy ?? null]
    );
    const versionRow = mapVersionRow(versionResult.rows[0]);

    if (setCanonical) {
      await client.query(
        `update public.characters set canonical_version_id = $1, updated_at = now() where id = $2`,
        [versionRow.id, characterId]
      );
    }

    await client.query("COMMIT");

    await recordAuditEvent({
      entityType: "character",
      entityId: characterId,
      action: "character_version_added",
      actorId: createdBy,
      metadata: {
        versionId: versionRow.id,
        title: versionRow.title,
        setCanonical: Boolean(setCanonical),
      },
    });

    await enqueueCoherenceEvent({
      entityType: "character",
      entityId: characterId,
      scope: "character_version",
      payload: { versionId: versionRow.id, traits: versionRow.traits },
    });

    return versionRow;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertRelationship({
  characterId,
  targetCharacterId,
  relationshipType,
  strength,
  context,
  createdBy,
}: UpsertRelationshipInput): Promise<CharacterRelationship> {
  const result = await query<{
    id: string;
    character_id: string;
    target_character_id: string;
    relationship_type: string;
    strength: number;
    context: string | null;
    created_by: string | null;
    created_at: Date;
  }>(
    `
      insert into public.character_relationships
        (character_id, target_character_id, relationship_type, strength, context, created_by)
      values ($1, $2, $3, $4, $5, $6)
      on conflict (character_id, target_character_id, relationship_type)
      do update set strength = excluded.strength,
                   context = excluded.context,
                   created_by = excluded.created_by,
                   created_at = now()
      returning *
    `,
    [characterId, targetCharacterId, relationshipType, strength ?? null, context ?? null, createdBy ?? null]
  );
  const relationship = mapRelationshipRow(result.rows[0]);

  await recordAuditEvent({
    entityType: "character",
    entityId: characterId,
    action: "character_relationship_upserted",
    actorId: createdBy,
    metadata: {
      relationshipId: relationship.id,
      targetCharacterId,
      relationshipType,
      strength,
    },
  });

  await enqueueCoherenceEvent({
    entityType: "character",
    entityId: characterId,
    scope: "character_relationship",
    payload: { relationshipId: relationship.id, targetCharacterId, relationshipType },
  });

  return relationship;
}


