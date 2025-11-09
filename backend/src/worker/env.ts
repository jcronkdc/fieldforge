export interface Env {
  DATABASE_URL: string;
  SUPABASE_SERVICE_KEY?: string;
  POSTHOG_API_KEY?: string;
  AI_FALLBACK_MODEL?: string;
  AI_FALLBACK_API_KEY?: string;
  AI_PROVIDER_URL?: string;
  AI_PROVIDER_API_KEY?: string;
  AI_PROVIDER_MODEL?: string;
  NOTIFY_WEBHOOK_DISCORD?: string;
  NOTIFY_SENDGRID_API_KEY?: string;
  NOTIFY_EMAIL_FROM?: string;
  NOTIFY_TWILIO_SID?: string;
  NOTIFY_TWILIO_AUTH_TOKEN?: string;
  NOTIFY_TWILIO_FROM?: string;
  APP_BASE_URL?: string;
  ABLY_API_KEY?: string;
}

export function loadEnv(): Env {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config();
  }

  const {
    DATABASE_URL,
    SUPABASE_SERVICE_KEY,
    POSTHOG_API_KEY,
    AI_FALLBACK_MODEL,
    AI_FALLBACK_API_KEY,
    AI_PROVIDER_URL,
    AI_PROVIDER_API_KEY,
    AI_PROVIDER_MODEL,
    NOTIFY_WEBHOOK_DISCORD,
    NOTIFY_SENDGRID_API_KEY,
    NOTIFY_EMAIL_FROM,
    NOTIFY_TWILIO_SID,
    NOTIFY_TWILIO_AUTH_TOKEN,
    NOTIFY_TWILIO_FROM,
    APP_BASE_URL,
    ABLY_API_KEY,
  } = process.env;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL env var is required for the hourglass worker");
  }

  return {
    DATABASE_URL,
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

