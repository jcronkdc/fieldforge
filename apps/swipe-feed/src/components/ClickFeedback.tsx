/**
 * Click Feedback System - Visual confirmation for all interactions
 * Makes it obvious when buttons are clicked
 */

import React, { useEffect, useState } from 'react';

interface ClickRipple {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export const ClickFeedback: React.FC = () => {
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [clickedElements, setClickedElements] = useState<Set<HTMLElement>>(new Set());

  useEffect(() => {
    // Add ripple effect and visual feedback to all clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if it's a clickable element
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.role === 'button' ||
        target.onclick !== null ||
        target.closest('button, a[href], [role="button"]');
      
      if (isClickable) {
        // Create ripple effect at click position
        const rect = document.body.getBoundingClientRect();
        const ripple: ClickRipple = {
          id: `ripple-${Date.now()}-${Math.random()}`,
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        };
        
        setRipples(prev => [...prev, ripple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 1000);
        
        // Add visual feedback to the clicked element
        const clickTarget = (target.closest('button, a[href], [role="button"]') || target) as HTMLElement;
        
        // Store original styles
        const originalTransform = clickTarget.style.transform;
        const originalTransition = clickTarget.style.transition;
        const originalBoxShadow = clickTarget.style.boxShadow;
        const originalBackground = clickTarget.style.background;
        
        // Apply click animation
        clickTarget.style.transition = 'all 0.1s ease';
        clickTarget.style.transform = 'scale(0.95)';
        
        // Add glow effect
        clickTarget.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.8), inset 0 0 20px rgba(147, 51, 234, 0.2)';
        
        // Flash background
        if (!clickTarget.style.background || clickTarget.style.background === 'none') {
          clickTarget.style.background = 'rgba(147, 51, 234, 0.1)';
        }
        
        // Add clicked class for additional styling
        clickTarget.classList.add('clicked-feedback');
        
        // Restore after animation
        setTimeout(() => {
          clickTarget.style.transform = originalTransform || '';
          clickTarget.style.boxShadow = originalBoxShadow || '';
          clickTarget.style.background = originalBackground || '';
          
          setTimeout(() => {
            clickTarget.style.transition = originalTransition || '';
            clickTarget.classList.remove('clicked-feedback');
          }, 100);
        }, 100);
        
        // Play click sound (optional)
        playClickSound();
      }
    };
    
    // Add global styles for click feedback
    const style = document.createElement('style');
    style.textContent = `
      /* Button hover states - more obvious */
      button:not(:disabled):hover,
      a:hover,
      [role="button"]:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3) !important;
        filter: brightness(1.1) !important;
        cursor: pointer !important;
      }
      
      /* Active state - when clicking */
      button:not(:disabled):active,
      a:active,
      [role="button"]:active {
        transform: scale(0.95) !important;
        box-shadow: 0 0 30px rgba(147, 51, 234, 0.6), inset 0 0 20px rgba(147, 51, 234, 0.3) !important;
      }
      
      /* Clicked feedback class */
      .clicked-feedback {
        animation: clickPulse 0.3s ease-out;
      }
      
      @keyframes clickPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.8);
        }
        50% {
          box-shadow: 0 0 20px 10px rgba(147, 51, 234, 0.4);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
        }
      }
      
      /* Focus states - keyboard navigation */
      button:focus-visible,
      a:focus-visible,
      [role="button"]:focus-visible {
        outline: 2px solid #9333ea !important;
        outline-offset: 2px !important;
      }
      
      /* Disabled state - obviously not clickable */
      button:disabled,
      [aria-disabled="true"] {
        opacity: 0.4 !important;
        cursor: not-allowed !important;
        filter: grayscale(0.5) !important;
      }
      
      /* Loading state */
      button.loading {
        position: relative;
        color: transparent !important;
      }
      
      button.loading::after {
        content: "";
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin-left: -8px;
        margin-top: -8px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spinner 0.6s linear infinite;
      }
      
      @keyframes spinner {
        to { transform: rotate(360deg); }
      }
      
      /* Ripple container */
      .click-ripple {
        position: fixed;
        pointer-events: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0) 70%);
        transform: translate(-50%, -50%) scale(0);
        animation: rippleEffect 1s ease-out;
        z-index: 10000;
      }
      
      @keyframes rippleEffect {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }
      
      /* Success feedback */
      .click-success {
        animation: successPulse 0.5s ease-out;
      }
      
      @keyframes successPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
          filter: brightness(1.2);
        }
      }
      
      /* Error feedback */
      .click-error {
        animation: errorShake 0.5s ease-out;
      }
      
      @keyframes errorShake {
        0%, 100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-5px);
        }
        75% {
          transform: translateX(5px);
        }
      }
    `;
    document.head.appendChild(style);
    
    // Listen for clicks
    document.addEventListener('click', handleClick, true);
    
    // Add visual feedback for touch events on mobile
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const ripple: ClickRipple = {
          id: `touch-${Date.now()}`,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now()
        };
        
        setRipples(prev => [...prev, ripple]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 1000);
      }
    };
    
    document.addEventListener('touchstart', handleTouch, { passive: true });
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleTouch);
      document.head.removeChild(style);
    };
  }, []);
  
  // Optional: Play click sound
  const playClickSound = () => {
    try {
      // Create a simple click sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };
  
  return (
    <>
      {/* Render ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="click-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
      
      {/* Visual indicator in corner */}
      <div className="fixed bottom-4 right-20 z-[9998] pointer-events-none">
        <div className="bg-purple-600/20 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-purple-300 border border-purple-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Click Feedback Active</span>
          </div>
        </div>
      </div>
    </>
  );
};

// Button wrapper component for extra feedback
export const FeedbackButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', loading = false, className = '', ...props }) => {
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    
    // Visual feedback
    setTimeout(() => setIsClicked(false), 300);
    
    // Call original handler
    if (onClick && !loading) {
      onClick(e);
    }
  };
  
  const variantStyles = {
    primary: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
  };
  
  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={props.disabled || loading}
      className={`
        ${variantStyles[variant]}
        ${isClicked ? 'scale-95 ring-4 ring-purple-400/50' : ''}
        ${loading ? 'loading' : ''}
        px-4 py-2 rounded-lg font-medium text-white
        transition-all duration-150 ease-out
        hover:scale-105 hover:shadow-lg
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {!loading && children}
    </button>
  );
};

export default ClickFeedback;
