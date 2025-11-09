import { createClient } from '@supabase/supabase-js';

// Use the same Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sxjydbukmknnmncyqsff.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anlkYnVrbWtubm1uY3lxc2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwNzY1NjksImV4cCI6MjA0NjY1MjU2OX0.p2i0FpyKzwNkVJdV8BfJMCNhIpKdHZRnSLNgPsFejxE';

// For admin creation, we need service role key (you'll need to get this from Supabase dashboard)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function createAdminAccount() {
  console.log('🔧 Creating admin account for Justin Cronk...');
  
  // Create Supabase client with service role for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
  
  try {
    // Try to sign up the user first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'justincronk@pm.me',
      password: 'Junuh2014!',
      options: {
        data: {
          first_name: 'Justin',
          last_name: 'Cronk',
          phone: '6123103241',
          job_title: 'Project Manager'
        }
      }
    });

    if (signUpError && signUpError.message.includes('already registered')) {
      console.log('✅ User already exists, attempting to update profile...');
      
      // If user exists, try to sign in to verify
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'justincronk@pm.me',
        password: 'Junuh2014!'
      });

      if (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        console.log('\n📝 Manual steps to fix:');
        console.log('1. Go to Supabase Dashboard: https://app.supabase.com');
        console.log('2. Navigate to Authentication > Users');
        console.log('3. Find user: justincronk@pm.me');
        console.log('4. Click "Reset Password" or delete and recreate');
        console.log('5. Set password to: Junuh2014!');
        return;
      }

      console.log('✅ Sign in successful!');
    } else if (signUpError) {
      console.error('❌ Error creating user:', signUpError.message);
      return;
    } else {
      console.log('✅ Admin account created successfully!');
    }

    // Now ensure the user profile is set up correctly
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      // Get company IDs
      const { data: brinkCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', 'Brink Constructors')
        .single();

      if (brinkCompany) {
        // Update or create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: userData.user.id,
            email: 'justincronk@pm.me',
            first_name: 'Justin',
            last_name: 'Cronk',
            phone: '6123103241',
            job_title: 'Project Manager',
            company_id: brinkCompany.id,
            role: 'admin',
            is_admin: true,
            address: '13740 10th Ave South, Zimmerman, MN 55398',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('❌ Error updating profile:', profileError.message);
        } else {
          console.log('✅ User profile updated with admin privileges!');
        }
      } else {
        console.log('⚠️ Brink Constructors company not found. Run migrations first.');
      }
    }

    console.log('\n🎉 Admin account setup complete!');
    console.log('📧 Email: justincronk@pm.me');
    console.log('🔐 Password: Junuh2014!');
    console.log('🔑 Role: Admin');
    console.log('\nYou can now sign in at http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminAccount();
}

export { createAdminAccount };
