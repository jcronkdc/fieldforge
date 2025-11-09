import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Zap, Shield, HardHat, Building2, Activity, 
  Map, Users, FileText, Eye, EyeOff, AlertCircle,
  CheckCircle, Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@fieldforge.com');
    setPassword('demo123456');
    // Auto-submit after setting demo credentials
    setTimeout(() => {
      handleLogin(new Event('submit') as any);
    }, 100);
  };

  const features = [
    { icon: Shield, label: 'Safety Compliance', color: 'text-green-500' },
    { icon: Activity, label: 'Real-time Tracking', color: 'text-blue-500' },
    { icon: Map, label: '3D Visualization', color: 'text-purple-500' },
    { icon: FileText, label: 'Digital Documents', color: 'text-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">FieldForge</h1>
            <p className="text-slate-400">T&D Construction Management Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Login successful! Redirecting...</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foreman@construction.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-slate-800 border-slate-700 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-amber-500 hover:text-amber-400">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Demo Account */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
            >
              Try Demo Account
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-amber-500 hover:text-amber-400 font-medium">
                Sign up
              </Link>
            </p>
          </form>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-slate-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs">256-bit SSL Encryption • SOC 2 Compliant</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Build the Future of Construction
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Manage T&D and Substation projects with cutting-edge technology
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center space-x-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded-lg">
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                <span className="text-white font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-amber-500">500+</p>
              <p className="text-sm text-slate-300">Active Projects</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500">10k+</p>
              <p className="text-sm text-slate-300">Field Workers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500">99.9%</p>
              <p className="text-sm text-slate-300">Uptime</p>
            </div>
          </div>

          {/* Bottom Images/Icons */}
          <div className="mt-12 flex items-center space-x-8">
            <HardHat className="w-12 h-12 text-slate-400" />
            <Building2 className="w-12 h-12 text-slate-400" />
            <Zap className="w-12 h-12 text-slate-400" />
            <Users className="w-12 h-12 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
