import { supabase } from './supabase';

// Demo account credentials
export const DEMO_CREDENTIALS = {
  email: 'demo@fieldforge.com',
  password: 'FieldForge2025!Demo'
};

// Sign up new user
export async function signUp(
  email: string,
  password: string,
  userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    employeeId?: string;
  }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        company: userData.company,
        job_title: userData.jobTitle,
        employee_id: userData.employeeId
      },
      emailRedirectTo: window.location.origin
    }
  });

  if (error) throw error;
  return data;
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// Sign in with demo account
export async function signInDemo() {
  return signIn(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
    employeeId?: string;
  }
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      job_title: updates.jobTitle,
      employee_id: updates.employeeId,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Request password reset
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
}
