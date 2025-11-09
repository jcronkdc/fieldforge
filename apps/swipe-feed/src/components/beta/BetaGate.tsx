/**
 * Beta Gate Component
 * Enforces 100-user limit and shows waitlist when full
 */

import { useState, useEffect } from "react";
import { Sparkles, Users, Trophy, Gift, Clock } from "lucide-react";
import { apiRequest } from "../../lib/api";

interface BetaStatus {
  allowed: boolean;
  currentCount: number;
  maxCount: number;
  message: string;
}

interface BetaGateProps {
  onAllowed: () => void;
  onWaitlist: () => void;
}

export function BetaGate({ onAllowed, onWaitlist }: BetaGateProps) {
  const [status, setStatus] = useState<BetaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  useEffect(() => {
    checkBetaStatus();
  }, []);

  const checkBetaStatus = async () => {
    try {
      const response = await apiRequest<BetaStatus>("/api/beta/can-register");
      setStatus(response);
      
      if (response.allowed) {
        onAllowed();
      }
    } catch (error) {
      console.error("Error checking beta status:", error);
      // Default to allowed if API fails
      onAllowed();
    } finally {
      setLoading(false);
    }
  };

  const joinWaitlist = async () => {
    // Store email in localStorage for now
    localStorage.setItem("mythatron_waitlist_email", email);
    setWaitlistJoined(true);
    onWaitlist();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Checking Beta Access...</h2>
        </div>
      </div>
    );
  }

  if (!status || status.allowed) {
    return null; // Allow registration
  }

  // Beta is full - show waitlist
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full">
        <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-4">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2">
              Beta Testing is Full!
            </h1>
            
            <p className="text-xl text-purple-200">
              We've reached our limit of {status.maxCount} beta testers
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-purple-500/10 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{status.currentCount}</div>
              <div className="text-sm text-purple-300">Active Testers</div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">500</div>
              <div className="text-sm text-purple-300">Free Sparks</div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/10 rounded-xl">
              <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-purple-300">Daily Bonus</div>
            </div>
          </div>

          {!waitlistJoined ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                Join the Waitlist for Round 2!
              </h3>
              
              <p className="text-purple-200 mb-4">
                Be the first to know when we open more beta spots. 
                Round 2 testers will receive:
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-purple-200">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  1,000 Free Sparks (double the current bonus!)
                </li>
                <li className="flex items-center text-purple-200">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Exclusive "Round 2" badge
                </li>
                <li className="flex items-center text-purple-200">
                  <Gift className="w-5 h-5 mr-2 text-green-400" />
                  Access to premium features
                </li>
              </ul>
              
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={joinWaitlist}
                  disabled={!email.includes("@")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Clock className="w-8 h-8 text-green-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                You're on the list!
              </h3>
              
              <p className="text-purple-200">
                We'll email you at <span className="font-semibold">{email}</span> as soon as Round 2 opens.
              </p>
              
              <div className="mt-6 p-4 bg-purple-500/10 rounded-xl">
                <p className="text-sm text-purple-300">
                  <strong>Pro tip:</strong> Follow us on social media for updates and sneak peeks!
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-purple-400 text-sm">
            Current beta testers are helping us build the future of creative writing.
            <br />
            Thank you for your patience!
          </p>
        </div>
      </div>
    </div>
  );
}
