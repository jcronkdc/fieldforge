"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const angryLips_js_1 = require("../worker/templates/angryLips.js");
const baseUrl = process.env.APP_BASE_URL ?? "https://mythatron.app";
const now = new Date();
const dueSoon = new Date(now.getTime() + 5 * 60 * 1000);
const warningDue = new Date(now.getTime() + 60 * 1000);
const baseInput = {
    storyTitle: "Aurora Heist – Party Pack",
    prompt: "@Starlight, we need a ridiculous noun",
    recipientHandle: "@Starlight",
    turnUrl: `${baseUrl}/angry-lips/turn/turn-aurora-1`,
};
const turnContext = {
    ...baseInput,
    dueAt: dueSoon,
    remainingMs: dueSoon.getTime() - now.getTime(),
};
const warningContext = {
    ...baseInput,
    dueAt: warningDue,
    remainingMs: warningDue.getTime() - now.getTime(),
};
const timeoutContext = {
    ...baseInput,
    elapsedMs: 90_000,
    aiFill: "A quantum donut materializes and hijacks the vault alarms.",
};
function logSection(title, payload) {
    console.log(`\n=== ${title} ===`);
    if (typeof payload === "string") {
        console.log(payload);
    }
    else {
        console.log(JSON.stringify(payload, null, 2));
    }
}
console.log("Previewing Angry Lips notification templates");
console.log(`Base URL: ${baseUrl}`);
console.log(`Generated at: ${(0, date_fns_1.formatISO)(now)}`);
// Discord payloads
logSection("Discord · Turn Prompt", (0, angryLips_js_1.buildDiscordTurnPrompt)(turnContext));
logSection("Discord · Warning", (0, angryLips_js_1.buildDiscordWarning)(warningContext));
logSection("Discord · Timeout", (0, angryLips_js_1.buildDiscordTimeout)(timeoutContext));
// Email payloads
const turnEmail = (0, angryLips_js_1.buildEmailTurnPrompt)(turnContext);
const warningEmail = (0, angryLips_js_1.buildEmailWarning)(warningContext);
const timeoutEmail = (0, angryLips_js_1.buildEmailTimeout)(timeoutContext);
logSection("Email · Turn Prompt (subject)", turnEmail.subject);
logSection("Email · Turn Prompt (html)", turnEmail.html);
logSection("Email · Warning (subject)", warningEmail.subject);
logSection("Email · Warning (html)", warningEmail.html);
logSection("Email · Timeout (subject)", timeoutEmail.subject);
logSection("Email · Timeout (html)", timeoutEmail.html);
// SMS payloads
logSection("SMS · Turn Prompt", (0, angryLips_js_1.buildSmsTurnPrompt)(turnContext));
logSection("SMS · Warning", (0, angryLips_js_1.buildSmsWarning)(warningContext));
logSection("SMS · Timeout", (0, angryLips_js_1.buildSmsTimeout)(timeoutContext));
