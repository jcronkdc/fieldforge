"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const env_js_1 = require("./env.js");
const notifications_js_1 = require("./notifications.js");
const aiFallback_js_1 = require("./aiFallback.js");
const analytics_js_1 = require("./analytics.js");
const database_js_1 = __importDefault(require("../database.js"));
const env = (0, env_js_1.loadEnv)();
const LOOP_INTERVAL_MS = Number(process.env.HOURGLASS_INTERVAL_MS ?? 30_000);
const WARNING_THRESHOLD_MS = Number(process.env.HOURGLASS_WARNING_MS ?? 60_000);
let isRunning = false;
async function main() {
    const runOnce = process.argv.includes("--once");
    const tick = async () => {
        if (isRunning)
            return;
        isRunning = true;
        try {
            await processBatch();
        }
        catch (error) {
            console.error("[hourglass] error", error);
        }
        finally {
            isRunning = false;
        }
    };
    await tick();
    if (runOnce) {
        await database_js_1.default.end();
        return;
    }
    setInterval(tick, LOOP_INTERVAL_MS);
}
async function processBatch() {
    const client = await database_js_1.default.connect();
    try {
        const result = await client.query(`
        select
          t.id,
          t.branch_id,
          b.title as branch_title,
          b.world_id,
          t.response_window_minutes,
          t.timeout_strategy,
          coalesce(t.notified_channels, array[]::text[]) as notified_channels,
          t.expires_at,
          t.created_at,
          t.completed_at,
          t.completed_by,
          t.auto_filled,
          t.auto_fill_text,
          t.recipient_handle,
          t.prompt_text,
          t.recipient_email,
          t.recipient_phone,
          t.recipient_discord_webhook
        from public.branch_turns t
        join public.story_branches b on b.id = t.branch_id
        where t.completed_at is null
        order by t.created_at asc
        limit 50;
      `);
        const rows = result.rows.map((row) => ({
            ...row,
            expires_at: row.expires_at ? new Date(row.expires_at) : null,
            created_at: new Date(row.created_at),
            completed_at: row.completed_at ? new Date(row.completed_at) : null,
        }));
        for (const row of rows) {
            await ensureExpiration(client, row);
            if (!row.notified_channels || row.notified_channels.length === 0) {
                await notifyTurn(client, row);
            }
            if (shouldSendWarning(row)) {
                await sendWarning(client, row);
            }
            if (row.expires_at && (0, date_fns_1.isAfter)(new Date(), row.expires_at)) {
                await handleTimeout(client, row);
            }
        }
    }
    finally {
        client.release();
    }
}
async function ensureExpiration(client, row) {
    if (row.expires_at || !row.response_window_minutes)
        return;
    const expiresAt = (0, date_fns_1.addMinutes)(row.created_at, row.response_window_minutes);
    await client.query("update public.branch_turns set expires_at = $1 where id = $2", [
        expiresAt,
        row.id,
    ]);
    row.expires_at = expiresAt;
}
async function notifyTurn(client, row) {
    if (!row.recipient_handle)
        return;
    const expiresAt = row.expires_at ?? (0, date_fns_1.addMinutes)(row.created_at, row.response_window_minutes ?? 30);
    const prompt = row.prompt_text ?? `Complete the next beat for ${row.branch_title}`;
    const channels = ["web"];
    if (row.recipient_discord_webhook || env.NOTIFY_WEBHOOK_DISCORD)
        channels.push("discord");
    if (row.recipient_email)
        channels.push("email");
    if (row.recipient_phone)
        channels.push("sms");
    const remainingMs = Math.max(0, expiresAt.getTime() - Date.now());
    const turnUrl = buildTurnUrl(row.id);
    await (0, notifications_js_1.dispatchTurnNotification)({
        branchId: row.branch_id,
        turnId: row.id,
        recipientHandle: row.recipient_handle,
        dueAt: expiresAt,
        prompt,
        channels,
        storyTitle: row.branch_title,
        remainingMs,
        turnUrl,
        email: row.recipient_email ?? undefined,
        phone: row.recipient_phone ?? undefined,
        discordWebhook: row.recipient_discord_webhook ?? env.NOTIFY_WEBHOOK_DISCORD,
    }, env);
    await client.query("update public.branch_turns set notified_channels = $1 where id = $2", [
        channels,
        row.id,
    ]);
    row.notified_channels = channels;
    await (0, analytics_js_1.capture)({
        event: "collab_turn_prompted",
        properties: {
            branch_id: row.branch_id,
            turn_id: row.id,
            recipient_handle: row.recipient_handle,
            channel: channels,
            response_window_minutes: row.response_window_minutes,
            session_id: `hourglass-${row.id}`,
        },
    }, env.POSTHOG_API_KEY);
}
function shouldSendWarning(row) {
    if (!row.expires_at)
        return false;
    if ((row.notified_channels ?? []).includes("warning"))
        return false;
    if (row.completed_at)
        return false;
    const remainingMs = row.expires_at.getTime() - Date.now();
    return remainingMs > 0 && remainingMs <= WARNING_THRESHOLD_MS;
}
async function sendWarning(client, row) {
    if (!row.expires_at)
        return;
    const channels = row.notified_channels ?? [];
    const remainingMs = Math.max(0, row.expires_at.getTime() - Date.now());
    await (0, notifications_js_1.dispatchWarningNotification)({
        branchId: row.branch_id,
        turnId: row.id,
        dueAt: row.expires_at,
        remainingMs,
        storyTitle: row.branch_title,
        prompt: row.prompt_text ?? `Complete the next beat for ${row.branch_title}`,
        channels,
        email: row.recipient_email ?? undefined,
        phone: row.recipient_phone ?? undefined,
        discordWebhook: row.recipient_discord_webhook ?? env.NOTIFY_WEBHOOK_DISCORD,
        turnUrl: buildTurnUrl(row.id),
    }, env);
    const updatedChannels = Array.from(new Set([...(row.notified_channels ?? []), "warning"]));
    await client.query("update public.branch_turns set notified_channels = $1 where id = $2", [
        updatedChannels,
        row.id,
    ]);
    row.notified_channels = updatedChannels;
    await (0, analytics_js_1.capture)({
        event: "collab_turn_warning",
        properties: {
            branch_id: row.branch_id,
            turn_id: row.id,
            response_window_minutes: row.response_window_minutes,
            remaining_ms: Math.max(0, row.expires_at.getTime() - Date.now()),
            session_id: `hourglass-${row.id}`,
        },
    }, env.POSTHOG_API_KEY);
}
async function handleTimeout(client, row) {
    if (row.completed_at)
        return;
    const elapsedMs = row.expires_at ? (0, date_fns_1.differenceInMilliseconds)(new Date(), row.expires_at) : 0;
    const prompt = row.prompt_text ?? `Complete the next beat for ${row.branch_title}`;
    if (row.timeout_strategy === "host_override") {
        await (0, notifications_js_1.dispatchTimeoutNotification)({
            branchId: row.branch_id,
            turnId: row.id,
            elapsedMs,
            channels: row.notified_channels ?? [],
            storyTitle: row.branch_title,
            prompt,
            email: row.recipient_email ?? undefined,
            phone: row.recipient_phone ?? undefined,
            discordWebhook: row.recipient_discord_webhook ?? env.NOTIFY_WEBHOOK_DISCORD,
            turnUrl: buildTurnUrl(row.id),
        }, env);
        return;
    }
    const aiResult = await (0, aiFallback_js_1.generateAIFill)({
        branchId: row.branch_id,
        turnId: row.id,
        prompt,
        model: env.AI_FALLBACK_MODEL,
        apiKey: env.AI_FALLBACK_API_KEY,
    });
    await client.query(`
      update public.branch_turns
      set completed_at = now(),
          completed_by = 'ai',
          auto_filled = true,
          auto_fill_text = $1
      where id = $2
      and completed_at is null
    `, [aiResult.content, row.id]);
    await (0, analytics_js_1.capture)({
        event: "collab_timeout_autofill",
        properties: {
            branch_id: row.branch_id,
            turn_id: row.id,
            response_window_minutes: row.response_window_minutes,
            elapsed_ms: elapsedMs,
            ai_model: aiResult.model,
            session_id: `hourglass-${row.id}`,
        },
    }, env.POSTHOG_API_KEY);
    await (0, notifications_js_1.dispatchTimeoutNotification)({
        branchId: row.branch_id,
        turnId: row.id,
        elapsedMs,
        channels: row.notified_channels ?? [],
        storyTitle: row.branch_title,
        prompt,
        email: row.recipient_email ?? undefined,
        phone: row.recipient_phone ?? undefined,
        discordWebhook: row.recipient_discord_webhook ?? env.NOTIFY_WEBHOOK_DISCORD,
        aiFill: aiResult.content,
        turnUrl: buildTurnUrl(row.id),
    }, env);
}
function buildTurnUrl(turnId) {
    if (!env.APP_BASE_URL)
        return undefined;
    const base = env.APP_BASE_URL.endsWith("/") ? env.APP_BASE_URL.slice(0, -1) : env.APP_BASE_URL;
    return `${base}/angry-lips/turn/${turnId}`;
}
main().catch((error) => {
    console.error("[hourglass] fatal", error);
    process.exitCode = 1;
});
