import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export const FuturisticLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
            <Link to="/admin-setup" className="ml-2 text-amber-500 hover:text-amber-400 underline">
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-lg mb-4">
            <Zap className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            FieldForge
          </h1>
          <p className="text-slate-400 text-sm">Electrical Construction Operations</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/signup"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Create account
              </Link>
              <Link
                to="/admin-setup"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                Admin setup
              </Link>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-slate-500 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
