"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchTurnNotification = dispatchTurnNotification;
exports.dispatchTimeoutNotification = dispatchTimeoutNotification;
exports.dispatchWarningNotification = dispatchWarningNotification;
const node_fetch_1 = __importDefault(require("node-fetch"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const angryLips_js_1 = require("./templates/angryLips.js");
let twilioClient = null; // Twilio disabled for beta
let sendgridReady = false;
function ensureSendGrid(env) {
    if (sendgridReady || !env.NOTIFY_SENDGRID_API_KEY)
        return;
    mail_1.default.setApiKey(env.NOTIFY_SENDGRID_API_KEY);
    sendgridReady = true;
}
function ensureTwilio(env) {
    if (twilioClient || !env.NOTIFY_TWILIO_SID || !env.NOTIFY_TWILIO_AUTH_TOKEN)
        return;
    // twilioClient = new Twilio(env.NOTIFY_TWILIO_SID, env.NOTIFY_TWILIO_AUTH_TOKEN); // SMS disabled
}
async function sendDiscord(message, webhook) {
    if (!webhook) {
        console.info(`[notify] Discord webhook missing, payload:`, message);
        return;
    }
    await (0, node_fetch_1.default)(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
    });
}
async function sendEmail(to, subject, html, env) {
    ensureSendGrid(env);
    if (!sendgridReady || !env.NOTIFY_EMAIL_FROM) {
        console.info(`[notify] Email skipped (config missing)`, { to, subject });
        return;
    }
    await mail_1.default.send({
        to,
        from: env.NOTIFY_EMAIL_FROM,
        subject,
        html,
    });
}
async function sendSms(to, body, env) {
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
async function dispatchTurnNotification(context, env) {
    const { recipientHandle, dueAt, prompt, channels, email, phone, discordWebhook } = context;
    if (channels.includes("discord")) {
        const message = (0, angryLips_js_1.buildDiscordTurnPrompt)({
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
        const { subject, html } = (0, angryLips_js_1.buildEmailTurnPrompt)({
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
        const sms = (0, angryLips_js_1.buildSmsTurnPrompt)({
            storyTitle: context.storyTitle,
            prompt,
            recipientHandle,
            dueAt,
            remainingMs: context.remainingMs,
            turnUrl: context.turnUrl,
        });
        await sendSms(phone, sms, env);
    }
    console.info(`[notify] Turn prompt dispatched`, JSON.stringify({ branchId: context.branchId, turnId: context.turnId, channels }));
}
async function dispatchTimeoutNotification(context, env) {
    const { channels, discordWebhook, email, phone, aiFill } = context;
    if (channels.includes("discord")) {
        const message = (0, angryLips_js_1.buildDiscordTimeout)({
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
        const { subject, html } = (0, angryLips_js_1.buildEmailTimeout)({
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
        const sms = (0, angryLips_js_1.buildSmsTimeout)({
            storyTitle: context.storyTitle,
            prompt: context.prompt,
            recipientHandle: "",
            elapsedMs: context.elapsedMs,
            aiFill,
            turnUrl: context.turnUrl,
        });
        await sendSms(phone, sms, env);
    }
    console.info(`[notify] Timeout dispatched`, JSON.stringify({ branchId: context.branchId, turnId: context.turnId, channels }));
}
async function dispatchWarningNotification(context, env) {
    const { channels, discordWebhook, email, phone } = context;
    if (channels.includes("discord")) {
        const message = (0, angryLips_js_1.buildDiscordWarning)({
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
        const { subject, html } = (0, angryLips_js_1.buildEmailWarning)({
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
        const sms = (0, angryLips_js_1.buildSmsWarning)({
            storyTitle: context.storyTitle,
            prompt: context.prompt,
            recipientHandle: "",
            dueAt: context.dueAt,
            remainingMs: context.remainingMs,
            turnUrl: context.turnUrl,
        });
        await sendSms(phone, sms, env);
    }
    console.info(`[notify] Warning dispatched`, JSON.stringify({ branchId: context.branchId, turnId: context.turnId, channels }));
}
