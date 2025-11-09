import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap, Shield, CheckCircle, AlertCircle, ArrowRight, Key, User, Mail, Lock } from 'lucide-react';

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
    setMessage('Checking for existing administrator account…');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminCredentials.email,
        password: adminCredentials.password
      });

      if (data?.user) {
        setAccountExists(true);
        setStatus('success');
        setMessage('Administrator account detected. You can continue to sign in.');
        await supabase.auth.signOut();
      } else if (error?.message === 'Invalid login credentials') {
        setAccountExists(false);
        setStatus('idle');
        setMessage('No administrator account found. Initialize FieldForge with the credentials below.');
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error('Check error:', error);
      setStatus('error');
      setMessage(error.message || 'Unable to verify administrator status');
    }
  };

  const createAdminAccount = async () => {
    setStatus('creating');
    setMessage('Provisioning administrator account…');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: adminCredentials.email,
        password: adminCredentials.password,
        options: {
          data: {
            full_name: adminCredentials.fullName,
            company: adminCredentials.company,
            job_title: adminCredentials.jobTitle,
            phone: adminCredentials.phone,
            is_admin: true
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('user_profiles')
          .upsert(
            {
              user_id: data.user.id,
              email: adminCredentials.email,
              full_name: adminCredentials.fullName,
              phone: adminCredentials.phone,
              job_title: adminCredentials.jobTitle,
              is_admin: true,
              company_id: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
          );
      }

      setStatus('success');
      setMessage('Administrator account created. Redirecting to sign-in.');
      setAccountExists(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error: any) {
      console.error('Creation error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to create administrator account');
    }
  };

  const resetPassword = async () => {
    setStatus('creating');
    setMessage('Sending password reset instructions…');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(adminCredentials.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setStatus('success');
      setMessage('Password reset email sent. Check your inbox to continue.');
    } catch (error: any) {
      console.error('Reset error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to send reset instructions');
    }
  };

  const statusBanner = () => {
    if (!message) return null;

    const tone =
      status === 'error' ? 'border-red-200 bg-red-50 text-red-600' :
      status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
      'border-slate-200 bg-slate-50 text-slate-600';

    const Icon = status === 'error' ? AlertCircle : status === 'success' ? CheckCircle : Shield;

    return (
      <div className={`mb-6 flex items-start gap-2 rounded-xl border p-4 text-sm ${tone}`}>
        <Icon className="mt-0.5 h-4 w-4" />
        <div>{message}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(15,76,129,0.06),_transparent_65%)]" aria-hidden />

      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">FieldForge Administration</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">System Initialization</p>
            </div>
          </div>
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:underline">
            Back to sign in
          </Link>
        </div>

        <h1 className="mt-10 text-3xl font-semibold text-slate-900">Initialize the administrator account</h1>
        <p className="mt-3 text-sm text-slate-600">
          FieldForge ships without default credentials. Use the pre-approved administrator details below to provision access for the first time.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.2em]">Credentials</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{adminCredentials.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{adminCredentials.password}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-500" />
                <span>{adminCredentials.fullName}, {adminCredentials.jobTitle}</span>
              </div>
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-slate-500" />
                <span>{adminCredentials.company}</span>
              </div>
            </div>
          </div>

          <div>
            {statusBanner()}
            <div className="space-y-3">
              <button
                onClick={checkAdminAccount}
                disabled={status === 'checking' || status === 'creating'}
                className="w-full btn-secondary justify-center"
              >
                {status === 'checking' ? 'Checking…' : 'Check for existing admin'}
                {status !== 'checking' && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
              <button
                onClick={createAdminAccount}
                disabled={status === 'checking' || status === 'creating' || accountExists}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'creating' ? 'Provisioning…' : 'Create administrator account'}
                {status !== 'creating' && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
              <button
                onClick={resetPassword}
                className="w-full btn-ghost justify-center text-slate-700"
              >
                Send password reset link
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.2em]">Implementation guidance</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Use the admin account to configure authentication, integrations, and baseline projects.</li>
            <li>Once initialized, enable SSO or provisioning through your identity provider.</li>
            <li>Contact the FieldForge onboarding team for guided rollout and data migration.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
