/**
 * 🍄⚡ F81 DEMO ACCOUNT LOGIN TEST
 * 
 * Tests login flow with demo account credentials
 * Run with: node test-login-demo.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'apps/swipe-feed/.env.local') });
dotenv.config({ path: join(__dirname, 'apps/swipe-feed/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo credentials from Landing.tsx
const DEMO_ACCOUNTS = [
  {
    role: 'Field Worker',
    email: 'demo@fieldforge.com',
    password: 'FieldForge2025!Demo'
  },
  {
    role: 'Manager',
    email: 'manager@fieldforge.com',
    password: 'FieldForge2025!Demo'
  },
  {
    role: 'Admin',
    email: 'admin@fieldforge.com',
    password: 'FieldForge2025!Demo'
  }
];

async function testLogin(email, password, role) {
  console.log(`\n🔐 Testing login for ${role}...`);
  console.log(`   Email: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`   ❌ Login failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    if (data.session) {
      console.log(`   ✅ Login successful!`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Session expires: ${new Date(data.session.expires_at * 1000).toLocaleString()}`);
      
      // Sign out after test
      await supabase.auth.signOut();
      console.log(`   ✅ Signed out`);
      
      return { success: true, user: data.user, session: data.session };
    } else {
      console.error(`   ❌ No session returned`);
      return { success: false, error: 'No session returned' };
    }
  } catch (error) {
    console.error(`   ❌ Unexpected error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🍄⚡ DEMO ACCOUNT LOGIN TEST');
  console.log('=' .repeat(50));
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase Key: ${supabaseKey.substring(0, 20)}...`);

  const results = [];

  for (const account of DEMO_ACCOUNTS) {
    const result = await testLogin(account.email, account.password, account.role);
    results.push({
      ...account,
      ...result
    });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.role}: ${result.success ? 'PASS' : `FAIL - ${result.error}`}`);
  });

  console.log(`\nTotal: ${results.length} | Passed: ${successful} | Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some accounts failed to login. Check:');
    console.log('   1. Demo accounts exist in Supabase');
    console.log('   2. Passwords are correct');
    console.log('   3. Email confirmation not required');
    console.log('   4. Supabase credentials are valid');
    process.exit(1);
  } else {
    console.log('\n✅ All demo accounts login successfully!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});



