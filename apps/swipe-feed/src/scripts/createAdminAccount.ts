/**
 * Script to create admin account for Justin Cronk
 * Run this script once to set up the admin user
 * 
 * Usage: 
 * 1. Make sure your Supabase project is running
 * 2. Run: npx tsx src/scripts/createAdminAccount.ts
 */

import { createClient } from '@supabase/supabase-js';

// Use your Supabase project URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// For admin operations, you'll need the service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

async function createAdminAccount() {
  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Creating admin account for Justin Cronk...');

  try {
    // Create the user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'justincronk@pm.me',
      password: 'Junuh2014!',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Justin',
        last_name: 'Cronk',
        phone: '6123103241',
        job_title: 'Project Manager'
      }
    });

    if (userError) {
      if (userError.message.includes('already registered')) {
        console.log('User already exists. Updating profile...');
        
        // Get existing user
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === 'justincronk@pm.me');
        
        if (existingUser) {
          await updateUserProfile(supabase, existingUser.id);
        }
      } else {
        throw userError;
      }
    } else if (userData.user) {
      console.log('User created successfully:', userData.user.email);
      await updateUserProfile(supabase, userData.user.id);
    }

    console.log('✅ Admin account setup complete!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: justincronk@pm.me');
    console.log('Password: Junuh2014!');
    console.log('');
    console.log('You can now sign in at http://localhost:5173/login');
    
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
}

async function updateUserProfile(supabase: any, userId: string) {
  // Get company IDs
  const { data: parentCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Cronk Companies LLC')
    .single();

  const { data: brinkCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Brink Constructors')
    .single();

  const companyId = brinkCompany?.id || parentCompany?.id;

  // Create or update user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email: 'justincronk@pm.me',
      first_name: 'Justin',
      last_name: 'Cronk',
      phone: '6123103241',
      job_title: 'Project Manager',
      company_id: companyId,
      role: 'admin',
      is_admin: true,
      address: '13740 10th Ave South, Zimmerman, MN 55398',
      employee_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('Error updating profile:', profileError);
  } else {
    console.log('User profile updated successfully');
  }

  // Grant admin access to all projects
  if (companyId) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('company_id', companyId);

    if (projects && projects.length > 0) {
      for (const project of projects) {
        await supabase
          .from('project_team')
          .upsert({
            project_id: project.id,
            user_id: userId,
            role: 'admin',
            permissions: {
              read: true,
              write: true,
              delete: true,
              manage_team: true,
              manage_budget: true
            }
          })
          .select();
      }
      console.log(`Granted admin access to ${projects.length} projects`);
    }
  }
}

// Run the script
createAdminAccount().catch(console.error);
