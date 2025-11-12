"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertProfessorCritique = insertProfessorCritique;
exports.fetchProfessorCritiques = fetchProfessorCritiques;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const env = (0, env_js_1.loadEnv)();
async function insertProfessorCritique(record) {
    await (0, database_js_1.query)(`
      insert into public.professor_critiques (
        story_id,
        user_id,
        project_id,
        mask_session_id,
        mask_id,
        mask_version,
        mode,
        tone,
        summary,
        strengths,
        risks,
        suggestions,
        scores,
        metrics,
        custom_tone
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    `, [
        record.storyId ?? null,
        record.userId ?? null,
        record.projectId ?? null,
        record.maskSessionId,
        record.maskId,
        record.maskVersion,
        record.mode,
        record.tone,
        record.summary ?? null,
        record.strengths,
        record.risks,
        record.suggestions,
        record.scores,
        record.metrics,
        record.customTone ?? null,
    ]);
}
// Note: Using shared database pool - do not close it here
// export async function closeProfessorRepository(): Promise<void> {
//   await pool.end();
// }
async function fetchProfessorCritiques(params) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const offset = Math.max(params.offset ?? 0, 0);
    const conditions = [];
    const values = [];
    if (params.storyId) {
        conditions.push(`story_id = $${values.length + 1}`);
        values.push(params.storyId);
    }
    if (params.userId) {
        conditions.push(`user_id = $${values.length + 1}`);
        values.push(params.userId);
    }
    const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const result = await (0, database_js_1.query)(`
      select id, story_id, user_id, project_id, mask_session_id, mask_id, mask_version, mode, tone, summary, strengths, risks, suggestions, scores, metrics, custom_tone, created_at
      from public.professor_critiques
      ${whereClause}
      order by created_at desc
      limit $${values.length + 1}
      offset $${values.length + 2}
    `, [...values, limit, offset]);
    return result.rows.map((row) => ({
        id: Number(row.id),
        storyId: row.story_id ?? undefined,
        userId: row.user_id ?? undefined,
        projectId: row.project_id ?? undefined,
        maskSessionId: row.mask_session_id,
        maskId: row.mask_id,
        maskVersion: row.mask_version,
        mode: row.mode,
        tone: row.tone,
        summary: row.summary ?? undefined,
        strengths: row.strengths ?? [],
        risks: row.risks ?? [],
        suggestions: row.suggestions ?? [],
        scores: row.scores ?? {},
        metrics: row.metrics ?? {},
        customTone: row.custom_tone ?? undefined,
        createdAt: row.created_at,
    }));
}
