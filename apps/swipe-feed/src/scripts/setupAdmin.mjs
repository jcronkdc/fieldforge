#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Direct admin user creation script
const supabaseUrl = 'https://sxjydbukmknnmncyqsff.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE';

const adminEmail = 'justincronk@pm.me';
const adminPassword = 'Junuh2014!';

async function createAdminUser() {
  console.log('🔧 Setting up admin user for FieldForge\n');
  
  try {
    // You need to use the service role key for admin operations
    // This would normally come from environment variables
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Try to sign up the user first
    console.log(`📧 Creating account for: ${adminEmail}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Justin Cronk',
        role: 'admin',
        company: 'Brink Constructors'
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️  User already exists, updating password');
        
        // Update the existing user's password
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          signUpData?.user?.id || '',
          { password: adminPassword }
        );
        
        if (updateError) {
          throw updateError;
        }
        console.log('✅ Password updated successfully!');
      } else {
        throw signUpError;
      }
    } else {
      console.log('✅ Admin account created successfully!');
    }

    // Create or update user profile
    console.log('\n📝 Setting up user profile');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: signUpData?.user?.id,
        email: adminEmail,
        full_name: 'Justin Cronk',
        phone: '6123103241',
        job_title: 'Project Manager',
        is_admin: true,
        company_id: 2, // Brink Constructors
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.log('⚠️  Profile error (may already exist):', profileError.message);
    } else {
      console.log('✅ User profile configured!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ADMIN SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Your credentials:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🔗 Login at: http://localhost:5173/login');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 To fix this manually:');
    console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Click "Invite" and add:', adminEmail);
    console.log('4. Set the password to:', adminPassword);
  }
}

// Run the setup
createAdminUser();
