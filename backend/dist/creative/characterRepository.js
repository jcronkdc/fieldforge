"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCharacters = listCharacters;
exports.getCharacter = getCharacter;
exports.createCharacter = createCharacter;
exports.addCharacterVersion = addCharacterVersion;
exports.upsertRelationship = upsertRelationship;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const auditRepository_js_1 = require("./auditRepository.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
function mapCharacterRow(row) {
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
function mapVersionRow(row) {
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
function mapRelationshipRow(row) {
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
async function listCharacters(worldId, limit = 50) {
    const { rows } = await pool.query(`
      select id, world_id, display_name, tagline, summary, tags, canonical_version_id, created_by, created_at
      from public.characters
      where world_id = $1
      order by created_at desc
      limit $2
    `, [worldId, Math.max(1, Math.min(limit, 200))]);
    return rows.map(mapCharacterRow);
}
async function getCharacter(characterId) {
    const characterResult = await pool.query(`
      select id, world_id, display_name, tagline, summary, tags, canonical_version_id, created_by, created_at
      from public.characters
      where id = $1
    `, [characterId]);
    if (characterResult.rowCount === 0)
        return null;
    const versionsResult = await pool.query(`
      select id, character_id, title, summary, traits, notes, created_by, created_at
      from public.character_versions
      where character_id = $1
      order by created_at desc
    `, [characterId]);
    const relationshipsResult = await pool.query(`
      select id, character_id, target_character_id, relationship_type, strength, context, created_by, created_at
      from public.character_relationships
      where character_id = $1
      order by created_at desc
    `, [characterId]);
    return {
        ...mapCharacterRow(characterResult.rows[0]),
        versions: versionsResult.rows.map(mapVersionRow),
        relationships: relationshipsResult.rows.map(mapRelationshipRow),
    };
}
async function createCharacter({ worldId, displayName, summary, tagline, tags, createdBy, initialVersion, }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const characterResult = await client.query(`
        insert into public.characters
          (world_id, display_name, summary, tagline, tags, created_by)
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `, [worldId, displayName, summary ?? null, tagline ?? null, tags ?? [], createdBy ?? null]);
        const characterRow = mapCharacterRow(characterResult.rows[0]);
        let versionRow = null;
        if (initialVersion) {
            const versionResult = await client.query(`
          insert into public.character_versions
            (character_id, title, summary, traits, notes, created_by)
          values ($1, $2, $3, $4, $5, $6)
          returning *
        `, [
                characterRow.id,
                initialVersion.title ?? `${displayName} – Prime`,
                initialVersion.summary ?? summary ?? null,
                initialVersion.traits ?? {},
                initialVersion.notes ?? [],
                createdBy ?? null,
            ]);
            versionRow = mapVersionRow(versionResult.rows[0]);
            await client.query(`update public.characters set canonical_version_id = $1, updated_at = now() where id = $2`, [versionRow.id, characterRow.id]);
            characterRow.canonicalVersionId = versionRow.id;
        }
        await client.query("COMMIT");
        await (0, auditRepository_js_1.recordAuditEvent)({
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
        await (0, auditRepository_js_1.enqueueCoherenceEvent)({
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
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function addCharacterVersion({ characterId, title, summary, traits, notes, createdBy, setCanonical, }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const versionResult = await client.query(`
        insert into public.character_versions
          (character_id, title, summary, traits, notes, created_by)
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `, [characterId, title ?? null, summary ?? null, traits ?? {}, notes ?? [], createdBy ?? null]);
        const versionRow = mapVersionRow(versionResult.rows[0]);
        if (setCanonical) {
            await client.query(`update public.characters set canonical_version_id = $1, updated_at = now() where id = $2`, [versionRow.id, characterId]);
        }
        await client.query("COMMIT");
        await (0, auditRepository_js_1.recordAuditEvent)({
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
        await (0, auditRepository_js_1.enqueueCoherenceEvent)({
            entityType: "character",
            entityId: characterId,
            scope: "character_version",
            payload: { versionId: versionRow.id, traits: versionRow.traits },
        });
        return versionRow;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function upsertRelationship({ characterId, targetCharacterId, relationshipType, strength, context, createdBy, }) {
    const result = await pool.query(`
      insert into public.character_relationships
        (character_id, target_character_id, relationship_type, strength, context, created_by)
      values ($1, $2, $3, $4, $5, $6)
      on conflict (character_id, target_character_id, relationship_type)
      do update set strength = excluded.strength,
                   context = excluded.context,
                   created_by = excluded.created_by,
                   created_at = now()
      returning *
    `, [characterId, targetCharacterId, relationshipType, strength ?? null, context ?? null, createdBy ?? null]);
    const relationship = mapRelationshipRow(result.rows[0]);
    await (0, auditRepository_js_1.recordAuditEvent)({
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
    await (0, auditRepository_js_1.enqueueCoherenceEvent)({
        entityType: "character",
        entityId: characterId,
        scope: "character_relationship",
        payload: { relationshipId: relationship.id, targetCharacterId, relationshipType },
    });
    return relationship;
}
