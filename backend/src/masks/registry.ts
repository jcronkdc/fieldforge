import { Pool, PoolClient } from "pg";
import { loadEnv } from "../worker/env.js";
import type { ActivateMaskInput, MaskMetadata, MaskSession, MaskVersion } from "./types.js";

const env = loadEnv();
const sharedPool = new Pool({ connectionString: env.DATABASE_URL });

export class MaskRegistry {
  constructor(private readonly pool: Pool = sharedPool) {}

  async registerMask(metadata: MaskMetadata, version: MaskVersion, client?: PoolClient): Promise<void> {
    const conn = client ?? (await this.pool.connect());
    let releaseOnFinish = false;
    if (!client) {
      releaseOnFinish = true;
      await conn.query("BEGIN");
    }

    try {
      await conn.query(
        `
          insert into public.ai_masks (mask_id, display_name, domains, default_version, status, tags)
          values ($1, $2, $3, $4, $5, $6)
          on conflict (mask_id) do update set
            display_name = excluded.display_name,
            domains = excluded.domains,
            status = excluded.status,
            tags = excluded.tags,
            updated_at = now()
        `,
        [metadata.maskId, metadata.displayName, metadata.domains, metadata.defaultVersion, metadata.status, metadata.tags]
      );

      await conn.query(
        `
          insert into public.ai_mask_versions (
            mask_id, version, changelog, persona, prompt_schema, skillset, llm_preset, max_context_tokens, safety_tags
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict (mask_id, version) do update set
            changelog = excluded.changelog,
            persona = excluded.persona,
            prompt_schema = excluded.prompt_schema,
            skillset = excluded.skillset,
            llm_preset = excluded.llm_preset,
            max_context_tokens = excluded.max_context_tokens,
            safety_tags = excluded.safety_tags
        `,
        [
          version.maskId,
          version.version,
          version.changelog ?? null,
          version.persona,
          version.promptSchema,
          version.skillset,
          version.llmPreset,
          version.maxContextTokens,
          version.safetyTags,
        ]
      );

      if (!client) {
        await conn.query("COMMIT");
      }
    } catch (error) {
      if (!client) {
        await conn.query("ROLLBACK");
      }
      throw error;
    } finally {
      if (!client && releaseOnFinish) {
        conn.release();
      }
    }
  }

  async getMask(maskId: string): Promise<MaskMetadata | null> {
    const result = await this.pool.query(
      `
        select mask_id, display_name, domains, default_version, status, tags
        from public.ai_masks
        where mask_id = $1
      `,
      [maskId]
    );

    if (result.rowCount === 0) return null;
    const row = result.rows[0];
    return {
      maskId: row.mask_id,
      displayName: row.display_name,
      domains: row.domains ?? [],
      defaultVersion: row.default_version,
      status: row.status,
      tags: row.tags ?? [],
    };
  }

  async getMaskVersion(maskId: string, version?: string): Promise<MaskVersion | null> {
    const resolvedVersion = version ?? (await this.getMask(maskId))?.defaultVersion;
    if (!resolvedVersion) return null;

    const result = await this.pool.query(
      `
        select mask_id, version, changelog, persona, prompt_schema, skillset, llm_preset, max_context_tokens, safety_tags
        from public.ai_mask_versions
        where mask_id = $1 and version = $2
      `,
      [maskId, resolvedVersion]
    );

    if (result.rowCount === 0) return null;
    const row = result.rows[0];
    return {
      maskId: row.mask_id,
      version: row.version,
      changelog: row.changelog,
      persona: row.persona,
      promptSchema: row.prompt_schema,
      skillset: row.skillset ?? [],
      llmPreset: row.llm_preset,
      maxContextTokens: row.max_context_tokens,
      safetyTags: row.safety_tags ?? [],
    };
  }

  async activateMask(input: ActivateMaskInput): Promise<MaskSession> {
    const version = await this.getMaskVersion(input.maskId, input.version);
    if (!version) {
      throw new Error(`Mask ${input.maskId} version ${input.version ?? "default"} not found`);
    }

    const blendMasks = input.blendWith?.map((blend) => blend.maskId) ?? [];
    const context = input.context ?? {};
    const metadata = input.metadata ?? {};

    const result = await this.pool.query(
      `
        insert into public.ai_mask_sessions (
          mask_id, mask_version, blend_masks, user_id, project_id, context, metadata
        ) values ($1, $2, $3, $4, $5, $6, $7)
        returning session_id, started_at
      `,
      [input.maskId, version.version, blendMasks, input.userId ?? null, input.projectId ?? null, context, metadata]
    );

    const row = result.rows[0];
    return {
      sessionId: row.session_id,
      maskId: input.maskId,
      maskVersion: version.version,
      blendMasks,
      userId: input.userId ?? null,
      projectId: input.projectId ?? null,
      context,
      startedAt: row.started_at,
      metadata,
    };
  }

  async endSession(sessionId: string, reason?: string): Promise<void> {
    await this.pool.query(
      `
        update public.ai_mask_sessions
        set ended_at = now(), ended_reason = $2
        where session_id = $1 and ended_at is null
      `,
      [sessionId, reason ?? null]
    );
  }

  async listMaskVersions(maskId: string): Promise<MaskVersion[]> {
    const result = await this.pool.query(
      `
        select mask_id, version, changelog, persona, prompt_schema, skillset, llm_preset, max_context_tokens, safety_tags
        from public.ai_mask_versions
        where mask_id = $1
        order by created_at desc
      `,
      [maskId]
    );

    return result.rows.map((row) => ({
      maskId: row.mask_id,
      version: row.version,
      changelog: row.changelog,
      persona: row.persona,
      promptSchema: row.prompt_schema,
      skillset: row.skillset ?? [],
      llmPreset: row.llm_preset,
      maxContextTokens: row.max_context_tokens,
      safetyTags: row.safety_tags ?? [],
    }));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const maskRegistry = new MaskRegistry();

