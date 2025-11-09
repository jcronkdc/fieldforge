import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export const FuturisticLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'Invalid login credentials' && email === 'justincronk@pm.me') {
        setError(
          <div>
            Invalid credentials.
            <Link to="/admin-setup" className="ml-2 text-slate-900 underline">
              Setup admin account →
            </Link>
          </div>
        );
      } else {
        setError(error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,76,129,0.08),_transparent_55%)]" aria-hidden />

      <div className="w-full max-w-2xl grid gap-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">FieldForge</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Secure Access</p>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-semibold text-slate-900">Sign in to continue</h1>
          <p className="mt-3 text-sm text-slate-600">
            Enter your credentials to access the FieldForge control surface. Multi-factor authentication and SSO are available on enterprise plans.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 text-slate-700">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-semibold">Built for regulated environments</p>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              SOC 2, SSO, and detailed audit trails ensure compliance with utility and regulator standards.
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center"
              >
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between text-sm text-slate-600">
              <Link to="/signup" className="hover:underline">
                Request access
              </Link>
              <Link to="/admin-setup" className="hover:underline">
                Administrator setup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
