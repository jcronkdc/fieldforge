/**
 * Authentication System Verification Script
 * Verifies that all authentication components are properly configured
 */

import { loadEnv } from '../worker/env.js';
import { createClient } from '@supabase/supabase-js';

async function verifyAuthSystem() {
  console.log('🔐 Verifying Authentication System Configuration\n');
  
  const env = loadEnv();
  let allChecksPassed = true;

  // Check 1: Supabase Configuration
  console.log('1️⃣  Checking Supabase Configuration...');
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    console.log('   ✅ SUPABASE_URL is set');
    console.log('   ✅ SUPABASE_SERVICE_KEY is set');
    
    // Test Supabase connection
    try {
      const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      // Try a simple query to verify connection
      const { error } = await supabaseAdmin.from('user_profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (acceptable)
        console.log('   ⚠️  Supabase connection test:', error.message);
      } else {
        console.log('   ✅ Supabase connection verified');
      }
    } catch (error) {
      console.log('   ⚠️  Could not verify Supabase connection:', error instanceof Error ? error.message : 'Unknown error');
    }
  } else {
    console.log('   ⚠️  SUPABASE_URL:', env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('   ⚠️  SUPABASE_SERVICE_KEY:', env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
    console.log('   ℹ️  Note: Auth will fall back to header-based auth in production');
    allChecksPassed = false;
  }

  // Check 2: Database Configuration
  console.log('\n2️⃣  Checking Database Configuration...');
  if (env.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL is set');
    
    // Test database connection
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: env.DATABASE_URL });
      const result = await pool.query('SELECT NOW()');
      await pool.end();
      console.log('   ✅ Database connection verified');
    } catch (error) {
      console.log('   ⚠️  Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
      allChecksPassed = false;
    }
  } else {
    console.log('   ❌ DATABASE_URL is missing');
    console.log('   ⚠️  Audit logging will not work without database');
    allChecksPassed = false;
  }

  // Check 3: Audit Logs Table
  console.log('\n3️⃣  Checking Audit Logs Table...');
  if (env.DATABASE_URL) {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: env.DATABASE_URL });
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'audit_logs'
        )
      `);
      await pool.end();
      
      if (result.rows[0].exists) {
        console.log('   ✅ audit_logs table exists');
      } else {
        console.log('   ⚠️  audit_logs table does not exist');
        console.log('   ℹ️  Run migration: npm run migrate');
        allChecksPassed = false;
      }
    } catch (error) {
      console.log('   ⚠️  Could not check audit_logs table:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Check 4: Rate Limiting
  console.log('\n4️⃣  Checking Rate Limiting...');
  try {
    const rateLimit = await import('../middleware/rateLimit.js');
    if (typeof rateLimit.apiLimiter === 'function' && typeof rateLimit.authLimiter === 'function') {
      console.log('   ✅ Rate limiting middleware loaded');
      console.log('   ✅ apiLimiter configured');
      console.log('   ✅ authLimiter configured');
    } else {
      console.log('   ⚠️  Rate limiting middleware not properly exported');
      allChecksPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Rate limiting middleware error:', error instanceof Error ? error.message : 'Unknown error');
    allChecksPassed = false;
  }

  // Check 5: Audit Logging
  console.log('\n5️⃣  Checking Audit Logging...');
  try {
    const auditLog = await import('../middleware/auditLog.js');
    if (typeof auditLog.logAuditEvent === 'function' && typeof auditLog.logTokenVerification === 'function') {
      console.log('   ✅ Audit logging functions available');
    } else {
      console.log('   ⚠️  Audit logging functions not properly exported');
      allChecksPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Audit logging error:', error instanceof Error ? error.message : 'Unknown error');
    allChecksPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allChecksPassed) {
    console.log('✅ All checks passed! Authentication system is ready.');
  } else {
    console.log('⚠️  Some checks failed. Review the warnings above.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Set DATABASE_URL in your .env file');
    console.log('   2. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    console.log('   3. Run migrations: npm run migrate');
  }
  console.log('='.repeat(50) + '\n');
}

// Run verification
if (require.main === module) {
  verifyAuthSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

export { verifyAuthSystem };

