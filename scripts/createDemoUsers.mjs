#!/usr/bin/env node
/**
 * Create Demo Users in Supabase
 * 
 * This script creates the 3 demo users using Supabase Admin API
 * Run with: node scripts/createDemoUsers.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: 'apps/swipe-feed/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\n💡 Get your service role key from:');
  console.error('   https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
  console.error('\n📝 Add to apps/swipe-feed/.env.local:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoUsers = [
  {
    email: 'demo@fieldforge.com',
    password: 'FieldForge2025!Demo',
    name: 'Demo Worker',
    role: 'field_worker',
    metadata: {
      full_name: 'Demo Worker',
      job_title: 'Field Technician',
      role: 'field_worker'
    }
  },
  {
    email: 'manager@fieldforge.com',
    password: 'FieldForge2025!Demo',
    name: 'Demo Manager',
    role: 'manager',
    metadata: {
      full_name: 'Demo Manager',
      job_title: 'Project Manager',
      role: 'manager'
    }
  },
  {
    email: 'admin@fieldforge.com',
    password: 'FieldForge2025!Demo',
    name: 'Demo Admin',
    role: 'admin',
    metadata: {
      full_name: 'Demo Admin',
      job_title: 'Administrator',
      role: 'admin'
    }
  }
];

async function createDemoUsers() {
  console.log('🚀 Creating demo users in Supabase...\n');

  for (const user of demoUsers) {
    console.log(`📧 Creating user: ${user.email}`);
    
    try {
      // Create user with admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: user.metadata
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`   ⚠️  User already exists: ${user.email}`);
        } else {
          console.error(`   ❌ Error creating ${user.email}:`, error.message);
        }
      } else {
        console.log(`   ✅ Created successfully: ${user.email}`);
        console.log(`      User ID: ${data.user.id}`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to create ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Demo user creation complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Run the demo accounts SQL script in Supabase SQL Editor:');
  console.log('   supabase/create_demo_accounts.sql');
  console.log('2. Or run: node scripts/setupDemoData.mjs');
  console.log('\n🔐 Login Credentials:');
  console.log('   Email: demo@fieldforge.com OR manager@fieldforge.com OR admin@fieldforge.com');
  console.log('   Password: FieldForge2025!Demo');
}

// Run the script
createDemoUsers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });


