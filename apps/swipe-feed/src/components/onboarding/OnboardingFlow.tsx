/**
 * Onboarding Flow Component
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function OnboardingFlow({ onComplete, forceShow = false }: { onComplete: () => void, forceShow?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to MythaTron!',
      description: 'You\'re one of the first 100 creators. Let\'s get you started on your creative journey.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add a bio and avatar to help other creators connect with you.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4"/>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        </svg>
      ),
      action: {
        label: 'Edit Profile',
        onClick: () => window.location.hash = '#settings',
      },
    },
    {
      id: 'angry-lips',
      title: 'Try Angry Lips',
      description: 'Our collaborative storytelling system. Create mad-lib adventures with AI and friends!',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      action: {
        label: 'Start Session',
        onClick: () => window.location.hash = '#angry-lips',
      },
    },
    {
      id: 'sparks',
      title: 'Earn Your First Sparks',
      description: 'Complete actions to earn Sparks. Use them for AI features or save for rewards!',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
    },
    {
      id: 'invite',
      title: 'Invite Friends',
      description: 'Earn 25 Sparks when friends join, plus 50 more when they create their first story!',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
      action: {
        label: 'Invite Friends',
        onClick: () => window.location.hash = '#invite-friends',
      },
    },
  ];

  // Don't auto-close the tutorial - let user go through it or skip it manually

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompleted([...completed, steps[currentStep].id]);
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('mythatron_onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('mythatron_onboarding_completed', 'true');
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white">
              {steps[currentStep].icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light mb-3 text-white">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/60">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {steps[currentStep].action ? (
              <>
                <button
                  onClick={steps[currentStep].action.onClick}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium transition-all text-white"
                >
                  {steps[currentStep].action.label}
                </button>
                <button
                  onClick={handleNext}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all text-white"
                >
                  Continue Later
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium transition-all text-white"
              >
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
              </button>
            )}
          </div>

          {/* Skip */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </div>

        {/* Checklist Preview */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-white/40 mb-3">Your progress:</p>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border ${
                  index < currentStep ? 'bg-green-500 border-green-500' :
                  index === currentStep ? 'bg-purple-500 border-purple-500' :
                  'bg-transparent border-white/20'
                }`}>
                  {index < currentStep && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span className={`text-xs ${
                  index <= currentStep ? 'text-white' : 'text-white/40'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
