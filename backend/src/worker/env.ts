export interface Env {
  DATABASE_URL: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;
  POSTHOG_API_KEY?: string;
  AI_FALLBACK_MODEL?: string;
  AI_FALLBACK_API_KEY?: string;
  AI_PROVIDER_URL?: string;
  AI_PROVIDER_API_KEY?: string;
  AI_PROVIDER_MODEL?: string;
  // Cloud AI (Powerful but sends data to external services)
  ANTHROPIC_API_KEY?: string;  // Claude Sonnet 4.5 - Most powerful AI
  OPENAI_API_KEY?: string;      // GPT-4 Turbo - Fallback AI
  XAI_API_KEY?: string;          // Grok (xAI) - Alternative powerful AI
  
  // Local AI (Private, NDA-compliant, data never leaves company)
  LOCAL_AI_ENABLED?: string;    // Set to 'true' to use local AI only
  LOCAL_AI_URL?: string;        // URL to local AI endpoint (e.g., Ollama, LM Studio, LocalAI)
  LOCAL_AI_MODEL?: string;      // Model name (e.g., 'llama3', 'mistral', 'codellama')
  
  OPENWEATHER_API_KEY?: string; // Real-time weather & forecasts
  AGROMONITORING_API_KEY?: string; // Agricultural monitoring (soil, vegetation, satellite)
  NOTIFY_WEBHOOK_DISCORD?: string;
  NOTIFY_SENDGRID_API_KEY?: string;
  NOTIFY_EMAIL_FROM?: string;
  NOTIFY_TWILIO_SID?: string;
  NOTIFY_TWILIO_AUTH_TOKEN?: string;
  NOTIFY_TWILIO_FROM?: string;
  APP_BASE_URL?: string;
  ABLY_API_KEY?: string;
  DAILY_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string; // Changed from _KEY to match usage
  RESEND_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  SIREN_API_ENDPOINT?: string;
}

export function loadEnv(): Env {
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

  const {
    DATABASE_URL,
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    POSTHOG_API_KEY,
    AI_FALLBACK_MODEL,
    AI_FALLBACK_API_KEY,
    AI_PROVIDER_URL,
    AI_PROVIDER_API_KEY,
    AI_PROVIDER_MODEL,
    ANTHROPIC_API_KEY,
    OPENAI_API_KEY,
    OPENWEATHER_API_KEY,
    NOTIFY_WEBHOOK_DISCORD,
    NOTIFY_SENDGRID_API_KEY,
    NOTIFY_EMAIL_FROM,
    NOTIFY_TWILIO_SID,
    NOTIFY_TWILIO_AUTH_TOKEN,
    NOTIFY_TWILIO_FROM,
    APP_BASE_URL,
    ABLY_API_KEY,
    DAILY_API_KEY,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    SIREN_API_ENDPOINT,
  } = process.env;

  if (!DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL env var is required in production");
    }
    console.error('⚠️ DATABASE_URL not set - database features will not work');
  }

  return {
    DATABASE_URL: DATABASE_URL!,
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
    ANTHROPIC_API_KEY,
    OPENAI_API_KEY,
    DAILY_API_KEY,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET, // Use STRIPE_WEBHOOK_SECRET not _KEY
    RESEND_API_KEY,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    SIREN_API_ENDPOINT,
  };
}

