import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify the session with the backend
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // In production, you would verify this session with your backend
        // For now, we'll just simulate a successful verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (err) {
        setError('Failed to verify payment');
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture flex items-center justify-center">
        <div className="text-center vitruvian-rect">
          <Loader2 className="w-[55px] h-[55px] text-amber-400 mx-auto mb-[13px]" style={{ animation: 'gear-rotate 2s linear infinite' }} />
          <p className="text-golden-base text-amber-300">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture flex items-center justify-center px-[21px]">
        <div className="max-w-md w-full text-center vitruvian-rect">
          <div className="bg-red-500/10 rounded-full w-[89px] h-[89px] mx-auto mb-[21px] flex items-center justify-center border-2 border-red-500/30 depth-layer-1">
            <span className="text-golden-2xl">⚠️</span>
          </div>
          <h1 className="text-golden-xl font-bold text-white mb-[13px]">Payment Verification Failed</h1>
          <p className="text-golden-base text-amber-300/80 mb-[34px]">{error}</p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-[8px] px-[21px] py-[13px] bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-[8px] transition-all transform hover:scale-105 shadow-amber-500/20 corner-sketch"
          >
            Back to Pricing
            <ArrowRight className="w-[21px] h-[21px]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture">
      <div className="max-w-4xl mx-auto px-[34px] py-[89px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Success Icon */}
          <div className="relative mb-[34px]">
            <div className="w-[144px] h-[144px] mx-auto bg-gradient-to-br from-amber-500/20 to-green-500/20 rounded-full flex items-center justify-center vitruvian-circle depth-layer-2">
              <CheckCircle className="w-[89px] h-[89px] text-amber-400" />
            </div>
            <motion.div
              className="absolute inset-0 w-[144px] h-[144px] mx-auto bg-amber-400/10 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3.14159, repeat: Infinity }}
            />
          </div>

          <h1 className="text-golden-2xl md:text-[55px] font-bold text-white mb-[13px]">
            Welcome to FieldForge!
          </h1>
          
          <p className="text-golden-lg text-amber-300/90 mb-[55px] max-w-2xl mx-auto">
            Your payment was successful and your subscription is now active. 
            You have full access to all features in your plan.
          </p>

          {/* What's Next Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-[13px] p-[34px] mb-[55px] border border-amber-500/20 vitruvian-rect corner-sketch depth-layer-1">
            <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">1️⃣</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Set Up Your Team</h3>
                <p className="text-gray-400 text-sm">
                  Invite your crew members and set up roles and permissions
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">2️⃣</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Create Your First Project</h3>
                <p className="text-gray-400 text-sm">
                  Start tracking time, safety, and progress from day one
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">3️⃣</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Download Mobile App</h3>
                <p className="text-gray-400 text-sm">
                  Get the field app for iOS and Android to work offline
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="bg-gray-900/30 rounded-xl p-6 mb-12 border border-gray-800">
            <p className="text-gray-300">
              A receipt has been sent to your email address. You can manage your subscription
              anytime from your account settings.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              to="/settings/billing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
            >
              Manage Subscription
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">
              Need help getting started?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://docs.fieldforge.com"
                className="text-blue-400 hover:text-blue-300 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Documentation
              </a>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <a
                href="mailto:support@fieldforge.com"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Contact Support
              </a>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <Link
                to="/help"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Watch Tutorials
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
