"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
function loadEnv() {
    if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("dotenv").config();
    }
    const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, POSTHOG_API_KEY, AI_FALLBACK_MODEL, AI_FALLBACK_API_KEY, AI_PROVIDER_URL, AI_PROVIDER_API_KEY, AI_PROVIDER_MODEL, NOTIFY_WEBHOOK_DISCORD, NOTIFY_SENDGRID_API_KEY, NOTIFY_EMAIL_FROM, NOTIFY_TWILIO_SID, NOTIFY_TWILIO_AUTH_TOKEN, NOTIFY_TWILIO_FROM, APP_BASE_URL, ABLY_API_KEY, } = process.env;
    if (!DATABASE_URL) {
        throw new Error("DATABASE_URL env var is required for the hourglass worker");
    }
    return {
        DATABASE_URL,
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        POSTHOG_API_KEY,
        AI_FALLBACK_MODEL,
        AI_FALLBACK_API_KEY,
        NOTIFY_WEBHOOK_DISCORD,
        NOTIFY_SENDGRID_API_KEY,
        NOTIFY_EMAIL_FROM,
        NOTIFY_TWILIO_SID,
        NOTIFY_TWILIO_AUTH_TOKEN,
        NOTIFY_TWILIO_FROM,
        APP_BASE_URL,
        ABLY_API_KEY,
        AI_PROVIDER_URL,
        AI_PROVIDER_API_KEY,
        AI_PROVIDER_MODEL,
    };
}
