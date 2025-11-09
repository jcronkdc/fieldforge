import fetch from "node-fetch";
import sgMail from "@sendgrid/mail";
// import { Twilio } from "twilio"; // SMS disabled for beta - not needed
import type { Env } from "./env.js";
import {
  buildDiscordTurnPrompt,
  buildDiscordWarning,
  buildDiscordTimeout,
  buildEmailTurnPrompt,
  buildEmailWarning,
  buildEmailTimeout,
  buildSmsTurnPrompt,
  buildSmsWarning,
  buildSmsTimeout,
} from "./templates/angryLips.js";

interface NotificationContext {
  branchId: string;
  turnId: string;
  recipientHandle: string;
  dueAt: Date;
  prompt: string;
  channels: string[];
  storyTitle: string;
  remainingMs: number;
  turnUrl?: string;
  email?: string;
  phone?: string;
  discordWebhook?: string;
}

interface TimeoutContext {
  branchId: string;
  turnId: string;
  elapsedMs: number;
  channels: string[];
  storyTitle: string;
  prompt: string;
  email?: string;
  phone?: string;
  discordWebhook?: string;
  aiFill?: string;
  turnUrl?: string;
}

interface WarningContext {
  branchId: string;
  turnId: string;
  dueAt: Date;
  remainingMs: number;
  channels: string[];
  storyTitle: string;
  prompt: string;
  email?: string;
  phone?: string;
  discordWebhook?: string;
  turnUrl?: string;
}

let twilioClient: any | null = null; // Twilio disabled for beta
let sendgridReady = false;

function ensureSendGrid(env: Env) {
  if (sendgridReady || !env.NOTIFY_SENDGRID_API_KEY) return;
  sgMail.setApiKey(env.NOTIFY_SENDGRID_API_KEY);
  sendgridReady = true;
}

function ensureTwilio(env: Env) {
  if (twilioClient || !env.NOTIFY_TWILIO_SID || !env.NOTIFY_TWILIO_AUTH_TOKEN) return;
  // twilioClient = new Twilio(env.NOTIFY_TWILIO_SID, env.NOTIFY_TWILIO_AUTH_TOKEN); // SMS disabled
}

async function sendDiscord(message: Record<string, unknown>, webhook?: string) {
  if (!webhook) {
    console.info(`[notify] Discord webhook missing, payload:`, message);
    return;
  }

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}

async function sendEmail(to: string, subject: string, html: string, env: Env) {
  ensureSendGrid(env);
  if (!sendgridReady || !env.NOTIFY_EMAIL_FROM) {
    console.info(`[notify] Email skipped (config missing)`, { to, subject });
    return;
  }

  await sgMail.send({
    to,
    from: env.NOTIFY_EMAIL_FROM,
    subject,
    html,
  });
}

async function sendSms(to: string, body: string, env: Env) {
  ensureTwilio(env);
  if (!twilioClient || !env.NOTIFY_TWILIO_FROM) {
    console.info(`[notify] SMS skipped (config missing)`, { to, body });
    return;
  }

  // SMS sending disabled for beta - no Twilio needed
  console.info(`[notify] SMS would send to ${to}: ${body.substring(0, 50)}...`);
  return;
  // await twilioClient.messages.create({
  //   to,
  //   from: env.NOTIFY_TWILIO_FROM,
  //   body,
  // });
}

export async function dispatchTurnNotification(context: NotificationContext, env: Env) {
  const { recipientHandle, dueAt, prompt, channels, email, phone, discordWebhook } = context;

  if (channels.includes("discord")) {
    const message = buildDiscordTurnPrompt({
      storyTitle: context.storyTitle,
      prompt,
      recipientHandle,
      dueAt,
      remainingMs: context.remainingMs,
      turnUrl: context.turnUrl,
    });
    await sendDiscord(message, discordWebhook);
  }

  if (channels.includes("email") && email) {
    const { subject, html } = buildEmailTurnPrompt({
      storyTitle: context.storyTitle,
      prompt,
      recipientHandle,
      dueAt,
      remainingMs: context.remainingMs,
      turnUrl: context.turnUrl,
    });
    await sendEmail(email, subject, html, env);
  }

  if (channels.includes("sms") && phone) {
    const sms = buildSmsTurnPrompt({
      storyTitle: context.storyTitle,
      prompt,
      recipientHandle,
      dueAt,
      remainingMs: context.remainingMs,
      turnUrl: context.turnUrl,
    });
    await sendSms(phone, sms, env);
  }

  console.info(
    `[notify] Turn prompt dispatched`,
    JSON.stringify({ branchId: context.branchId, turnId: context.turnId, channels })
  );
}

export async function dispatchTimeoutNotification(context: TimeoutContext, env: Env) {
  const { channels, discordWebhook, email, phone, aiFill } = context;

  if (channels.includes("discord")) {
    const message = buildDiscordTimeout({
      storyTitle: context.storyTitle,
      prompt: context.prompt,
      recipientHandle: "",
      elapsedMs: context.elapsedMs,
      aiFill,
      turnUrl: context.turnUrl,
    });
    await sendDiscord(message, discordWebhook);
  }

  if (channels.includes("email") && email) {
    const { subject, html } = buildEmailTimeout({
      storyTitle: context.storyTitle,
      prompt: context.prompt,
      recipientHandle: "",
      elapsedMs: context.elapsedMs,
      aiFill,
      turnUrl: context.turnUrl,
    });
    await sendEmail(email, subject, html, env);
  }

  if (channels.includes("sms") && phone) {
    const sms = buildSmsTimeout({
      storyTitle: context.storyTitle,
      prompt: context.prompt,
      recipientHandle: "",
      elapsedMs: context.elapsedMs,
      aiFill,
      turnUrl: context.turnUrl,
    });
    await sendSms(phone, sms, env);
  }

  console.info(
    `[notify] Timeout dispatched`,
    JSON.stringify({ branchId: context.branchId, turnId: context.turnId, channels })
  );
}

export async function dispatchWarningNotification(context: WarningContext, env: Env) {
  const { channels, discordWebhook, email, phone } = context;

  if (channels.includes("discord")) {
    const message = buildDiscordWarning({
      storyTitle: context.storyTitle,
      prompt: context.prompt,
      recipientHandle: "",
      dueAt: context.dueAt,
      remainingMs: context.remainingMs,
      turnUrl: context.turnUrl,
    });
    await sendDiscord(message, discordWebhook);
  }

  if (channels.includes("email") && email) {
    const { subject, html } = buildEmailWarning({
      storyTitle: context.storyTitle,
      prompt: context.prompt,
      recipientHandle: "",
      dueAt: context.dueAt,
      remainingMs: context.remainingMs,
      turnUrl: context.turnUrl,
    });
    await sendEmail(email, subject, html, env);
  }

  if (channels.includes("sms") && phone) {
    const sms = buildSmsWarning({
      storyTitle: context.storyTitle,
      prompt: context.prompt,
      recipientHandle: "",
      dueAt: context.dueAt,
      remainingMs: context.remainingMs,
      turnUrl: context.turnUrl,
    });
    await sendSms(phone, sms, env);
  }

  console.info(
    `[notify] Warning dispatched`,
    JSON.stringify({ branchId: context.branchId, turnId: context.turnId, channels })
  );
}

