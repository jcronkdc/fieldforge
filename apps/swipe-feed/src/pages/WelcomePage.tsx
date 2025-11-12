import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Zap, ArrowRight, Mail, Shield } from 'lucide-react';
import { toast } from '../components/common/FuturisticToast';
import { FuturisticLoader } from '../components/common/FuturisticLoader';

export const WelcomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is an email confirmation callback
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      setVerificationStatus('error');
      toast.error(errorDescription || 'Verification failed. Try again.');
      setLoading(false);
      return;
    }

    // Check for authenticated user
    checkAuth();
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        setUserInfo(user);
        setVerificationStatus('success');
        
        // Check if profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserInfo({ ...user, profile });
        }
        
        toast.success('Email verified.');
      } else {
        setVerificationStatus('error');
        toast.error('No signed-in user. Sign in again.');
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      setVerificationStatus('error');
      toast.error('Authentication check failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <FuturisticLoader size="fullscreen" message="VERIFYING YOUR ACCOUNT" />;
  }

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

      {/* Particle Effects */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {verificationStatus === 'success' ? (
          <>
            {/* Success Animation */}
            <div className="mb-8">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-green-500 blur-3xl opacity-30 animate-pulse" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <h1 className="mb-4 text-5xl font-bold font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Welcome to FieldForge
            </h1>
            
            <p className="mb-8 text-xl text-gray-300">
              Email verification complete.
            </p>

            {/* User Info Card */}
            {userInfo?.profile && (
              <div className="mb-8 p-6 bg-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 text-left">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Your Profile</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <p className="text-white">
                      {userInfo.profile.first_name} {userInfo.profile.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="text-white">{userInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Company:</span>
                    <p className="text-white">{userInfo.profile.company || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Role:</span>
                    <p className="text-white">{userInfo.profile.job_title || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-cyan-500/20">
                <Zap className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-white font-semibold">AI Assistant</h4>
                <p className="text-gray-400 text-xs mt-1">Voice-powered help</p>
              </div>
              <div className="p-4 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-cyan-500/20">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="text-white font-semibold">Safety First</h4>
                <p className="text-gray-400 text-xs mt-1">Real-time monitoring</p>
              </div>
              <div className="p-4 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-cyan-500/20">
                <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="text-white font-semibold">Smart OCR</h4>
                <p className="text-gray-400 text-xs mt-1">Receipt scanning</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleGetStarted}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3 group font-['Orbitron'] text-lg"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
              >
                Take the Tour
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Error State */}
            <div className="mb-8">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-30 animate-pulse" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold font-['Orbitron'] text-white mb-4">
              VERIFICATION ISSUE
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              We couldn't verify your email address
            </p>

            <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg mb-8">
              <p className="text-red-400">
                The verification link may have expired or already been used.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] transition-all duration-200 font-['Orbitron']"
              >
                GO TO LOGIN
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
              >
                Create new account
              </button>
            </div>
          </>
        )}
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
