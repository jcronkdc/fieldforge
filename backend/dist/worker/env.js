"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
function loadEnv() {
    if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("dotenv").config();
        // Development defaults for missing environment variables
        if (!process.env.DATABASE_URL) {
            console.warn('[DEV] DATABASE_URL not set, using default PostgreSQL connection');
            process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fieldforge_dev';
        }
        if (!process.env.SUPABASE_URL) {
            console.warn('[DEV] SUPABASE_URL not set, authentication will be limited in development');
        }
        if (!process.env.SUPABASE_SERVICE_KEY) {
            console.warn('[DEV] SUPABASE_SERVICE_KEY not set, authentication will be limited in development');
        }
    }
    const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, POSTHOG_API_KEY, AI_FALLBACK_MODEL, AI_FALLBACK_API_KEY, AI_PROVIDER_URL, AI_PROVIDER_API_KEY, AI_PROVIDER_MODEL, NOTIFY_WEBHOOK_DISCORD, NOTIFY_SENDGRID_API_KEY, NOTIFY_EMAIL_FROM, NOTIFY_TWILIO_SID, NOTIFY_TWILIO_AUTH_TOKEN, NOTIFY_TWILIO_FROM, APP_BASE_URL, ABLY_API_KEY, } = process.env;
    if (!DATABASE_URL) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("DATABASE_URL env var is required in production");
        }
        console.error('⚠️ DATABASE_URL not set - database features will not work');
    }
    return {
        DATABASE_URL: DATABASE_URL,
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
