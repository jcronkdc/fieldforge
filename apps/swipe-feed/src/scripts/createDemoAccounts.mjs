#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Demo account creation script
const supabaseUrl = 'https://lzfzkrylexsarpxypktt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const demoAccounts = [
  {
    email: 'demo@fieldforge.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'Worker',
    jobTitle: 'Field Technician',
    role: 'user'
  },
  {
    email: 'manager@fieldforge.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'Manager',
    jobTitle: 'Project Manager',
    role: 'user'
  },
  {
    email: 'admin@fieldforge.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'Admin',
    jobTitle: 'Administrator',
    role: 'admin'
  }
];

async function createDemoAccounts() {
  console.log('🎯 Setting up demo accounts for FieldForge\n');

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
    console.log('Set it with: export SUPABASE_SERVICE_KEY=your_service_key_here');
    console.log('\n🔧 MANUAL CREATION INSTRUCTIONS:');
    console.log('='.repeat(60));
    console.log('Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users');
    console.log('Click "Add user" → "Create new user" for each account:');
    demoAccounts.forEach(account => {
      console.log(`  • ${account.email} | Password: ${account.password} | Auto Confirm: ✅`);
    });
    console.log('='.repeat(60));
    console.log('\nAfter creating users, run: supabase/create_demo_accounts.sql in SQL Editor');
    process.exit(1);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    for (const account of demoAccounts) {
      console.log(`📧 Creating demo account: ${account.email}`);

      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: `${account.firstName} ${account.lastName}`,
            role: account.role,
            job_title: account.jobTitle
          }
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            console.log(`⚠️  ${account.email} already exists, skipping...`);
          } else {
            console.error(`❌ Failed to create ${account.email}:`, error.message);
          }
        } else {
          console.log(`✅ Created ${account.email} successfully!`);
        }
      } catch (err) {
        console.error(`❌ Error creating ${account.email}:`, err.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMO ACCOUNTS SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Demo Account Credentials:');
    demoAccounts.forEach(account => {
      console.log(`   ${account.jobTitle}: ${account.email} / ${account.password}`);
    });
    console.log('\n🔗 Login at: https://fieldforge-dtotsf378-justins-projects-d7153a8c.vercel.app/login');
    console.log('='.repeat(60));

    console.log('\n📝 Next step: Run the SQL script to set up profiles and demo data');
    console.log('   Location: supabase/create_demo_accounts.sql');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 To fix this manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users');
    console.log('2. Click "Add user" → "Create new user"');
    console.log('3. For each account, enter:');
    demoAccounts.forEach(account => {
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   ✅ Check "Auto Confirm Email"`);
      console.log(`   ---`);
    });
    console.log('4. After creating all users, run the SQL script:');
    console.log('   supabase/create_demo_accounts.sql');
    console.log('\n🔄 Or run this command after setting SUPABASE_SERVICE_KEY:');
    console.log('   SUPABASE_SERVICE_KEY=your_key_here node apps/swipe-feed/src/scripts/createDemoAccounts.mjs');
  }
}

// Run the setup
createDemoAccounts();
