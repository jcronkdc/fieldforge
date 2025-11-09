import React from 'react';
import { Zap, Cpu, Power } from 'lucide-react';

interface FuturisticLoaderProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({
  size = 'medium',
  message = 'INITIALIZING SYSTEM...',
  showProgress = false,
  progress = 0
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    fullscreen: 'w-48 h-48'
  };

  const iconSize = {
    small: 16,
    medium: 32,
    large: 40,
    fullscreen: 56
  };

  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Main Loader */}
        <div className="relative z-10">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className={`${sizeClasses[size]} relative`}>
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-purple-500/30 rounded-full" />
              <div className="absolute inset-2 border-2 border-t-transparent border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin-reverse" />
              <div className="absolute inset-4 border border-amber-500/30 rounded-full" />
              <div className="absolute inset-4 border border-t-transparent border-r-transparent border-b-amber-500 border-l-transparent rounded-full animate-spin-slow" />
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Zap className={`w-${iconSize[size]/4} h-${iconSize[size]/4} text-cyan-500 animate-pulse`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className={`w-${iconSize[size]/4} h-${iconSize[size]/4} text-cyan-500 blur-md animate-pulse`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Energy beams */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
              <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mt-8 text-center">
              <p className="text-cyan-400 font-['Orbitron'] text-sm tracking-wider animate-pulse">
                {message}
              </p>
              
              {/* Typing effect dots */}
              <div className="flex justify-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-6 w-64 mx-auto">
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-gray-400 mt-2 font-['Orbitron']">
                {progress}% COMPLETE
              </p>
            </div>
          )}

          {/* System Status */}
          <div className="mt-8 flex justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-1">
              <Cpu className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-gray-400">CPU OK</span>
            </div>
            <div className="flex items-center space-x-1">
              <Power className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-gray-400">PWR OK</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 border border-purple-500 rounded animate-ping" />
              <span className="text-gray-400">NET OK</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          
          @keyframes spin-reverse {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .animate-spin-reverse {
            animation: spin-reverse 3s linear infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // Inline loader for smaller sizes
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-cyan-500 animate-pulse" style={{ width: iconSize[size]/2, height: iconSize[size]/2 }} />
          </div>
        </div>
        
        {message && size !== 'small' && (
          <p className="text-cyan-400 text-xs mt-3 font-['Exo_2'] text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
