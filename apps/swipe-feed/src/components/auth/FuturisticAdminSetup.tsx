import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap, Shield, CheckCircle, AlertCircle, ArrowRight, Key, User, Mail, Lock, Cpu } from 'lucide-react';

export const FuturisticAdminSetup: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [accountExists, setAccountExists] = useState(false);

  const adminCredentials = {
    email: 'justincronk@pm.me',
    password: 'Junuh2014!',
    fullName: 'Justin Cronk',
    company: 'Brink Constructors',
    jobTitle: 'Project Manager',
    phone: '6123103241'
  };

  const checkAdminAccount = async () => {
    setStatus('checking');
    setMessage('Scanning authentication database...');

    try {
      // Try to sign in to check if account exists
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminCredentials.email,
        password: adminCredentials.password
      });

      if (data?.user) {
        setAccountExists(true);
        setStatus('success');
        setMessage('Admin account detected! Ready for system access.');
        
        // Sign out immediately after checking
        await supabase.auth.signOut();
      } else if (error?.message === 'Invalid login credentials') {
        setAccountExists(false);
        setStatus('idle');
        setMessage('Admin account not found. Initialize system administrator.');
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error('Check error:', error);
      setStatus('error');
      setMessage(error.message || 'System check failed');
    }
  };

  const createAdminAccount = async () => {
    setStatus('creating');
    setMessage('Initializing administrative protocols...');

    try {
      // Sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email: adminCredentials.email,
        password: adminCredentials.password,
        options: {
          data: {
            full_name: adminCredentials.fullName,
            company: adminCredentials.company,
            job_title: adminCredentials.jobTitle,
            phone: adminCredentials.phone,
            role: 'admin'
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: data.user.id,
            email: adminCredentials.email,
            full_name: adminCredentials.fullName,
            phone: adminCredentials.phone,
            job_title: adminCredentials.jobTitle,
            is_admin: true,
            company_id: 2, // Brink Constructors
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.warn('Profile creation warning:', profileError);
        }
      }

      setStatus('success');
      setMessage('Administrator account successfully initialized!');
      setAccountExists(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Creation error:', error);
      setStatus('error');
      setMessage(error.message || 'Initialization failed');
    }
  };

  const resetPassword = async () => {
    setStatus('creating');
    setMessage('Transmitting password reset protocol...');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        adminCredentials.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) throw error;

      setStatus('success');
      setMessage('Password reset link transmitted to email address.');
    } catch (error: any) {
      console.error('Reset error:', error);
      setStatus('error');
      setMessage(error.message || 'Reset protocol failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Subtle Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" aria-hidden="true" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Setup
          </h1>
          <p className="text-slate-400 text-sm">Configure system administrator account</p>
        </div>

        {/* Status Panel */}
        <div className="relative">
          
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            {/* Credentials Display */}
            <div className="mb-8 p-6 bg-slate-950/50 rounded-lg border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Administrative Credentials
              </h2>
              
              <div className="space-y-3 font-['Exo 2']">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-mono">{adminCredentials.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-cyan-500" />
                  <span className="text-gray-400">Password:</span>
                  <span className="text-white font-mono">{adminCredentials.password}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-cyan-500" />
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{adminCredentials.fullName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-cyan-500" />
                  <span className="text-gray-400">Company:</span>
                  <span className="text-white">{adminCredentials.company}</span>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
                status === 'error' ? 'bg-red-500/10 border-red-500/50' :
                status === 'success' ? 'bg-green-500/10 border-green-500/50' :
                'bg-purple-500/10 border-purple-500/50'
              }`}>
                {status === 'error' ? <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" /> :
                 status === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> :
                 <Cpu className="w-5 h-5 text-purple-500 mt-0.5 animate-spin" />}
                <div className="flex-1">
                  <p className={`text-sm ${
                    status === 'error' ? 'text-red-400' :
                    status === 'success' ? 'text-green-400' :
                    'text-purple-400'
                  }`}>{message}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!accountExists && (
                <>
                  <button
                    onClick={checkAdminAccount}
                    disabled={status === 'checking' || status === 'creating'}
                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group font-['Orbitron']"
                  >
                    <Shield className="w-5 h-5" />
                    <span>CHECK SYSTEM STATUS</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={createAdminAccount}
                    disabled={status === 'checking' || status === 'creating'}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group font-['Orbitron']"
                  >
                    <Cpu className="w-5 h-5" />
                    <span>INITIALIZE ADMINISTRATOR</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              )}

              {accountExists && (
                <>
                  <Link
                    to="/login"
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 group font-['Orbitron'] text-center"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>ACCESS SYSTEM</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    onClick={resetPassword}
                    disabled={status === 'creating'}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group font-['Orbitron']"
                  >
                    <Key className="w-5 h-5" />
                    <span>RESET ACCESS CODE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              )}
            </div>

            {/* Navigation Links */}
            <div className="mt-6 pt-6 border-t border-purple-500/20 flex items-center justify-center space-x-6 text-sm">
              <Link to="/" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1 group">
                <span>Home</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1 group">
                <span>Login Portal</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-purple-500/60 text-xs">
            <Shield className="w-4 h-4" />
            <span>SECURE ADMINISTRATIVE PROTOCOL • 256-BIT ENCRYPTION</span>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};
