import { Pool, PoolClient } from "pg";
import { addMinutes, differenceInMilliseconds, isAfter } from "date-fns";
import { loadEnv } from "./env.js";
import {
  dispatchTimeoutNotification,
  dispatchTurnNotification,
  dispatchWarningNotification,
} from "./notifications.js";
import { generateAIFill } from "./aiFallback.js";
import { capture } from "./analytics.js";

interface BranchTurnRow {
  id: string;
  branch_id: string;
  branch_title: string;
  world_id?: string | null;
  response_window_minutes: number | null;
  timeout_strategy: "ai_autofill" | "host_override" | null;
  notified_channels: string[] | null;
  expires_at: Date | null;
  created_at: Date;
  completed_at: Date | null;
  completed_by: string | null;
  auto_filled: boolean | null;
  auto_fill_text: string | null;
  recipient_handle: string | null;
  prompt_text: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  recipient_discord_webhook: string | null;
}

import pool from "../database.js";
const env = loadEnv();
const LOOP_INTERVAL_MS = Number(process.env.HOURGLASS_INTERVAL_MS ?? 30_000);
const WARNING_THRESHOLD_MS = Number(process.env.HOURGLASS_WARNING_MS ?? 60_000);

let isRunning = false;

async function main() {
  const runOnce = process.argv.includes("--once");

  const tick = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await processBatch();
    } catch (error) {
      console.error("[hourglass] error", error);
    } finally {
      isRunning = false;
    }
  };

  await tick();

  if (runOnce) {
    await pool.end();
    return;
  }

  setInterval(tick, LOOP_INTERVAL_MS);
}

async function processBatch() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
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
      `
    );

    const rows: BranchTurnRow[] = result.rows.map((row: any) => ({
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

      if (row.expires_at && isAfter(new Date(), row.expires_at)) {
        await handleTimeout(client, row);
      }
    }
  } finally {
    client.release();
  }
}

async function ensureExpiration(client: PoolClient, row: BranchTurnRow) {
  if (row.expires_at || !row.response_window_minutes) return;

  const expiresAt = addMinutes(row.created_at, row.response_window_minutes);
  await client.query("update public.branch_turns set expires_at = $1 where id = $2", [
    expiresAt,
    row.id,
  ]);
  row.expires_at = expiresAt;
}

async function notifyTurn(client: PoolClient, row: BranchTurnRow) {
  if (!row.recipient_handle) return;

  const expiresAt = row.expires_at ?? addMinutes(row.created_at, row.response_window_minutes ?? 30);
  const prompt = row.prompt_text ?? `Complete the next beat for ${row.branch_title}`;
  const channels: string[] = ["web"];
  if (row.recipient_discord_webhook || env.NOTIFY_WEBHOOK_DISCORD) channels.push("discord");
  if (row.recipient_email) channels.push("email");
  if (row.recipient_phone) channels.push("sms");
  const remainingMs = Math.max(0, expiresAt.getTime() - Date.now());
  const turnUrl = buildTurnUrl(row.id);

  await dispatchTurnNotification(
    {
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
    },
    env
  );

  await client.query("update public.branch_turns set notified_channels = $1 where id = $2", [
    channels,
    row.id,
  ]);

  row.notified_channels = channels;

  await capture(
    {
      event: "collab_turn_prompted",
      properties: {
        branch_id: row.branch_id,
        turn_id: row.id,
        recipient_handle: row.recipient_handle,
        channel: channels,
        response_window_minutes: row.response_window_minutes,
        session_id: `hourglass-${row.id}`,
      },
    },
    env.POSTHOG_API_KEY
  );
}

function shouldSendWarning(row: BranchTurnRow): boolean {
  if (!row.expires_at) return false;
  if ((row.notified_channels ?? []).includes("warning")) return false;
  if (row.completed_at) return false;

  const remainingMs = row.expires_at.getTime() - Date.now();
  return remainingMs > 0 && remainingMs <= WARNING_THRESHOLD_MS;
}

async function sendWarning(client: PoolClient, row: BranchTurnRow) {
  if (!row.expires_at) return;

  const channels = row.notified_channels ?? [];
  const remainingMs = Math.max(0, row.expires_at.getTime() - Date.now());

  await dispatchWarningNotification(
    {
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
    },
    env
  );

  const updatedChannels = Array.from(new Set([...(row.notified_channels ?? []), "warning"]));
  await client.query("update public.branch_turns set notified_channels = $1 where id = $2", [
    updatedChannels,
    row.id,
  ]);
  row.notified_channels = updatedChannels;

  await capture(
    {
      event: "collab_turn_warning",
      properties: {
        branch_id: row.branch_id,
        turn_id: row.id,
        response_window_minutes: row.response_window_minutes,
        remaining_ms: Math.max(0, row.expires_at.getTime() - Date.now()),
        session_id: `hourglass-${row.id}`,
      },
    },
    env.POSTHOG_API_KEY
  );
}

async function handleTimeout(client: PoolClient, row: BranchTurnRow) {
  if (row.completed_at) return;

  const elapsedMs = row.expires_at ? differenceInMilliseconds(new Date(), row.expires_at) : 0;
  const prompt = row.prompt_text ?? `Complete the next beat for ${row.branch_title}`;

  if (row.timeout_strategy === "host_override") {
    await dispatchTimeoutNotification(
      {
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
      },
      env
    );
    return;
  }

  const aiResult = await generateAIFill({
    branchId: row.branch_id,
    turnId: row.id,
    prompt,
    model: env.AI_FALLBACK_MODEL,
    apiKey: env.AI_FALLBACK_API_KEY,
  });

  await client.query(
    `
      update public.branch_turns
      set completed_at = now(),
          completed_by = 'ai',
          auto_filled = true,
          auto_fill_text = $1
      where id = $2
      and completed_at is null
    `,
    [aiResult.content, row.id]
  );

  await capture(
    {
      event: "collab_timeout_autofill",
      properties: {
        branch_id: row.branch_id,
        turn_id: row.id,
        response_window_minutes: row.response_window_minutes,
        elapsed_ms: elapsedMs,
        ai_model: aiResult.model,
        session_id: `hourglass-${row.id}`,
      },
    },
    env.POSTHOG_API_KEY
  );

  await dispatchTimeoutNotification(
    {
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
    },
    env
  );
}

function buildTurnUrl(turnId: string): string | undefined {
  if (!env.APP_BASE_URL) return undefined;
  const base = env.APP_BASE_URL.endsWith("/") ? env.APP_BASE_URL.slice(0, -1) : env.APP_BASE_URL;
  return `${base}/angry-lips/turn/${turnId}`;
}

main().catch((error) => {
  console.error("[hourglass] fatal", error);
  process.exitCode = 1;
});

