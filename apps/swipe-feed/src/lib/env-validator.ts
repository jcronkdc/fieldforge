/**
 * ENVIRONMENT VALIDATOR
 * 
 * Validates that all required environment variables are present
 * and provides clear error messages if they're not.
 */

interface EnvConfig {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_API_BASE_URL?: string;
  VITE_VAPID_PUBLIC_KEY?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const env: EnvConfig = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  if (!env.VITE_SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is required for authentication');
  } else if (!env.VITE_SUPABASE_URL.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!env.VITE_SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is required for authentication');
  } else if (env.VITE_SUPABASE_ANON_KEY.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  // Check optional variables
  if (!env.VITE_API_BASE_URL) {
    warnings.push('VITE_API_BASE_URL not set - backend features may not work');
  }

  if (!env.VITE_VAPID_PUBLIC_KEY) {
    warnings.push('VITE_VAPID_PUBLIC_KEY not set - push notifications will not work');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function logEnvironmentStatus() {
  const validation = validateEnvironment();
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed');
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:', validation.warnings);
    }
  } else {
    console.error('❌ Environment validation failed');
    validation.errors.forEach(error => {
      console.error('  -', error);
    });
    
    console.error('\n📋 To fix this:');
    console.error('1. Check your .env file in apps/swipe-feed/');
    console.error('2. Ensure all required variables are set');
    console.error('3. Restart your dev server after making changes');
    
    if (import.meta.env.PROD) {
      throw new Error('Invalid environment configuration');
    }
  }
  
  return validation;
}

export function getEnvStatus(): 'production' | 'development' | 'test' {
  if (import.meta.env.PROD) return 'production';
  if (import.meta.env.MODE === 'test') return 'test';
  return 'development';
}













