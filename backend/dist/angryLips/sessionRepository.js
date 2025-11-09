"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.listSessions = listSessions;
exports.listSessionParticipants = listSessionParticipants;
exports.inviteParticipants = inviteParticipants;
exports.respondToInvitation = respondToInvitation;
exports.startSession = startSession;
exports.advanceTurn = advanceTurn;
exports.submitTurn = submitTurn;
exports.autoFillTurn = autoFillTurn;
exports.logTurnEvent = logTurnEvent;
exports.completeSession = completeSession;
exports.summarizeSession = summarizeSession;
exports.generateAiStory = generateAiStory;
exports.publishVaultEntry = publishVaultEntry;
exports.listPublishedEntries = listPublishedEntries;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const templateGenerator_js_1 = require("./templateGenerator.js");
const ablyPublisher_js_1 = require("../realtime/ablyPublisher.js");
const aiClient_js_1 = require("../creative/aiClient.js");
const mythacoinRepository_js_1 = require("../mythacoin/mythacoinRepository.js");
const messagingRepository_js_1 = require("../messaging/messagingRepository.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
async function createSession(input) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const templateSource = normalizeTemplateSource(input.templateSource);
        const templateLength = normalizeTemplateLength(input.templateLength);
        const templateOptions = {
            genre: input.genre ?? "heist",
            length: templateLength,
            seedText: input.seedText,
        };
        if (templateSource === "custom" && !templateOptions.seedText) {
            throw new Error("seedText is required when templateSource is 'custom'");
        }
        const template = (0, templateGenerator_js_1.generateTemplate)(templateOptions);
        const sessionTitle = input.title ?? (templateOptions.genre ? `${capitalize(templateOptions.genre)} Party` : "Angry Lips Session");
        const sessionRow = await client.query(`
        insert into public.angry_lips_sessions
          (host_id, title, genre, template_source, template_length, seed_text, template_text, status,
           response_window_minutes, allow_ai_cohost, vault_mode, participants)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        returning *
      `, [
            input.hostId ?? null,
            sessionTitle,
            input.genre ?? null,
            templateSource,
            templateLength,
            template.originalText,
            template.template,
            "draft",
            input.responseWindowMinutes ?? 5,
            input.allowAiCohost ?? true,
            input.vaultMode ?? "invite_only",
            JSON.stringify([]),
        ]);
        const sessionId = sessionRow.rows[0].id;
        const turns = await insertTurns(client, sessionId, template, {
            responseWindowMinutes: input.responseWindowMinutes,
        });
        await upsertInitialParticipants(client, sessionId, input.hostId ?? null, input.participantIds ?? []);
        await client.query("COMMIT");
        const session = mapSessionRow(sessionRow.rows[0]);
        const participants = await listSessionParticipants(sessionId);
        await (0, ablyPublisher_js_1.publishSessionEvent)(session.id, "session_created", {
            templateSource: session.templateSource,
            templateLength: session.templateLength,
            blankCount: template.blanks.length,
        });
        if (session.hostId) {
            (0, mythacoinRepository_js_1.recordMythacoinTransaction)({
                userId: session.hostId,
                amount: 10,
                transactionType: "angry_lips_host_session",
                description: "Hosted Angry Lips session",
                metadata: { sessionId },
            }).catch((error) => {
                console.warn("[mythacoin] failed to reward host", error);
            });
            // Create project conversation for the session
            if (input.participantIds && input.participantIds.length > 0) {
                (0, messagingRepository_js_1.createProjectConversation)(session.hostId, 'angry_lips', sessionId, sessionTitle, input.participantIds).catch((error) => {
                    console.warn("[angry-lips] failed to create project conversation", error);
                });
            }
            pool
                .query(`update public.user_profiles set last_session_id = $2 where user_id = $1`, [session.hostId, sessionId])
                .catch((error) => {
                console.warn("[profiles] failed to record last session", error);
            });
        }
        return {
            session: { ...session, participants, turns },
            template,
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
async function getSession(sessionId) {
    const sessionResult = await pool.query(`select * from public.angry_lips_sessions where id = $1`, [sessionId]);
    if (sessionResult.rowCount === 0)
        return null;
    const session = mapSessionRow(sessionResult.rows[0]);
    const participants = await listSessionParticipants(sessionId);
    const turnsResult = await pool.query(`select * from public.angry_lips_turns where session_id = $1 order by order_index asc`, [
        sessionId,
    ]);
    const turnIds = turnsResult.rows.map((row) => row.id);
    let eventsByTurn = {};
    if (turnIds.length > 0) {
        const eventsResult = await pool.query(`select * from public.angry_lips_turn_events where turn_id = any($1::uuid[]) order by created_at asc`, [turnIds]);
        eventsByTurn = eventsResult.rows.reduce((acc, row) => {
            const event = mapTurnEventRow(row);
            if (!acc[event.turnId])
                acc[event.turnId] = [];
            acc[event.turnId].push(event);
            return acc;
        }, {});
    }
    const turns = turnsResult.rows.map((row) => ({ ...mapTurnRow(row), events: eventsByTurn[row.id] ?? [] }));
    return { ...session, participants, turns };
}
async function listSessions(options = {}) {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const params = [limit];
    let paramIndex = 2;
    const conditions = [];
    if (options.status) {
        conditions.push(`status = $${paramIndex}`);
        params.push(options.status);
        paramIndex += 1;
    }
    if (options.userId) {
        conditions.push(`exists (
        select 1
        from public.angry_lips_session_participants asp
        where asp.session_id = public.angry_lips_sessions.id
          and asp.user_id = $${paramIndex}
      )`);
        params.push(options.userId);
        paramIndex += 1;
    }
    const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const result = await pool.query(`
      select *
      from public.angry_lips_sessions
      ${whereClause}
      order by created_at desc
      limit $1
    `, params);
    const sessions = result.rows.map(mapSessionRow);
    const participantsMap = await fetchParticipantsForSessions(sessions.map((session) => session.id));
    return sessions.map((session) => ({
        ...session,
        participants: participantsMap[session.id] ?? [],
    }));
}
async function listSessionParticipants(sessionId) {
    const map = await fetchParticipantsForSessions([sessionId]);
    return map[sessionId] ?? [];
}
async function inviteParticipants(sessionId, hostId, participantIds) {
    if (participantIds.length === 0) {
        return listSessionParticipants(sessionId);
    }
    await ensureHostPrivileges(sessionId, hostId);
    const uniqueParticipantIds = Array.from(new Set(participantIds.filter((id) => id !== hostId)));
    if (uniqueParticipantIds.length === 0) {
        return listSessionParticipants(sessionId);
    }
    await pool.query(`
      insert into public.angry_lips_session_participants (session_id, user_id, role, status)
      select $1, unnest($2::uuid[]), 'player', 'invited'
      on conflict (session_id, user_id)
      do update set status = 'invited', updated_at = timezone('utc', now())
    `, [sessionId, uniqueParticipantIds]);
    return listSessionParticipants(sessionId);
}
async function respondToInvitation(sessionId, userId, action) {
    const statusMap = {
        accept: "accepted",
        decline: "declined",
        left: "left",
    };
    const result = await pool.query(`
      update public.angry_lips_session_participants
      set status = $3, updated_at = timezone('utc', now())
      where session_id = $1 and user_id = $2
      returning *
    `, [sessionId, userId, statusMap[action]]);
    if (result.rowCount === 0) {
        return null;
    }
    const participant = mapParticipantRow(result.rows[0]);
    if (participant.status === "accepted") {
        (0, mythacoinRepository_js_1.recordMythacoinTransaction)({
            userId: participant.userId,
            amount: 5,
            transactionType: "angry_lips_participation",
            description: "Accepted Angry Lips session invitation",
            metadata: { sessionId },
        }).catch((error) => {
            console.warn("[mythacoin] failed to reward participant", error);
        });
    }
    await (0, ablyPublisher_js_1.publishSessionEvent)(sessionId, "participant_status", {
        participantId: participant.userId,
        status: participant.status,
        handle: participant.handle,
    });
    return participant;
}
async function startSession(sessionId, hostId) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureHostPrivileges(sessionId, hostId);
        const sessionResult = await client.query(`select * from public.angry_lips_sessions where id = $1`, [sessionId]);
        if (sessionResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }
        const sessionRow = sessionResult.rows[0];
        if (sessionRow.status === "active") {
            await client.query("ROLLBACK");
            return getSession(sessionId);
        }
        const participants = await listSessionParticipants(sessionId);
        const activeParticipants = participants.filter((participant) => participant.status === "accepted" || participant.role === "host");
        if (activeParticipants.length === 0) {
            throw new Error("At least one participant must accept before starting the session.");
        }
        const turnsResult = await client.query(`select * from public.angry_lips_turns where session_id = $1 order by order_index asc`, [sessionId]);
        const responseWindow = sessionRow.response_window_minutes ?? 5;
        for (let index = 0; index < turnsResult.rows.length; index += 1) {
            const turnRow = turnsResult.rows[index];
            const participant = activeParticipants[index % activeParticipants.length];
            const handle = participant.handle ?? (participant.userId ? `@${participant.userId.slice(0, 6)}` : `@player${index + 1}`);
            await client.query(`
          update public.angry_lips_turns
          set assigned_handle = $2,
              due_at = case when order_index = 0 then timezone('utc', now()) else null end,
              expires_at = case when order_index = 0 then timezone('utc', now()) + ($3 || ' minutes')::interval else null end
          where id = $1
        `, [turnRow.id, handle, responseWindow]);
        }
        await client.query(`update public.angry_lips_sessions set status = 'active', updated_at = timezone('utc', now()) where id = $1`, [sessionId]);
        await client.query("COMMIT");
        const session = await getSession(sessionId);
        if (session) {
            const firstTurn = session.turns.find((turn) => turn.orderIndex === 0);
            await (0, ablyPublisher_js_1.publishSessionEvent)(sessionId, "session_started", {
                participantOrder: activeParticipants.map((participant) => ({
                    userId: participant.userId,
                    handle: participant.handle ?? (participant.userId ? `@${participant.userId.slice(0, 6)}` : "player"),
                })),
                firstTurnId: firstTurn?.id ?? null,
                dueAt: firstTurn?.dueAt ?? null,
                expiresAt: firstTurn?.expiresAt ?? null,
            });
        }
        return session;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function advanceTurn(sessionId, hostId) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureHostPrivileges(sessionId, hostId);
        const sessionResult = await client.query(`select * from public.angry_lips_sessions where id = $1`, [sessionId]);
        if (sessionResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }
        const sessionRow = sessionResult.rows[0];
        const responseWindow = sessionRow.response_window_minutes ?? 5;
        const currentTurnResult = await client.query(`
        select *
        from public.angry_lips_turns
        where session_id = $1 and status = 'pending' and due_at is not null
        order by order_index asc
        limit 1
      `, [sessionId]);
        if (currentTurnResult.rows.length > 0) {
            await client.query(`update public.angry_lips_turns set due_at = null, expires_at = null where id = $1`, [currentTurnResult.rows[0].id]);
        }
        const nextTurnResult = await client.query(`
        select *
        from public.angry_lips_turns
        where session_id = $1 and status = 'pending' and due_at is null
        order by order_index asc
        limit 1
      `, [sessionId]);
        if (nextTurnResult.rows.length === 0) {
            await client.query(`update public.angry_lips_sessions set status = 'completed', updated_at = timezone('utc', now()) where id = $1`, [sessionId]);
            await client.query("COMMIT");
            const session = await getSession(sessionId);
            if (session) {
                await (0, ablyPublisher_js_1.publishSessionEvent)(sessionId, "session_completed", { sessionId });
            }
            return session;
        }
        const nextTurn = nextTurnResult.rows[0];
        await client.query(`
        update public.angry_lips_turns
        set due_at = timezone('utc', now()),
            expires_at = timezone('utc', now()) + ($2 || ' minutes')::interval
        where id = $1
      `, [nextTurn.id, responseWindow]);
        await client.query("COMMIT");
        const session = await getSession(sessionId);
        if (session) {
            const turnRecord = session.turns.find((turn) => turn.id === nextTurn.id);
            await (0, ablyPublisher_js_1.publishSessionEvent)(sessionId, "turn_advanced", {
                turnId: nextTurn.id,
                dueAt: turnRecord?.dueAt ?? null,
                expiresAt: turnRecord?.expiresAt ?? null,
            });
        }
        return session;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function submitTurn({ turnId, text, handle }) {
    const result = await pool.query(`
      update public.angry_lips_turns
      set status = 'submitted',
          submitted_text = $1,
          submission_handle = $2,
          submitted_at = now(),
          auto_filled = false
      where id = $3
      returning *
    `, [text, handle ?? null, turnId]);
    if (result.rowCount === 0)
        return null;
    await logTurnEvent(turnId, "submitted", { handle: handle ?? null });
    return mapTurnRow(result.rows[0]);
}
async function autoFillTurn({ turnId, text, handle }) {
    const result = await pool.query(`
      update public.angry_lips_turns
      set status = 'auto_filled',
          auto_fill_text = $1,
          auto_filled = true,
          submission_handle = $2,
          submitted_at = now()
      where id = $3
      returning *
    `, [text, handle ?? "ai", turnId]);
    if (result.rowCount === 0)
        return null;
    await logTurnEvent(turnId, "auto_filled", { handle: handle ?? "ai" });
    return mapTurnRow(result.rows[0]);
}
async function logTurnEvent(turnId, eventType, payload) {
    const turnResult = await pool.query(`select session_id from public.angry_lips_turns where id = $1`, [turnId]);
    if (turnResult.rowCount === 0)
        return;
    await pool.query(`
      insert into public.angry_lips_turn_events (turn_id, event_type, payload)
      values ($1,$2,$3)
    `, [turnId, eventType, JSON.stringify(payload ?? {})]);
    await (0, ablyPublisher_js_1.publishTurnEvent)(turnResult.rows[0].session_id, turnId, eventType, payload ?? {});
}
async function completeSession({ sessionId, storyText, title, visibility }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const sessionResult = await client.query(`select * from public.angry_lips_sessions where id = $1`, [sessionId]);
        if (sessionResult.rowCount === 0) {
            throw new Error("Session not found");
        }
        const sessionRow = sessionResult.rows[0];
        const resolvedStory = storyText ?? (await buildSessionStory(sessionId, client)).storyText;
        const resolvedTitle = title ?? sessionRow.title ?? "Angry Lips Story";
        const resolvedVisibility = visibility ?? sessionRow.vault_mode ?? "invite_only";
        await client.query(`
        update public.angry_lips_sessions
        set status = 'completed',
            updated_at = timezone('utc', now()),
            vault_mode = $2
        where id = $1
      `, [sessionId, resolvedVisibility]);
        const vaultResult = await client.query(`
        insert into public.angry_lips_vault_entries (session_id, title, story_text, visibility)
        values ($1,$2,$3,$4)
        on conflict (session_id)
        do update set
          title = excluded.title,
          story_text = excluded.story_text,
          visibility = excluded.visibility
        returning *
      `, [sessionId, resolvedTitle, resolvedStory, resolvedVisibility]);
        await client.query("COMMIT");
        await (0, ablyPublisher_js_1.publishSessionEvent)(sessionId, "session_completed", {
            vaultEntryId: vaultResult.rows[0].id,
            visibility: vaultResult.rows[0].visibility,
        });
        return mapVaultEntryRow(vaultResult.rows[0]);
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function summarizeSession(sessionId, requesterId, focus) {
    const { sessionRow } = await ensureParticipantAccess(sessionId, requesterId);
    const { storyText } = await buildSessionStory(sessionId);
    const vaultEntry = await completeSession({ sessionId, storyText, visibility: sessionRow.vault_mode ?? undefined });
    const trimmedFocus = focus?.trim() ?? "";
    const focusSuffix = trimmedFocus ? `\n\nHighlight this angle: ${trimmedFocus}` : "";
    const { content } = await (0, aiClient_js_1.runCreativeCompletion)({
        messages: [
            {
                role: "system",
                content: "You are Professor Malachai summarizing wildly creative Angry Lips sessions. Offer a punchy, spoiler-safe recap in 2-3 energetic sentences.",
            },
            {
                role: "user",
                content: `Session title: ${vaultEntry.title}\nGenre: ${sessionRow.genre ?? "Unspecified"}\n\nStory transcript:\n${storyText}${focusSuffix}\n\nProvide a recap that captures the theme and tone.`,
            },
        ],
        temperature: 0.6,
        maxTokens: 240,
    });
    const summaryText = content.trim();
    const update = await pool.query(`
      update public.angry_lips_vault_entries
      set summary_text = $2,
          theme_prompt = case when $3 is not null and length($3) > 0 then $3 else theme_prompt end
      where id = $1
      returning *
    `, [vaultEntry.id, summaryText, trimmedFocus || null]);
    return mapVaultEntryRow(update.rows[0]);
}
async function generateAiStory(sessionId, hostId, prompt) {
    const sessionRow = await assertHostAccess(sessionId, hostId);
    const { storyText } = await buildSessionStory(sessionId);
    const vaultEntry = await completeSession({ sessionId, storyText, visibility: sessionRow.vault_mode ?? undefined });
    const trimmedPrompt = prompt?.trim() ?? "";
    const { content } = await (0, aiClient_js_1.runCreativeCompletion)({
        messages: [
            {
                role: "system",
                content: "You rewrite Angry Lips Mad Libs into cohesive short stories. Preserve comedic beats, add connective tissue, and keep it under three paragraphs.",
            },
            {
                role: "user",
                content: `Title: ${vaultEntry.title}\nGenre: ${sessionRow.genre ?? "Unspecified"}\nDesired vibe: ${trimmedPrompt || "embrace the original tone"}\n\nOriginal fill transcript:\n${storyText}\n\nRewrite this into a cohesive short story with playful pacing and a satisfying ending.`,
            },
        ],
        temperature: 0.85,
        maxTokens: 600,
    });
    const aiStory = content.trim();
    const update = await pool.query(`
      update public.angry_lips_vault_entries
      set ai_story_text = $2,
          theme_prompt = case when $3 is not null and length($3) > 0 then $3 else theme_prompt end
      where id = $1
      returning *
    `, [vaultEntry.id, aiStory, trimmedPrompt || null]);
    return mapVaultEntryRow(update.rows[0]);
}
async function publishVaultEntry(sessionId, hostId, visibility = "public") {
    const sessionRow = await assertHostAccess(sessionId, hostId);
    const { storyText } = await buildSessionStory(sessionId);
    const vaultEntry = await completeSession({ sessionId, storyText, visibility });
    const publisherUuid = isValidUuid(hostId) ? hostId : null;
    const update = await pool.query(`
      update public.angry_lips_vault_entries
      set visibility = $2,
          published_at = case when $2 = 'public' then coalesce(published_at, timezone('utc', now())) else null end,
          published_by = case when $2 = 'public' and $3::uuid is not null then $3::uuid else null end
      where id = $1
      returning *
    `, [vaultEntry.id, visibility, publisherUuid]);
    return mapVaultEntryRow(update.rows[0]);
}
async function listPublishedEntries(limit = 20, offset = 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);
    const { rows } = await pool.query(`
      select ve.*,
             als.title as session_title,
             als.genre,
             als.host_id,
             up.username,
             up.display_name
      from public.angry_lips_vault_entries ve
      join public.angry_lips_sessions als on als.id = ve.session_id
      left join public.user_profiles up on up.user_id::text = als.host_id
      where ve.visibility = 'public'
      order by coalesce(ve.published_at, ve.created_at) desc
      limit $1 offset $2
    `, [safeLimit, safeOffset]);
    return rows.map(mapFeedEntryRow);
}
function normalizeTemplateSource(source) {
    if (!source)
        return "ai";
    const value = source.toLowerCase();
    if (value === "custom")
        return "custom";
    if (value === "seed")
        return "seed";
    return "ai";
}
function normalizeTemplateLength(length) {
    if (!length)
        return "quick";
    const value = length.toLowerCase();
    if (value === "classic" || value === "epic")
        return value;
    return "quick";
}
async function insertTurns(client, sessionId, template, options) {
    const rows = [];
    const responseWindow = options.responseWindowMinutes ?? null;
    for (let index = 0; index < template.blanks.length; index += 1) {
        const blank = template.blanks[index];
        const placeholder = `[[${blank.id.toUpperCase()}::${blank.slot}]]`;
        const result = await client.query(`
        insert into public.angry_lips_turns
          (session_id, order_index, status, prompt, part_of_speech, creative_nudge, placeholder, response_window_minutes)
        values ($1,$2,'pending',$3,$4,$5,$6,$7)
        returning *
      `, [
            sessionId,
            index,
            blank.prompt,
            blank.slot,
            `${blank.description} Example: ${blank.example}.`,
            placeholder,
            responseWindow,
        ]);
        const turn = mapTurnRow(result.rows[0]);
        rows.push(turn);
        await insertTurnEventWithClient(client, sessionId, turn.id, "turn_seeded", {
            slot: blank.slot,
            placeholder,
            prompt: blank.prompt,
            description: blank.description,
            example: blank.example,
        });
    }
    return rows;
}
function mapSessionRow(row) {
    return {
        id: row.id,
        hostId: row.host_id ?? null,
        title: row.title ?? null,
        genre: row.genre ?? null,
        templateSource: normalizeTemplateSource(row.template_source),
        templateLength: normalizeTemplateLength(row.template_length),
        seedText: row.seed_text ?? null,
        templateText: row.template_text ?? null,
        status: (row.status ?? "draft"),
        responseWindowMinutes: row.response_window_minutes ?? 5,
        allowAiCohost: row.allow_ai_cohost ?? true,
        vaultMode: (row.vault_mode ?? "invite_only"),
        participants: [],
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
}
function mapTurnRow(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        orderIndex: row.order_index ?? 0,
        status: (row.status ?? "pending"),
        prompt: row.prompt ?? null,
        partOfSpeech: row.part_of_speech ?? null,
        creativeNudge: row.creative_nudge ?? null,
        placeholder: row.placeholder ?? null,
        assignedHandle: row.assigned_handle ?? null,
        assignedChannel: row.assigned_channel ?? null,
        responseWindowMinutes: row.response_window_minutes ?? null,
        dueAt: row.due_at ? new Date(row.due_at).toISOString() : null,
        expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
        submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
        submittedText: row.submitted_text ?? null,
        submissionHandle: row.submission_handle ?? null,
        autoFilled: Boolean(row.auto_filled),
        autoFillText: row.auto_fill_text ?? null,
        reactions: Array.isArray(row.reactions) ? row.reactions : safeParseArray(row.reactions),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    };
}
function mapTurnEventRow(row) {
    return {
        id: row.id,
        turnId: row.turn_id,
        eventType: row.event_type,
        payload: typeof row.payload === "object" && row.payload !== null ? row.payload : safeParseObject(row.payload),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    };
}
async function upsertInitialParticipants(client, sessionId, hostId, participantIds) {
    if (hostId) {
        await client.query(`
        insert into public.angry_lips_session_participants (session_id, user_id, role, status)
        values ($1, $2, 'host', 'accepted')
        on conflict (session_id, user_id)
        do update set role = 'host', status = 'accepted', updated_at = timezone('utc', now())
      `, [sessionId, hostId]);
    }
    const uniqueParticipantIds = Array.from(new Set(participantIds.filter((id) => id && id !== hostId)));
    if (uniqueParticipantIds.length === 0)
        return;
    await client.query(`
      insert into public.angry_lips_session_participants (session_id, user_id, role, status)
      select $1, unnest($2::uuid[]), 'player', 'invited'
      on conflict (session_id, user_id)
      do update set status = excluded.status, updated_at = timezone('utc', now())
    `, [sessionId, uniqueParticipantIds]);
}
async function ensureHostPrivileges(sessionId, hostId) {
    const result = await pool.query(`select 1 from public.angry_lips_sessions where id = $1 and host_id = $2`, [
        sessionId,
        hostId,
    ]);
    if (result.rowCount === 0) {
        throw new Error("Only the session host can perform this action.");
    }
}
async function fetchParticipantsForSessions(sessionIds) {
    if (sessionIds.length === 0) {
        return {};
    }
    const { rows } = await pool.query(`
      select *
      from public.angry_lips_session_participants
      where session_id = any($1::uuid[])
      order by created_at asc
    `, [sessionIds]);
    return rows.reduce((acc, row) => {
        const participant = mapParticipantRow(row);
        if (!acc[participant.sessionId]) {
            acc[participant.sessionId] = [];
        }
        acc[participant.sessionId].push(participant);
        return acc;
    }, {});
}
function mapParticipantRow(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        handle: row.handle ?? null,
        role: row.role ?? "player",
        status: row.status ?? "invited",
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
}
function mapVaultEntryRow(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        title: row.title,
        storyText: row.story_text,
        visibility: row.visibility,
        reactions: Array.isArray(row.reactions) ? row.reactions : safeParseArray(row.reactions),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        summaryText: row.summary_text ?? null,
        aiStoryText: row.ai_story_text ?? null,
        themePrompt: row.theme_prompt ?? null,
        publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
        publishedBy: row.published_by ?? null,
    };
}
function safeParseArray(value) {
    if (Array.isArray(value))
        return value;
    if (!value)
        return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (error) {
        return [];
    }
}
function safeParseObject(value) {
    if (value && typeof value === "object")
        return value;
    if (!value)
        return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" ? parsed : {};
    }
    catch (error) {
        return {};
    }
}
function capitalize(input) {
    if (!input || input.length === 0)
        return "Angry Lips Session";
    return input.charAt(0).toUpperCase() + input.slice(1);
}
async function insertTurnEventWithClient(client, sessionId, turnId, eventType, payload) {
    await client.query(`
      insert into public.angry_lips_turn_events (turn_id, event_type, payload)
      values ($1,$2,$3)
    `, [turnId, eventType, JSON.stringify(payload ?? {})]);
    await (0, ablyPublisher_js_1.publishTurnEvent)(sessionId, turnId, eventType, payload ?? {});
}
function mapFeedEntryRow(row) {
    const base = mapVaultEntryRow(row);
    return {
        ...base,
        sessionTitle: row.session_title ?? base.title ?? null,
        genre: row.genre ?? null,
        hostId: row.host_id ?? null,
        hostUsername: row.username ?? null,
        hostDisplayName: row.display_name ?? null,
    };
}
function isValidUuid(value) {
    return typeof value === "string" && /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(value);
}
async function loadSessionRow(sessionId, client) {
    const runner = client ?? pool;
    const result = await runner.query(`select * from public.angry_lips_sessions where id = $1`, [sessionId]);
    if (result.rowCount === 0) {
        throw new Error("Session not found");
    }
    return result.rows[0];
}
async function ensureParticipantAccess(sessionId, userId) {
    const sessionRow = await loadSessionRow(sessionId);
    const isHost = sessionRow.host_id === userId;
    if (!isHost) {
        const participantResult = await pool.query(`select status from public.angry_lips_session_participants where session_id = $1 and user_id = $2`, [sessionId, userId]);
        if (participantResult.rowCount === 0) {
            throw new Error("You are not part of this Angry Lips session.");
        }
        const status = participantResult.rows[0].status ?? "invited";
        if (!["accepted", "host"].includes(status)) {
            throw new Error("You need to accept the invitation before running this action.");
        }
    }
    return { sessionRow, isHost };
}
async function assertHostAccess(sessionId, hostId) {
    const sessionRow = await loadSessionRow(sessionId);
    if ((sessionRow.host_id ?? null) !== hostId) {
        throw new Error("Only the session host can perform this action.");
    }
    return sessionRow;
}
async function buildSessionStory(sessionId, client) {
    const sessionRow = await loadSessionRow(sessionId, client);
    const templateText = sessionRow.template_text ?? null;
    const turnsResult = await (client ?? pool).query(`
      select order_index, placeholder, submitted_text, auto_fill_text, part_of_speech
      from public.angry_lips_turns
      where session_id = $1
      order by order_index asc
    `, [sessionId]);
    const replacements = {};
    turnsResult.rows.forEach((row) => {
        const placeholder = row.placeholder ?? null;
        const fill = row.submitted_text ?? row.auto_fill_text ?? fallbackValueForTurn(row);
        if (placeholder) {
            replacements[placeholder] = fill;
        }
    });
    let storyText = templateText ?? "";
    if (storyText) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
            storyText = storyText.replace(new RegExp(escapeRegExp(placeholder), "g"), value);
        });
    }
    else {
        storyText = turnsResult.rows
            .map((row) => row.submitted_text ?? row.auto_fill_text ?? fallbackValueForTurn(row))
            .join(" ");
    }
    if (!storyText.trim()) {
        storyText = "This Angry Lips story is still warming up — fill in more blanks to finish it.";
    }
    return { storyText, templateText, replacements };
}
function fallbackValueForTurn(row) {
    let slot = typeof row.part_of_speech === "string" ? row.part_of_speech : "blank";
    const placeholder = row.placeholder ?? null;
    if (placeholder) {
        const match = placeholder.match(/::([^\]]+)/);
        if (match?.[1]) {
            slot = match[1];
        }
    }
    return slot.replace(/_/g, " ");
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
