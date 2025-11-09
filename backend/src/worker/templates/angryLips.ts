interface BaseTemplateInput {
  storyTitle: string;
  prompt: string;
  recipientHandle?: string;
  turnUrl?: string;
}

interface TurnPromptInput extends BaseTemplateInput {
  dueAt: Date;
  remainingMs: number;
}

interface WarningInput extends BaseTemplateInput {
  dueAt: Date;
  remainingMs: number;
}

interface TimeoutInput extends BaseTemplateInput {
  elapsedMs: number;
  aiFill?: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

export function buildDiscordTurnPrompt(input: TurnPromptInput) {
  const countdown = formatCountdown(input.dueAt);
  const dueLabel = dateFormatter.format(input.dueAt);

  return {
    content: `⏳ **${countdown}** left · ${input.recipientHandle ?? "Crew"}, it's your turn!`,
    embeds: [
      {
        title: input.storyTitle,
        description: `${input.prompt}\n\nRespond before **${dueLabel}**${
          input.turnUrl ? `\n[Open turn](${input.turnUrl})` : ""
        }\nAI fills the blank if the hourglass empties.`,
        color: 0x5eead4,
      },
    ],
    allowed_mentions: { parse: [] as string[] },
  };
}

export function buildDiscordWarning(input: WarningInput) {
  const countdown = formatDuration(input.remainingMs);

  return {
    content: `⚠️ **${countdown}** left!`,
    embeds: [
      {
        title: input.storyTitle,
        description: `${input.prompt}\n⏳ ${countdown} remaining${input.turnUrl ? `\n[Finish turn](${input.turnUrl})` : ""}`,
        color: 0xf97316,
      },
    ],
    allowed_mentions: { parse: [] as string[] },
  };
}

export function buildDiscordTimeout(input: TimeoutInput) {
  return {
    content: `⌛ Hourglass expired for **${input.storyTitle}**`,
    embeds: [
      {
        title: input.prompt,
        description: input.aiFill
          ? `AI co-host filled the blank with:\n> ${input.aiFill}`
          : `Host override needed to keep the story moving.`,
        color: input.aiFill ? 0xa855f7 : 0xfbbf24,
        footer: { text: `Elapsed since expiry: ${formatDuration(input.elapsedMs)}` },
      },
    ],
    allowed_mentions: { parse: [] as string[] },
  };
}

export function buildEmailTurnPrompt(input: TurnPromptInput) {
  const countdown = formatCountdown(input.dueAt);
  const dueLabel = dateFormatter.format(input.dueAt);
  const subject = `Angry Lips – ${countdown} left (${input.storyTitle})`;

  const html = `
    <div style="font-family:Inter,system-ui; background:#020617; padding:24px; color:#e2e8f0;">
      <div style="max-width:520px; margin:0 auto; background:rgba(15,23,42,0.75); border:1px solid rgba(94,234,212,0.35); border-radius:16px; padding:24px;">
        <p style="letter-spacing:0.35em; text-transform:uppercase; color:#64748b; font-size:11px; margin:0 0 12px;">Angry Lips Turn</p>
        <h1 style="margin:0 0 12px; font-size:24px; color:#f8fafc;">${escapeHtml(input.storyTitle)}</h1>
        <p style="margin:0 0 20px; font-size:15px; color:#cbd5f5;">${escapeHtml(input.prompt)}</p>
        <div style="background:rgba(14,116,144,0.25); border-radius:12px; padding:16px; margin-bottom:24px;">
          <p style="margin:0; font-size:14px;">⏳ <strong>${countdown}</strong> remaining</p>
          <p style="margin:8px 0 0; font-size:13px; color:#94a3b8;">Hourglass empties at <strong>${dueLabel}</strong>.</p>
        </div>
        ${input.turnUrl ? CTAButton(input.turnUrl, "Open live turn") : ""}
        <p style="margin:24px 0 0; font-size:12px; color:#64748b;">Reply to this email or tap the button – all responses land in the same turn.</p>
      </div>
    </div>
  `;

  return { subject, html };
}

export function buildEmailWarning(input: WarningInput) {
  const countdown = formatDuration(input.remainingMs);
  const subject = `Angry Lips – 1 minute left`; 
  const html = `
    <div style="font-family:Inter,system-ui; background:#020617; padding:24px; color:#e2e8f0;">
      <div style="max-width:520px; margin:0 auto; background:rgba(76,29,149,0.6); border:1px solid rgba(248,113,113,0.45); border-radius:16px; padding:24px;">
        <h1 style="margin:0 0 12px; font-size:22px; color:#fee2e2;">One minute remaining!</h1>
        <p style="margin:0 0 16px; font-size:15px; color:#f8fafc;">${escapeHtml(input.prompt)}</p>
        <p style="margin:0 0 24px; font-size:14px;">⏳ <strong>${countdown}</strong> left.</p>
        ${input.turnUrl ? CTAButton(input.turnUrl, "Finish turn") : ""}
      </div>
    </div>
  `;

  return { subject, html };
}

export function buildEmailTimeout(input: TimeoutInput) {
  const subject = `Angry Lips turn auto-filled`;
  const html = `
    <div style="font-family:Inter,system-ui; background:#020617; padding:24px; color:#e2e8f0;">
      <div style="max-width:520px; margin:0 auto; background:rgba(122,53,191,0.4); border:1px solid rgba(217,70,239,0.45); border-radius:16px; padding:24px;">
        <h1 style="margin:0 0 12px; font-size:22px; color:#f5d0fe;">Hourglass expired</h1>
        <p style="margin:0 0 16px; font-size:15px; color:#f8fafc;">${escapeHtml(input.prompt)}</p>
        ${
          input.aiFill
            ? `<p style="margin:0 0 16px; font-size:14px;">AI co-host filled the blank with:</p><blockquote style="margin:0 0 16px; font-size:16px; color:#f8fafc;">${escapeHtml(
                input.aiFill
              )}</blockquote>`
            : `<p style="margin:0 0 16px; font-size:14px;">Host override needed to resume the story.</p>`
        }
        <p style="margin:0 0 24px; font-size:13px; color:#cbd5f5;">Elapsed since expiry: ${formatDuration(input.elapsedMs)}</p>
      </div>
    </div>
  `;

  return { subject, html };
}

export function buildSmsTurnPrompt(input: TurnPromptInput) {
  const countdown = formatCountdown(input.dueAt);
  return `Angry Lips: ${input.prompt} (${countdown} left)${input.turnUrl ? ` → ${input.turnUrl}` : ""}`;
}

export function buildSmsWarning(input: WarningInput) {
  const countdown = formatDuration(input.remainingMs);
  return `Angry Lips: ${countdown} left! ${input.prompt}${input.turnUrl ? ` → ${input.turnUrl}` : ""}`;
}

export function buildSmsTimeout(input: TimeoutInput) {
  return input.aiFill
    ? `Angry Lips: timer expired. AI filled with "${input.aiFill}".`
    : `Angry Lips: timer expired. Host override needed.`;
}

function formatCountdown(dueAt: Date): string {
  const diff = Math.max(0, dueAt.getTime() - Date.now());
  return formatDuration(diff);
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function CTAButton(url: string, label: string) {
  return `
    <a
      href="${url}"
      style="display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;background:#5eead4;color:#020617;text-decoration:none;border-radius:9999px;font-weight:600;"
    >
      ${label} →
    </a>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


