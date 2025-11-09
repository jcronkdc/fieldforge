import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, Shield, Cpu, Grid3x3 } from 'lucide-react';

export const FuturisticLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    // Create floating particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1
    }));
    setParticles(newParticles);
  }, []);

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slide 10s linear infinite'
          }}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-cyan-500/20 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${10 + particle.id % 10}s ease-in-out infinite`
          }}
        />
      ))}

      {/* Electric Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent animate-pulse" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent animate-pulse" />

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 animate-pulse shadow-[0_0_40px_rgba(255,184,0,0.5)]">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            FIELDFORGE
          </h1>
          <p className="text-cyan-400/80 text-sm tracking-wider">ELECTRICAL DIVISION</p>
        </div>

        {/* Login Form */}
        <div className="relative">
          {/* Holographic Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg blur opacity-30 animate-pulse" />
          
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-lg p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,212,255,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-2 font-['Orbitron']">
              SYSTEM ACCESS
            </h2>
            <p className="text-cyan-400/60 mb-6 text-sm">
              Authenticate to continue
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-cyan-500/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                  placeholder="Email address"
                  required
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition-opacity focus-within:opacity-100" />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-cyan-500/50" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                  placeholder="Password"
                  required
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition-opacity focus-within:opacity-100" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>ACCESS SYSTEM</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-cyan-500/20">
              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/signup"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1 group"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Create Account</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
                <Link
                  to="/admin-setup"
                  className="text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1 group"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span>Admin Setup</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-cyan-500/60 text-xs">
            <Shield className="w-4 h-4" />
            <span>SECURE 256-BIT ENCRYPTION</span>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};
