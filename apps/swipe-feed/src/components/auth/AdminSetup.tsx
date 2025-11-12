import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, CheckCircle, AlertCircle, Loader2, User, Key, Mail } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [accountExists, setAccountExists] = useState(false);

  const checkAdminAccount = async () => {
    setLoading(true);
    setStatus('checking');
    setMessage('Checking for admin account');

    try {
      // Try to sign in with the admin credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'justincronk@pm.me',
        password: 'Junuh2014'
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setAccountExists(false);
          setMessage('Admin account not found or password incorrect');
          setStatus('error');
        } else {
          setMessage(`Error: ${error.message}`);
          setStatus('error');
        }
      } else if (data.user) {
        setAccountExists(true);
        setMessage('✅ Admin account exists and credentials are correct.');
        setStatus('success');
        
        // Sign out after checking
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      setMessage(`Unexpected error: ${error.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async () => {
    setLoading(true);
    setStatus('creating');
    setMessage('Creating admin account');

    try {
      // First, try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'justincronk@pm.me',
        password: 'Junuh2014',
        options: {
          data: {
            first_name: 'Justin',
            last_name: 'Cronk',
            phone: '6123103241',
            job_title: 'Project Manager',
            company: 'Brink Constructors'
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // User exists, try to reset password
          setMessage('User already exists. You may need to reset the password.');
          setStatus('error');
          
          // Attempt password reset
          const { error: resetError } = await supabase.auth.resetPasswordForEmail('justincronk@pm.me', {
            redirectTo: `${window.location.origin}/reset-password`
          });
          
          if (!resetError) {
            setMessage('Password reset email sent to justincronk@pm.me. Check your email.');
            setStatus('success');
          }
        } else {
          setMessage(`Error creating account: ${signUpError.message}`);
          setStatus('error');
        }
      } else {
        // Account created successfully
        setMessage('✅ Admin account created successfully. You can now sign in.');
        setStatus('success');
        setAccountExists(true);

        // Create user profile
        if (signUpData.user) {
          // Get Brink Constructors company
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('name', 'Brink Constructors')
            .single();

          if (company) {
            await supabase.from('user_profiles').upsert({
              id: signUpData.user.id,
              email: 'justincronk@pm.me',
              first_name: 'Justin',
              last_name: 'Cronk',
              phone: '6123103241',
              job_title: 'Project Manager',
              company_id: company.id,
              role: 'admin',
              is_admin: true,
              address: '13740 10th Ave South, Zimmerman, MN 55398'
            });
          }
        }
      }
    } catch (error: any) {
      setMessage(`Unexpected error: ${error.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    setMessage('Sending password reset email');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail('justincronk@pm.me', {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setStatus('error');
      } else {
        setMessage('✅ Password reset email sent to justincronk@pm.me');
        setStatus('success');
      }
    } catch (error: any) {
      setMessage(`Unexpected error: ${error.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-amber-500/30 p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Admin Account Setup</h1>
          <p className="text-slate-400 text-center mb-8">
            Configure the admin account for Justin Cronk
          </p>

          {/* Account Details */}
          <div className="bg-slate-900/50 rounded-lg p-6 mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Account Credentials</h3>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">Email:</span>
              <span className="text-white font-mono">justincronk@pm.me</span>
            </div>

            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">Password:</span>
              <span className="text-white font-mono">Junuh2014</span>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">Role:</span>
              <span className="text-amber-400 font-semibold">System Administrator</span>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
              status === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
              status === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
              'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            }`}>
              {status === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
               status === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
               <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />}
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={checkAdminAccount}
              disabled={loading}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {loading && status === 'checking' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking Account
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Check if Account Exists
                </>
              )}
            </button>

            {!accountExists && status !== 'idle' && (
              <button
                onClick={createAdminAccount}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center"
              >
                {loading && status === 'creating' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    Create Admin Account
                  </>
                )}
              </button>
            )}

            {accountExists && (
              <button
                onClick={resetPassword}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <Key className="w-5 h-5 mr-2" />
                Reset Password
              </button>
            )}

            <a
              href="/login"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center"
            >
              Go to Login Page
            </a>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              <strong>Note:</strong> This admin account has full system privileges including:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300 ml-4">
              <li>• Full access to all projects and data</li>
              <li>• User management capabilities</li>
              <li>• System configuration controls</li>
              <li>• Financial and billing access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
