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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Payment Verification Failed</h1>
          <p className="text-gray-300 mb-8">{error}</p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Back to Pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <motion.div
              className="absolute inset-0 w-32 h-32 mx-auto bg-green-500/20 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to FieldForge!
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Your payment was successful and your subscription is now active. 
            You have full access to all features in your plan.
          </p>

          {/* What's Next Section */}
          <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 mb-12 border border-gray-800">
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
